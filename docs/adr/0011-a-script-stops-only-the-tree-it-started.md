# A script stops only the process tree it started

Other sessions run their own `node`, `vite` and Chrome on the same machine. A `pkill -f vite` or a `kill` by name takes down another worktree's dev server or e2e run halfway through. In Festival dos Macacos this already happened, and it became item 3 of the "Four ways to hurt yourself" in its AGENTS.md.

## Decision

- **Whoever starts a child keeps its PID and stops it by that PID.** `scripts/kill-tree.ts` starts the child in a shell and in a process group of its own (`spawnWithGroup`) and stops it with `killTree`, which sends the signal to the whole group (on Windows, `taskkill /T` on the PID). That way the `vite` under `pnpm exec` dies too, and nothing outside the group gets the signal. `withTimeout` does the same when the child runs past its time.
- **`scripts/dev.ts` uses both.** Ctrl-C, `SIGTERM` or the script exiting take the child and its tree with them.
- **An agent stops only what it started**: the PID it kept, or the owner of its own worktree's port (`ss -ltnp 'sport = :<port>'`). The commands are in `docs/agents/environment.md`.
- **The test queue (ADR 0013) never kills a process.** It only asks whether a PID exists.

## Consequences

- A child that has already exited gets no signal: its PID may now belong to another process.
- Anyone starting a long-running process in a new script uses `spawnWithGroup` and `killTree`, not `spawn` directly.
