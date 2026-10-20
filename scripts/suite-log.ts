// The record of each `pr-suite.ts` run, like the Festival dos Macacos
// `registro-da-suite.ts`. Each run gets a folder of its own, `<logs>/<sha>/<uuid>`,
// with the step logs and a `manifest.json`: the HEAD, the tree, whether it was
// clean at the start and at the end, the base, whether it was the full suite,
// the start, the end, each step's result and the flaky tests. The next run
// does not delete the previous one: there, one suite deleted another's logs.
//
// Festival also writes, for a fully green run, a certificate that the push
// hook requires on `main`. Here the gate to `main` is the PR's CI (ADR 0016),
// and the record only keeps what ran.
//
// Runs on plain `node`, without `node_modules`.

import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FlakyTest } from './flaky.ts'

export type StepResult = {
  name: string
  log: string
  passed: boolean
  /** The tests that failed and passed on retry: with them, the step counts as
   * green. */
  flaky?: FlakyTest[]
}
export type GitState = { sha: string; tree: string; clean: boolean }
export type SuiteRun = {
  id: string
  root: string
  dir: string
  base: string
  full: boolean
  /** The steps the run runs. */
  steps: string[]
  /** The ones it skips on purpose, with the reason. */
  skipped: Record<string, string>
  start: string
  startState: GitState
}

/** git without the variables a hook inherits: inside `pre-push`, `GIT_DIR`
 * would point every `git` at the repository of whoever is pushing. */
export function envWithoutHookGit(env: NodeJS.ProcessEnv = process.env) {
  return Object.fromEntries(
    Object.entries(env).filter(([name]) => !name.startsWith('GIT_')),
  )
}

function git(root: string, ...args: string[]) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    env: envWithoutHookGit(),
  })
  if (result.status !== 0)
    throw new Error(`git ${args.join(' ')}: ${result.stderr.trim()}`)
  return result.stdout.trim()
}

function gitState(root: string): GitState {
  return {
    sha: git(root, 'rev-parse', 'HEAD'),
    tree: git(root, 'rev-parse', 'HEAD^{tree}'),
    clean: git(root, 'status', '--porcelain', '--untracked-files=all') === '',
  }
}

const writeJson = (file: string, data: unknown) =>
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)

/** Opens the run: the git snapshot at the start and the logs folder. Call it
 * after getting a turn in the machine queue, so the snapshot is of what will
 * run. */
export function startRun(options: {
  root: string
  base: string
  full: boolean
  steps: string[]
  skipped?: Record<string, string>
  logsDir: string
}): SuiteRun {
  const startState = gitState(options.root)
  const id = randomUUID()
  const dir = join(options.logsDir, startState.sha, id)
  mkdirSync(dir, { recursive: true })
  const run: SuiteRun = {
    id,
    root: options.root,
    dir,
    base: options.base,
    full: options.full,
    steps: [...options.steps],
    skipped: { ...options.skipped },
    start: new Date().toISOString(),
    startState,
  }
  writeJson(join(dir, 'manifest.json'), { ...run, passed: null })
  return run
}

/** Closes the run: the snapshot at the end and the manifest. `passed` only if
 * it finished without interruption, with every planned step run and green. */
export function finishRun(
  run: SuiteRun,
  results: StepResult[],
  { interrupted = false } = {},
) {
  const endState = gitState(run.root)
  const passed =
    !interrupted &&
    results.every((result) => result.passed) &&
    run.steps.every((name) => results.some((done) => done.name === name))
  const manifest = join(run.dir, 'manifest.json')
  writeJson(manifest, {
    ...run,
    end: new Date().toISOString(),
    endState,
    // A tree that changed midway is not the one the steps tested.
    sameTree:
      endState.tree === run.startState.tree &&
      endState.clean === run.startState.clean,
    results,
    flaky: results.flatMap((r) => r.flaky ?? []),
    passed,
    interrupted,
  })
  return { passed, manifest }
}

/** The line that names a failed test: Vitest's `×` and `FAIL`, Playwright's
 * `✘` and `1) … ›`. */
const FAILED_TEST = [/(^|\s)(FAIL|×|✗|✖|✘)\s/, /^\s*\d+\) .+›/]
/** An error line: `AssertionError`, `TypeError`, `Error:`, `tsc`'s
 * `error TS` and Oxlint's `×`. */
const ERROR = [/\b[A-Z]\w*Error\b/, /\berror TS\d+/, /^\s*×\s/]
/** The coverage table, which `--coverage` prints after everything else. */
const COVERAGE_HEADER = /Coverage (report|summary)/
const COVERAGE_SEPARATOR = /^\s*(-+(?:\|-+)+\|?|=+)\s*$/

/** The lines without the coverage block: from the header or a separator to
 * the table's last separator. */
function withoutCoverage(lines: string[]) {
  const separator = (line: string) => COVERAGE_SEPARATOR.test(line)
  const kept: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string
    if (!COVERAGE_HEADER.test(line) && !separator(line)) {
      kept.push(line)
      continue
    }
    let end = i
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j] as string
      if (separator(next)) end = j
      else if (!/[|:]/.test(next)) break
    }
    i = end
  }
  return kept
}

/** What a step log says about the failure: the failed tests, the first error
 * and the last lines without the coverage table. */
export function logSummary(text: string) {
  const lines = text.trimEnd().split(/\r?\n/)
  const tests = [
    ...new Set(
      lines
        .filter((line) => FAILED_TEST.some((pattern) => pattern.test(line)))
        .map((line) => line.trim()),
    ),
  ].slice(0, 10)
  const firstError = lines.findIndex((line) =>
    ERROR.some((pattern) => pattern.test(line)),
  )
  const tail = withoutCoverage(lines).slice(-25)
  return [
    ...(tests.length > 0 ? ['failed tests:', ...tests, ''] : []),
    ...(firstError === -1
      ? []
      : ['first error:', ...lines.slice(firstError, firstError + 4), '']),
    'end of the log, without coverage:',
    ...tail,
  ].join('\n')
}
