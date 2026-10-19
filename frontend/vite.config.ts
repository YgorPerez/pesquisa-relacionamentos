import babel from '@rolldown/plugin-babel'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, type PluginOption } from 'vite-plus'
import { workersDoVitest } from '../scripts/fila-da-maquina.ts'
import { acervo } from './vite/acervo.ts'
import { grupoPossivel } from './vite/grupo-possivel.ts'

// A rodada entra na fila da máquina antes de começar e leva os workers que
// ela der (`scripts/fila-da-maquina.ts`, ADR 0010).
const workers = await workersDoVitest()

// O Vitest só precisa do React: o Start e o nitro montam o servidor, que
// teste de unidade nenhum usa. O app inteiro é testado pelo Playwright,
// sobre o build (`playwright.config.ts`).
const plugins: PluginOption[] = process.env.VITEST
  ? [viteReact()]
  : [
      acervo(),
      grupoPossivel(),
      tanstackStart(),
      nitro(),
      viteReact(),
      // O React Compiler memoiza cada componente e hook no build. O plugin 6
      // do React não traz mais o Babel, e o compilador ainda é um plugin do
      // Babel: roda pelo `@rolldown/plugin-babel`, só no bundle do navegador
      // (o preset pula o SSR). Uma tela que o compilador quebrar sai dele com
      // `'use no memo'` no topo (ADR 0003).
      babel({ presets: [reactCompilerPreset()] }),
    ]

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins,
  test: {
    ...(workers ? { maxWorkers: workers } : {}),
    include: [
      'src/**/*.test.ts',
      'nginx/**/*.test.ts',
      'scripts/**/*.test.ts',
      'vite/**/*.test.ts',
      'lint/**/*.test.ts',
    ],
    environment: 'node',
    // A cobertura serve à `fallow health` (o formato `json`) e tem um piso
    // (ADR 0005): o de quando ele entrou, que sobe com ela e nunca desce. É
    // baixo porque as telas são testadas pelo e2e e pelas stories, que não
    // entram nesta conta.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['{src,vite,nginx,scripts,lint}/**/*.{ts,tsx}'],
      thresholds: { statements: 12, branches: 7, functions: 9, lines: 12 },
    },
  },
})
