// As stories como teste, num Chrome de verdade: `pnpm test:stories`. No
// molde do Festival dos Macacos, fica fora do `vite.config.ts` porque a
// story se monta com o Vite do Storybook (`.storybook/vite.config.ts`), e
// não com o do app (TanStack Start e nitro).
import { playwright } from 'vite-plus/test/browser-playwright'
import { defineConfig, mergeConfig } from 'vite-plus'
import { workersDoVitest } from '../scripts/fila-da-maquina.ts'
import { portaDoCheckout } from '../scripts/portas.ts'
import doStorybook from './.storybook/vite.config.ts'

// A rodada entra na fila da máquina antes de abrir os Chrome
// (`scripts/fila-da-maquina.ts`, ADR 0010).
const workers = await workersDoVitest()

// O servidor que o Vitest sobe para o Chrome abrir as stories, na porta do
// checkout (`scripts/portas.ts`, ADR 0007). Sem ela, dois worktrees disputam a
// 63315 do Vitest. `STORIES_PORTA` escolhe outra.
const porta = Number(process.env.STORIES_PORTA ?? portaDoCheckout('stories'))

export default mergeConfig(
  doStorybook,
  defineConfig({
    test: {
      name: 'stories',
      ...(workers ? { maxWorkers: workers } : {}),
      include: ['src/platform/storybook/*.navegador.test.tsx'],
      setupFiles: ['.storybook/vitest.setup.ts'],
      testTimeout: 30_000,
      browser: {
        enabled: true,
        headless: true,
        api: { port: porta, strictPort: true },
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
