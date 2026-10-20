# A new suppression waits for a person, and the code has a ceiling

An `oxlint-disable` is the shortest way past a red lint, and several agents push here every day. The code has zero suppressions today (apart from `routeTree.gen.ts`, which is generated). From [Festival dos Macacos ADR-0036](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0036-a-new-suppression-waits-for-a-person.md), with a ceiling that Festival rejected.

## Decision

- **`.github/scripts/suppressions.ts` counts and reads.** The directives are `oxlint-disable`, `eslint-disable` (which Oxlint also obeys), `react-doctor-disable`, `@ts-expect-error`, `@ts-ignore`, `@ts-nocheck`, `@effect-diagnostics`, `fallow-ignore`, the coverage `ignore` comments, and `'use no memo'`. Only one that opens a comment counts; one quoted in the middle of a sentence does not.
- **The ceiling.** `.github/suppression-ceiling.json` says how many of each the tree may have. Over it, it fails, with or without the label. Whoever removes one lowers the number; raising it is changing an auditor's configuration.
- **No reason always fails.** The reason goes after `--` in Oxlint, React Doctor and fallow, after the directive in TypeScript, and in a comment on the same line as `'use no memo'`.
- **With a reason, or with an auditor's configuration changed, the PR waits for a person** to add the `supressao-revisada` label. Configuration means each package's `vite.config.ts`, `vitest.*config.ts`, `doctor.config.ts`, `.fallowrc.jsonc`, each `tsconfig*.json`, the rules in `frontend/lint/`, the ceiling, and the audit script lines in the `package.json` files. No agent adds the label.
- **It runs in `suppressions.yml`**, on every PR and every label, and **in the push hook** (ADR 0020), where the ceiling and the reason block and the rest only warns.

## Options considered

**Only the diff, as in Festival.** Festival rejected the ceiling because swapping a reviewed suppression for an unreviewed one keeps the count. Here the diff is still read: the swap shows up as a new suppression and asks for the label. The ceiling adds what the diff does not see, the total that only goes up.

**Approval in a terminal (`--aprovar`), as in Festival's hook.** There, most changes go straight to `main`, without a PR. Here everything goes through a PR, and the label is enough.

## Consequences

- Moving code that carries a suppression counts as adding it.
- A PR that touches `vite.config.ts` stays red on `Supressões` until someone reads it.
