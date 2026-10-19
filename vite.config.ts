// O Vite+ da raiz: o formato (Oxfmt) e o lint (Oxlint) do repositório
// inteiro moram aqui, e o `vp check` os lê daqui mesmo rodando de um pacote
// (ADR 0002). O Vite, o Vitest e o Storybook de cada pacote seguem no
// `vite.config.ts` dele. Nenhuma regra é desligada para o check passar: o que
// não vale para uma pasta sai por `overrides`, com o motivo.
import { recommended as effectRecomendado } from '@effect/tsgo/oxlint-presets'
import { defineConfig } from 'vite-plus'
import { workersDoVitest } from './scripts/fila-da-maquina.ts'

// A rodada entra na fila da máquina antes de começar e leva os workers que
// ela der (`scripts/fila-da-maquina.ts`, ADR 0013).
const workers = await workersDoVitest()

/** O que não é código nosso, ou é texto que o build lê byte a byte. */
const FORA = [
  // Gerado pelo TanStack Router a cada build.
  'frontend/src/routeTree.gen.ts',
  // Gerado pelo `cn build` (`pnpm cn:tabelas`) a partir do `@theme`.
  'frontend/src/platform/cn-tabelas.js',
  'frontend/.output/**',
  'frontend/.nitro/**',
  'frontend/.tanstack/**',
  'frontend/.vitest/**',
  'frontend/storybook-static/**',
  'frontend/test-results/**',
  'frontend/playwright-report/**',
  '**/coverage/**',
  // O acervo: o Conteúdo confere o Trecho contra a Fonte, e uma tabela
  // realinhada ou uma linha quebrada muda o que ele lê. As fixtures dos
  // testes do Conteúdo e da conferência são o mesmo formato.
  'estudos/**',
  'dicas/**',
  'relatorios/**',
  'fontes/**',
  'dados/**',
  'packages/conteudo/fixtures/**',
  'packages/regras/fixtures/**',
  'scripts/fixtures/**',
  'frontend/e2e/acervo/**',
  // Vendorizado: as skills de terceiros e o que o `impeccable` gera.
  '.claude/skills/unslop/**',
  '.claude/skills/grilling/**',
  '.agents/**',
  'skills-lock.json',
  '.impeccable/**',
  '.claude/worktrees/**',
  // O código do Effect que os agentes leem (ADR 0012).
  '.repos/**',
]

export default defineConfig({
  // Os testes dos scripts da raiz (`pnpm conferir`, o pipeline dos dados, o
  // gancho do Claude Code, a suíte do PR) e os do CI (`.github/scripts/`).
  // Cada pacote tem o `test` dele.
  test: {
    ...(workers ? { maxWorkers: workers } : {}),
    include: ['scripts/**/*.test.ts', '.github/scripts/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['scripts/**/*.ts', '.github/scripts/**/*.ts'],
      exclude: ['scripts/fixtures/**'],
      // O piso é a cobertura de quando ele entrou (ADR 0005): sobe com ela,
      // nunca desce.
      thresholds: { statements: 60, branches: 49, functions: 60, lines: 60 },
    },
  },
  fmt: {
    // O estilo do Festival (o `biome.json` dele): aspas simples, sem
    // ponto e vírgula, 80 colunas.
    printWidth: 80,
    singleQuote: true,
    semi: false,
    trailingComma: 'all',
    arrowParens: 'always',
    // A prosa fica como foi escrita: uma linha por frase ou por parágrafo.
    proseWrap: 'preserve',
    ignorePatterns: FORA,
  },
  lint: {
    ignorePatterns: FORA,
    plugins: [
      'eslint',
      'typescript',
      'unicorn',
      'oxc',
      'react',
      'import',
      'vitest',
    ],
    categories: { correctness: 'error' },
    options: {
      typeAware: true,
      typeCheck: true,
      denyWarnings: true,
      // Uma supressão que não suprime mais nada falha o lint, como o
      // `reportUnusedDisableDirectives` do ESLint do Festival (ADR 0036 dele).
      reportUnusedDisableDirectives: 'deny',
    },
    jsPlugins: [
      // `vite-plus/prefer-vite-plus-imports`: o Vitest e o Vite vêm do Vite+.
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      './frontend/lint/estado.ts',
      // As peças do DESIGN.md e os donos delas, a cor que não é token, o
      // `title` que não abre no toque e o import relativo com `.js` (#54).
      // `frontend/lint/chave-das-regras.test.ts` confere que cada plugin
      // daqui tem as regras ligadas.
      './frontend/lint/coesao.ts',
      './frontend/lint/cor-do-tema.ts',
      './frontend/lint/sem-title-nativo.ts',
      './frontend/lint/sem-import-js.ts',
      // O design system: as classes do Tailwind contra o tema de
      // `frontend/src/ui/tokens.css` e os componentes de `src/ui/shadcn/`,
      // achados pelo `frontend/components.json` (ADR 0028).
      '@shadcn/lint',
    ],
    settings: {
      shadcn: {
        note: 'Os tokens e as peças estão no DESIGN.md; o tema é frontend/src/ui/tokens.css.',
      },
    },
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      // As regras de hooks e as 22 do React Compiler (ADR 0003). A categoria
      // `correctness` já liga 12 delas; estas são as outras dez.
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'error',
      'react/capitalized-calls': 'error',
      'react/exhaustive-effect-dependencies': 'error',
      'react/hooks': 'error',
      'react/memo-dependencies': 'error',
      'react/no-deriving-state-in-effects': 'error',
      'react/unsupported-syntax': 'error',
      'react/invariant': 'error',
      'react/rule-suppression': 'error',
      'react/syntax': 'error',
      'react/todo': 'error',
      // O `.js` num import relativo não resolve pelo `node` que roda os
      // scripts do repo, em lugar nenhum.
      'modulos/sem-import-js': 'error',
    },
    overrides: [
      {
        // O app: o localStorage só pelo `armazenado()`, que é o dono dele.
        files: ['frontend/src/**'],
        excludeFiles: ['frontend/src/estado/armazenado.ts'],
        rules: { 'estado/localstorage-pelo-armazenado': 'error' },
      },
      {
        // As classes do app contra o design system, como no `eslint.config.js`
        // do Festival. `ui/shadcn/` é onde o design system se desenha: lá a
        // classe é a definição da variante, e não um retoque dela.
        files: ['frontend/src/**'],
        excludeFiles: ['frontend/src/ui/shadcn/**'],
        rules: {
          'shadcn/no-unknown-classes': 'error',
          'shadcn/no-raw-colors': 'error',
          'shadcn/require-static-classes': 'error',
          'shadcn/no-arbitrary-values': [
            'error',
            {
              // `layout`: largura, altura, posição e margem medidas para uma
              // tela não são token. `transition`: quais propriedades se movem
              // é escolha do componente.
              allow: ['layout', 'transition'],
            },
          ],
          'shadcn/no-restyle': [
            'error',
            // O lugar é de quem usa: margem, largura, altura, posição.
            { allow: ['layout'] },
          ],
        },
      },
      {
        // O app: o `title` do HTML não abre no toque, e um pacote de ícones
        // prontos não entra (os do site são desenhados à mão).
        files: ['frontend/src/**'],
        rules: {
          'html/sem-title-nativo': 'error',
          'coesao/icone-a-mao': 'error',
        },
      },
      {
        // O `<h1>` é o `Display`, dono dele.
        files: ['frontend/src/**'],
        excludeFiles: ['frontend/src/ui/pagina.tsx'],
        rules: { 'coesao/h1-do-dono': 'error' },
      },
      {
        // A retícula é das peças de `src/ui/` (o `Painel`, o `Botao`).
        files: ['frontend/src/**'],
        excludeFiles: ['frontend/src/ui/**'],
        rules: { 'coesao/reticula-do-dono': 'error' },
      },
      {
        // A cor escrita à mão. `ui/marca.ts` é a dona das cores fora do CSS;
        // o teste, a story e a moldura do Storybook não são tela.
        files: ['frontend/src/**'],
        excludeFiles: [
          'frontend/src/ui/marca.ts',
          'frontend/src/**/*.test.{ts,tsx}',
          'frontend/src/**/*.stories.tsx',
          'frontend/src/**/storybook/**',
          'frontend/src/platform/cn-tabelas.js',
        ],
        rules: { 'tema/cor-crua': 'error' },
      },
      {
        // Os diagnósticos do Effect, pelo patch do `@effect/tsgo` (ADR 0004).
        // Só o Conteúdo usa o Effect.
        // O `typeAware` do preset já está ligado acima.
        files: ['packages/conteudo/**'],
        plugins: effectRecomendado.plugins,
        rules: effectRecomendado.rules,
      },
    ],
  },
})
