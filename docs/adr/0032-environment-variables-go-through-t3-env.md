# Environment variables go through T3 Env

As in the Festival dos Macacos (`frontend/src/env.server.ts`, `platform/variaveis-do-servidor.ts`), the repository reads variables with `createEnv` from `@t3-oss/env-core`, not with `process.env.X ?? default` scattered around. `scripts/env.ts` has the types (`port`, `folder`, `optionalFile`, `flag`) and `readEnv`. `scripts/ports.ts` (`requestedPort`) reads `DEV_PORT`, `START_PORT`, `E2E_PORT`, `STORYBOOK_PORT` and `STORIES_PORT`; `frontend/vite/environment.ts` reads `CONTENT_ROOT`, `SITEMAP_ANTERIOR` and `VITE_COUNT_ON_LOCALHOST`, once, when `vite.config.ts` loads. `frontend/scripts/vps.ts` reads `GOATCOUNTER_EMAIL` and `COMMENT_GITHUB_TOKEN` before the first deploy step, and the app server reads `COMMENT_GITHUB_TOKEN` on each Comentário (ADR 0043). The app server's variables are keys of one module, `frontend/src/platform/server-env.ts`, the only app code that imports `scripts/env.ts`; a server function imports it inside its handler (`frontend/src/content/comment.ts`). A secret's type (`optionalSecret`) never fails, because the error message prints the value.

The reason is to fail at the start. Before, a `CONTENT_ROOT` with a typo only showed up as an empty library or an error in the middle of the build, and `E2E_PORT=abc` became `NaN` in Playwright. Now the command stops before it starts, with a message that names each wrong variable, its value and what was expected.

Unlike the Festival, the types are hand-written Standard Schema, not Effect Schema: the app does not use Effect (spec #23), and zod would weigh more than the lines of `env.ts`. There is also no `env.ts` in the browser: the only variable in the bundle, `VITE_COUNT_ON_LOCALHOST`, is already validated at build time.

## Consequences

- A new variable: a type in `env.ts`, if one is missing, and a key in the `readEnv` call of whoever uses it. A blank key counts as absent.
- The deploy's `VPS_*` variables are still read directly: a missing `VPS_HOST` already stops `vps.ts` with the usage.
