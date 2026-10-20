// The test queue for the whole machine (ADR 0013, from ADR-0054 of Festival dos
// Macacos). Several agents run tests in different worktrees at the same time,
// and each run would size its workers by the cores as if it were alone. In the
// Festival, with three suites together, each took four times as long, and the
// tests with deadlines timed out.
//
// A heavy run is an unfiltered one: a package's Vitest suite, or the whole
// `pnpm e2e` or `pnpm test:stories`. They run one at a time, in arrival order,
// each with what it asks for. A light run is a filtered one (a file, a folder,
// a `-t`, a `-g`): it never waits and takes its share of what the others leave,
// at least one worker.
//
// The callers are each tool's config (the `vite.config.ts` of the root, of
// `frontend/` and of the packages, `frontend/vitest.stories.config.ts` and
// `frontend/playwright.config.ts`), not `package.json`: that way `pnpm test`,
// `vp test` and `pnpm exec playwright` all go through here. The boundary comes
// from the arguments the tool received.
//
// Each run is a file in `<tmp>/tem-estudo-test-queue`, which every worktree
// sees, holding the owner's PID. The folder is not the Festival's: one of its
// suites lasts up to 20 min, and our whole one, seconds. The owner refreshes the
// file's mtime every 30 s. A run whose PID died, or that went 5 min without a
// heartbeat (the PID may now belong to another process), counts as dead, and
// the next read deletes the file. Nothing here kills a process: it only asks
// whether the PID exists (`AGENTS.md`, "Quatro jeitos de se machucar", item 3).
//
// Runs on plain `node`, which reads TypeScript by itself: only erasable syntax.

import { randomUUID } from 'node:crypto'
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs'
import { availableParallelism, tmpdir } from 'node:os'
import { join } from 'node:path'
import { ROOT } from './ports.ts'

export type QueueRequest = {
  /** The command, so whoever waits knows whom they wait for. */
  name: string
  heavy: boolean
  /** The most workers the run would use alone. */
  max: number
  /** The run accepts no less than the max: the workers came from a flag,
   * which beats the config. */
  fixed?: boolean
}

export type QueuedRun = QueueRequest & {
  pid: number
  root: string
  state: 'waiting' | 'running'
  /** The workers it took; zero while it waits. */
  workers: number
  /** When it arrived, while it waits; when it got in, afterwards. */
  start: number
}

export type Turn =
  | { enters: true; workers: number }
  | { enters: false; owner: QueuedRun }

const FOLDER = join(tmpdir(), 'tem-estudo-test-queue')
const HEARTBEAT_MS = 30_000
const NO_HEARTBEAT_MS = 5 * 60_000
const NOTICE_MS = 60_000

/** The turn of `me` among the live `others`, in a budget of one worker per
 * core. */
export function turn(me: QueuedRun, others: QueuedRun[], budget: number): Turn {
  const running = others.filter((other) => other.state === 'running')
  if (me.heavy) {
    const ahead =
      running.find((other) => other.heavy) ??
      others
        .filter((other) => other.heavy && other.state === 'waiting')
        .filter((other) => before(other, me))
        .sort((a, b) => a.start - b.start)[0]
    if (ahead) return { enters: false, owner: ahead }
    // With what it asks for, even with light runs going: they end soon, and a
    // heavy run that got in small would stay small to the end.
    return { enters: true, workers: me.max }
  }
  if (me.fixed) return { enters: true, workers: me.max }
  const busy = running.reduce((sum, other) => sum + other.workers, 0)
  const share = Math.floor(budget / (running.length + 1))
  return {
    enters: true,
    workers: Math.max(1, Math.min(me.max, share, budget - busy)),
  }
}

function before(a: QueuedRun, b: QueuedRun) {
  return a.start < b.start || (a.start === b.start && a.pid < b.pid)
}

type Options = {
  folder?: string
  cores?: number
  intervalMs?: number
  notify?: (text: string) => void
}

/** Registers the run and waits for its turn. `leave` deletes the record; so
 * does the process exiting. */
export async function enter(
  request: QueueRequest,
  {
    folder = FOLDER,
    cores = availableParallelism(),
    intervalMs = 2000,
    notify = (text) => console.error(`[queue] ${text}`),
  }: Options = {},
) {
  mkdirSync(folder, { recursive: true })
  const file = join(folder, `${process.pid}-${randomUUID().slice(0, 8)}.json`)
  const me: QueuedRun = {
    ...request,
    pid: process.pid,
    root: ROOT,
    state: 'waiting',
    workers: 0,
    start: Date.now(),
  }
  withLock(folder, () => writeFileSync(file, JSON.stringify(me)))

  const heartbeat = setInterval(() => {
    const now = new Date()
    try {
      utimesSync(file, now, now)
    } catch {
      // Another run found it dead and deleted it; its next read decides.
    }
  }, HEARTBEAT_MS)
  heartbeat.unref()
  const leave = () => {
    clearInterval(heartbeat)
    process.off('exit', leave)
    rmSync(file, { force: true })
  }
  process.on('exit', leave)

  const arrived = me.start
  let notified = 0
  for (;;) {
    const decision = withLock(folder, () => {
      const decision = turn(me, alive<QueuedRun>(folder, file), cores)
      if (decision.enters) {
        Object.assign(me, {
          state: 'running',
          workers: decision.workers,
          start: Date.now(),
        })
        writeFileSync(file, JSON.stringify(me))
      }
      return decision
    })
    if (decision.enters) {
      if (notified) notify(`turn came after ${duration(Date.now() - arrived)}.`)
      else if (decision.workers < me.max)
        notify(
          `${decision.workers} of ${me.max} workers: the machine is running other tests.`,
        )
      return { workers: decision.workers, leave }
    }
    if (Date.now() - notified >= NOTICE_MS) {
      notified = Date.now()
      notify(waiting(decision.owner, notified - arrived))
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

function waiting(owner: QueuedRun, waited: number) {
  const ago = duration(Date.now() - owner.start)
  const doing =
    owner.state === 'running'
      ? `running for ${ago}`
      : `waiting for ${ago}, ahead`
  return `waiting for a turn (for ${duration(waited)}): \`${owner.name}\` in ${owner.root}, PID ${owner.pid}, ${doing}.`
}

function duration(ms: number) {
  const seconds = Math.round(ms / 1000)
  return seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`
}

/** The other records in `folder`, deleting the dead ones: the PID does not
 * exist, or the file went 5 min without a heartbeat. `onRemove` hears about
 * each one removed. Only inside the lock. `merge-branches.ts` uses the same for
 * its own lock. */
export function alive<T extends { pid: number }>(
  folder: string,
  mine: string,
  onRemove?: (
    dead: T,
    reason: { dead: boolean; noHeartbeatMs: number },
  ) => void,
) {
  const now = Date.now()
  const read: T[] = []
  for (const name of readdirSync(folder)) {
    const file = join(folder, name)
    if (!name.endsWith('.json') || file === mine) continue
    try {
      const noHeartbeatMs = now - statSync(file).mtimeMs
      const run = JSON.parse(readFileSync(file, 'utf8')) as T
      const dead = !exists(run.pid)
      if (dead || noHeartbeatMs > NO_HEARTBEAT_MS) {
        rmSync(file, { force: true })
        onRemove?.(run, { dead, noHeartbeatMs })
      } else read.push(run)
    } catch {
      // Deleted between the `readdir` and the read, or unreadable: not counted.
    }
  }
  return read
}

/** Signal 0 does not reach the process: it only says whether the PID exists. */
function exists(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

/** A millisecond lock around each read and write of the folder, so two heavy
 * runs do not get in together. Creating a folder is atomic. */
export function withLock<T>(folder: string, action: () => T): T {
  const lock = join(folder, '.lock')
  for (;;) {
    try {
      mkdirSync(lock)
      break
    } catch {
      try {
        // A process that died holding the lock.
        if (Date.now() - statSync(lock).mtimeMs > 10_000)
          rmSync(lock, { recursive: true, force: true })
      } catch {
        // Released between the `mkdir` and the `stat`.
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10)
    }
  }
  try {
    return action()
  } finally {
    rmSync(lock, { recursive: true, force: true })
  }
}

let slot: Promise<number | undefined> | undefined

/** The configs' entry point: enters once per process and returns the workers,
 * or `undefined` for the tool to decide alone. Outside the queue: CI, which
 * runs each job on a machine of its own; what is not a run (watch mode,
 * `--list`); and what runs inside a run that already got in (the Playwright
 * workers, which read the config again), which inherits `MACHINE_QUEUE`.
 * `MACHINE_QUEUE=off` skips the queue on purpose. */
export function joinQueue(request: QueueRequest | undefined) {
  if (slot) return slot
  if (!request || process.env.CI || process.env.MACHINE_QUEUE)
    return Promise.resolve(undefined)
  slot = enter(request).then(({ workers }) => {
    process.env.MACHINE_QUEUE = 'inside'
    return workers
  })
  return slot
}

/** The workers of a Vitest run, for the `maxWorkers` of the `vite.config.ts`
 * files. Outside Vitest (`vp check`, `vp dev` and `vp build` read the same
 * config), `undefined`, without joining the queue. */
export function vitestWorkers() {
  if (!process.env.VITEST) return Promise.resolve(undefined)
  return joinQueue(vitestRequest(process.argv, availableParallelism()))
}

const VITEST_SUBCOMMANDS = new Set([
  'run',
  'related',
  'watch',
  'dev',
  'bench',
  'list',
  'init',
])
const VITEST_FILTERS = new Set([
  '-t',
  '--testNamePattern',
  '--project',
  '--changed',
  '--related',
  '--shard',
])
const VITEST_FLAGS_WITH_VALUE = new Set([
  '-t',
  '--testNamePattern',
  '--project',
  '--shard',
  '--maxWorkers',
  '--testTimeout',
  '--hookTimeout',
  '--reporter',
  '--outputFile',
  '-c',
  '--config',
  '-r',
  '--root',
  '--dir',
  '--pool',
  '--exclude',
  '--environment',
  '--mode',
  '--retry',
  '--bail',
])

/** The request of a `vitest` from `process.argv`, or `undefined` for what does
 * not join the queue. */
export function vitestRequest(argv: string[], cores: number) {
  const args = argv.slice(2)
  const subcommand = VITEST_SUBCOMMANDS.has(args[0] ?? '')
    ? args.shift()
    : undefined
  // Without `run`, Vitest watches the files when it has a terminal.
  const watching =
    subcommand === 'watch' ||
    subcommand === 'dev' ||
    args.includes('--watch') ||
    args.includes('-w') ||
    (subcommand === undefined && process.stdin.isTTY && !process.env.CI)
  if (
    watching ||
    subcommand === 'list' ||
    subcommand === 'init' ||
    subcommand === 'bench'
  )
    return undefined
  const { filtered, positionals } = parseArgs(
    args,
    VITEST_FILTERS,
    VITEST_FLAGS_WITH_VALUE,
  )
  const heavy = !filtered && positionals.length === 0
  const onlyFiles =
    positionals.length > 0 &&
    positionals.every((positional) => /\.test\.tsx?$/.test(positional))
  return {
    name: ['vitest', subcommand, ...args]
      .filter(Boolean)
      .join(' ')
      .slice(0, 120),
    heavy,
    max: onlyFiles ? positionals.length : Math.max(1, cores - 1),
  }
}

const PLAYWRIGHT_FILTERS = new Set([
  '-g',
  '--grep',
  '--grep-invert',
  '--project',
  '--shard',
  '--last-failed',
  '--only-changed',
])
const PLAYWRIGHT_FLAGS_WITH_VALUE = new Set([
  '-c',
  '--config',
  '-g',
  '--grep',
  '--grep-invert',
  '--project',
  '-j',
  '--workers',
  '--reporter',
  '--retries',
  '--repeat-each',
  '--shard',
  '--timeout',
  '--max-failures',
  '--output',
  '--trace',
  '--global-timeout',
  '--tsconfig',
])

/** The request of a `playwright test`, with the `workers` the e2e opens, each
 * with its own Chrome. */
export function playwrightRequest(argv: string[], workers: number) {
  const [command, ...args] = argv.slice(2)
  // `--ui-port` and `--ui-host` also open the UI, which stays open for hours.
  if (
    command !== 'test' ||
    args.some((arg) => arg === '--list' || arg.startsWith('--ui'))
  )
    return undefined
  const { filtered, positionals } = parseArgs(
    args,
    PLAYWRIGHT_FILTERS,
    PLAYWRIGHT_FLAGS_WITH_VALUE,
  )
  // `--workers` beats the config, and whoever gave it wants that number: the
  // queue does not lower it.
  const fromFlag = workersFromFlag(args)
  return {
    name: ['playwright test', ...args].join(' ').slice(0, 120),
    heavy: !filtered && positionals.length === 0,
    max: fromFlag ?? workers,
    ...(fromFlag === undefined ? {} : { fixed: true }),
  }
}

function workersFromFlag(args: string[]) {
  for (const [i, arg] of args.entries()) {
    const [flag, value = args[i + 1]] = arg.split('=')
    if (flag === '--workers' || flag === '-j') {
      const workers = Number(value)
      return Number.isInteger(workers) && workers > 0 ? workers : undefined
    }
  }
  return undefined
}

function parseArgs(
  args: string[],
  filters: Set<string>,
  withValue: Set<string>,
) {
  let filtered = false
  const positionals: string[] = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i] as string
    if (!arg.startsWith('-')) {
      positionals.push(arg)
      continue
    }
    const [flag] = arg.split('=')
    if (filters.has(flag as string)) filtered = true
    if (!arg.includes('=') && withValue.has(flag as string)) i++
  }
  return { filtered, positionals }
}
