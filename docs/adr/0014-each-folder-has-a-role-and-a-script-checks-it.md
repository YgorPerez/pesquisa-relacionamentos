# Each app folder has a role, and a script checks it

An agent that cannot find where to put a file creates `lib/`, `components/` or `utils/`, or leaves a component next to the route. In a few tickets the tree stops telling where each thing is. In Festival dos Macacos this became [ADR-0049](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0049-code-is-grouped-by-glossary-term-and-what-is-not-a-term-lives-in-platform.md) and `frontend/lint/folders.ts`. Here the code is not grouped by glossary term as it is there: each folder in `frontend/src/` has a role, described in "Onde um arquivo mora" in `AGENTS.md`.

## Decision

- **`frontend/lint/folders.ts` lists what is out of place and exits with an error.** It runs in `pnpm check`, right after `vp check`, and therefore in CI. No linter looks at the tree.
- **The current rules:** `routes/` holds only route files (`.tsx`, without the `-` prefix and without tests); `frontend/src/` holds only the folders `analytics/`, `content/`, `state/`, `fonts/`, `platform/`, `routes/` and `ui/`, plus the files Start looks for at the root; a test lives next to what it tests, never in a `__tests__/` or `tests/` folder; `packages/*/src/` is flat, because the package is imported by subpath.
- **A new folder takes one line in the script and one in `AGENTS.md`**, in the same change. Each rule's reason is in its error message, so whoever hits it knows where the file goes.

## Consequences

- The script's test (`folders.test.ts`) also runs against the real repository: a file out of place fails `pnpm test`, not only `pnpm check`.
