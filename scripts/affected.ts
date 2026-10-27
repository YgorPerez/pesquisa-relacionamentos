// What a diff affects, like Festival dos Macacos's `afetados.ts`: the PR suite
// (`pr-suite.ts`), the minimal proof (`minimal-proof.ts`) and the push hook
// (`verify-push.ts`) run only that. The full suite runs in the PR's CI and
// every night.
//
// Vitest tests pick themselves: `--changed <base>` follows the import graph
// from what changed. What is left to decide here is when to run everything,
// because the graph does not see what changes outside it (the lockfile, a
// config, the plugin that reads the library), which packages to run Vitest
// in, and which e2e specs the diff reaches, because a spec opens a URL and
// does not import the screen. A spec reaches the terms the table below lists,
// through the name of the app file that changed and through its folders.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

import { spawnSync } from 'node:child_process'

/** The terms each e2e spec covers. A new spec goes in here, and this file's
 * test fails until it does. The terms are app file and folder names. */
export const SPEC_TERMS: Readonly<Record<string, readonly string[]>> = {
  'accessibility.e2e.ts': [],
  'analytics.e2e.ts': ['analytics', 'contagem', 'privacidade'],
  'search.e2e.ts': ['busca', 'guia', 'estudos'],
  'site-search.e2e.ts': ['busca', 'topo', 'guia', 'estudos'],
  'possible-group-card.e2e.ts': ['grupo-possivel', 'compartilhar'],
  'fact-sheets.e2e.ts': ['estudos', 'selos'],
  'possible-group.e2e.ts': ['grupo-possivel'],
  'guide.e2e.ts': ['guia', 'dicas', 'inicio'],
  'home.e2e.ts': ['inicio'],
  'reads.e2e.ts': ['leituras'],
  'link.e2e.ts': ['link', 'compartilhar', 'grupo-possivel', 'prioridades'],
  'navigation.e2e.ts': ['navegacao', 'topo', 'guia'],
  'profile.e2e.ts': ['perfil', 'guia'],
  'priorities.e2e.ts': ['prioridades', 'guia'],
  'privacy.e2e.ts': ['privacidade'],
  'neighbor-sites.e2e.ts': ['sites-vizinhos', 'guia'],
  'reading.e2e.ts': ['leitura', 'inicio', 'guia'],
  'selection.e2e.ts': ['selecao', 'busca', 'guia', 'dicas', 'estudos'],
  'highlight.e2e.ts': ['grifo', 'selecao', 'guia'],
  'highlights.e2e.ts': ['grifo', 'grifos'],
  'selection-source.e2e.ts': ['selecao', 'guia', 'estudos'],
}

/** Run on every run that touches the app: they open each page cold, and
 * catch what breaks on any of them. */
const ALWAYS = ['accessibility.e2e.ts', 'home.e2e.ts']

/** A file or folder name that is not its own term. */
const ALIASES: Readonly<Record<string, string>> = {
  $tema: 'guia',
  guias: 'guia',
  guides: 'guia',
  'guide-view': 'guia',
  'profile-in-guide': 'perfil',
  'group-packs': 'grupo-possivel',
  'priorities-view': 'prioridades',
  'fact-sheets': 'estudos',
  'cited-in': 'estudos',
  goatcounter: 'analytics',
  counting: 'analytics',
  events: 'analytics',
  index: 'inicio',
  home: 'inicio',
  header: 'topo',
  navigation: 'navegacao',
  badges: 'selos',
  share: 'compartilhar',
  profile: 'perfil',
  priorities: 'prioridades',
  'possible-group': 'grupo-possivel',
  reads: 'leituras',
  reading: 'leitura',
  'reading-progress': 'leitura',
  'continue-reading': 'leitura',
  search: 'busca',
  'site-search': 'busca',
  'site-search-view': 'busca',
  readings: 'sites-vizinhos',
  'neighbor-sites': 'sites-vizinhos',
  'neighbor-sites-view': 'sites-vizinhos',
  'text-fragment': 'busca',
  'selection-popover': 'selecao',
  'selection-quote': 'selecao',
  'selection-copy': 'selecao',
  'selection-action': 'selecao',
  'selection-count': 'selecao',
  'quote-text': 'selecao',
  highlight: 'grifo',
  highlights: 'grifo',
  'highlight-action': 'grifo',
  'highlight-layer': 'grifo',
  'highlight-paint': 'grifo',
  'highlight-popover': 'grifo',
  'highlight-text': 'grifo',
  'highlight-list': 'grifos',
  'highlight-record': 'grifo',
  'selection-source': 'selecao',
  'selection-sentences': 'selecao',
  'selection-button': 'selecao',
}

/** What changes outside the import graph, or what everything else uses. */
const AFFECTS_ALL: ReadonlyArray<[RegExp, string]> = [
  [/^packages\//, 'packages/ is read by the whole app'],
  [/(^|\/)platform\//, 'platform/ belongs to every page'],
  [/(^|\/)pnpm-(lock|workspace)\.yaml$/, 'pnpm-lock or the workspace changed'],
  [/(^|\/)package\.json$/, 'a package.json changed'],
  [/(^|\/)tsconfig[^/]*\.json$/, 'a tsconfig changed'],
  [/(^|\/)[^/]+\.config\.(ts|js|mjs)$/, 'a config changed'],
  [/^frontend\/\.storybook\//, 'the Storybook config changed'],
  [/^frontend\/lint\//, 'a lint rule changed'],
  [/^frontend\/vite\//, 'a build plugin changed'],
  [
    /^frontend\/src\/[^/]+$/,
    "the app's entry changed (router, server, styles)",
  ],
  [/^frontend\/src\/routes\/__root\.tsx$/, 'the routes root changed'],
  [
    /^frontend\/src\/ui\/(tokens|drawings|fonts|desenhos|fontes)\.css$/,
    'the style of every page changed',
  ],
  [
    /^frontend\/src\/(content\/view|state\/stored|conteudo\/vista|estado\/armazenado)\.ts$/,
    'what every page reads changed',
  ],
  [/^frontend\/e2e\/(?![^/]+\.e2e\.ts$)/, 'the e2e under the specs changed'],
  [
    /^scripts\/(ports|machine-queue|dev|kill-tree)\.ts$/,
    'a script the suite uses changed',
  ],
  [/^\.github\/workflows\//, 'the CI changed'],
]

/** Has no tests: text for people and for agents. */
const TEXT_ONLY = /(\.md$|^docs\/|^\.claude\/|^\.agents\/|^GLOSSARY|^README)/
/** The library, which Content validates and the build reads. */
const LIBRARY = /^(studies|tips|reports|sources|data)\//
const FROM_ROOT = /^(\.github\/)?scripts\//

export type Plan = {
  /** Why everything runs, or `null` when only the affected part runs. */
  readonly full: string | null
  /** The folders where Vitest runs, with `--changed`: `frontend`, a package
   * in `packages/`, or `.` for the root scripts. */
  readonly packages: readonly string[]
  /** Whether the build runs. */
  readonly build: boolean
  /** Whether the stories tests run. */
  readonly stories: boolean
  /** The e2e specs, in order. Empty, the e2e does not run. */
  readonly specs: readonly string[]
  /** What the log says about each choice. */
  readonly reasons: readonly string[]
}

const ALL_SPECS = Object.keys(SPEC_TERMS).sort()
const TERMS = new Set(Object.values(SPEC_TERMS).flat())
const FOLDERS = ['frontend', 'packages/content', 'packages/rules', '.']

/** The terms of an app file: each folder and the name, without extensions. */
function fileTerms(path: string) {
  return path
    .replace(/^frontend\/src\/[^/]+\//, '')
    .split('/')
    .map((part) => part.replace(/(\.[a-z]+)+$/, ''))
    .map((part) => ALIASES[part] ?? part)
    .filter((part) => TERMS.has(part))
}

/** The plan for a run, from the files the diff changed, with paths from the
 * repo root. */
export function planForDiff(files: readonly string[]): Plan {
  const packages = new Set<string>()
  const specs = new Set<string>()
  const reasons: string[] = []
  let app = false
  let build = false
  let wholeE2e = false

  for (const file of files) {
    const affectsAll = AFFECTS_ALL.find(([pattern]) => pattern.test(file))
    if (affectsAll)
      return {
        full: `${affectsAll[1]} (${file})`,
        packages: FOLDERS,
        build: true,
        stories: true,
        specs: ALL_SPECS,
        reasons: [],
      }
    // Before text: a fact sheet is `.md`, and the build reads it.
    if (LIBRARY.test(file)) {
      packages.add('packages/content')
      build = true
      continue
    }
    if (TEXT_ONLY.test(file)) continue
    if (FROM_ROOT.test(file)) {
      packages.add('.')
      continue
    }
    const spec = /^frontend\/e2e\/([^/]+\.e2e\.ts)$/.exec(file)?.[1]
    if (spec) {
      specs.add(spec)
      build = true
      continue
    }
    if (!file.startsWith('frontend/')) {
      reasons.push(`${file} has no tests`)
      continue
    }
    packages.add('frontend')
    if (!file.startsWith('frontend/src/')) continue
    app = true
    build = true
    if (file.endsWith('.test.ts')) continue
    const terms = fileTerms(file)
    if (terms.length === 0) {
      wholeE2e = true
      reasons.push(`whole e2e: ${file} has no term in the table`)
    }
    for (const term of terms)
      for (const [name, itsTerms] of Object.entries(SPEC_TERMS))
        if (itsTerms.includes(term)) specs.add(name)
  }

  if (app) for (const spec of wholeE2e ? ALL_SPECS : ALWAYS) specs.add(spec)
  return {
    full: null,
    packages: FOLDERS.filter((p) => packages.has(p)),
    build,
    stories: app,
    specs: [...specs].sort(),
    reasons,
  }
}

/** The commit `HEAD` branched from `against`, and what changed since it,
 * uncommitted changes and new files included. Fetches `origin` first, unless
 * `fetch` is `false`. */
export function diffAgainst(
  root: string,
  against: string,
  { fetch = true } = {},
) {
  const git = (...args: string[]) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
    if (result.status !== 0)
      throw new Error(`git ${args.join(' ')}: ${result.stderr.trim()}`)
    return result.stdout.trim()
  }
  if (fetch) spawnSync('git', ['fetch', '-q', 'origin'], { cwd: root })
  const base = git('merge-base', against, 'HEAD')
  const files = [
    ...git('diff', '--name-only', '--no-renames', base).split(/\r?\n/),
    ...git('ls-files', '--others', '--exclude-standard').split(/\r?\n/),
  ].filter(Boolean)
  return { base, files: [...new Set(files)].sort() }
}
