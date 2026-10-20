// The Fact sheet gate (#78, ADR 0040): runs `verify-fact-sheet` on each
// Fact sheet marked verified (✅), with `sources/private/` cloned from the
// private sources repo. A PR checks the fact sheets it touches; a push to
// main checks all of them.
//
// - A broken excerpt, a number that is not in it or a `Cálculo` that does not
//   reproduce the Valor fails.
// - A ✅ fact sheet with no local source is not verified. When the PR is what
//   marked it ✅, that fails: the claim comes with its source. One that was
//   already ✅ only warns, because the sources were not in any repo before the
//   private one existed, and failing those would turn every PR red.
//
//   node .github/scripts/fact-sheets.ts --base origin/main
//   node .github/scripts/fact-sheets.ts --all
import { spawnSync } from 'node:child_process'
import { appendFileSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { findSource, verifyFactSheet } from '../../scripts/verify-fact-sheet.ts'

export type Result =
  | { file: string; kind: 'verified'; source: string; rows: number }
  | { file: string; kind: 'failed'; source: string | null; reasons: string[] }
  | { file: string; kind: 'no-source'; newlyVerified: boolean }

/** The `status` in a fact sheet's frontmatter, or `null`. */
export function statusOf(text: string | null) {
  const frontmatter = text?.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  return frontmatter.match(/^status:\s*["']?([\w-]+)/m)?.[1] ?? null
}

const slugOf = (file: string) => file.replace(/^.*\//, '').replace(/\.md$/, '')

/** Checks one fact sheet. `null` when it is not marked verified. `baseText`
 * is the fact sheet before the PR (`null` when the PR adds it); without it,
 * as on main, a missing source is never the PR's doing. */
export function checkFactSheet(
  file: string,
  { root, baseText }: { root: string; baseText?: string | null },
): Result | null {
  if (statusOf(readFileSync(join(root, file), 'utf8')) !== 'verified')
    return null
  if (!findSource(root, slugOf(file)))
    return {
      file,
      kind: 'no-source',
      newlyVerified:
        baseText !== undefined && statusOf(baseText) !== 'verified',
    }
  const r = verifyFactSheet(file, { root })
  if (r.failures.length === 0 && r.source)
    return { file, kind: 'verified', source: r.source, rows: r.verified }
  return {
    file,
    kind: 'failed',
    source: r.source,
    reasons: r.failures.map((f) =>
      f.row === null ? f.reason : `row ${f.row} (${f.measure}): ${f.reason}`,
    ),
  }
}

/** Escapes a workflow command's message (`%`, CR and LF). */
const escape = (text: string) =>
  text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')

/** What to print (with the workflow annotations), the step summary, and
 * whether the job fails. */
export function report(results: ReadonlyArray<Result>, scope: string) {
  const lines: string[] = []
  const rows: string[] = []
  let failed = false
  for (const r of results) {
    if (r.kind === 'verified') {
      lines.push(`ok    ${r.file} (${r.source}): ${r.rows} rows verified`)
      rows.push(
        `| \`${r.file}\` | verified, ${r.rows} rows (\`${r.source}\`) |`,
      )
    } else if (r.kind === 'failed') {
      failed = true
      lines.push(`FAIL  ${r.file}${r.source ? ` (${r.source})` : ''}`)
      for (const reason of r.reasons) {
        lines.push(`  ${reason}`)
        lines.push(
          `::error file=${r.file},title=Fact sheet does not match its source::${escape(reason)}`,
        )
      }
      rows.push(`| \`${r.file}\` | **failed**: ${r.reasons.length} problems |`)
    } else {
      const where = `no sources/${slugOf(r.file)}.* nor sources/private/${slugOf(r.file)}.* (the private repo)`
      if (r.newlyVerified) {
        failed = true
        lines.push(`FAIL  ${r.file}: marked verified in this PR, but ${where}`)
        lines.push(
          `::error file=${r.file},title=Verified without a local source::This PR marks it verified, but there is ${where}. Add the source first: open license in sources/, the rest pushed to the private repo.`,
        )
        rows.push(
          `| \`${r.file}\` | **failed**: marked verified without a local source |`,
        )
      } else {
        lines.push(`SKIP  ${r.file}: NOT verified, ${where}`)
        lines.push(
          `::warning file=${r.file},title=Verified fact sheet not checked::There is ${where}, so CI did not check its excerpts. Add it: open license in sources/, the rest pushed to the private repo.`,
        )
        rows.push(`| \`${r.file}\` | not checked: no local source |`)
      }
    }
  }
  if (results.length === 0) lines.push(`No verified fact sheet in ${scope}.`)
  const summary = [
    `### Fact sheets (${scope})`,
    '',
    ...(rows.length > 0
      ? ['| Fact sheet | Result |', '| --- | --- |', ...rows]
      : [`No verified fact sheet in ${scope}.`]),
    '',
  ].join('\n')
  return { lines, summary, failed }
}

function git(root: string, ...args: string[]) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  return r.status === 0 ? r.stdout : null
}

const FACT_SHEET = /^studies\/[^_/][^/]*\.md$/

if (import.meta.main) {
  const { values } = parseArgs({
    options: { base: { type: 'string' }, all: { type: 'boolean' } },
  })
  const root = process.cwd()
  let files: string[]
  let scope: string
  let baseOf: (file: string) => string | null | undefined = () => undefined
  if (values.all) {
    files = readdirSync(join(root, 'studies'))
      .map((name) => `studies/${name}`)
      .filter((file) => FACT_SHEET.test(file))
    scope = 'the whole library'
  } else if (values.base) {
    const changed = git(
      root,
      'diff',
      '--name-only',
      '--diff-filter=d',
      `${values.base}...HEAD`,
      '--',
      'studies/',
    )
    const mergeBase = git(root, 'merge-base', values.base, 'HEAD')?.trim()
    if (changed === null || !mergeBase) {
      console.error(`git could not compare HEAD with ${values.base}.`)
      process.exit(1)
    }
    files = changed.split('\n').filter((file) => FACT_SHEET.test(file))
    scope = 'this PR'
    baseOf = (file) => git(root, 'show', `${mergeBase}:${file}`)
  } else {
    console.error(
      'usage: node .github/scripts/fact-sheets.ts --base <ref> | --all',
    )
    process.exit(1)
  }
  const results = files.flatMap(
    (file) => checkFactSheet(file, { root, baseText: baseOf(file) }) ?? [],
  )
  const { lines, summary, failed } = report(results, scope)
  for (const line of lines) console.log(line)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary)
  process.exitCode = failed ? 1 : 0
}
