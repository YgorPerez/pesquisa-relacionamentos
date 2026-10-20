# Cada pasta do app tem um papel, e um script confere

Um agente que não acha onde pôr um arquivo cria `lib/`, `components/` ou `utils/`, ou deixa um componente ao lado da rota. Em poucos tickets a árvore deixa de dizer onde cada coisa está. No Festival dos Macacos isso virou o [ADR-0049](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0049-code-is-grouped-by-glossary-term-and-what-is-not-a-term-lives-in-platform.md) e o `frontend/lint/folders.ts`. Aqui o código não se agrupa por termo do glossário como lá: cada pasta de `frontend/src/` tem um papel, descrito em "Onde um arquivo mora" do `AGENTS.md`.

## Decisão

- **`frontend/lint/folders.ts` lista o que está fora do lugar e sai com erro.** Roda no `pnpm check`, logo depois do `vp check`, e portanto no CI. Nenhum linter olha a árvore.
- **As regras de hoje:** `routes/` tem só arquivos de rota (`.tsx`, sem o prefixo `-` e sem teste); `frontend/src/` tem só as pastas `analytics/`, `conteudo/`, `estado/`, `fontes/`, `platform/`, `routes/` e `ui/`, e os arquivos que o Start procura na raiz; o teste mora ao lado do que testa, nunca numa pasta `__tests__/` ou `testes/`; `packages/*/src/` é plano, porque o pacote é importado por subcaminho.
- **Uma pasta nova pede uma linha no script e uma no `AGENTS.md`**, na mesma mudança. O motivo de cada regra sai na mensagem de erro, para quem a encontra saber para onde o arquivo vai.

## Consequências

- O teste do script (`pastas.test.ts`) também roda o repositório de verdade: um arquivo fora do lugar falha o `pnpm test`, e não só o `pnpm check`.
