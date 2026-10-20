# PR CI runs the full suite, and the agent runs the minimal proof

Until now, the agent ran the full `pnpm check`, build and e2e before each push, and `ci.yml` repeated all of it on the PR. Several agents share the same machine (ADR 0013): each one's full suite competes for cores with the others', and the local copy proves nothing that CI does not prove again. Copied from [Festival dos Macacos ADR-0035](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0035-the-pull-requests-ci-runs-the-whole-suite-and-an-agent-runs-the-smallest-proof.md).

## Decision

- **`pr.yml` is the gate, and runs the full suite on every push to a PR**, in three parallel jobs: `check` (`pnpm typecheck` and `pnpm check`), `stories` (the Storybook build and `pnpm test:stories`) and `e2e` (the build with the sitemap check and `pnpm e2e`). `ci.yml` became `pr.yml`.
- **On the machine, the agent runs the minimal proof of what changed**: `node scripts/minimal-proof.ts [--base <branch>]`. From the diff against the merge-base, it runs the types of the affected packages and of the app that imports them, Vitest with `--changed` in each affected folder, the app folder check, and `vp check` on the changed files. A failing step does not stop the others.
- **The work is done when CI is green on the PR's last commit**, not when the local run passes. A red job is read with `gh run view <id> --log-failed`.

## Consequences

- An e2e spec the agent touched still runs by hand, `pnpm e2e <spec>`; the minimal proof does not start e2e.
- The repository is public: Actions costs nothing, and the rule "do not merge a red PR" belongs to people and agents, because there is no branch protection.
