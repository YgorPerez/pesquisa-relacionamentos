// The `pr.yml` suite on the machine, in four queues at once, like the Festival
// dos Macacos `suite-do-pr.ts` (ADR 0019). It is for checking a branch before the
// PR, or a PR whose CI did not run. Day to day, the minimal proof is enough
// (`minimal-proof.ts`, ADR 0016).
//
//   node scripts/pr-suite.ts                       only what the diff against origin/main affects
//   node scripts/pr-suite.ts --base origin/spec/23-mvp
//   node scripts/pr-suite.ts --full                the whole suite
//   node scripts/pr-suite.ts --plan                only says what it would run
//
// By default it runs what the diff affects (`affected.ts`): Vitest with
// `--changed` in the affected folders, the stories if the app changed, and the
// e2e specs for the terms that changed. The log says what it skipped and why.
// The whole suite runs in every PR's CI and every night (`nightly-suite.yml`).
//
// A Vitest or Playwright step that fails runs each failed file again, alone,
// once (`flaky.ts`). Each run keeps the logs and the manifest in a folder of
// its own (`suite-log.ts`). Before running, it lists the open PRs that touch
// the same files (`overlapping-prs.ts`).
//
// Each step that starts Vitest or Playwright waits for its turn in the machine
// queue (`machine-queue.ts`). Each step's output goes to a log, and the
// terminal shows only who finished and how; at the end, the summary of each
// one that failed. Ctrl-C stops only the tree this script started
// (`kill-tree.ts`).
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it can
// strip.

import { createHash } from 'node:crypto'
import { createWriteStream, readFileSync } from 'node:fs'
import { loadavg, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { diffAgainst, type Plan, planForDiff } from './affected.ts'
import { type Failure, retryFailures } from './flaky.ts'
import { killTree, spawnWithGroup, withTimeout } from './kill-tree.ts'
import { ROOT } from './ports.ts'
import { openPrs, overlaps, overlapWarning } from './overlapping-prs.ts'
import {
  finishRun,
  logSummary,
  startRun,
  type StepResult,
  type SuiteRun,
} from './suite-log.ts'

export type Step = {
  name: string
  /** Where it runs from, relative to the repo root. */
  dir: string
  command: string
  /** Why the step does not run in this run. */
  skip?: string
  /** How the step, if it fails, runs a failed file again. */
  retry?: {
    tool: 'vitest' | 'playwright'
    command: (failure: Failure) => string
  }
}

/** A shell argument, in quotes: a route's file has a `$`. */
const quote = (text: string) => `'${text.replaceAll("'", `'\\''`)}'`

const vitestRetry = {
  tool: 'vitest' as const,
  command: ({ file }: Failure) => `pnpm exec vp test run ${quote(file)}`,
}
const playwrightRetry = {
  tool: 'playwright' as const,
  command: ({ file }: Failure) =>
    `pnpm exec playwright test ${quote(file)} --retries=0`,
}

/** A run's queues: the same stages as the `pr.yml` jobs, and whoever changes
 * one there changes it here. `plan` is the diff's, or `null` for the whole
 * suite. Each queue runs its steps one after another, and the queues run
 * together. The build and the e2e share a queue because both write
 * `frontend/.output`. */
export function suiteQueues({
  plan,
  base,
}: {
  plan: Plan | null
  base: string
}): Step[][] {
  const whole = plan === null
  const app = whole || plan.packages.includes('frontend')
  const noApp = app ? undefined : 'nothing in the front changed'
  const tests: Step[] = whole
    ? [
        {
          name: 'tests',
          dir: '.',
          command: 'pnpm exec vp run -r test:coverage',
          retry: vitestRetry,
        },
      ]
    : plan.packages.map((dir) => ({
        name: `tests:${dir}`,
        dir,
        command: `pnpm exec vp test run --changed ${base} --passWithNoTests`,
        retry: vitestRetry,
      }))
  const specs = plan?.specs ?? []
  return [
    [
      { name: 'check', dir: '.', command: 'pnpm exec vp check' },
      {
        name: 'folders',
        dir: '.',
        command: 'node frontend/lint/folders.ts',
        skip: noApp,
      },
      // Each piece in `src/ui/` with a story (ADR 0036).
      {
        name: 'pieces',
        dir: '.',
        command: 'node frontend/lint/stories.ts',
        skip: noApp,
      },
      ...tests,
      // `fallow health` reads the whole suite's coverage: with only some
      // tests' coverage, the score would drop with nothing getting worse.
      {
        name: 'fallow',
        dir: 'frontend',
        command: whole
          ? 'pnpm run fallow'
          : 'pnpm exec fallow dead-code && pnpm exec fallow dupes',
        skip: noApp,
      },
      {
        name: 'doctor',
        dir: 'frontend',
        command: 'pnpm run doctor',
        skip: noApp,
      },
    ],
    [
      { name: 'types', dir: '.', command: 'pnpm typecheck' },
      {
        name: 'suppressions',
        dir: '.',
        command: `node .github/scripts/suppressions.ts --base ${base}`,
      },
    ],
    [
      {
        name: 'stories',
        dir: 'frontend',
        command: 'pnpm test:stories',
        skip: whole || plan.stories ? undefined : 'nothing in the app changed',
        retry: vitestRetry,
      },
    ],
    [
      {
        name: 'build',
        dir: '.',
        command: 'pnpm build',
        skip:
          whole || plan.build ? undefined : 'nothing the build reads changed',
      },
      {
        name: 'storybook',
        dir: '.',
        command: 'pnpm build-storybook',
        skip: whole || plan.stories ? undefined : 'nothing in the app changed',
      },
      {
        name: 'e2e',
        dir: 'frontend',
        command: whole ? 'pnpm e2e' : `pnpm e2e ${specs.join(' ')}`,
        skip:
          whole || specs.length > 0
            ? undefined
            : 'no spec goes through what changed',
        retry: playwrightRetry,
      },
    ],
  ]
}

/** Runs a step, with its log, and says how it ended. */
function run(
  { name, dir, command }: Step,
  logs: string,
  children: Set<ReturnType<typeof spawnWithGroup>>,
  logName = name,
) {
  const log = join(logs, `${logName.replaceAll(/[:/.]/g, '-')}.log`)
  const output = createWriteStream(log)
  const start = Date.now()
  const child = spawnWithGroup(command, {
    cwd: resolve(ROOT, dir),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.add(child)
  child.stdout?.pipe(output)
  child.stderr?.pipe(output)
  // If it hung, it would hold up its queue and the whole suite.
  withTimeout(child, 30 * 60_000, () =>
    output.write(
      `\n[suite] ${name} ran past 30 min without finishing: stopped its tree.\n`,
    ),
  )
  return new Promise<StepResult>((done) =>
    child.on('close', (code) => {
      children.delete(child)
      const passed = code === 0
      console.log(
        `[suite] ${passed ? 'ok    ' : 'FAILED'} ${logName} (${Math.round((Date.now() - start) / 1000)} s)`,
      )
      output.end(() => done({ name, log, passed }))
    }),
  )
}

async function main() {
  const argv = process.argv.slice(2)
  const full = argv.includes('--full')
  const i = argv.indexOf('--base')
  const against = i === -1 ? 'origin/main' : argv[i + 1]
  if (!against || against.startsWith('--')) {
    console.error('[suite] --base needs a ref: --base <branch>.')
    return 1
  }
  const { base, files } = diffAgainst(ROOT, against)
  const plan = full ? null : planForDiff(files)
  const whole = plan === null || plan.full !== null
  const queues = suiteQueues({ plan: whole ? null : plan, base })

  if (plan === null)
    console.log('[suite] the whole suite: asked for with --full')
  else if (plan.full) console.log(`[suite] the whole suite: ${plan.full}`)
  else {
    console.log(
      `[suite] only what is affected since ${base.slice(0, 7)} (merge-base with ${against}), ${files.length} files`,
    )
    for (const reason of plan.reasons) console.log(`[suite] ${reason}`)
  }
  for (const step of queues.flat())
    if (step.skip) console.log(`[suite] skip   ${step.name}: ${step.skip}`)

  const open = files.length > 0 ? openPrs(ROOT) : []
  if ('reason' in open)
    console.log(`[suite] without the list of open PRs: ${open.reason}`)
  else {
    const lines = overlapWarning(
      overlaps(files, open, [against.replace(/^origin\//, '')]),
    )
    if (lines.length > 0)
      console.log(
        '[suite] open PRs that touch the same files; check that it is not the same work:',
      )
    for (const line of lines) console.log(`[suite]   ${line}`)
  }
  if (argv.includes('--plan')) return 0

  // One folder per checkout, by the hash of its path, like the ports.
  const logsDir = join(
    tmpdir(),
    'pr-suite-tem-estudo',
    createHash('sha256').update(ROOT).digest('hex').slice(0, 8),
  )
  const toRun = queues.map((queue) => queue.filter((s) => !s.skip))
  const suiteRun: SuiteRun = startRun({
    root: ROOT,
    base,
    full: whole,
    steps: toRun.flat().map((s) => s.name),
    skipped: Object.fromEntries(
      queues.flat().flatMap((s) => (s.skip ? [[s.name, s.skip]] : [])),
    ),
    logsDir,
  })
  console.log(`[suite] run ${suiteRun.id}, logs in ${suiteRun.dir}`)
  const children = new Set<ReturnType<typeof spawnWithGroup>>()
  const done: StepResult[] = []
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const)
    process.on(signal, () => {
      for (const child of children) killTree(child)
      finishRun(suiteRun, done, { interrupted: true })
      process.exit(130)
    })

  const runStep = async (step: Step) => {
    const result = await run(step, suiteRun.dir, children)
    const final = step.retry
      ? await retryFailures({
          step: step.name,
          result,
          tool: step.retry.tool,
          load: loadavg(),
          rerun: (failure, attempt) =>
            run(
              {
                ...step,
                dir: failure.dir ?? step.dir,
                command: step.retry?.command(failure) ?? '',
              },
              suiteRun.dir,
              children,
              `${step.name}-retry-${attempt}`,
            ),
          say: (text) => console.log(`[suite] ${text}`),
        })
      : result
    done.push(final)
    return final
  }
  await Promise.all(
    toRun.map(async (queue) => {
      // A step that fails does not stop the next ones: the end shows every
      // failure at once.
      for (const step of queue) await runStep(step)
    }),
  )

  const failures = done.filter((r) => !r.passed)
  for (const { name, log } of failures) {
    console.log(`\n[suite] ${name}, end of ${log}:`)
    console.log(logSummary(readFileSync(log, 'utf8')))
  }
  for (const { step, file, log } of done.flatMap((r) => r.flaky ?? []))
    console.log(`[suite] flaky: ${file}, in ${step}, passed alone (${log})`)
  const { manifest } = finishRun(suiteRun, done)
  console.log(`[suite] manifest at ${manifest}`)
  console.log(
    failures.length === 0
      ? '\n[suite] Everything passed.'
      : `\n[suite] ${failures.length} of ${done.length} failed.`,
  )
  return failures.length === 0 ? 0 : 1
}

if (import.meta.main) process.exit(await main())
