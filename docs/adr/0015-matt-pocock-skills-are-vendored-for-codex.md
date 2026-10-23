# Matt Pocock's skills are vendored for Codex

Superseded by ADR 0041 on 2026-10-23.

Claude Code installs the skills from [`mattpocock/skills`](https://github.com/mattpocock/skills) as a plugin (`.claude/settings.json`). Codex and the other harnesses do not read Claude Code plugins, and a Codex agent was working here without `tdd`, `code-review` or `grilling`. Festival dos Macacos solved this with a copy in `.agents/skills/` and `skills-lock.json`, managed by the [`skills`](https://skills.sh) CLI.

## Decision

- **`.agents/skills/` holds the 27 skills from `engineering` and `productivity`, and `skills-lock.json` holds the hash of each.** It is the same version as Festival's (`main` @ `6fd9479`, from 2026-10-06), with the same local edits to `grilling` and `handoff` (`.agents/skills/NOTICE.md`).
- **Nobody edits the skills by hand:** `npx skills update` overwrites them. What belongs to this repository goes into `AGENTS.md` and `docs/agents/`, which the skills read.
- **impeccable stays out of the lock and out of git.** It installs with its own command (`docs/agents/design.md`), and `prepare-worktree.ts` links the main checkout's copy.
- **`.claude/skills/grilling` remains the copy edited for Claude Code**, identical to `.agents/skills/grilling`. The two change together.

## Consequences

- `.agents/` and `skills-lock.json` stay outside formatting and lint, like the other third-party skills.
- An upstream update is a single commit with `npx skills update` and a review of the `grilling` and `handoff` diff.
