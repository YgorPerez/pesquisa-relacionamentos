import { fileURLToPath } from 'node:url'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv, type PluginOption } from 'vite-plus'
import { vitestWorkers } from '../scripts/machine-queue.ts'
import { acervo } from './vite/acervo.ts'
import { lerAmbienteDoBuild } from './vite/ambiente.ts'
import { grupoPossivel } from './vite/grupo-possivel.ts'
import { manifestoSemPreload } from './vite/manifesto-sem-preload.ts'

// A rodada entra na fila da máquina antes de começar e leva os workers que
// ela der (`scripts/machine-queue.ts`, ADR 0013).
const workers = await vitestWorkers()

/** O conteúdo de fixture do e2e, que os testes de tela leem. */
const FIXTURE = fileURLToPath(new URL('e2e/acervo', import.meta.url))

// O Vitest só precisa do React: o Start e o nitro montam o servidor, que
// nenhum teste do Vitest usa. Os testes de tela montam o router no jsdom
// (ADR 0035), e o app inteiro, com o servidor, é testado pelo Playwright
// sobre o build (`playwright.config.ts`).
const doApp = (mode: string): PluginOption[] => {
  // As variáveis do build, validadas antes de qualquer plugin
  // (`vite/ambiente.ts`, ADR 0032). O `loadEnv` junta o `.env` deste pacote
  // ao ambiente do shell, que vale mais; o prefixo vazio traz também as sem
  // `VITE_`.
  const ambiente = lerAmbienteDoBuild(loadEnv(mode, import.meta.dirname, ''))
  return [
    // O bundle recebe o valor já validado, e não o texto cru do ambiente.
    {
      name: 'contar-em-localhost',
      config: () => ({
        define: {
          'import.meta.env.VITE_CONTAR_EM_LOCALHOST': JSON.stringify(
            ambiente.contarEmLocalhost ? '1' : '0',
          ),
        },
      }),
    },
    acervo({
      raiz: ambiente.raizDoConteudo,
      anterior: ambiente.sitemapAnterior,
    }),
    grupoPossivel({ raiz: ambiente.raizDoConteudo }),
    // As classes do Tailwind (`styles.css`, `ui/tokens.css`), antes do
    // Start, como no Festival.
    tailwindcss(),
    tanstackStart(),
    // Sem os `modulepreload` de cada chunk no `<head>` (ADR 0034).
    manifestoSemPreload(),
    nitro(),
    viteReact(),
    // O React Compiler memoiza cada componente e hook no build. O plugin 6
    // do React não traz mais o Babel, e o compilador ainda é um plugin do
    // Babel: roda pelo `@rolldown/plugin-babel`, só no bundle do navegador
    // (o preset pula o SSR). Uma tela que o compilador quebrar sai dele com
    // `'use no memo'` no topo (ADR 0003).
    babel({ presets: [reactCompilerPreset()] }),
  ]
}

export default defineConfig(({ mode }) => ({
  resolve: { tsconfigPaths: true },
  plugins: process.env.VITEST ? [viteReact()] : doApp(mode),
  test: {
    ...(workers ? { maxWorkers: workers } : {}),
    projects: [
      {
        extends: true,
        test: {
          name: 'logica',
          include: [
            'src/**/*.test.ts',
            'nginx/**/*.test.ts',
            'scripts/**/*.test.ts',
            'vite/**/*.test.ts',
            'lint/**/*.test.ts',
          ],
          environment: 'node',
        },
      },
      {
        // As telas no jsdom, com a Testing Library (ADR 0035): o router de
        // verdade, sobre o acervo e os dados de fixture do e2e
        // (`e2e/acervo`). As server functions rodam no próprio teste
        // (`src/platform/telas/servidor-no-teste.ts`), e os pacotes do Grupo
        // possível chegam pelo MSW (`src/platform/telas/rede.ts`).
        extends: true,
        plugins: [
          acervo({ raiz: FIXTURE, anterior: undefined }),
          grupoPossivel({ raiz: FIXTURE }),
        ],
        resolve: {
          alias: [
            {
              find: /^@tanstack\/react-start$/,
              replacement: fileURLToPath(
                new URL(
                  'src/platform/telas/servidor-no-teste.ts',
                  import.meta.url,
                ),
              ),
            },
          ],
        },
        test: {
          name: 'telas',
          include: ['src/**/*.test.tsx'],
          // As stories rodam num Chrome (`vitest.stories.config.ts`).
          exclude: ['src/**/*.navegador.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/platform/telas/telas.ts'],
          // Em localhost, a contagem não sai (`analytics/contagem.ts`).
          environmentOptions: { jsdom: { url: 'http://localhost/' } },
          // A primeira tela de um arquivo compila as rotas dentro do teste.
          testTimeout: 30_000,
        },
      },
    ],
    // A cobertura serve à `fallow health` (o formato `json`) e tem um piso
    // (ADR 0005): o valor medido, arredondado para baixo, que sobe com ela e
    // nunca desce. Conta a lógica e os testes de tela (`telas`); o e2e e as
    // stories ficam de fora.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['{src,vite,nginx,scripts,lint}/**/*.{ts,tsx}'],
      thresholds: { statements: 61, branches: 65, functions: 63, lines: 62 },
    },
  },
}))
