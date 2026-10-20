// Merges branches into a target and publishes, like the Festival dos Macacos
// `integrar-main.ts` (ADR 0021):
//
//   node scripts/merge-branches.ts [--target <branch>] <branch...>
//   node scripts/merge-branches.ts --dry-run [--target <branch>] <branch...>
//
// The default target is `main`; to gather tickets into a spec,
// `--target spec/23-mvp`. With the PR's CI up, a ticket goes in by merging its
// PR (`docs/agents/integracao.md`). This is for merging several branches at
// once with a single suite, or for when CI does not run.
//
// Runs in a clean worktree, never in the main checkout nor in the worktree of
// one of the branches it merges. One merge per repository at a time: the turn
// is a file at `<git-common-dir>/merge-branches.lock`, holding the owner's PID.
// While holding it:
//
// 1. fetches `origin` and puts the worktree, detached, on the fetched target;
// 2. merges each branch (`origin/<branch>`), in the given order, without
//    squash: the branches' commits stay. On a conflict, aborts the merge and
//    stops, naming the files;
// 3. the suppression audit against the target, `before-merge.ts` and the
//    diff's suite (`pr-suite.ts --base origin/<target>`). The first red stops;
// 4. fetches again. If the target moved during the suite, stops without
//    publishing: run it again. (The Festival merges the tip onto the new
//    target and runs again; here merges are few, and stopping is simpler.)
// 5. `git push origin HEAD:<target>`, without force, through the push hook.
//    Each test that only passed on retry becomes a comment on the
//    "Testes intermitentes" issue.
//
// When done, well or badly, the worktree goes back to where it was, and the
// branches never change. The turn is released when done, on an error and on
// SIGINT or SIGTERM; a dead owner's turn (its PID does not exist) is taken
// without killing anything.
//
// `--dry-run` only says what the merge would find: in a temporary worktree
// detached at the target, it merges each branch and reports ok or the
// conflicting files for each. It does not take the turn, run the suite, or
// push.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it erases.

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type Gh, ghIn } from './issue-by-title.ts'
import { reportOnIssue, type FlakyTest } from './flaky.ts'
import { ROOT } from './ports.ts'
import { envWithoutHookGit } from './suite-log.ts'

/** Runs a command in `folder` and returns its status and output. */
export type Run = (
  command: string[],
  folder: string,
) => { status: number | null; output: string }

export type MergeResult = { branch: string; conflicts: string[] | null }

/** The dry-run report: ok or the conflicts of each branch. */
export function dryRunReport(results: readonly MergeResult[]) {
  return results.map(({ branch, conflicts }) =>
    conflicts === null
      ? `ok        ${branch}`
      : `conflict  ${branch}: ${conflicts.join(', ') || '(git did not say which files)'}`,
  )
}

/** Whether the PID is still running. Only asks: signal 0 kills nothing. */
function isAlive(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

/** Takes the turn in `file`, or says whose it is. A dead owner's turn is
 * taken. */
export function takeTurn(
  file: string,
  pid: number,
  alive: (pid: number) => boolean = isAlive,
): { taken: true } | { taken: false; owner: number } {
  if (existsSync(file)) {
    const owner = Number(JSON.parse(readFileSync(file, 'utf8')).pid)
    if (owner !== pid && alive(owner)) return { taken: false, owner }
  }
  writeFileSync(file, JSON.stringify({ pid, start: new Date().toISOString() }))
  return { taken: true }
}

export function mergeBranches({
  root,
  target,
  branches,
  dryRun = false,
  run,
  say,
  gh,
}: {
  root: string
  target: string
  branches: readonly string[]
  dryRun?: boolean
  run: Run
  say: (text: string) => void
  gh: Gh
}): number {
  const git = (cwd: string, ...args: string[]) =>
    spawnSync('git', args, { cwd, encoding: 'utf8', env: envWithoutHookGit() })
  const line = (cwd: string, ...args: string[]) =>
    git(cwd, ...args).stdout.trim()
  const commonDir = line(
    root,
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir',
  )

  /** Merges each branch in `cwd`, in order, up to the first conflict; with
   * `keepGoing`, aborts the one that conflicted and moves to the next. */
  const mergeEach = (cwd: string, keepGoing: boolean) => {
    const results: MergeResult[] = []
    for (const branch of branches) {
      const merge = git(
        cwd,
        'merge',
        '--no-ff',
        '--no-edit',
        '-m',
        `Merge branch '${branch}' into ${target}`,
        `origin/${branch}`,
      )
      if (merge.status === 0) {
        results.push({ branch, conflicts: null })
        continue
      }
      const conflicts = line(cwd, 'diff', '--name-only', '--diff-filter=U')
        .split('\n')
        .filter(Boolean)
      git(cwd, 'merge', '--abort')
      results.push({ branch, conflicts })
      if (!keepGoing) break
    }
    return results
  }

  if (git(root, 'fetch', '-q', 'origin').status !== 0) {
    say('git fetch failed: nothing changed.')
    return 1
  }
  for (const branch of [target, ...branches])
    if (
      git(root, 'rev-parse', '--verify', '-q', `origin/${branch}`).status !== 0
    ) {
      say(`origin/${branch} does not exist.`)
      return 1
    }

  if (dryRun) {
    const folder = mkdtempSync(join(tmpdir(), 'merge-dry-run-'))
    rmSync(folder, { recursive: true })
    git(root, 'worktree', 'add', '-q', '--detach', folder, `origin/${target}`)
    try {
      const results = mergeEach(folder, true)
      for (const text of dryRunReport(results)) say(text)
      return results.some((r) => r.conflicts !== null) ? 1 : 0
    } finally {
      git(root, 'worktree', 'remove', '--force', folder)
    }
  }

  const current = line(root, 'rev-parse', '--abbrev-ref', 'HEAD')
  if (line(root, 'status', '--porcelain') !== '') {
    say('the worktree has changes: merge from a clean one.')
    return 1
  }
  if (branches.includes(current) || current === target) {
    say(
      `the worktree is on ${current}, which the merge would touch: run from another.`,
    )
    return 1
  }
  if (join(root, '.git') === commonDir) {
    say('this is the main checkout: run from a worktree just for this.')
    return 1
  }
  const turn = join(commonDir, 'merge-branches.lock')
  const taken = takeTurn(turn, process.pid)
  if (!taken.taken) {
    say(
      `another merge (PID ${taken.owner}) has the turn: wait for it to finish.`,
    )
    return 1
  }
  const startingPoint =
    current === 'HEAD' ? line(root, 'rev-parse', 'HEAD') : current
  const restore = () => {
    git(root, 'checkout', '-q', startingPoint)
    rmSync(turn, { force: true })
  }
  const onSignal = () => {
    restore()
    process.exit(130)
  }
  process.once('SIGINT', onSignal)
  process.once('SIGTERM', onSignal)
  try {
    const base = line(root, 'rev-parse', `origin/${target}`)
    git(root, 'checkout', '-q', '--detach', base)
    const conflict = mergeEach(root, false).find((r) => r.conflicts !== null)
    if (conflict) {
      say(
        `conflict in ${conflict.branch}: ${conflict.conflicts?.join(', ')}. Merge origin/${target} into it, resolve, and run again.`,
      )
      return 1
    }
    say(
      `${branches.join(', ')} onto ${target} (${base.slice(0, 7)}): ${line(root, 'rev-parse', '--short', 'HEAD')}`,
    )

    const steps: [string, string[]][] = [
      ['audit', ['node', '.github/scripts/suppressions.ts', '--base', base]],
      ['before-merge', ['node', 'scripts/before-merge.ts', '--base', base]],
      ['suite', ['node', 'scripts/pr-suite.ts', '--base', base]],
    ]
    let suiteOutput = ''
    for (const [name, command] of steps) {
      const { status, output } = run(command, root)
      if (name === 'suite') suiteOutput = output
      if (status !== 0) {
        say(
          `${name} red at ${line(root, 'rev-parse', 'HEAD')}: nothing published.`,
        )
        return 1
      }
    }

    git(root, 'fetch', '-q', 'origin')
    if (line(root, 'rev-parse', `origin/${target}`) !== base) {
      say(
        `origin/${target} moved during the suite: nothing published. Run again.`,
      )
      return 1
    }
    const push = git(root, 'push', 'origin', `HEAD:${target}`)
    if (push.status !== 0) {
      say(`the push was refused: ${push.stderr.trim()}`)
      return 1
    }
    const sha = line(root, 'rev-parse', 'HEAD')
    say(`published: ${target} = ${sha.slice(0, 7)}`)
    const flaky = flakyFromSuite(suiteOutput)
    if (flaky.length > 0) {
      const report = reportOnIssue(gh, sha, flaky)
      say(
        'error' in report
          ? `flaky tests not reported: ${report.error}`
          : `flaky tests in #${report.issue}`,
      )
    }
    return 0
  } finally {
    restore()
  }
}

/** The flaky tests the suite manifest records, found through the line that
 * says where it is. */
function flakyFromSuite(output: string): FlakyTest[] {
  const manifest = output.match(/^\[suite\] manifest at (.+)$/m)?.[1]
  if (!manifest || !existsSync(manifest)) return []
  return JSON.parse(readFileSync(manifest, 'utf8')).flaky ?? []
}

if (import.meta.main) {
  const argv = process.argv.slice(2)
  const i = argv.indexOf('--target')
  const target = i === -1 ? 'main' : argv[i + 1]
  const branches = argv.filter(
    (a, j) => !a.startsWith('--') && (i === -1 || j !== i + 1),
  )
  if (!target || branches.length === 0) {
    console.error(
      'usage: node scripts/merge-branches.ts [--dry-run] [--target <branch>] <branch...>',
    )
    process.exit(2)
  }
  process.exit(
    mergeBranches({
      root: ROOT,
      target,
      branches,
      dryRun: argv.includes('--dry-run'),
      run: (command, folder) => {
        const r = spawnSync(command[0] as string, command.slice(1), {
          cwd: folder,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'inherit'],
          maxBuffer: 256 * 1024 * 1024,
        })
        process.stdout.write(r.stdout ?? '')
        return { status: r.status, output: r.stdout ?? '' }
      },
      say: (text) => console.log(`[merge] ${text}`),
      gh: ghIn(ROOT),
    }),
  )
}
