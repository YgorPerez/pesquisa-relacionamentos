// Brings up this checkout's app or Storybook on its port (ADR 0010): the usual
// ones in the main checkout, the block's in a worktree (`./ports.ts`), so two
// worktrees run side by side without coordinating.
//
//   node scripts/dev.ts              `vp dev` (pnpm dev)
//   node scripts/dev.ts start        the build server (pnpm start)
//   node scripts/dev.ts storybook    Storybook (pnpm storybook)
//   DEV_PORT=5000 node scripts/dev.ts
//
// `DEV_PORT`, `START_PORT` and `STORYBOOK_PORT` pick the port; the shell's
// `PORT` does not, because another tool may have set it. A busy port is an
// error, not a silent jump to the next one: it may be another worktree in the
// same block.
//
// Ctrl-C or `kill <pid of this script>` stops what it spawned, and only that:
// the child's tree, by its PID (`./kill-tree.ts`). Other sessions run their
// own `node` on the same machine.
//
// Runs on plain `node`, which reads TypeScript by itself: only erasable syntax.

import type { ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { connect } from 'node:net'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { killTree, spawnWithGroup } from './kill-tree.ts'
import { isWorktree, PORT_VARIABLE, requestedPort, ROOT } from './ports.ts'

const DEV_USES = {
  dev: {
    command: (port: number) => `pnpm exec vp dev --port ${port} --strictPort`,
    env: (): Record<string, string> => ({}),
  },
  start: {
    command: () => 'node .output/server/index.mjs',
    env: (port: number) => ({ PORT: String(port) }),
  },
  storybook: {
    command: (port: number) =>
      `pnpm exec storybook dev --port ${port} --no-open --exact-port`,
    env: (): Record<string, string> => ({}),
  },
} as const

type DevUse = keyof typeof DEV_USES

/** What to bring up for `use`, on the port of the checkout at `root` or the
 * one the environment gives. Runs in `frontend/`. */
export function commandForUse(
  use: DevUse,
  environment: Record<string, string | undefined>,
  root = ROOT,
) {
  const { command, env } = DEV_USES[use]
  const port = requestedPort(use, environment, root)
  return { port, command: command(port), env: env(port) }
}

function portInUse(number: number) {
  return new Promise<boolean>((resolve) => {
    const connection = connect(number, '127.0.0.1')
    connection.once('connect', () => {
      connection.destroy()
      resolve(true)
    })
    connection.once('error', () => resolve(false))
  })
}

async function waitUntilUp(url: string, child: ChildProcess) {
  while (child.exitCode === null && child.signalCode === null) {
    const up = await fetch(url).then(
      () => true,
      () => false,
    )
    if (up) return true
    await new Promise((ready) => setTimeout(ready, 250))
  }
  return false
}

async function bringUp(use: DevUse) {
  const say = (line: string) => console.log(`[dev] ${line}`)
  let plan: ReturnType<typeof commandForUse>
  try {
    plan = commandForUse(use, process.env)
  } catch (error) {
    console.error(`[dev] ${(error as Error).message}`)
    process.exit(1)
  }
  const { port, command, env } = plan
  const frontend = join(ROOT, 'frontend')
  if (use === 'start' && !existsSync(join(frontend, '.output/server'))) {
    console.error('[dev] The build is missing: run `pnpm build` first.')
    process.exit(1)
  }
  if (await portInUse(port)) {
    const variable = PORT_VARIABLE[use]
    console.error(
      `[dev] Port ${port} is already in use. Stop what you brought up on it, or ` +
        `pick another with ${variable}. Do not stop another session's process.`,
    )
    process.exit(1)
  }

  const url = `http://localhost:${port}`
  const origin = isWorktree() ? `worktree ${ROOT}` : 'main checkout'
  say(`${use} ${url} (${origin})`)

  const child = spawnWithGroup(command, {
    cwd: frontend,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  for (const stream of [child.stdout, child.stderr])
    if (stream)
      createInterface({ input: stream }).on('line', (line) =>
        console.log(`[${use}] ${line}`),
      )

  let stopping = false
  const stop = (code: number) => {
    if (stopping) return
    stopping = true
    killTree(child)
    process.exit(code)
  }
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const)
    process.on(signal, () => stop(0))
  // The last safety net: however we exit, the child's tree goes too.
  process.on('exit', () => killTree(child))
  child.on('exit', (code, signal) => {
    if (stopping) return
    say(`${use} exited (${signal ?? code}).`)
    stop(code || 1)
  })

  // `localhost` may resolve to ::1 in the check; `127.0.0.1` is certain.
  if (await waitUntilUp(`http://127.0.0.1:${port}/`, child)) say(`up: ${url}`)
}

if (import.meta.main) {
  const use = process.argv[2] ?? 'dev'
  if (!(use in DEV_USES)) {
    console.error(
      `[dev] Unknown "${use}". Use: ${Object.keys(DEV_USES).join(', ')}.`,
    )
    process.exit(1)
  }
  await bringUp(use as DevUse)
}
