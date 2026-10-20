# The Effect source lives in `.repos/` for agents to read

`packages/content` validates the frontmatter with the Schema from `effect@4.0.2`. The v4 API renamed things and moved modules from v3, and almost everything the agent has read about Effect is v3 or a v4 release candidate. From memory, it writes a function that does not exist, or that exists with different behavior. Copied from [Festival dos Macacos ADR-0039](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0039-the-effect-source-sits-in-repos-for-agents-to-read.md), which copied it from t3code.

## Decision

- **`node scripts/sync-references.ts` clones the Effect repository into `.repos/effect-smol`**, at the `effect@<version>` tag from the `catalog:` in `pnpm-workspace.yaml`: a shallow clone of one tag, about 60 MB. It does nothing if the clone is already at that tag, and clones again when the version changes.
- **`.repos/` is in `.gitignore`**, outside formatting and lint.
- **`scripts/prepare-worktree.ts` syncs from the main checkout's copy** (`--from`), without downloading from GitHub.
- **Read it, never import or edit it.** The entry point is `.repos/effect-smol/LLMS.md`; a module's source is in `packages/effect/src/`. `AGENTS.md` says so in "Código do Effect".

## Consequences

- Bumping `effect` in the catalog means running the script again; preparing a worktree already runs it.
- With no network and no copy in the main checkout, the preparation warns and goes on without `.repos/`.
