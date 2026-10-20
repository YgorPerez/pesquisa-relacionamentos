// The Festival dos Macacos `lint/chave-das-regras.ts` is ESLint's cache key:
// it changes when what the rules read outside the linted file changes. The
// Vite+ Oxlint has no such cache, and `vp run --cache` already records every
// file the lint reads (ADR 0002). What is left of that role is the other side
// of the same question, "are the rules in force the ones we think are?", and
// that is what this file checks in the `lint` of the root `vite.config.ts`
// (ADR 0029):
//
// - every local plugin in `frontend/lint/` is in `lint.jsPlugins`;
// - every rule of a local plugin is turned on somewhere, and every rule turned
//   on with a local plugin's name exists in it;
// - the `@shadcn/lint` rules ticket #54 asks for are on in the app, and off in
//   `src/ui/shadcn/`, where the class is the variant's definition.
//
// `rule-config.test.ts` runs the check on the real config.

type Level = string | [string, ...unknown[]]

export type LintConfig = {
  jsPlugins?: ReadonlyArray<string | { name: string; specifier: string }>
  rules?: Record<string, Level>
  overrides?: ReadonlyArray<{
    files: ReadonlyArray<string>
    excludeFiles?: ReadonlyArray<string>
    rules?: Record<string, Level>
  }>
}

/** A local plugin: its name and the rules it brings. */
export type LocalPlugin = {
  readonly path: string
  readonly name: string
  readonly rules: ReadonlyArray<string>
}

/** The `@shadcn/lint` rules the app turns on (ticket #54). */
const SHADCN_RULES = [
  'shadcn/no-unknown-classes',
  'shadcn/no-raw-colors',
  'shadcn/require-static-classes',
  'shadcn/no-arbitrary-values',
  'shadcn/no-restyle',
] as const

const SHADCN_FOLDER = 'frontend/src/ui/shadcn/**'

const isOn = (level: Level | undefined) =>
  level !== undefined && (Array.isArray(level) ? level[0] : level) !== 'off'

type Block = {
  files: ReadonlyArray<string>
  excludeFiles: ReadonlyArray<string>
  rules: Record<string, Level>
}

/** The top-level `rules` and those of each `override`, in one shape. */
const blocksOf = (lint: LintConfig): Block[] => [
  { files: ['**'], excludeFiles: [], rules: lint.rules ?? {} },
  ...(lint.overrides ?? []).map((o) => ({
    files: o.files,
    excludeFiles: o.excludeFiles ?? [],
    rules: o.rules ?? {},
  })),
]

/** Each local plugin is in `jsPlugins`, with every rule turned on. */
function unregisteredPlugins(
  lint: LintConfig,
  locals: ReadonlyArray<LocalPlugin>,
  on: ReadonlySet<string>,
): string[] {
  const paths = new Set(
    (lint.jsPlugins ?? []).map((p) =>
      typeof p === 'string' ? p : p.specifier,
    ),
  )
  return locals.flatMap((plugin) => [
    ...(paths.has(plugin.path)
      ? []
      : [`${plugin.path} is not in lint.jsPlugins`]),
    ...plugin.rules
      .filter((rule) => !on.has(`${plugin.name}/${rule}`))
      .map((rule) => `${plugin.name}/${rule} is not turned on anywhere`),
  ])
}

/** Each rule turned on with a local plugin's name exists in it. */
function missingRules(
  locals: ReadonlyArray<LocalPlugin>,
  on: ReadonlySet<string>,
): string[] {
  const byName = new Map(locals.map((p) => [p.name, new Set(p.rules)]))
  return [...on].flatMap((name) => {
    const [plugin = '', rule = ''] = name.split('/')
    const rules = byName.get(plugin)
    return rules && !rules.has(rule)
      ? [`${name} is turned on, but plugin ${plugin} does not have it`]
      : []
  })
}

/** The `@shadcn/lint` ones apply in the app and not in `ui/shadcn/`. */
function misplacedShadcn(blocks: ReadonlyArray<Block>): string[] {
  return SHADCN_RULES.flatMap((rule) => {
    const inApp = blocks.filter(
      (b) =>
        isOn(b.rules[rule]) &&
        b.files.some((f) => f.startsWith('frontend/src')),
    )
    if (inApp.length === 0) return [`${rule} is not turned on in frontend/src`]
    return inApp
      .filter((b) => !b.excludeFiles.includes(SHADCN_FOLDER))
      .map(() => `${rule} also applies in ${SHADCN_FOLDER}`)
  })
}

/** The config's problems; empty when everything is right. */
export function checkRules(
  lint: LintConfig,
  locals: ReadonlyArray<LocalPlugin>,
): string[] {
  const blocks = blocksOf(lint)
  const on = new Set(
    blocks.flatMap((b) =>
      Object.entries(b.rules)
        .filter(([, level]) => isOn(level))
        .map(([name]) => name),
    ),
  )
  return [
    ...unregisteredPlugins(lint, locals, on),
    ...missingRules(locals, on),
    ...misplacedShadcn(blocks),
  ]
}
