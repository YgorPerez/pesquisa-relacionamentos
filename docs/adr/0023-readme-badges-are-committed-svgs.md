# README badges are committed SVGs

The fallow score, the React Doctor score and the coverage change with every merge. Written by hand in the README, they go stale at the first one. Taken from Festival dos Macacos's `badges.yml`.

## Decision

- **`badges.yml` measures after each push to `main` that touches code** (each package's coverage, `fallow health --min-score 0`, `react-doctor --json`) and writes `docs/badges/fallow.svg`, `react-doctor.svg` and `coverage.svg` with `.github/scripts/badges.ts`. It only commits if a badge changed, with the workflow's token, which does not trigger the deploy.
- **The badge's coverage is line coverage of all the code**: the app, the packages and the scripts, excluding tests, stories and generated code.
- **The badge is not a gate.** What enforces the score and the floor is the PR's `pnpm check`.

## Options considered

**The shields.io endpoint.** The repository is public and shields could reach a JSON file, but the badge would depend on an outside service; the SVG in the repository depends on nothing.
