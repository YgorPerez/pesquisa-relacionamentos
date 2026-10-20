// Each test uses a temporary remote (`--bare`), a clone and a worktree of it:
// nothing writes to this repo's `.git`. The suite, the audit and
// `before-merge` go through a fake `run`.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import {
  dryRunReport,
  mergeBranches,
  type Run,
  takeTurn,
} from './merge-branches.ts'
import { envWithoutHookGit } from './suite-log.ts'

const temporaries: string[] = []
afterEach(() => {
  for (const folder of temporaries.splice(0))
    rmSync(folder, { recursive: true, force: true })
})

function git(cwd: string, ...args: string[]) {
  const r = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: envWithoutHookGit(),
  })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
  return r.stdout.trim()
}

/** The remote with `main` and two ticket branches, `ticket/a` and `ticket/b`,
 * and a detached worktree to merge from. With `conflict`, both change the same
 * line. */
function repositories({ conflict = false } = {}) {
  const folder = mkdtempSync(join(tmpdir(), 'merge-'))
  temporaries.push(folder)
  const remote = join(folder, 'remote.git')
  const clone = join(folder, 'clone')
  git(folder, 'init', '-q', '--bare', '-b', 'main', remote)
  git(folder, 'clone', '-q', remote, clone)
  git(clone, 'config', 'user.email', 'test@local')
  git(clone, 'config', 'user.name', 'Test')
  const commit = (file: string, text: string) => {
    writeFileSync(join(clone, file), text)
    git(clone, 'add', '.')
    git(clone, 'commit', '-qm', `${file}: ${text}`)
  }
  commit('common.txt', 'base')
  git(clone, 'push', '-q', 'origin', 'HEAD:main')
  for (const branch of ['a', 'b']) {
    git(clone, 'switch', '-qc', `ticket/${branch}`, 'main')
    commit(conflict ? 'common.txt' : `${branch}.txt`, branch)
    git(clone, 'push', '-q', 'origin', `HEAD:ticket/${branch}`)
  }
  git(clone, 'switch', '-q', 'main')
  const worktree = join(folder, 'merge')
  git(clone, 'worktree', 'add', '-q', '--detach', worktree, 'main')
  return { remote, clone, worktree }
}

function fakeRun(red?: string) {
  const ran: string[] = []
  const run: Run = (command) => {
    const text = command.join(' ')
    ran.push(text)
    return { status: red && text.includes(red) ? 1 : 0, output: '' }
  }
  return { run, ran }
}

const noGh = () => {
  throw new Error('gh does not run in tests')
}

describe('mergeBranches', () => {
  it('merges the branches, runs the audit, before-merge and the suite, and publishes', () => {
    const { remote, worktree } = repositories()
    const before = git(worktree, 'rev-parse', 'HEAD')
    const { run, ran } = fakeRun()
    const said: string[] = []

    const status = mergeBranches({
      root: worktree,
      target: 'main',
      branches: ['ticket/a', 'ticket/b'],
      run,
      say: (t) => said.push(t),
      gh: noGh,
    })

    expect({ status, said }).toMatchObject({ status: 0 })
    expect(ran.map((r) => r.split(' ')[1])).toEqual([
      '.github/scripts/suppressions.ts',
      'scripts/before-merge.ts',
      'scripts/pr-suite.ts',
    ])
    const main = git(remote, 'log', '--format=%s', 'main')
    expect(main).toMatch(/Merge branch 'ticket\/a'/)
    expect(main).toMatch(/Merge branch 'ticket\/b'/)
    // The worktree goes back to where it was.
    expect(git(worktree, 'rev-parse', 'HEAD')).toBe(before)
  })

  it('a red suite publishes nothing', () => {
    const { remote, worktree } = repositories()
    const main = git(remote, 'rev-parse', 'main')
    const status = mergeBranches({
      root: worktree,
      target: 'main',
      branches: ['ticket/a'],
      run: fakeRun('pr-suite').run,
      say: () => {},
      gh: noGh,
    })
    expect(status).toBe(1)
    expect(git(remote, 'rev-parse', 'main')).toBe(main)
  })

  it('on a conflict, stops with the files and does not run the suite', () => {
    const { worktree } = repositories({ conflict: true })
    const { run, ran } = fakeRun()
    const said: string[] = []
    expect(
      mergeBranches({
        root: worktree,
        target: 'main',
        branches: ['ticket/a', 'ticket/b'],
        run,
        say: (t) => said.push(t),
        gh: noGh,
      }),
    ).toBe(1)
    expect(said.join('\n')).toMatch(/conflict in ticket\/b: common\.txt/)
    expect(ran).toEqual([])
    expect(git(worktree, 'status', '--porcelain')).toBe('')
  })

  it('the dry run reports ok or the conflicts of each branch, without publishing', () => {
    const { remote, clone } = repositories({ conflict: true })
    const main = git(remote, 'rev-parse', 'main')
    const said: string[] = []
    expect(
      mergeBranches({
        root: clone,
        target: 'main',
        branches: ['ticket/a', 'ticket/b'],
        dryRun: true,
        run: fakeRun().run,
        say: (t) => said.push(t),
        gh: noGh,
      }),
    ).toBe(1)
    expect(said).toEqual([
      'ok        ticket/a',
      'conflict  ticket/b: common.txt',
    ])
    expect(git(remote, 'rev-parse', 'main')).toBe(main)
  })

  it('refuses the main checkout and a missing branch', () => {
    const { clone, worktree } = repositories()
    const said: string[] = []
    const attempt = (root: string, branches: string[]) =>
      mergeBranches({
        root,
        target: 'main',
        branches,
        run: fakeRun().run,
        say: (t) => said.push(t),
        gh: noGh,
      })
    expect(attempt(clone, ['ticket/a'])).toBe(1)
    expect(attempt(worktree, ['ticket/missing'])).toBe(1)
    expect(said.join('\n')).toMatch(/main/)
    expect(said.join('\n')).toMatch(/origin\/ticket\/missing does not exist/)
  })
})

describe('takeTurn', () => {
  it('takes a free turn or a dead owner’s, and refuses a live one’s', () => {
    const folder = mkdtempSync(join(tmpdir(), 'turn-'))
    temporaries.push(folder)
    const file = join(folder, 'turn')
    expect(takeTurn(file, 10, () => true)).toEqual({ taken: true })
    expect(takeTurn(file, 20, () => true)).toEqual({
      taken: false,
      owner: 10,
    })
    expect(takeTurn(file, 20, () => false)).toEqual({ taken: true })
  })
})

describe('dryRunReport', () => {
  it('one line per branch', () => {
    expect(
      dryRunReport([
        { branch: 'a', conflicts: null },
        { branch: 'b', conflicts: [] },
      ]),
    ).toEqual(['ok        a', 'conflict  b: (git did not say which files)'])
  })
})
