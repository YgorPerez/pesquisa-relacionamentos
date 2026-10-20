// The Storybook manager in a Chrome: `pnpm test:storybook`. Today only the
// accent-free search (`.storybook/manager.ts`), which touches Storybook's own
// search field and can only be proven with it running. It stays out of
// `playwright.config.ts`, which builds and starts the site. Modeled on the
// Festival dos Macacos `playwright.storybook.config.ts` (ADR 0037).
//
// The port is the checkout's Storybook port (`scripts/portas.ts`, ADR 0010):
// with a `pnpm storybook` running in the same worktree, stop it first, or
// pick another in `STORYBOOK_PORTA`.
import { defineConfig } from '@playwright/test'
import { portaPedida } from '../scripts/portas.ts'

const port = portaPedida('storybook')

export default defineConfig({
  testDir: './.storybook',
  testMatch: '**/*.e2e.ts',
  // Away from the e2e `test-results/`, which each of its runs deletes.
  outputDir: '.storybook/test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    // The installed Chrome, like the e2e.
    channel: 'chrome',
  },
  webServer: {
    command: `pnpm exec storybook dev --ci --exact-port --quiet --disable-telemetry -p ${port}`,
    url: `http://localhost:${port}/index.json`,
    reuseExistingServer: false,
    stderr: 'pipe',
    timeout: 180_000,
  },
})
