# Pre-push runs the audit and only the affected tests

A push that breaks a test only shows up in CI, minutes later, and another agent may already have merged the branch. Running the whole suite on every push would bring back the cost that ADR 0016 removed. Taken from Festival dos Macacos's `verify-push.ts` (its #1054), without the certificate.

## Decision

- **`.githooks/pre-push` runs `node scripts/verify-push.ts`**, and `prepare-worktree.ts` turns the hook on with `scripts/install-hooks.ts` (`core.hooksPath = .githooks`, shared by every worktree). The hook of one worktree hands over to the hook of the worktree doing the push.
- **Each ref in the push goes through the suppression audit** (ADR 0017) against the target: the remote branch the commit is closest to, `main` or a `spec/*`.
- **And through Vitest for only the folders the push affects** (`affected.ts`), with `--changed`: on the branch's first push, since the merge-base with the target; on later pushes, since what the remote already had. No e2e, no stories.
- **`main` only moves forward**, and deleting it is refused.
- **`SKIP_TESTS="<reason>" git push`** skips the tests, not the audit, and writes the reason to `<git-common-dir>/push-skip-tests.log`.

## Consequences

- The hook is client-side: `git push --no-verify` skips it, and the server checks nothing. It catches mistakes, not someone who wants to get through.
- A documentation-only push runs no tests.
