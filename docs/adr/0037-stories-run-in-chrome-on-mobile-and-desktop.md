# As stories rodam num Chrome, no celular e no desktop

Como no Festival dos Macacos (ADR-0047 dele, `docs/adr/0047-every-screen-opens-in-storybook-on-recorded-api-answers.md`, "Every story is a test"), cada story é um teste.

## Decisão

- **`pnpm test:stories`** abre cada story num Chrome de verdade, pelo modo navegador do Vitest (`vitest.stories.config.ts`), uma instância a 412×915 e outra a 1280×800. A story falha se lança, se o `play` dela falha ou se escreve erro ou aviso no console. Usa as stories portáveis do Storybook (`composeStories`), e não o `@storybook/addon-vitest`, que não aceita o Vitest 5. Roda no job `stories` do `pr.yml`, depois do `build-storybook`.
- **`pnpm test:storybook`** abre o Storybook de pé num Chrome, pelo Playwright (`playwright.storybook.config.ts`), para o que só se prova no manager. Hoje é a busca sem acento: os títulos saem do caminho do arquivo, sem acento, e `.storybook/manager.ts` tira o acento do que se digita, para `possível` achar `ui/grupo-possivel` (`.storybook/busca.e2e.ts`, como no Festival).
- **As prévias de link das calculadoras têm story** (`src/platform/storybook/previas-do-link.stories.tsx`), no papel dos cartões do link do Festival. O Storybook não tem servidor, então a story faz no navegador a conta que o servidor faz para o robô da rede social: `montarPreviaDoGrupo` (`conteudo/previa-do-grupo.ts`, a mesma de `buscarPreviaDoGrupo`) e `previaDePrioridades` sobre a vista do acervo de fixture. A conta não roda num plugin do Vite no Node, como a do Festival, porque a vista do acervo traz o `xss`, que é CommonJS e não carrega pelo `runnerImport`.

## Consequências

- Uma peça que só quebra no celular ou só no desktop quebra uma das duas instâncias.
- O `test:storybook` sobe o Storybook na porta do worktree (`scripts/ports.ts`); com um `pnpm storybook` de pé no mesmo worktree, pare-o antes.
