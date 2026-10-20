// Spawns a child in a process group of its own and, to stop it, stops the
// whole tree by the PID `spawn` gave, never by name or pattern (ADR 0011,
// `AGENTS.md`, "Quatro jeitos de se machucar", item 3). Other sessions run
// their own `node`, `vite` and `playwright` on the same machine.
//
// Used by: `scripts/dev.ts`.
//
// Runs on plain `node`, which reads TypeScript by itself: only erasable syntax.

import {
  type ChildProcess,
  spawn,
  type SpawnOptions,
  spawnSync,
} from 'node:child_process'

/** `spawn` in a shell (Windows only finds `pnpm.cmd` through it) and, outside
 * Windows, in a group of its own (`detached`), so `killTree` takes the group. */
export function spawnWithGroup(command: string, options: SpawnOptions = {}) {
  return spawn(command, {
    ...options,
    shell: true,
    detached: process.platform !== 'win32',
  })
}

/** The PIDs below `pid`, by each process's parent PID (`ps`). Catches whoever
 * opened a group of its own, like the Vite that `vp dev` spawns. */
function descendants(pid: number) {
  const { stdout } = spawnSync('ps', ['-A', '-o', 'pid=,ppid='], {
    encoding: 'utf8',
  })
  const children = new Map<number, number[]>()
  for (const line of (stdout ?? '').split('\n')) {
    const [p, parent] = line.trim().split(/\s+/).map(Number)
    if (!p || !parent) continue
    children.set(parent, [...(children.get(parent) ?? []), p])
  }
  const found: number[] = []
  const queue = [pid]
  while (queue.length > 0)
    for (const p of children.get(queue.shift()!) ?? []) {
      found.push(p)
      queue.push(p)
    }
  return found
}

/** Kills the child's tree, not just the child: with `shell: true` the PID is
 * the shell's, and the real work is below it. On Windows it is `taskkill /T`
 * of that PID; elsewhere, the group `spawnWithGroup` created and each
 * descendant found by parent PID, which may have left the group. A child that
 * already exited is left alone: its PID may belong to another process now. */
export function killTree(child: ChildProcess) {
  const { pid } = child
  if (pid === undefined || child.exitCode !== null || child.signalCode !== null)
    return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/T', '/F', '/PID', String(pid)], {
      stdio: 'ignore',
    })
    return
  }
  // The list comes before the signal: a dead process leaves the tree, and its
  // grandchild goes to init.
  const below = descendants(pid)
  for (const target of [-pid, ...below])
    try {
      process.kill(target, 'SIGTERM')
    } catch {
      // Already gone.
    }
}

/** Kills the child's tree if it runs past `ms` without finishing, and calls
 * `onTimeout` first, so whoever ran it can say why. A child that finishes in
 * time disarms the timeout. */
export function withTimeout(
  child: ChildProcess,
  ms: number,
  onTimeout: () => void,
) {
  const timer = setTimeout(() => {
    onTimeout()
    killTree(child)
  }, ms)
  timer.unref()
  child.on('close', () => clearTimeout(timer))
}
