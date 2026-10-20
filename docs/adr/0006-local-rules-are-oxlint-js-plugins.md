# Local rules are Oxlint `jsPlugins`

The Festival writes its rules in GritQL for Biome and as ESLint plugins (`coesao`, `tema`, `@shadcn/lint`). Here a repository rule is an Oxlint JavaScript plugin: a file in `frontend/lint/` that exports `definePlugin` from `vite-plus/lint/plugins`, with a `.test.ts` next to it that runs the `RuleTester` from `vite-plus/lint/plugins-dev`. The file goes in `lint.jsPlugins` in the root `vite.config.ts`, and the rule is turned on in `lint.overrides` only in the folders where it applies.

The first is `state` (`frontend/lint/state.ts`), with the rule `state/localstorage-through-stored`: in the app, `localStorage` only goes through `stored()`, which validates what it reads. Its owner, `src/state/stored.ts`, stays out of the override.

## Consequences

- The plugin is TypeScript, and Oxlint loads it through Node, which strips the types by itself. Nothing is compiled beforehand.
- The plugins import the Vite+ API, not `oxlint` or `@oxlint/plugins` directly: that way the API is the one of the Oxlint that loads the plugin.
- A JavaScript plugin rule does not read types. A rule that needs them stays out of here.
- `@shadcn/lint` and the `cohesion` and `theme` plugins come in with #54 the same way. If `@shadcn/lint` does not run on Oxlint, it goes to a minimal fallback ESLint, with only it.
