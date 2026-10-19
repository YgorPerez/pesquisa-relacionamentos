// O app inteiro no navegador, sobre o servidor SSR do build (`pnpm build`),
// como ele vai para produção. `pnpm e2e` constrói e sobe sozinho.
//
// A porta 4311 é a de produção local (`pnpm start`); o `vite dev` fica na
// 4310 e o Storybook na 6310, longe das do Festival e dos outros apps da
// máquina. `E2E_PORTA` troca a do e2e.
// Os arquivos terminam em `.e2e.ts`, e não `.spec.ts`, porque o Vitest pega
// `*.spec.ts` por padrão.

import { defineConfig, devices } from '@playwright/test'

const porta = Number(process.env.E2E_PORTA ?? 4311)

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${porta}`,
    // O Chrome instalado na máquina, sem baixar navegador. A imagem ubuntu do
    // GitHub Actions já traz o Google Chrome.
    channel: 'chrome',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Celular primeiro: o Pixel 7 tem 412px de largura e toque.
    { name: 'celular', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
  webServer: {
    command: `pnpm build && PORT=${porta} node .output/server/index.mjs`,
    url: `http://localhost:${porta}/`,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 180_000,
  },
})
