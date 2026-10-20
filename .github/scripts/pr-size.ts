// The PR size becomes a label, from `tamanho:PP` to `tamanho:XG`, as in
// Festival dos Macacos (which took it from t3code's `pr-size.yml`). Whoever
// opens the PR list sees from afar what is one line and what is an afternoon
// of reading.
//
// Counts only what someone wrote: lockfile, generated route tree, badge and
// vendored skill stay out, and a binary file has no lines. In a PR that
// touches code and tests, the tests stay out too, so the test that comes with
// the change does not push the label up. In a test-only PR, they count.
//
// Runs in `pr-size.yml` on every push to a PR. By hand, it only measures:
//   node .github/scripts/pr-size.ts origin/main
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

type Size = { name: string; range: string; upTo: number; color: string }

const XG: Size = {
  name: 'tamanho:XG',
  range: '1000 or more',
  upTo: Number.POSITIVE_INFINITY,
  color: 'b60205',
}
const SIZES: Size[] = [
  { name: 'tamanho:PP', range: '0 to 9', upTo: 9, color: '0e8a16' },
  { name: 'tamanho:P', range: '10 to 29', upTo: 29, color: '5ebd3e' },
  { name: 'tamanho:M', range: '30 to 99', upTo: 99, color: 'fbca04' },
  { name: 'tamanho:G', range: '100 to 499', upTo: 499, color: 'fe7d37' },
  { name: 'tamanho:GG', range: '500 to 999', upTo: 999, color: 'd93f0b' },
  XG,
]

/** What nobody wrote by hand. */
const GENERATED = [
  /(?:^|\/)pnpm-lock\.yaml$/,
  /(?:^|\/)skills-lock\.json$/,
  /routeTree\.gen\.ts$/,
  /^docs\/badges\//,
  /^\.agents\//,
]
const TEST = /\.(?:test|e2e)\.tsx?$|^frontend\/e2e\//

/** The size, from the PR's `git diff --numstat`. */
export function measure(numstat: string) {
  const files = numstat
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      const [added, removed, path = ''] = line.split('\t')
      // A binary comes as `-\t-`: it has no lines to count.
      if (added === '-' || GENERATED.some((r) => r.test(path))) return []
      return [{ path, lines: Number(added) + Number(removed) }]
    })
  const tests = files.filter((f) => TEST.test(f.path))
  const code = files.filter((f) => !TEST.test(f.path))
  const testsOnly = code.length === 0
  const counted = testsOnly ? tests : code
  const lines = counted.reduce((sum, f) => sum + f.lines, 0)
  return {
    size: SIZES.find((s) => lines <= s.upTo) ?? XG,
    lines,
    counted: counted.length,
    tests: testsOnly ? 0 : tests.length,
  }
}

if (import.meta.main) {
  const base = process.argv[2] ?? 'origin/main'
  const pr = process.env.PR
  const labels: string[] = JSON.parse(process.env.LABELS ?? '[]')
  const { size, lines, counted, tests } = measure(
    execFileSync(
      'git',
      ['diff', '--numstat', '-M', '--no-color', `${base}...HEAD`],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    ),
  )
  const report = [
    `### ${size.name}`,
    '',
    `${lines} lines changed in ${counted} files` +
      (tests > 0 ? `, plus ${tests} test files not counted.` : '.'),
  ].join('\n')
  console.log(report)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`)

  if (process.env.GITHUB_ACTIONS === 'true' && pr) {
    const gh = (...args: string[]) =>
      execFileSync('gh', args, { stdio: ['ignore', 'ignore', 'inherit'] })
    // `--force` also fixes the color and description of a label that exists.
    gh(
      'label',
      'create',
      size.name,
      '--force',
      '--color',
      size.color,
      '--description',
      `${size.range} lines written by hand (without tests, in a PR that also changes code).`,
    )
    for (const old of labels) {
      if (!old.startsWith('tamanho:') || old === size.name) continue
      gh(
        'api',
        '--method',
        'DELETE',
        `repos/{owner}/{repo}/issues/${pr}/labels/${encodeURIComponent(old)}`,
      )
    }
    if (!labels.includes(size.name))
      gh(
        'api',
        `repos/{owner}/{repo}/issues/${pr}/labels`,
        '-f',
        `labels[]=${size.name}`,
      )
  }
}
