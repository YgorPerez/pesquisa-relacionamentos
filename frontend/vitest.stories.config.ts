// As stories como teste, num Chrome de verdade: `pnpm test:stories`. No
// molde do Festival dos Macacos, fica fora do `vite.config.ts` porque a
// story se monta com o Vite do Storybook (`.storybook/vite.config.ts`), e
// não com o do app (TanStack Start e nitro).
import { playwright } from 'vite-plus/test/browser-playwright'
import { defineConfig, mergeConfig } from 'vite-plus'
import doStorybook from './.storybook/vite.config.ts'

export default mergeConfig(
  doStorybook,
  defineConfig({
    test: {
      name: 'stories',
      include: ['src/platform/storybook/*.navegador.test.tsx'],
      setupFiles: ['.storybook/vitest.setup.ts'],
      testTimeout: 30_000,
      browser: {
        enabled: true,
        headless: true,
        // O Chrome instalado, como o e2e (`playwright.config.ts`).
        provider: playwright({ launchOptions: { channel: 'chrome' } }),
        // Cada story no celular e no desktop, como o e2e.
        instances: [
          {
            browser: 'chromium',
            name: 'celular',
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
