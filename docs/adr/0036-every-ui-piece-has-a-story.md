# Toda peça de `src/ui/` tem story

No Festival dos Macacos, toda tela abre no Storybook, e o `lint/stories.ts` falha a rota que nenhuma story abre (ADR-0047 dele, `docs/adr/0047-every-screen-opens-in-storybook-on-recorded-api-answers.md`). Aqui as stories mostram peças, e não telas: as rotas leem o acervo por server functions, que o Storybook não tem. Metade das peças de `src/ui/` não aparecia em story nenhuma, os sete controles de `ui/shadcn/` inclusive, e nada dizia isso.

## Decisão

`frontend/lint/stories.ts`, no `pnpm check`, falha cada `.tsx` de `src/ui/` (com `ui/shadcn/`) que nenhuma `*.stories.tsx` importa. Lê os imports pelo parser do Vite, sem importar o app; o relativo, o `#/` e o `@/` contam, e o `import type` não. Um teste ou outra peça que importa a peça não conta: a story é onde a peça se vê, e onde o `pnpm test:stories` a abre (ADR 0037).

A story pode morar em outro arquivo (`controles.stories.tsx` mostra os de `ui/shadcn/`). As que precisam de conteúdo leem a fixture do e2e, que o Storybook carrega pelos mesmos plugins do build (`acervo()`, `grupoPossivel()`).

## Consequências

- Uma peça nova pede story no mesmo PR.
- Um arquivo `.tsx` de `src/ui/` que não é peça (não há hoje) também pediria story; mova-o para fora de `ui/`.
