# PR size becomes a label

Someone opening the PR list cannot tell a one-line change from an afternoon of reading, and a PR that grew too large only shows up when someone starts reviewing it. Taken from Festival dos Macacos's `pr-size.ts`, which took it from t3code's `pr-size.yml`.

## Decision

- **`pr-size.yml` sets a label from `tamanho:PP` (0 to 9 lines) to `tamanho:XG` (1000 or more)** on each push to a PR, and removes the old one.
- **It counts only what someone wrote**: lockfile, route tree, badge, vendored skill and binaries are left out. In a PR that changes code and tests, the tests do not count; in a test-only PR, they do.
- **It only labels, never fails.** A large PR is sometimes the right one, and the reviewer decides.
