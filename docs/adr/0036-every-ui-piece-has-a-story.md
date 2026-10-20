# Every piece in `src/ui/` has a story

In the Festival dos Macacos, every screen opens in Storybook, and `lint/stories.ts` fails a route that no story opens (its ADR-0047, `docs/adr/0047-every-screen-opens-in-storybook-on-recorded-api-answers.md`). Here the stories show pieces, not screens: the routes read the library through server functions, which Storybook does not have. Half the pieces in `src/ui/` did not appear in any story, the seven controls in `ui/shadcn/` included, and nothing said so.

## Decision

`frontend/lint/stories.ts`, in `pnpm check`, fails each `.tsx` in `src/ui/` (including `ui/shadcn/`) that no `*.stories.tsx` imports. It reads the imports with Vite's parser, without importing the app; relative, `#/` and `@/` imports count, and `import type` does not. A test or another piece that imports the piece does not count: the story is where the piece is seen, and where `pnpm test:stories` opens it (ADR 0037).

The story may live in another file (`controls.stories.tsx` shows the ones in `ui/shadcn/`). Those that need content read the e2e fixture, which Storybook loads through the same plugins as the build (`library()`, `possibleGroup()`).

## Consequences

- A new piece needs a story in the same PR.
- A `.tsx` file in `src/ui/` that is not a piece (there is none today) would also need a story; move it out of `ui/`.
