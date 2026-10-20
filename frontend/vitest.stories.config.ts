// The stories as tests, in a real Chrome: `pnpm test:stories`. Modeled on
// the Festival dos Macacos, it stays out of `vite.config.ts` because the
// story is built with Storybook's Vite (`.storybook/vite.config.ts`), and not
// with the app's (TanStack Start and nitro).
import { playwright } from 'vite-plus/test/browser-playwright'
import { defineConfig, mergeConfig } from 'vite-plus'
import { vitestWorkers } from '../scripts/machine-queue.ts'
import { requestedPort } from '../scripts/ports.ts'
import storybookConfig from './.storybook/vite.config.ts'

// The run joins the machine queue before opening the Chrome instances
// (`scripts/machine-queue.ts`, ADR 0013).
const workers = await vitestWorkers()

// The server Vitest starts for Chrome to open the stories, on the checkout's
// port (`scripts/ports.ts`, ADR 0010). Without it, two worktrees fight over
// Vitest's 63315. `STORIES_PORT` picks another.
const port = requestedPort('stories')

export default mergeConfig(
  storybookConfig,
  defineConfig({
    test: {
      name: 'stories',
      ...(workers ? { maxWorkers: workers } : {}),
      include: ['src/platform/storybook/*.browser.test.tsx'],
      setupFiles: ['.storybook/vitest.setup.ts'],
      testTimeout: 30_000,
      browser: {
        enabled: true,
        headless: true,
        api: { port, strictPort: true },
        // The installed Chrome, like the e2e (`playwright.config.ts`).
        provider: playwright({ launchOptions: { channel: 'chrome' } }),
        // Each story on mobile and on desktop, like the e2e.
        instances: [
          {
            browser: 'chromium',
            name: 'mobile',
            viewport: { width: 412, height: 915 },
          },
          {
            browser: 'chromium',
            name: 'desktop',
            viewport: { width: 1280, height: 800 },
          },
        ],
      },
    },
  }),
)
