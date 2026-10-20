# Screens are tested in jsdom, and e2e guards the journeys

The frontend had two test layers: the pure calculations in Node and Playwright over the build, on mobile and desktop. Everything a screen does on a tap (the calculator that changes the number, the Profile that marks the findings) could only be proven in e2e, which builds the site before it starts. The Festival dos Macacos (its ADR-0045, `docs/adr/0045-a-screen-is-tested-in-jsdom-against-the-contract-and-e2e-keeps-the-journeys.md`) found that most of its e2e tests were exactly that: one screen, given what reaches it.

## Decision

- **A screen's behavior is tested in jsdom, with Testing Library.** The file is `*.test.tsx`, next to the screen's piece in `src/ui/` (`routes/` only has routes). The frontend's `vite.config.ts` splits Vitest into two projects: `logic` (`*.test.ts`, in Node) and `screens` (`*.test.tsx`, in jsdom, with `src/platform/screens/setup.ts`). The test uses `user-event` and finds things by role and label.
- **The route opens in the real router** (`openScreen(url)`, `src/platform/screens/open-screen.tsx`), with its `queryClient`: the loader, `notFound` and the state saved on the device run as in the browser. The root renders only the `<body>` (header, page, footer); the `<head>` belongs to e2e.
- **Server functions run inside the test itself.** In jsdom there is no server and no Start plugin, so `@tanstack/react-start` becomes `src/platform/screens/test-server.ts`: the `handler` runs after the `validator`, over the e2e fixture library and data (`e2e/library`), and the response goes through a `structuredClone`. Here there is no API with a contract, as in the Festival; the contract is each server function's type, which the test reads from the real module.
- **The network is MSW** (`src/platform/screens/network.ts`). The screens' only `fetch`, the Possible group packs, comes from the fixture data, built by the build's `buildPacks`. `goOffline()` drops the request. A request with no written response fails the test.
- **An error or warning in the console fails the test**, as in the stories.
- **e2e guards what needs the whole site:** the server HTML and hydration, the `<head>` and Open Graph, the layout (the number pinned to the top, 44 px touch targets), the real keyboard and the clipboard.

## Consequences

- The first screen test found a bug: offline, Possible group requested the pack again on every render, endlessly, and the failure notice flickered. Now what failed is only requested again through "Tentar de novo".
- A new screen behavior gets a `.test.tsx`; a journey across pages, or something that depends on layout, gets an e2e test.
- The packs kept in `state/group-packs.ts` live until the end of the test file. The test that drops the network lives in a file of its own.
