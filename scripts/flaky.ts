// The flaky test, from the Festival dos Macacos `intermitentes.ts`: one that fails in
// a run and passes alone right after. There, with the load average between 40
// and 50, a merge went red twice, each time on a different test unrelated to
// the diff, and both passed when run alone. This is the same machine.
//
// `pr-suite.ts` passes each Vitest or Playwright step that failed through
// `retryFailures`: it reads from the log the file of each test that failed
// (`failuresFromLog`) and runs each one again, alone, once. If it passes, the
// step counts as green and the run's manifest records the test under `flaky`.
// If it fails again, the step stays red. A log that does not say just "these
// files failed" (an error outside a test, coverage below the threshold, the
// step hanging, too many files) gets no retry: the defect may not be in a
// test.
//
// `merge-branches.ts` comments each flaky test of the commit it publishes on
// the "Testes intermitentes" issue, which it opens if there is none
// (`reportOnIssue`).
//
// Runs on plain `node`, without `node_modules`.

import { readFileSync } from 'node:fs'
import { stripVTControlCharacters } from 'node:util'
import { findOpenIssue, type Gh, openIssue } from './issue-by-title.ts'

export type FlakyTest = {
  step: string
  /** The Vitest file or the Playwright spec, as the log names it. */
  file: string
  /** `os.loadavg()` when the step failed: 1, 5 and 15 min. */
  load: number[]
  /** The log of the retry that passed. */
  log: string
}

/** More files than this failing at once is not a flaky test, and retrying
 * each one would only delay the red. */
export const MAX_RETRIES = 5

export const TITLE = 'Testes intermitentes'

export type Failure = {
  /** The folder where Vitest ran, from the log's `RUN`; `null` for
   * Playwright, which runs in the step's folder. */
  dir: string | null
  file: string
  /** The Vitest project, the `|telas|` in the log. */
  project?: string
}

const TIMEOUT = /ran past \d+ min without finishing/
const RUN = /^\s*RUN\s+v\S+\s+(.+?)\s*$/
const FAIL = /^\s*FAIL\s+(?:\|([^|]+)\|\s+)?(\S+)/
const FILES_FAILED = /Test Files\s+(\d+) failed/
const VITEST_SUMMARY = /^\s*Test Files\s/
const OUTSIDE_VITEST = [
  /Unhandled (Errors?|Rejection)/,
  /^\s*Errors\s+\d+ errors?/,
]
const COVERAGE = /ERROR: Coverage for|does not meet .*threshold/i
/** The header of the `list` reporter's list: `  2 failed`; the lines under it,
 * one test each, with or without the `[project] ›`. */
const PLAYWRIGHT_FAILED = /^\s+\d+ failed\s*$/
const LISTED_TEST = /^\s{4}(?:\[[^\]]+\] › )?(\S+):\d+:\d+ ›/
const OUTSIDE_PLAYWRIGHT = /not a part of any test/
const INTERRUPTED = /^\s+\d+ interrupted\s*$/

/** The files the log says failed, to run again, or why there is nothing to
 * retry. */
export function failuresFromLog(
  text: string,
  tool: 'vitest' | 'playwright',
): { failures: Failure[] } | { reason: string } {
  const lines = stripVTControlCharacters(text).split(/\r?\n/)
  if (lines.some((line) => TIMEOUT.test(line)))
    return { reason: 'the step ran past the time limit' }
  const found = new Map<string, Failure>()
  const add = (failure: Failure) =>
    found.set(
      `${failure.dir ?? ''}|${failure.project ?? ''}|${failure.file}`,
      failure,
    )
  if (tool === 'vitest') {
    if (lines.some((line) => OUTSIDE_VITEST.some((p) => p.test(line))))
      return { reason: 'there was an error outside a test' }
    if (lines.some((line) => COVERAGE.test(line)))
      return { reason: 'coverage fell below the threshold' }
    // Every Vitest that started ended in its summary: a package that crashed
    // before that does not say which tests did not run.
    const started = lines.filter((line) => RUN.test(line)).length
    const summaries = lines.filter((line) => VITEST_SUMMARY.test(line)).length
    if (started !== summaries)
      return {
        reason: `${started - summaries} Vitest runs ended without the summary`,
      }
    let dir: string | null = null
    let inSummary = 0
    for (const line of lines) {
      const run = line.match(RUN)
      if (run) dir = run[1] ?? null
      const fail = line.match(FAIL)
      if (fail?.[2])
        add({
          dir,
          file: fail[2],
          ...(fail[1] ? { project: fail[1].trim() } : {}),
        })
      inSummary += Number(line.match(FILES_FAILED)?.[1] ?? 0)
    }
    if (found.size > 0 && inSummary !== found.size)
      return {
        reason: `the log names ${found.size} failed files, and the Vitest summary counts ${inSummary}`,
      }
  } else {
    if (lines.some((line) => OUTSIDE_PLAYWRIGHT.test(line)))
      return { reason: 'there was an error outside a test' }
    if (lines.some((line) => INTERRUPTED.test(line)))
      return { reason: 'Playwright interrupted tests' }
    let inList = false
    for (const line of lines) {
      if (PLAYWRIGHT_FAILED.test(line)) {
        inList = true
        continue
      }
      const listed = inList ? line.match(LISTED_TEST) : null
      if (inList && !listed) inList = false
      const file = listed?.[1]
      if (file) add({ dir: null, file })
    }
  }
  const failures = [...found.values()]
  if (failures.length === 0)
    return { reason: 'the log does not say which file failed' }
  if (failures.length > MAX_RETRIES)
    return {
      reason: `${failures.length} files failed, more than the ${MAX_RETRIES} of a flaky test`,
    }
  return { failures }
}

/** How a step, or the retry of one of its files, ended. */
type Ran = { log: string; passed: boolean }

/** The failed step, after the retry: runs again each file its log says failed
 * (`failuresFromLog`), one at a time, alone, and stops at the first that
 * fails again. All green, the step passes, with them under `flaky`;
 * otherwise it comes back as it was. `load` is the load average when it
 * failed; `say`, what goes to the terminal. */
export async function retryFailures<R extends Ran>({
  step,
  result,
  tool,
  load,
  rerun,
  say = () => {},
}: {
  step: string
  result: R
  tool: 'vitest' | 'playwright'
  load: number[]
  /** Runs only `failure`; `attempt` counts from 1, for the log name. */
  rerun: (failure: Failure, attempt: number) => Promise<Ran>
  say?: (text: string) => void
}): Promise<R & { flaky?: FlakyTest[] }> {
  if (result.passed) return result
  const parsed = failuresFromLog(readFileSync(result.log, 'utf8'), tool)
  if ('reason' in parsed) {
    say(`${step} without retry: ${parsed.reason}`)
    return result
  }
  const flaky: FlakyTest[] = []
  for (const [i, failure] of parsed.failures.entries()) {
    say(`${step}: ${failure.file} failed; running it again, alone`)
    const retry = await rerun(failure, i + 1)
    if (!retry.passed) {
      say(`${step}: ${failure.file} failed again, in ${retry.log}`)
      return result
    }
    flaky.push({ step, file: failure.file, load, log: retry.log })
  }
  say(
    `ok     ${step}, with ${flaky.length} flaky test(s): ${flaky.map(({ file }) => file).join(', ')}`,
  )
  return { ...result, passed: true, flaky }
}

/** The comment on the issue: each test, the step, the commit and the load. */
export function flakyComment(sha: string, flaky: FlakyTest[]) {
  return [
    `In the merge of \`${sha.slice(0, 7)}\` (${sha}), these failed and then passed alone on retry:`,
    '',
    ...flaky.map(
      ({ step, file, load }) =>
        `- \`${file}\`, in \`${step}\`, with the load average at ${load.map((value) => value.toFixed(2)).join(', ')} (1, 5 and 15 min).`,
    ),
  ].join('\n')
}

const DESCRIPTION = [
  'Each comment is a test that failed in a merge and passed when run again, alone (`scripts/flaky.ts`).',
  'The run manifest records it under `flaky`. A test that comes back here several times needs fixing.',
].join('\n\n')

/** Comments the commit's flaky tests on the open issue, opening it if there
 * is none. Returns the error instead of throwing: the report does not hold
 * up the merge. */
export function reportOnIssue(
  gh: Gh,
  sha: string,
  flaky: FlakyTest[],
): { issue: number } | { error: string } {
  try {
    const issue = findOpenIssue(gh, TITLE) ?? openIssue(gh, TITLE, DESCRIPTION)
    gh(
      ['issue', 'comment', String(issue), '--body-file', '-'],
      flakyComment(sha, flaky),
    )
    return { issue }
  } catch (error) {
    return { error: (error as Error).message }
  }
}
