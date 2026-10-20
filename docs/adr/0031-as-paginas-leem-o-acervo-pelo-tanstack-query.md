# As páginas leem o acervo pelo TanStack Query, com SSR

Como no Festival dos Macacos (`frontend/src/router.tsx`, `platform/leituras.ts`), cada server function que uma página lê tem uma leitura em `src/conteudo/leituras.ts`. O loader a pede com `context.queryClient.query(...)` e a tela a lê com `useSuspenseQuery(...)`. O `router.tsx` cria um `QueryClient` por router (o servidor cria um por pedido, então o que um visitante leu não vaza para outro) e liga o `setupRouterSsrQueryIntegration` do `@tanstack/react-router-ssr-query`. Com isso, o que o servidor leu vai junto do HTML, e a hidratação não pede nada de novo.

Diferente do Festival, toda leitura é `staleTime: 'static'`. O acervo entra no build (`vite/acervo.ts`) e só muda no próximo deploy. Antes, voltar a uma página já vista pedia os dados de novo, porque o router dá o loader por velho logo depois de rodar; agora sai do cache.

## Consequências

- O loader devolve só o que o `head` e o topo leem (`busca`, `tema`, `temaTitulo`, a prévia do link). A vista inteira vai pelo `queryClient`; devolvida também pelo loader, iria duas vezes no HTML.
- Leitura nova: uma entrada em `leituras`, o loader pede, a tela lê. `e2e/reads.e2e.ts` falha se uma página pedir server function ao hidratar.
- Estado de fora do React continua por `useSyncExternalStore` (`estado/`), não por query: o React Compiler quebra a leitura direta (ADR 0003).
