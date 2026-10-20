# Vite+ no lugar de Biome, Prettier e ESLint

O Festival dos Macacos formata com Biome e Prettier e roda um ESLint pequeno para as regras de hooks e o `@shadcn/lint`. Aqui o formato, o lint, os tipos e as tarefas passam pelo Vite+ (`vite-plus`, comando `vp`): `vp fmt` é o Oxfmt, `vp lint` é o Oxlint com checagem de tipos pelo `oxlint-tsgolint`, `vp check` junta os três, `vp test` é o Vitest e `vp run` roda os scripts do monorepo com cache. O usuário decidiu em 19/10/2026, com o ESLint só de reserva para um plugin que não rode no Oxlint.

A troca se afasta do Festival por três motivos. Um binário faz o que lá são três ferramentas com três configurações e três extensões de editor. O Oxlint já traz as 22 regras do React Compiler e as de hooks, que no Festival exigem o ESLint com o parser do Babel. E o `vp check` dá os erros de tipo no mesmo passo do lint, sem um `tsc` separado.

## Consequências

- A configuração do formato e do lint mora no `vite.config.ts` da raiz, nos blocos `fmt` e `lint`. O Vite+ ignora blocos nos pacotes, e o que vale só para uma pasta entra em `lint.overrides`.
- O estilo é o do Biome do Festival: aspas simples, sem ponto e vírgula, 80 colunas. O acervo (`estudos/`, `dicas/`, `relatorios/`, `fontes/`, `dados/`) e as fixtures ficam fora do formato, porque o Conteúdo compara o Trecho com a Fonte byte a byte.
- O `vite` do workspace é o núcleo do Vite+ (`@voidzero-dev/vite-plus-core`), e o Vitest é o que ele traz. Os dois sobem junto com o `vite-plus`, pelo catálogo do `pnpm-workspace.yaml`. Os testes importam de `vite-plus/test`, e a regra `vite-plus/prefer-vite-plus-imports` recusa `vitest` direto.
- O Prettier e o ESLint ainda aparecem em `node_modules`, trazidos pelo gerador de rotas do TanStack, pelo Storybook e pelo React Doctor. Nenhum arquivo do repositório os configura ou chama.
- Uma supressão que não suprime mais nada falha o lint (`reportUnusedDisableDirectives: 'deny'`), e um aviso também (`denyWarnings`).
