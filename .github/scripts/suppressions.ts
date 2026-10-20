// The suppression gate, from the Festival dos Macacos `supressoes.ts` (its
// ADR 0036), with a ceiling. A lint, type, React Compiler or coverage
// suppression does not get in on its own:
//
// - The ceiling (`.github/suppression-ceiling.json`) says how many of each
//   directive the tree may have. Over it, this fails, label or not. The
//   ceiling only goes down: whoever removes a suppression lowers the number;
//   raising it changes an auditor's configuration, and that waits for a
//   person (below).
// - Every new directive says why, in the tool's format: after the `--` in
//   Oxlint, React Doctor and fallow, after the directive itself in
//   TypeScript, in a comment on the same line for `'use no memo'`. With no
//   reason, it always fails.
// - With a reason, or with an auditor's configuration changed, the PR waits
//   for a person to add the `supressao-revisada` label. No agent adds the
//   label. Outside CI (the push hook), this only warns: the PR is what blocks.
//
// Runs in `suppressions.yml` on every PR, in the push hook
// (`scripts/verify-push.ts`), and by hand:
//   node .github/scripts/suppressions.ts --base origin/main [--target HEAD]
import { spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

export type Finding = {
  file: string
  line: number
  name: string
  text: string
}
export type Count = Record<string, number>

export const LABEL = 'supressao-revisada'
export const CEILING_FILE = '.github/suppression-ceiling.json'
/** The ceiling's name before #69. A PR branched before the rename only has
 * this one at its tip. */
const LEGACY_CEILING_FILE = '.github/teto-de-supressoes.json'

/** Each directive, how it starts, and what counts as a reason after it. */
const DIRECTIVES = (
  [
    ['oxlint-disable', /oxlint-disable(?:-next-line|-line)?/, /\s--\s*\S/],
    ['eslint-disable', /eslint-disable(?:-next-line|-line)?/, /\s--\s*\S/],
    [
      'react-doctor-disable',
      /react-doctor-disable(?:-next-line|-line)?/,
      /\s--\s*\S/,
    ],
    ['@ts-expect-error', /@ts-expect-error/, /\S/],
    ['@ts-ignore', /@ts-ignore/, /\S/],
    ['@ts-nocheck', /@ts-nocheck/, /\S/],
    ['@effect-diagnostics', /@effect-diagnostics/, /\s--?\s+\S/],
    ['fallow-ignore', /fallow-ignore\S*/, /\s--\s*\S/],
    ['ignore de cobertura', /(?:v8|c8|istanbul) ignore/, /\s--\s*\S/],
  ] satisfies [string, RegExp, RegExp][]
).map(([name, directive, reason]) => ({
  name,
  // Only one that opens a comment counts: text quoting the directive
  // mid-sentence turns nothing off.
  pattern: new RegExp(
    String.raw`(?:\/\/|\/\*|^\s*\*)\s*${directive.source}(.*)`,
  ),
  reason,
}))
/** `'use no memo'` takes a component out of the React Compiler (ADR 0003). */
const NO_MEMO = /^\s*['"]use no memo['"];?(.*)$/

export function findDirective(
  line: string,
): { name: string; hasReason: boolean } | null {
  const memo = line.match(NO_MEMO)
  if (memo)
    return {
      name: 'use no memo',
      hasReason: /\/[/*]\s*\S/.test(memo[1] ?? ''),
    }
  for (const { name, pattern, reason } of DIRECTIVES) {
    const found = line.match(pattern)
    if (found) return { name, hasReason: reason.test(found[1] ?? '') }
  }
  return null
}

/** Where a directive is code. Documentation quotes directives without
 * applying any, vendored and generated files are not written here, and the
 * auditor and its test quote them on purpose. */
const CODE = /\.(?:[cm]?[jt]sx?|css)$/
const IGNORED = [
  /^\.agents\//,
  /^\.claude\//,
  /^\.repos\//,
  /routeTree\.gen\.ts$/,
  /^\.github\/scripts\/suppressions(?:\.test)?\.ts$/,
]
const isCode = (file: string) =>
  CODE.test(file) && !IGNORED.some((r) => r.test(file))

/** The auditors' configuration. Any change to it goes through a person. In
 * `package.json`, only the lines of the scripts that audit. */
const CONFIGURATION: { file: RegExp; line?: RegExp }[] = [
  { file: /(?:^|\/)vite\.config\.ts$/ },
  { file: /(?:^|\/)vitest\.[^/]*config\.ts$/ },
  { file: /^frontend\/doctor\.config\.ts$/ },
  { file: /(?:^|\/)\.fallowrc[^/]*$/ },
  { file: /(?:^|\/)tsconfig[^/]*\.json$/ },
  { file: /^frontend\/lint\/(?![^/]+\.test\.ts$)[^/]+\.ts$/ },
  { file: /^\.github\/(?:suppression-ceiling|teto-de-supressoes)\.json$/ },
  {
    file: /(?:^|\/)package\.json$/,
    line: /fallow|react-doctor|"check"|"lint"|"doctor"|coverage/,
  },
]

/** The suppressions the diff (`git diff --unified=0`) adds, and each auditor
 * configuration it changes, with the lines that changed in it. */
export function readDiff(diff: string) {
  const withoutReason: Finding[] = []
  const withReason: Finding[] = []
  const configuration = new Map<string, string[]>()
  let file: string | null = null
  let fromFile: string | null = null
  let line = 0
  // Between `diff --git` and the first `@@`: only there are `---` and `+++`
  // the header. After it, they are a line starting with `--` or `++`.
  let inHeader = false
  const ruleFor = (path: string) => CONFIGURATION.find((r) => r.file.test(path))

  for (const text of diff.split('\n')) {
    if (text.startsWith('diff --git ')) {
      inHeader = true
      file = null
      fromFile = null
      continue
    }
    if (inHeader && text.startsWith('--- ')) {
      fromFile = text === '--- /dev/null' ? null : text.slice('--- a/'.length)
      continue
    }
    if (inHeader && text.startsWith('+++ ')) {
      file = text === '+++ /dev/null' ? null : text.slice('+++ b/'.length)
      continue
    }
    const hunk = text.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
    if (hunk) {
      inHeader = false
      line = Number(hunk[1])
      continue
    }
    if (inHeader) continue
    // Deleting a configuration also changes it.
    const changed = file ?? fromFile ?? ''
    const rule = ruleFor(changed)
    if (rule && /^[+-]/.test(text) && (rule.line?.test(text) ?? true))
      configuration.set(changed, [...(configuration.get(changed) ?? []), text])
    if (!text.startsWith('+')) continue
    const current = line++
    if (!file || !isCode(file)) continue
    const found = findDirective(text.slice(1))
    if (!found) continue
    ;(found.hasReason ? withReason : withoutReason).push({
      file,
      line: current,
      name: found.name,
      text: text.slice(1).trim(),
    })
  }
  return { withoutReason, withReason, configuration }
}

/** How many of each directive the tree has, from the output of
 * `git grep -n -E <directives> <commit>` (`<commit>:<file>:<line>:<text>`). */
export function countInGrep(output: string): Count {
  const count: Count = {}
  for (const line of output.split('\n')) {
    const found = line.match(/^[^:]+:([^:]+):\d+:(.*)$/)
    if (!found || !isCode(found[1] ?? '')) continue
    const directive = findDirective(found[2] ?? '')
    if (directive) count[directive.name] = (count[directive.name] ?? 0) + 1
  }
  return count
}

/** The verdict and the report. */
export function judge({
  withoutReason,
  withReason,
  configuration,
  count,
  ceiling,
  labels,
  inCi,
}: ReturnType<typeof readDiff> & {
  count: Count
  ceiling: Count
  labels: readonly string[]
  inCi: boolean
}) {
  const names = [...new Set([...Object.keys(count), ...Object.keys(ceiling)])]
  const above = names.filter((n) => (count[n] ?? 0) > (ceiling[n] ?? 0))
  const below = names.filter((n) => (count[n] ?? 0) < (ceiling[n] ?? 0))
  const output: string[] = []
  const list = (findings: Finding[]) => {
    for (const s of findings)
      output.push(`- \`${s.file}:${s.line}\` ${s.name}: \`${s.text}\``)
    output.push('')
  }
  if (above.length > 0) {
    output.push(
      '### Above the ceiling',
      '',
      `Remove the new suppression. The ceiling (\`${CEILING_FILE}\`) only goes up with a person, and this fails even with the label until it does.`,
      '',
      ...above.map(
        (n) =>
          `- ${n}: ${count[n] ?? 0}, and the ceiling is ${ceiling[n] ?? 0}`,
      ),
      '',
    )
  }
  if (withoutReason.length > 0) {
    output.push(
      '### Suppressions without a reason',
      '',
      'Say why next to the directive. This fails even with the label.',
      '',
    )
    list(withoutReason)
  }
  if (withReason.length > 0) {
    output.push('### New suppressions', '')
    list(withReason)
  }
  if (configuration.size > 0) {
    output.push('### Auditor configuration changed', '')
    for (const [c, lines] of configuration)
      output.push(`- \`${c}\``, '', '```diff', ...lines, '```')
    output.push('')
  }
  const needsReview = withReason.length > 0 || configuration.size > 0
  const reviewed = labels.includes(LABEL)
  if (needsReview) {
    if (reviewed)
      output.push(`Label \`${LABEL}\` present: a person read what is above.`)
    else if (inCi)
      output.push(
        `A person still has to read what is above and add the \`${LABEL}\` label to the PR. An agent never adds this label.`,
      )
    else
      output.push(
        `The PR will wait for a person to add the \`${LABEL}\` label: show them what is above.`,
      )
  }
  if (below.length > 0)
    output.push(
      '',
      `The tree has fewer suppressions than the ceiling: lower in \`${CEILING_FILE}\` ${below
        .map((n) => `${n} to ${count[n] ?? 0}`)
        .join(', ')}.`,
    )
  if (output.length === 0)
    output.push(
      'No new suppression, the tree is at the ceiling, and no auditor configuration changed.',
    )
  const passes =
    above.length === 0 &&
    withoutReason.length === 0 &&
    (!needsReview || reviewed || !inCi)
  return { passes, lines: output }
}

/** The `git grep` pattern that finds every candidate directive. */
const CANDIDATES =
  'oxlint-disable|eslint-disable|react-doctor-disable|@ts-expect-error|@ts-ignore|@ts-nocheck|@effect-diagnostics|fallow-ignore|(v8|c8|istanbul) ignore|use no memo'

if (import.meta.main) {
  const { values: options, positionals } = parseArgs({
    allowPositionals: true,
    options: { base: { type: 'string' }, target: { type: 'string' } },
  })
  const base = options.base ?? positionals[0] ?? 'origin/main'
  const target = options.target ?? 'HEAD'
  const run = (args: string[]) =>
    spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const git = (...args: string[]) => {
    const r = run(args)
    // `git grep` exits with 1 when it finds nothing.
    if (r.status !== 0 && !(args[0] === 'grep' && r.status === 1)) {
      console.error(`git ${args.join(' ')}: ${r.stderr.trim()}`)
      process.exit(1)
    }
    return r.stdout
  }
  const baseSha = git('rev-parse', '--verify', `${base}^{commit}`).trim()
  const targetSha = git('rev-parse', '--verify', `${target}^{commit}`).trim()
  const root = git('rev-parse', '--show-toplevel').trim()
  const diff = readDiff(
    git(
      'diff',
      '--unified=0',
      '--no-color',
      '--no-ext-diff',
      '--src-prefix=a/',
      '--dst-prefix=b/',
      `${baseSha}...${targetSha}`,
    ),
  )
  // The ceiling comes from the target. One that predates #69 still has it
  // under the old name.
  const ceilingFile = (path: string) =>
    target === 'HEAD'
      ? existsSync(join(root, path))
      : run(['cat-file', '-e', `${targetSha}:${path}`]).status === 0
  const path = ceilingFile(CEILING_FILE) ? CEILING_FILE : LEGACY_CEILING_FILE
  const ceiling: Count = JSON.parse(
    target === 'HEAD'
      ? readFileSync(join(root, path), 'utf8')
      : git('show', `${targetSha}:${path}`),
  ).teto
  const { passes, lines } = judge({
    ...diff,
    count: countInGrep(git('grep', '-n', '-E', CANDIDATES, targetSha)),
    ceiling,
    labels: JSON.parse(process.env.LABELS ?? '[]'),
    inCi: process.env.GITHUB_ACTIONS === 'true',
  })
  const report = lines.join('\n')
  console.log(report)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`)
  process.exit(passes ? 0 : 1)
}
