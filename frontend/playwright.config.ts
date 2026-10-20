// The whole app in the browser, over the build's SSR server (`pnpm build`),
// as it goes to production. `pnpm e2e` builds and starts it on its own.
//
// The port is the checkout's e2e port (`scripts/portas.ts`, ADR 0010): 4312
// in the main checkout, the block's one in a worktree, so two worktrees run
// the e2e at the same time without agreeing on anything. `E2E_PORTA` picks
// another.
// The files end in `.e2e.ts`, and not `.spec.ts`, because Vitest picks up
// `*.spec.ts` by default.

import { availableParallelism } from 'node:os'
import { defineConfig, devices } from '@playwright/test'
import { entrarNaFila, pedidoDoPlaywright } from '../scripts/fila-da-maquina.ts'
import { portaPedida } from '../scripts/portas.ts'

const port = portaPedida('e2e')

// The run joins the machine queue before starting the server, and opens the
// Chrome instances it is given (`scripts/fila-da-maquina.ts`, ADR 0013).
// Alone, half the cores, Playwright's default. The workers read this config
// again and inherit `FILA_DA_MAQUINA`, so they do not join again.
const HALF = Math.max(1, Math.floor(availableParallelism() / 2))
const workers = await entrarNaFila(pedidoDoPlaywright(process.argv, HALF))

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  ...(workers ? { workers } : {}),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    // The Chrome installed on the machine, without downloading a browser. The
    // GitHub Actions ubuntu image already has Google Chrome.
    channel: 'chrome',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Mobile first: the Pixel 7 is 412px wide and has touch.
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    // The whole suite on desktop too, where the column becomes a sheet over
    // the halftone. A test that only makes sense on one of them says so,
    // with `test.skip(!isMobile, …)` or the opposite.
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  // The e2e build reads the fixture content (`e2e/library`), with one Fact
  // sheet of each Status, and not the repository's library. Run `pnpm build`
  // again before `pnpm start` with the real content.
  // `VITE_COUNT_ON_LOCALHOST` turns counting on in localhost, where
  // `analytics.e2e.ts` intercepts the sends to GoatCounter.
  webServer: {
    command: `CONTENT_ROOT=e2e/library VITE_COUNT_ON_LOCALHOST=1 pnpm build && PORT=${port} node .output/server/index.mjs`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 180_000,
  },
})
