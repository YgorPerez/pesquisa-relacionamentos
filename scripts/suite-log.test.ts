// Each test in a temporary git repository: none writes to the `.git` here.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import {
  envWithoutHookGit,
  finishRun,
  logSummary,
  startRun,
  type SuiteRun,
} from './suite-log.ts'

const temporaries: string[] = []
afterEach(() => {
  for (const dir of temporaries.splice(0))
    rmSync(dir, { recursive: true, force: true })
})

function tempDir(prefix: string) {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  temporaries.push(dir)
  return dir
}

function git(root: string, ...args: string[]) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    env: envWithoutHookGit(),
  })
  if (result.status !== 0)
    throw new Error(`git ${args.join(' ')}: ${result.stderr}`)
  return result.stdout.trim()
}

function repository() {
  const root = tempDir('suite-log-')
  git(root, 'init', '-q')
  git(root, 'config', 'user.email', 'test@local')
  git(root, 'config', 'user.name', 'Test')
  writeFileSync(join(root, 'app.txt'), 'first version')
  git(root, 'add', 'app.txt')
  git(root, 'commit', '-qm', 'first')
  return { root, logsDir: tempDir('suite-logs-') }
}

const STEPS = ['types', 'tests']

/** The steps as if they came from the suite: each writes its log into the
 * run's folder. */
function steps(run: SuiteRun, failing?: string) {
  return STEPS.map((name) => {
    const log = join(run.dir, `${name}.log`)
    writeFileSync(log, `output of ${name} in run ${run.id}`)
    return { name, log, passed: name !== failing }
  })
}

const open = (root: string, logsDir: string) =>
  startRun({
    root,
    base: 'origin/main',
    full: true,
    steps: STEPS,
    logsDir,
  })

const manifest = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

describe('the suite run', () => {
  it('two runs of the same commit each keep their own logs', () => {
    const { root, logsDir } = repository()
    const first = open(root, logsDir)
    const second = open(root, logsDir)
    finishRun(first, steps(first))
    finishRun(second, steps(second))
    expect(first.dir).not.toBe(second.dir)
    expect(readFileSync(join(first.dir, 'types.log'), 'utf8')).toContain(
      first.id,
    )
  })

  it('green, with every step run, passed; the manifest says the tree did not change', () => {
    const { root, logsDir } = repository()
    const run = open(root, logsDir)
    const end = finishRun(run, steps(run))
    expect(end.passed).toBe(true)
    expect(manifest(end.manifest)).toMatchObject({
      passed: true,
      sameTree: true,
      endState: { clean: true },
    })
  })

  it('a run with a red step, one that skipped a step, or an interrupted one did not pass', () => {
    const { root, logsDir } = repository()
    const red = open(root, logsDir)
    expect(finishRun(red, steps(red, 'tests')).passed).toBe(false)
    const short = open(root, logsDir)
    expect(finishRun(short, steps(short).slice(0, 1)).passed).toBe(false)
    const stopped = open(root, logsDir)
    expect(
      finishRun(stopped, steps(stopped), { interrupted: true }).passed,
    ).toBe(false)
  })

  it('the manifest says when the tree changed midway, and gathers the flaky tests', () => {
    const { root, logsDir } = repository()
    const run = open(root, logsDir)
    writeFileSync(join(root, 'app.txt'), 'changed midway')
    const flakyTest = {
      step: 'tests',
      file: 'src/a.test.ts',
      load: [1, 1, 1],
      log: '/x.log',
    }
    const done = steps(run).map((s) => ({
      ...s,
      flaky: s.name === 'tests' ? [flakyTest] : [],
    }))
    const end = manifest(finishRun(run, done).manifest)
    expect(end.sameTree).toBe(false)
    expect(end.flaky).toEqual([flakyTest])
  })
})

describe('envWithoutHookGit', () => {
  it('drops the GIT_ variables the hook inherits', () => {
    expect(
      envWithoutHookGit({ GIT_DIR: '/x', GIT_INDEX_FILE: '/y', PATH: '/bin' }),
    ).toEqual({ PATH: '/bin' })
  })
})

describe('logSummary', () => {
  const COVERAGE = [
    '% Coverage report from v8',
    '-----------------|---------|----------|---------|---------|-------------------',
    'File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s',
    '-----------------|---------|----------|---------|---------|-------------------',
    ...Array.from(
      { length: 80 },
      (_, i) =>
        ` src/file-${i}.ts |   91.2 |    80.5 |     100 |    91.2 | 12-14`,
    ),
    '-----------------|---------|----------|---------|---------|-------------------',
  ]

  it("shows Vitest's test and first error, even with coverage at the end", () => {
    const log = [
      ' RUN  v5.0.5 /repo/frontend',
      ' ✓ src/ui/laco.test.ts (4 tests) 12ms',
      ' × src/estado/perfil.test.ts > o perfil > guarda a idade 8ms',
      '',
      ' FAIL  src/estado/perfil.test.ts > o perfil > guarda a idade',
      'AssertionError: expected 2 to be 3 // Object.is equality',
      ' ❯ src/estado/perfil.test.ts:41:18',
      '',
      ' Test Files  1 failed | 1 passed (2)',
      '      Tests  1 failed | 4 passed (5)',
      ...COVERAGE,
    ].join('\n')

    const summary = logSummary(log)

    expect(summary).toMatch(/perfil\.test\.ts > o perfil > guarda a idade/)
    expect(summary).toMatch(/AssertionError: expected 2 to be 3/)
    expect(summary).toMatch(/1 failed \| 4 passed/)
    expect(summary).not.toMatch(/file-40\.ts/)
  })

  it('also drops the text coverage summary', () => {
    const log = [
      ' Test Files  12 passed (12)',
      '=============================== Coverage summary ===============================',
      'Statements   : 61.93% ( 641/1035 )',
      'Lines        : 62.27% ( 581/933 )',
      '================================================================================',
      'ERROR: Coverage for lines (59%) does not meet global threshold (60%)',
    ].join('\n')
    const tail = logSummary(log).split('end of the log, without coverage:')[1]
    expect(tail).toMatch(/does not meet/)
    expect(tail).not.toMatch(/Statements/)
  })

  it('keeps at the end a line with many pipes that is not coverage', () => {
    const error =
      'src/a.ts(3,7): error TS2322: Type \'"a" | "b" | "c" | "d" | "e"\' is not assignable to type \'never\'.'
    const log = [
      ...COVERAGE,
      error,
      ' ELIFECYCLE  Command failed with exit code 2.',
    ].join('\n')

    const tail = logSummary(log).split('end of the log, without coverage:')[1]

    expect(tail).toMatch(/error TS2322: Type '"a" \| "b"/)
    expect(tail).toMatch(/ELIFECYCLE/)
    expect(tail).not.toMatch(/file-40\.ts|% Stmts|-----\|/)
  })

  it('with no recognized test or error, the last lines', () => {
    const log = Array.from({ length: 40 }, (_, i) => `line ${i}`).join('\n')
    const summary = logSummary(log)
    expect(summary).toMatch(/line 39/)
    expect(summary).not.toMatch(/line 5\n/)
  })
})
