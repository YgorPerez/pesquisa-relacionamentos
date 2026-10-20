# Each worktree prepares itself and has its own ports

Several agents work here at the same time, each in a worktree, on the same machine. Until #53, a new worktree was born without `node_modules` and without the files git does not carry, and each agent set that up by hand. All used the same ports (4310, 4311, 6310), and `.env.example` said to change `E2E_PORT` in each worktree: whoever forgot saw Playwright refuse the port, or tested another worktree's server. Copied from [Festival dos Macacos's ADR-0038](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0038-each-worktree-prepares-itself-and-gets-its-own-ports.md), without a database and without an API.

## Decision

- **`t3.json` runs `node scripts/prepare-worktree.ts` when T3 Code creates a worktree.** Outside it (a Claude Code agent's worktree, a `git worktree add`), whoever created it runs the same command. It runs `pnpm install`, links from the main checkout what git does not carry (`frontend/.env*`, `sources/private/`, the impeccable skill), syncs `.repos/` (ADR 0012) and says how many commits HEAD is behind `origin/main`.
- **The root `.env` and `.env.deploy` are never linked.** They carry the Hostinger token and the VPS access.
- **Each worktree has a block of 10 ports** (`scripts/ports.ts`): dev +0, start +1, e2e +2, Storybook +3, stories Vitest +4. The block comes from a sha256 of the path, one of 800 between 40100 and 48099. Below 40100 are the blocks of the Festival, which runs on the same machine. The main checkout (`.git` is a folder) stays on 4310, 4311, 4312, 6310 and 6311.
- **`pnpm dev`, `pnpm start` and `pnpm storybook` go through `scripts/dev.ts`**, which refuses a busy port and says which variable changes it (`DEV_PORT`, `START_PORT`, `STORYBOOK_PORT`). `pnpm e2e` reads the port in `playwright.config.ts` (`E2E_PORT`), and `pnpm test:stories` in `vitest.stories.config.ts` (`STORIES_PORT`).

## Consequences

- The main checkout's e2e moved off 4311, which belongs to `pnpm start`, to 4312. The two now run together.
- In a worktree, the app is not on 4310. The port shows up in the `[dev]` line, or in `node scripts/ports.ts`.
- The shell's generic `PORT` does not change the port: another tool may have set it. The Docker image does not go through here and stays on its `PORT=3000`.
- Two worktrees land on the same block 1 time in 800. When it happens, the second refuses the port, and the use's variable solves it.
