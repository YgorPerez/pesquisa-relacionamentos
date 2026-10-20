# Stories run in Chrome, on mobile and desktop

As in the Festival dos Macacos (its ADR-0047, `docs/adr/0047-every-screen-opens-in-storybook-on-recorded-api-answers.md`, "Every story is a test"), each story is a test.

## Decision

- **`pnpm test:stories`** opens each story in a real Chrome, through Vitest's browser mode (`vitest.stories.config.ts`), one instance at 412×915 and another at 1280×800. A story fails if it throws, if its `play` fails or if it writes an error or warning to the console. It uses Storybook's portable stories (`composeStories`), not `@storybook/addon-vitest`, which does not accept Vitest 5. It runs in the `stories` job of `pr.yml`, after `build-storybook`.
- **`pnpm test:storybook`** opens the running Storybook in Chrome, through Playwright (`playwright.storybook.config.ts`), for what can only be proven in the manager. Today that is search without accents: titles come from the file path, without accents, and `.storybook/manager.ts` strips the accent from what is typed, so that `possíble` finds `ui/possible-group` (`.storybook/search.e2e.ts`, as in the Festival).
- **The calculators' link previews have a story** (`src/platform/storybook/link-previews.stories.tsx`), in the role of the Festival's link cards. Storybook has no server, so the story does in the browser the calculation the server does for the social network's bot: `buildGroupPreview` (`content/group-preview.ts`, the same one `fetchGroupPreview` uses) and `prioritiesPreview` over the fixture library's view. The calculation does not run in a Vite plugin in Node, as the Festival's does, because the library view brings in `xss`, which is CommonJS and does not load through `runnerImport`.

## Consequences

- A piece that only breaks on mobile or only on desktop breaks one of the two instances.
- `test:storybook` starts Storybook on the worktree's port (`scripts/ports.ts`); with a `pnpm storybook` running in the same worktree, stop it first.
