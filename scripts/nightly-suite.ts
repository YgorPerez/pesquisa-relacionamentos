// The nightly suite's report, like the Festival dos Macacos `suite-noturna.ts`.
// The full suite runs every night on `main`, in `nightly-suite.yml`, which
// calls the `pr.yml` jobs: it is what says whether `main` is green after the
// day's merges, and it catches what each PR's diff plan let through.
//
// A red night opens an issue, "Suíte noturna vermelha", with the SHA, the jobs
// that did not pass, the link to the run and the end of the log. The next red
// night comments on the same one, and the first green one closes it.
//
// The workflow's last job runs:
//   node scripts/nightly-suite.ts --sha <sha> --jobs '<needs as JSON>' \
//     --url <run> [--log <file with the end of the log>]
//
// Festival runs the suite in a worktree on the machine, through the Windows
// Task Scheduler; here Actions on the public repository runs for free, and the
// machine is left to the agents (ADR 0022).
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it can
// strip.

import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { findOpenIssue, type Gh, ghIn, openIssue } from './issue-by-title.ts'
import { ROOT } from './ports.ts'

export const TITLE = 'Suíte noturna vermelha'

/** GitHub rejects a body over 65,536 characters. */
const MAX_BODY = 60_000

export type Action = 'open' | 'comment' | 'close' | 'nothing'

/** What to do with the issue, given the run and the issue already open. */
export function nextAction(passed: boolean, open: number | null): Action {
  if (passed) return open === null ? 'nothing' : 'close'
  return open === null ? 'open' : 'comment'
}

/** The workflow's `needs`: each job's result. */
type Jobs = Record<string, { result: string }>

type NightlyRun = { sha: string; jobs: Jobs; url: string; log: string }

const redJobs = (jobs: Jobs) =>
  Object.entries(jobs).filter(([, { result }]) => result !== 'success')

export function failureSummary({ sha, jobs, url, log }: NightlyRun): string {
  const cut = log.length > MAX_BODY ? `…\n${log.slice(-MAX_BODY)}` : log
  return [
    `The full suite failed on \`main\` at ${sha}.`,
    '',
    ...redJobs(jobs).map(([name, { result }]) => `- \`${name}\`: ${result}`),
    '',
    `The run: ${url}. To see it again on the machine: \`node scripts/pr-suite.ts --full\`.`,
    ...(cut.trim() ? ['', 'The end of the log:', '', '```', cut, '```'] : []),
  ].join('\n')
}

/** Opens, comments on or closes the issue according to the run, and says
 * what it did. */
export function report(gh: Gh, run: NightlyRun): Action {
  const passed = redJobs(run.jobs).length === 0
  const open = findOpenIssue(gh, TITLE)
  const action = nextAction(passed, open)
  if (action === 'open') openIssue(gh, TITLE, failureSummary(run), ['bug'])
  if (action === 'comment')
    gh(
      ['issue', 'comment', String(open), '--body-file', '-'],
      failureSummary(run),
    )
  if (action === 'close')
    gh([
      'issue',
      'close',
      String(open),
      '--comment',
      `The full suite passed on \`main\` at ${run.sha}: ${run.url}.`,
    ])
  return action
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      sha: { type: 'string' },
      jobs: { type: 'string' },
      url: { type: 'string' },
      log: { type: 'string' },
    },
  })
  const run = {
    sha: values.sha ?? '?',
    jobs: JSON.parse(values.jobs ?? '{}') as Jobs,
    url: values.url ?? '',
    log: values.log ? readFileSync(values.log, 'utf8') : '',
  }
  const action = report(ghIn(ROOT), run)
  console.log(`[nightly] ${run.sha}: ${action}`)
}
