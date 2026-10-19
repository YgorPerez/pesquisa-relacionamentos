# Third-party notice

The skills in this directory are vendored from
[**mattpocock/skills**](https://github.com/mattpocock/skills) — "Skills for Real Engineers"
by Matt Pocock — and are used under the MIT License. The upstream license text is in
`LICENSE` alongside this file.

- **Upstream**: https://github.com/mattpocock/skills
- **Vendored from**: `main` @ `6fd9479`
- **Vendored on**: 2026-10-06
- **Scope**: the `engineering` and `productivity` skill sets (27 skills). The upstream
  `in-progress`, `misc`, `deprecated` and `personal` sets are deliberately excluded.

## Don't hand-edit these files

They are managed by the [`skills`](https://skills.sh) CLI and `skills-lock.json` in the repo
root. To change what's here:

```bash
npx skills add mattpocock/skills -a github-copilot -s <skill> --copy -y   # add one
npx skills update                                                        # pull upstream changes
npx skills list                                                          # see what's installed
```

Pass `--copy`: the default symlinks into your home directory, which would be broken for
everyone else who clones this repo. Note that `skills remove` does not delete `--copy`-installed
directories — delete the directory and prune `skills-lock.json` by hand.

Local edits will be overwritten by `npx skills update`. Repo-specific guidance belongs in
`docs/agents/` and `AGENTS.md` instead.

## Local edits

Two skills carry edits made here, which an update will overwrite:

- `grilling`: asks each round through the harness's native question tool, with the text format
  in `TEXT-ROUND.md` as the fallback, and reads `DA` as "default the rest of this round".
- `handoff`: has a `resume` mode, run by the user in a new chat.

After `npx skills update`, check `git diff .agents/skills/grilling .agents/skills/handoff` and
restore the local parts before committing, keeping what upstream changed outside them.
`.claude/skills/grilling` is a copy of the edited `grilling` for Claude Code, whose plugin brings
the upstream one; keep the two the same.

The update also links each skill into `.claude/skills/`, and the link replaces the `grilling`
copy. Delete the links (`find .claude/skills -maxdepth 1 -type l -delete`) and copy `grilling`
back. Some skills fail to update, and a skill reported as updated can stay old: diff each folder
against a clone of upstream before committing.
