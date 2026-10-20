# The full suite runs every night, on Actions

A PR's CI proves its diff against the base at that moment. Two PRs that go in on the same day can together break what neither broke alone, and `main` runs nothing after the merge. Taken from Festival dos Macacos's `nightly-suite.ts`, which runs in a worktree on the machine through the Windows Task Scheduler.

## Decision

- **`nightly-suite.yml` runs at 04:00 Brasília time** (and on `workflow_dispatch`), calling `pr.yml` as a reusable workflow: the same jobs, on `main`.
- **The last job reports** (`scripts/nightly-suite.ts`): the first red night opens the "Suíte noturna vermelha" issue, with the SHA, the jobs that failed, the run link and the end of the log; the next one comments on it; the first green one closes it.

## Options considered

**On the machine, as in the Festival.** There, Actions was off for lack of payment. This repository is public, Actions runs for free, and the machine is left to the agents.

## Consequences

- The schedule only runs the file that is on `main`: the nightly suite starts when spec #23 goes into it.
