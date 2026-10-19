// O app inteiro no navegador, sobre o servidor SSR do build (`pnpm build`),
// como ele vai para produção. `pnpm e2e` constrói e sobe sozinho.
//
// A porta é a do e2e no checkout (`scripts/portas.ts`, ADR 0010): 4312 no
// principal, a do bloco num worktree, então dois worktrees rodam o e2e ao
// mesmo tempo sem combinar nada. `E2E_PORTA` escolhe outra.
// Os arquivos terminam em `.e2e.ts`, e não `.spec.ts`, porque o Vitest pega
// `*.spec.ts` por padrão.

import { availableParallelism } from 'node:os'
import { defineConfig, devices } from '@playwright/test'
import { entrarNaFila, pedidoDoPlaywright } from '../scripts/fila-da-maquina.ts'
import { portaDoCheckout } from '../scripts/portas.ts'

const porta = Number(process.env.E2E_PORTA ?? portaDoCheckout('e2e'))

// A rodada entra na fila da máquina antes de subir o servidor, e abre os
// Chrome que ela der (`scripts/fila-da-maquina.ts`, ADR 0013). Sozinha, a
// metade dos núcleos, o padrão do Playwright. Os workers leem esta config de
// novo e herdam `FILA_DA_MAQUINA`, então não entram outra vez.
const METADE = Math.max(1, Math.floor(availableParallelism() / 2))
const workers = await entrarNaFila(pedidoDoPlaywright(process.argv, METADE))

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  ...(workers ? { workers } : {}),
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
    // A suíte inteira também no desktop, onde a coluna vira folha sobre a
    // retícula. Um teste que só faz sentido num dos dois diz isso nele, com
    // `test.skip(!isMobile, …)` ou o contrário.
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  // O build do e2e lê o conteúdo de fixture (`e2e/acervo`), com uma Ficha de
  // cada Status, e não o acervo do repositório. Rode `pnpm build` de novo
  // antes de `pnpm start` com o conteúdo de verdade. O `VITE_CONTAR_EM_LOCALHOST`
  // liga a contagem em localhost, onde o `analytics.e2e.ts` intercepta os
  // envios ao GoatCounter.
  webServer: {
    command: `CONTEUDO_RAIZ=e2e/acervo VITE_CONTAR_EM_LOCALHOST=1 pnpm build && PORT=${porta} node .output/server/index.mjs`,
    url: `http://localhost:${porta}/`,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 180_000,
  },
})
