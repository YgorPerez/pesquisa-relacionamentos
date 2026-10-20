// O manager do Storybook num Chrome: `pnpm test:storybook`. Hoje só a busca
// sem acento (`.storybook/manager.ts`), que mexe no campo da busca do próprio
// Storybook e só se prova com ele de pé. Fica fora do `playwright.config.ts`,
// que builda e sobe o site. No molde do `playwright.storybook.config.ts` do
// Festival dos Macacos (ADR 0037).
//
// A porta é a do Storybook no checkout (`scripts/portas.ts`, ADR 0010): com um
// `pnpm storybook` de pé no mesmo worktree, pare-o antes, ou escolha outra
// em `STORYBOOK_PORTA`.
import { defineConfig } from '@playwright/test'
import { portaPedida } from '../scripts/portas.ts'

const porta = portaPedida('storybook')

export default defineConfig({
  testDir: './.storybook',
  testMatch: '**/*.e2e.ts',
  // Longe do `test-results/` do e2e, que cada rodada dele apaga.
  outputDir: '.storybook/test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${porta}`,
    // O Chrome instalado, como o e2e.
    channel: 'chrome',
  },
  webServer: {
    command: `pnpm exec storybook dev --ci --exact-port --quiet --disable-telemetry -p ${porta}`,
    url: `http://localhost:${porta}/index.json`,
    reuseExistingServer: false,
    stderr: 'pipe',
    timeout: 180_000,
  },
})
