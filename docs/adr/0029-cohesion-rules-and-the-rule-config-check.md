# The cohesion rules, and the rule config check verifies which rules are on

Festival dos Macacos ties each piece to its owner through lint (`lint/coesao.ts`, `lint/cor-do-tema.ts`) and has two GritQL rules (`sem-title-nativo`, `sem-import-js`). Here they are Oxlint `jsPlugins` (ADR 0006), each with its `RuleTester`, and the content is this site's:

- `cohesion/h1-owner`: the `<h1>` is the `Display` in `ui/sheet.tsx`.
- `cohesion/halftone-owner`: the halftone, the only elevation, belongs to the pieces in `src/ui/` (the `Panel`, the `SiteButton`).
- `cohesion/hand-drawn-icons`: ready-made icon packages do not go in.
- `theme/raw-color`: a color written by hand in a string (`#f5f8f8`, `rgb()`). The owner of colors outside CSS is `ui/brand.ts`. With no dark mode, the Festival's rule (the color that does not change in dark mode) does not apply.
- `html/no-native-title`: the HTML `title` does not open on touch.
- `modules/no-js-import`: a relative import names the `.ts` file, so `node` can run the scripts.

The Festival's `lint/chave-das-regras.ts` is the ESLint cache key. Oxlint has no such cache, and `vp run --cache` records by itself what the lint reads. Here `frontend/lint/rule-config.ts` checks the other side: that every local plugin is in `lint.jsPlugins`, that every rule in it is on, that no rule that is on is missing from the plugin, and that the `@shadcn/lint` rules apply in the app and not in `ui/shadcn/`. `frontend/lint/rule-config.test.ts` runs this on the real config.

## Consequences

- A new plugin in `frontend/lint/` with no rule turned on fails the test, and is not forgotten.
