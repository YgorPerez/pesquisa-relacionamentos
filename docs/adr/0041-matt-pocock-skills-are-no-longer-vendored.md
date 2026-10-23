# Matt Pocock's skills are no longer vendored

ADR 0015 put a copy of the [`mattpocock/skills`](https://github.com/mattpocock/skills) skills in `.agents/skills/`, pinned by `skills-lock.json`, so Codex would have `tdd`, `code-review` and `grilling`. On 2026-10-23 the user decided the repo should not carry them: they keep their own edited versions installed on the machine, and an older copy in the repo would sit beside them.

## Decision

- **`.agents/skills/` and `skills-lock.json` are gone.** Every harness uses the skills installed on the user's machine.
- **`.claude/skills/grilling` stays**, still the copy Claude Code uses for `wayfinder:grilling` tickets.
- **impeccable is unchanged:** it still installs into `.agents/skills/impeccable`, git-ignored, and `prepare-worktree.ts` still links it.

## Consequences

- A machine without the skills installed has no `tdd`, `code-review` or `implement-spec` for Codex.
