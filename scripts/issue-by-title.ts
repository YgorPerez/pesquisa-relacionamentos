// The issue behind an automatic report, found by its title: "Suíte noturna
// vermelha" (`nightly-suite.ts`) and "Testes intermitentes" (`flaky.ts`).
// Each report comments on the open one, or opens one.
//
// Runs on plain `node`, without `node_modules`.

import { spawnSync } from 'node:child_process'

/** A `gh` that returns its output and throws if it fails. */
export type Gh = (args: string[], input?: string) => string

/** `gh` in `cwd`. `command` is the executable and the arguments that come
 * before `gh`'s own: the tests put a fake one there. Without a shell, the
 * body goes whole through stdin, and no `cmd` touches the quotes. */
export function ghIn(
  cwd: string,
  [executable, ...before]: string[] = ['gh'],
): Gh {
  return (args, input) => {
    const result = spawnSync(executable ?? 'gh', [...before, ...args], {
      cwd,
      encoding: 'utf8',
      input,
    })
    if (result.status !== 0)
      throw new Error(
        `gh ${args.slice(0, 2).join(' ')}: ${result.stderr || result.error?.message}`,
      )
    return result.stdout.trim()
  }
}

/** The open issue with exactly this title, if there is one. */
export function findOpenIssue(gh: Gh, title: string): number | null {
  const list = JSON.parse(
    gh([
      'issue',
      'list',
      '--state',
      'open',
      '--search',
      `"${title}" in:title`,
      '--json',
      'number,title',
    ]),
  ) as { number: number; title: string }[]
  return list.find((issue) => issue.title === title)?.number ?? null
}

/** Opens the issue and returns its number, read from the URL `gh` prints. */
export function openIssue(
  gh: Gh,
  title: string,
  body: string,
  labels: string[] = [],
): number {
  const url = gh(
    [
      'issue',
      'create',
      '--title',
      title,
      ...labels.flatMap((label) => ['--label', label]),
      '--body-file',
      '-',
    ],
    body,
  )
  const number = Number(url.match(/\/issues\/(\d+)/)?.[1])
  if (!Number.isInteger(number))
    throw new Error(`gh issue create did not return the issue: ${url}`)
  return number
}
