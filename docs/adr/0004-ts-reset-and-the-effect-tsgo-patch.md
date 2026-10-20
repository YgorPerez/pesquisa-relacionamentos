# ts-reset and the `@effect/tsgo` patch, in `tsc` and in Oxlint

Two type adjustments come from the Festival.

`@total-typescript/ts-reset` comes in through a `reset.d.ts` in each TypeScript project (the app and the two packages). With it, `JSON.parse` and `Response.json()` return `unknown`, and whoever reads JSON checks its shape before using it. It found three places that passed the Possible group pack straight from JSON to `openPack`, which now receives `unknown` and checks the version with a type guard.

The root `prepare` runs `effect-tsgo patch --typescript --oxlint`. The patch replaces TypeScript 7's `tsc` and Vite+'s Oxlint binary with those from `@effect/tsgo`, and Effect diagnostics come out in both. The Festival runs with `--no-oxlint`, because Oxlint does not exist there. Here the content package, the only one with Effect, turns on the `@effect/language-service` plugin in `tsconfig.json` and, in `lint.overrides`, the `recommended` preset of the `effecttsgo` plugin.

## Consequences

- Each `@effect/tsgo` version accepts a short list of Oxlint and `oxlint-tsgolint` versions, and the patch fails `pnpm install` outside it. Upgrading `vite-plus` requires upgrading `@effect/tsgo` with it, through the catalog.
- React Doctor ships its own Oxlint 1.81, which the patch rejects. It keeps its own, which is the only one its plugin runs on, and `hoistPattern` takes it out of `node_modules/.pnpm/node_modules`. From there, the `NODE_PATH` pnpm gives scripts handed it to the patch.
- The same Effect diagnostic may come out twice, in `tsc` and in `vp check`.
