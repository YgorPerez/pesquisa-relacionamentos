# Tests from several worktrees share the machine through a queue

Each Vitest and Playwright run picks its workers from the core count, as if it were alone on the machine. With several agents testing at the same time, the runs fight over the same cores and all of them slow down; in Festival dos Macacos, three suites together took four times as long, and tests with deadlines timed out. Copied from [Festival ADR-0054](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0054-test-runs-share-the-machine-through-one-queue-and-a-worker-budget.md).

## Decision

- **An unfiltered run is heavy, and heavy runs go one at a time**, in order of arrival, with the workers they would use alone. Unfiltered means no file, folder, `-t`, `-g`, `--project` or `--shard`: the boundary comes from the arguments, and no list of commands has to be kept up to date.
- **A filtered run is light and never waits.** It takes its share of the budget (one worker per core), divided by the runs in progress, and never less than one worker.
- **The entry point is in each tool's config**, not in `package.json`: the `vite.config.ts` files at the root, in `frontend/` and in the packages, `frontend/vitest.stories.config.ts` and `frontend/playwright.config.ts` call `scripts/machine-queue.ts` when they load. That way `pnpm test`, `vp test` and `pnpm exec playwright` all go through it.
- **The state is one file per run in `<tmp>/tem-estudo-test-queue`**, written under a folder lock. The folder is not Festival's: one of its suites lasts up to 20 min, and our whole suite takes seconds; sharing the queue would leave ours waiting for theirs.
- **A dead run gives up its turn on its own.** The file holds the owner's PID, which the owner renews every 30 s. With no live PID, or 5 min without a signal, the next reader deletes the file. The queue only asks whether the PID exists and never stops a process (ADR 0011).
- **Outside the queue:** CI (`CI` set), watch mode, `--list`, the Playwright UI, and whatever runs inside a run that has already entered (Playwright's workers inherit `MACHINE_QUEUE`). `MACHINE_QUEUE=off` skips the queue on purpose.

## Consequences

- `pnpm check` runs each package's suite as heavy, one after the other. Each takes seconds.
- Whoever is waiting for a turn sees `[queue] waiting for a turn` once a minute, with the command, the worktree and the PID of the run ahead. The wait counts toward the command's time limit: run the full suite in the background.
- The budget is the machine's, but only among this repository's worktrees: Festival's tests are not counted.
