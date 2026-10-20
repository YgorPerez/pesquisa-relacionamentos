# The PR suite on the machine runs what the diff affects

Sometimes a branch needs the suite before the PR, or CI did not run. Running everything in sequence takes minutes and ties up the other agents' machine. From Festival dos Macacos's `pr-suite.ts`, without its certificates.

## Decision

- **`node scripts/pr-suite.ts [--base <branch>] [--full] [--plan]`** runs the `pr.yml` steps in four queues at once: `check` in parts (`vp check`, the folders, the tests, fallow, doctor), the types and the audit, the stories, and the build with e2e. The build and e2e share a queue because both write `frontend/.output`.
- **By default, only what the diff affects** (`scripts/affected.ts`): Vitest with `--changed` in the affected folders, the stories if the app changed, and the e2e specs for the terms that changed, through the `SPEC_TERMS` table. A lockfile, a config, `platform/`, a package in `packages/` or a style used by every page runs everything. An app file with no term runs the whole e2e.
- **A failing test runs again, alone, once** (`scripts/flaky.ts`). If it passes, the step counts as green and the manifest records the flaky test.
- **Each run keeps its logs and a `manifest.json` in a folder of its own** (`scripts/suite-log.ts`).
- **Before running, it lists the open PRs that touch the same files** (`scripts/overlapping-prs.ts`).

## Options considered

**Festival's certificate**, which the hook requires before a push to `main`. There, Actions was turned off, and the local suite was the only gate. Here the gate is PR CI (ADR 0016), and a local certificate would repeat what it proves.

## Consequences

- A new spec goes into `SPEC_TERMS`; the `affected.ts` test fails until it does.
