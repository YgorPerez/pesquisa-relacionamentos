// Each test in a pair of temporary repositories, a remote (`--bare`) and a
// clone: the hook fetches from the remote as it would here. The commands it
// runs (the audit and Vitest) go through a fake `run`, which records each one.
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { envWithoutHookGit } from './suite-log.ts'
import { chooseTarget, verifyPush } from './verify-push.ts'

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

const ZERO = '0'.repeat(40)

/** A remote with `main` and `spec/9-x`, and a clone of it on branch
 * `ticket/10-y`, taken from the spec. */
function repositories() {
  const folder = mkdtempSync(join(tmpdir(), 'verify-push-'))
  temporaries.push(folder)
  const remote = join(folder, 'remote.git')
  const clone = join(folder, 'clone')
  git(folder, 'init', '-q', '--bare', '-b', 'main', remote)
  git(folder, 'clone', '-q', remote, clone)
  git(clone, 'config', 'user.email', 'test@local')
  git(clone, 'config', 'user.name', 'Test')
  const commit = (file: string, text = file) => {
    mkdirSync(join(clone, dirname(file)), { recursive: true })
    writeFileSync(join(clone, file), text)
    git(clone, 'add', '.')
    git(clone, 'commit', '-qm', file)
    return git(clone, 'rev-parse', 'HEAD')
  }
  const main = commit('README.md')
  git(clone, 'push', '-q', 'origin', 'HEAD:main')
  git(clone, 'switch', '-qc', 'spec/9-x')
  const spec = commit('scripts/from-spec.ts')
  git(clone, 'push', '-q', 'origin', 'HEAD:spec/9-x')
  git(clone, 'switch', '-qc', 'ticket/10-y')
  return { clone, main, spec, commit }
}

function fakeRun(fail: (command: string[]) => boolean = () => false) {
  const runs: { command: string[]; folder: string }[] = []
  return {
    runs,
    run: (command: string[], folder: string) => {
      runs.push({ command, folder })
      return fail(command) ? 1 : 0
    },
  }
}

const line = (ref: string, sha: string, remote = ZERO) =>
  `refs/heads/x ${sha} ${ref} ${remote}\n`

describe('chooseTarget', () => {
  it('is the remote branch the commit is closest to', () => {
    expect(
      chooseTarget([
        { ref: 'origin/main', ahead: 12 },
        { ref: 'origin/spec/23-mvp', ahead: 2 },
        { ref: 'origin/spec/8-old', ahead: 40 },
      ]),
    ).toBe('origin/spec/23-mvp')
    expect(chooseTarget([])).toBeNull()
  })
})

describe('verifyPush', () => {
  it('a ticket branch runs the audit against the spec and only the Vitest of the affected folders', () => {
    const { clone, spec, commit } = repositories()
    const sha = commit('scripts/new.ts')
    const { run, runs } = fakeRun()
    const said: string[] = []

    const { refused } = verifyPush({
      root: clone,
      remote: 'origin',
      input: line('refs/heads/ticket/10-y', sha),
      run,
      say: (t) => said.push(t),
      env: {},
    })

    expect(refused).toBe(false)
    expect(runs.map((r) => r.command.slice(0, 3).join(' '))).toEqual([
      'node .github/scripts/suppressions.ts --base',
      'pnpm exec vp',
    ])
    expect(runs[0]?.command).toContain(spec)
    expect(runs[1]).toEqual({
      command: [
        'pnpm',
        'exec',
        'vp',
        'test',
        'run',
        '--changed',
        spec,
        '--passWithNoTests',
      ],
      folder: clone,
    })
    expect(said.join('\n')).toMatch(/origin\/spec\/9-x/)
  })

  it("the branch's second push tests only what came after the first", () => {
    const { clone, commit } = repositories()
    const first = commit('scripts/a.ts')
    const second = commit('frontend/src/ui/perfil.tsx')
    const { run, runs } = fakeRun()

    verifyPush({
      root: clone,
      remote: 'origin',
      input: line('refs/heads/ticket/10-y', second, first),
      run,
      say: () => {},
      env: {},
    })

    const vitest = runs.filter((r) => r.command.includes('test'))
    expect(vitest.map((r) => r.folder)).toEqual([join(clone, 'frontend')])
    expect(vitest[0]?.command).toContain(first)
  })

  it('docs only runs no tests at all', () => {
    const { clone, commit } = repositories()
    const sha = commit('docs/x.md')
    const { run, runs } = fakeRun()
    verifyPush({
      root: clone,
      remote: 'origin',
      input: line('refs/heads/ticket/10-y', sha),
      run,
      say: () => {},
      env: {},
    })
    expect(runs).toHaveLength(1)
  })

  it('the audit or a red test refuses the push', () => {
    const { clone, commit } = repositories()
    const sha = commit('scripts/a.ts')
    for (const part of ['suppressions', 'test']) {
      const { run } = fakeRun((c) => c.join(' ').includes(part))
      const { refused } = verifyPush({
        root: clone,
        remote: 'origin',
        input: line('refs/heads/ticket/10-y', sha),
        run,
        say: () => {},
        env: {},
      })
      expect({ part, refused }).toEqual({ part, refused: true })
    }
  })

  it('SKIP_TESTS with a reason skips the tests, not the audit; without a reason, refuses', () => {
    const { clone, commit } = repositories()
    const sha = commit('scripts/a.ts')
    const withReason = fakeRun()
    expect(
      verifyPush({
        root: clone,
        remote: 'origin',
        input: line('refs/heads/ticket/10-y', sha),
        run: withReason.run,
        say: () => {},
        env: { SKIP_TESTS: 'the user asked for the push now' },
      }).refused,
    ).toBe(false)
    expect(withReason.runs).toHaveLength(1)

    expect(
      verifyPush({
        root: clone,
        remote: 'origin',
        input: line('refs/heads/ticket/10-y', sha),
        run: fakeRun().run,
        say: () => {},
        env: { SKIP_TESTS: '  ' },
      }).refused,
    ).toBe(true)
  })

  it('deleting a branch passes with nothing; deleting main does not', () => {
    const { clone, main } = repositories()
    const { run, runs } = fakeRun()
    const remove = (ref: string) =>
      verifyPush({
        root: clone,
        remote: 'origin',
        input: `(delete) ${ZERO} ${ref} ${main}\n`,
        run,
        say: () => {},
        env: {},
      }).refused
    expect(remove('refs/heads/ticket/10-y')).toBe(false)
    expect(remove('refs/heads/main')).toBe(true)
    expect(runs).toEqual([])
  })

  it('main only moves forward', () => {
    const { clone, main, commit } = repositories()
    git(clone, 'switch', '-qc', 'other', main)
    git(clone, 'reset', '-q', '--hard', `${main}`)
    // A commit that does not descend from the remote's main.
    git(clone, 'checkout', '-q', '--orphan', 'loose')
    const loose = commit('scripts/loose.ts')
    const { run } = fakeRun()
    const said: string[] = []
    expect(
      verifyPush({
        root: clone,
        remote: 'origin',
        input: line('refs/heads/main', loose, main),
        run,
        say: (t) => said.push(t),
        env: {},
      }).refused,
    ).toBe(true)
    expect(said.join('\n')).toMatch(/is not an ancestor/)
  })
})
