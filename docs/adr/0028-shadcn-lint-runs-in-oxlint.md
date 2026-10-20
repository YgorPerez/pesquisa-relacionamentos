# `@shadcn/lint` runs in Oxlint, without ESLint

Festival dos Macacos keeps an ESLint just for `@shadcn/lint` and the local rules (its `eslint.config.js`). Here `@shadcn/lint` 0.2 runs as a Vite+ Oxlint `jsPlugin`, which it supports, and the fallback ESLint from ADR 0006 was not needed. The rules are the Festival's: `no-unknown-classes`, `no-raw-colors`, `require-static-classes`, `no-arbitrary-values` (with `layout` and `transition` allowed) and `no-restyle` (only `layout`), on in `frontend/src/**` and off in `src/ui/shadcn/**`, where the class is the variant's definition.

## Consequences

- The plugin finds the theme through `frontend/components.json`, starting from each linted file; its config lives in the `lint` block of the root `vite.config.ts`, like the rest (ADR 0002).
- A class that asks for a touch-up on a shadcn component (`<Button className="gap-2.5">`) becomes a variant in the component, not an exception in the config.
- `@shadcn/lint` is a root dependency, where the lint config is.
