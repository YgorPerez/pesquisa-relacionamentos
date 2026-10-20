# Private sources live in a private repo, and CI verifies the Fact sheets against them

A Fact sheet's local source without an open license (#37) lived in a git-ignored folder of the main checkout, `sources/private/`, which `prepare-worktree.ts` linked into each worktree. Nothing backed it up, it did not move to another machine, and CI could not see it, so `verify-fact-sheet` only ran on the machine of whoever wrote the Fact sheet. On 2026-10-20 the user decided where those sources live (#78).

## Decision

- **The private sources are in a private repo, `YgorPerez/pesquisa-relacionamentos-fontes`,** one file per Fact sheet at its root (`<slug>.<pdf|html|txt|md>`). The public repo never carries them, not even in its history or build.
- **A machine keeps a clone of it at `sources/private/`**, still git-ignored. It is not a submodule: the public repo does not point at a repo its readers cannot fetch.
- **`prepare-worktree.ts` clones it into the main checkout when `sources/private/` is missing there** (`scripts/private-sources.ts`), and links it into each worktree as before. The URL follows the public `origin` (https or ssh), and the clone takes the main checkout's own `credential.helper` list, so it uses the account the public repo is already pinned to. Without access it prints one line and goes on: `pnpm verify` then sees only the public sources.
- **`scripts/fetch-sources.py` saves into `sources/private/`** and prints the commands to commit and push there.
- **The `Fichas` workflow (`fact-sheets.yml`) clones the private repo with a read-only deploy key**, kept in the `SOURCES_DEPLOY_KEY` Actions secret, and runs `.github/scripts/fact-sheets.ts`: `verify-fact-sheet` on each Fact sheet marked verified (✅) that a PR touches, or on all of them on a push to `main` or by hand.
  - A broken excerpt, a number that is not in its excerpt or a `Cálculo` that does not reproduce the Valor fails.
  - A ✅ Fact sheet with no local source fails when the PR is what marked it ✅. One that was already ✅ gets a warning, and the summary says it was not checked.
  - Without the secret (a PR from a fork), the job warns that nothing was verified and ends green.
- **The legacy folder `fontes/privado` (before #70) is no longer read.** `prepare-worktree.ts` says when it still has files to move, and drops a worktree's old link to it.

## Why

A private repo is a backup and travels to any machine with `git clone`. A deploy key reaches only that one repo, and read-only, so the secret cannot write anywhere if it leaks.

A missing source on a Fact sheet that was already ✅ does not fail, because when the private repo was created none of the sources were in it: failing them would have turned `main` red until every PDF was found again. A PR that newly marks one ✅ has no such excuse.

## Options considered

**A submodule.** The public repo would record a commit of a repo that only the owner can fetch. `git clone --recursive` fails for every reader, and every source change needs a commit in both repos.

**Git LFS or a bucket.** LFS in a public repo makes the files public. A bucket would need its own credentials on each machine and in CI, and gives no history.

## Consequences

- Each new private source is pushed to the private repo, or CI does not see it: `fetch-sources.py` prints the commands, and the `library` skill says so.
- A change only in the private repo does not run the public CI. The `Fichas` workflow runs by hand from the Actions tab (`workflow_dispatch`) to check everything again.
- When every ✅ Fact sheet has its source, a missing source can fail everywhere: `report` in `.github/scripts/fact-sheets.ts` is the one place to change.
