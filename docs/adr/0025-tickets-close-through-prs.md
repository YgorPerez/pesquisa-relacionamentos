# Tickets close through PRs

Until spec #23, a ticket closed with a comment and a `gh issue close`, and the code went in by a direct merge into the spec branch. Nothing showed, in one place, each ticket's diff, checks and conversation. With `pr.yml` and the other checks (ADR 0016 to 0018), the PR is that place, as in Festival dos Macacos.

## Decision

- **A code ticket goes in through a PR from the `ticket/<n>-<name>` branch into the spec branch** (or into `main`, for a ticket outside a spec), using the `.github/pull_request_template.md` template, with `Closes #<n>`.
- **The PR goes in green**: every check on the last commit passed and no comment was left unanswered. The merge is `gh pr merge <pr> --merge`, no squash.
- **GitHub only closes the issue by itself for a PR into the default branch.** For a PR into a `spec/*`, whoever merges closes the issue: `gh issue close <n> --comment "Entrou em spec/<n> por #<pr>."`. The spec's PR into `main` carries `Closes #<spec>`.
- **A ticket without code** (`research`, `grilling`, a `prototype` with no code to merge) still closes by comment.
- **The implementer opens the PR when the orchestrator asks**; otherwise, it pushes the branch and the orchestrator opens it (`docs/agents/orchestration.md`).

## Consequences

- The line in the map's "Decisions so far" points to the PR, which keeps the diff and the conversation.
