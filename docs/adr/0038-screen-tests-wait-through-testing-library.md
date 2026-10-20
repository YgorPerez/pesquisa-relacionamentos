# Screen tests wait through Testing Library

Vitest's `vi.waitFor` gives up after 1 s. In a screen test, the first screen of a file compiles the routes inside the test, and with the machine busy that takes more than 1 s: the test fails with "Timed out in waitFor!" with nothing wrong on the screen. The Festival dos Macacos saw this happen and wrote a GritQL rule (`lint/sem-vi-waitfor-nas-telas.grit`).

## Decision

Testing Library's `waitFor` and `findBy*` give up after 10 s (`src/platform/screens/setup.ts`, ADR 0035). The `screens/no-vi-waitfor-in-screens` rule (`frontend/lint/no-vi-waitfor-in-screens.ts`, an Oxlint `jsPlugin` like the ones in ADR 0006) fails `vi.waitFor` in `*.test.tsx` files. The logic `*.test.ts` files stay free.

## Consequences

- A wait that finds what it looks for takes no longer because of this; only a test that was already going to fail waits the 10 s.
