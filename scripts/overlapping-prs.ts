// The open PRs that touch the same files as this branch, as in Festival dos
// Macacos. `pr-suite.ts` lists them before running: there, two sessions bumped
// the same dependency at the same time, and one only learned of the other from
// the user. The list of open PRs is the only place where a session sees what
// the others are doing.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it can
// strip.

import { spawnSync } from 'node:child_process'

/** An open PR, as `gh pr list --json number,title,headRefName,files` gives it. */
export type OpenPr = {
  number: number
  title: string
  headRefName: string
  files: { path: string }[]
}

export type Overlap = { number: number; title: string; shared: string[] }

/** The PRs in `prs` with some file from `files`, except those from the
 * branches in `ignore`: this branch's own, and the one under a stacked PR. */
export function overlaps(
  files: string[],
  prs: OpenPr[],
  ignore: string[],
): Overlap[] {
  const inBranch = new Set(files)
  return prs
    .filter((pr) => !ignore.includes(pr.headRefName))
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      shared: pr.files.map((f) => f.path).filter((p) => inBranch.has(p)),
    }))
    .filter((pr) => pr.shared.length > 0)
    .sort((a, b) => a.number - b.number)
}

/** The warning lines, up to `MAX_FILES` files per PR. */
const MAX_FILES = 5
export function overlapWarning(list: Overlap[]): string[] {
  return list.map(({ number, title, shared }) => {
    const shown = shared.slice(0, MAX_FILES).join(', ')
    const rest =
      shared.length > MAX_FILES ? ` and ${shared.length - MAX_FILES} more` : ''
    return `#${number} ${title}: ${shown}${rest}`
  })
}

/** The repo's open PRs, or why they could not be read. Without `gh` or
 * without network, the suite goes on without the warning. */
export function openPrs(dir: string): OpenPr[] | { reason: string } {
  const result = spawnSync(
    'gh',
    [
      'pr',
      'list',
      '--state',
      'open',
      '--limit',
      '100',
      '--json',
      'number,title,headRefName,files',
    ],
    { cwd: dir, encoding: 'utf8' },
  )
  if (result.error) return { reason: `gh did not run: ${result.error.message}` }
  if (result.status !== 0)
    return { reason: `gh pr list failed: ${result.stderr.trim()}` }
  return JSON.parse(result.stdout) as OpenPr[]
}
