# Vite+ instead of Biome, Prettier and ESLint

Festival dos Macacos formats with Biome and Prettier and runs a small ESLint for the hooks rules and `@shadcn/lint`. Here formatting, lint, types and tasks go through Vite+ (`vite-plus`, command `vp`): `vp fmt` is Oxfmt, `vp lint` is Oxlint with type checking through `oxlint-tsgolint`, `vp check` joins the three, `vp test` is Vitest and `vp run` runs the monorepo scripts with a cache. The user decided on 2026-10-19, with ESLint kept only as a fallback for a plugin that does not run on Oxlint.

The switch departs from the Festival for three reasons. One binary does what there takes three tools with three configurations and three editor extensions. Oxlint already ships the 22 React Compiler rules and the hooks rules, which in the Festival require ESLint with the Babel parser. And `vp check` gives type errors in the same step as lint, without a separate `tsc`.

## Consequences

- The format and lint configuration lives in the root `vite.config.ts`, in the `fmt` and `lint` blocks. Vite+ ignores blocks in the packages, and what applies to only one folder goes in `lint.overrides`.
- The style is the Festival's Biome style: single quotes, no semicolons, 80 columns. The library (`studies/`, `tips/`, `reports/`, `sources/`, `data/`) and the fixtures stay out of formatting, because the content package compares the Excerpt with the source byte by byte.
- The workspace's `vite` is the Vite+ core (`@voidzero-dev/vite-plus-core`), and Vitest is the one it ships. Both are upgraded together with `vite-plus`, through the `pnpm-workspace.yaml` catalog. Tests import from `vite-plus/test`, and the `vite-plus/prefer-vite-plus-imports` rule rejects `vitest` directly.
- Prettier and ESLint still show up in `node_modules`, brought in by the TanStack route generator, Storybook and React Doctor. No file in the repository configures or calls them.
- A suppression that no longer suppresses anything fails lint (`reportUnusedDisableDirectives: 'deny'`), and so does a warning (`denyWarnings`).
