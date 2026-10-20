# Merge several branches at once, with a single suite

A ticket goes in by merging its PR. When the orchestrator brings several tickets into a spec, merging one at a time runs each one's CI on a target that has already changed, and a conflict between two only shows up at the last one. Taken from Festival dos Macacos's `merge-branches.ts` and `before-merge.ts`.

## Decision

- **`node scripts/merge-branches.ts [--target <branch>] <branch...>`**, from a clean worktree kept for this alone, merges each branch onto the fetched `origin/<target>` (no squash), runs the audit, `before-merge.ts` and the diff's suite, and pushes without force through the hook. The default target is `main`.
- **One merge run per repository at a time**: the turn is a file holding the PID at `<git-common-dir>/merge-branches.lock`; one whose owner is dead is taken over without killing anything.
- **On a conflict, or a red result, it stops without publishing.** If the target moved during the suite, it stops and asks for another run.
- **`--dry-run`** merges each branch in a temporary worktree and reports ok or the conflicting files, with no suite and no push.
- **`node scripts/before-merge.ts [--base <ref>]`** checks in seconds what `pnpm check` only blocks at the end: `fallow dead-code`, React Doctor, and whether any `fallow health` penalty went up since the base. The frontend is at 90 and the floor is 90.

## Options considered

**Merge the tip onto the new target and run again, up to three times, as the Festival does.** There, several merge runs per hour competed for `main`. Here they are few, and stopping is simpler.

## Consequences

- Each test that only passed on retry becomes a comment on the "Testes intermitentes" issue.
