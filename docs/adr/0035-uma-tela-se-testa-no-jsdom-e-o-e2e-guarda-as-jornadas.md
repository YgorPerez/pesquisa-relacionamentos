# Uma tela se testa no jsdom, e o e2e guarda as jornadas

O front tinha duas camadas de teste: as contas puras no Node e o Playwright sobre o build, no celular e no desktop. Tudo o que uma tela faz com um toque (a calculadora que muda o número, o Perfil que marca os achados) só se provava no e2e, que builda o site antes de começar. O Festival dos Macacos (ADR-0045 dele, `docs/adr/0045-a-screen-is-tested-in-jsdom-against-the-contract-and-e2e-keeps-the-journeys.md`) achou que a maior parte dos testes de e2e era isso: uma tela, dado o que chega a ela.

## Decisão

- **O comportamento de uma tela se testa no jsdom, com a Testing Library.** O arquivo é `*.test.tsx`, ao lado da peça de `src/ui/` da tela (`routes/` só tem rotas). O `vite.config.ts` do front divide o Vitest em dois projetos: `logica` (`*.test.ts`, no Node) e `telas` (`*.test.tsx`, no jsdom, com `src/platform/telas/telas.ts`). O teste usa o `user-event` e acha as coisas por papel e rótulo.
- **A rota abre no router de verdade** (`abrirTela(url)`, `src/platform/telas/abrir-tela.tsx`), com o `queryClient` dela: o loader, o `notFound` e o estado salvo no aparelho rodam como no navegador. A raiz desenha só o `<body>` (topo, página, rodapé); o `<head>` é do e2e.
- **As server functions rodam no próprio teste.** No jsdom não há servidor nem o plugin do Start, então o `@tanstack/react-start` vira `src/platform/telas/servidor-no-teste.ts`: o `handler` roda depois do `validator`, sobre o acervo e os dados de fixture do e2e (`e2e/acervo`), e a resposta passa por um `structuredClone`. Aqui não há uma API com contrato, como no Festival; o contrato é o tipo de cada server function, que o teste lê do módulo de verdade.
- **A rede é o MSW** (`src/platform/telas/rede.ts`). O único `fetch` das telas, o dos pacotes do Grupo possível, sai dos dados de fixture, montados pelo `montarPacotes` do build. `semRede()` derruba o pedido. Um pedido sem resposta escrita falha o teste.
- **Um erro ou aviso no console falha o teste**, como nas stories.
- **O e2e guarda o que precisa do site inteiro:** o HTML do servidor e a hidratação, o `<head>` e o Open Graph, o layout (o número preso no topo, 44 px de toque), o teclado de verdade e a área de transferência.

## Consequências

- O primeiro teste de tela achou um bug: sem rede, o Grupo possível pedia o pacote de novo a cada render, sem parar, e o aviso da falha piscava. Agora o que falhou só se pede de novo pelo "Tentar de novo".
- Um comportamento novo de tela ganha um `.test.tsx`; uma jornada entre páginas, ou o que depende de layout, ganha um teste de e2e.
- Os pacotes guardados em `estado/pacotes-do-grupo.ts` vivem até o fim do arquivo de teste. O teste que derruba a rede mora num arquivo só dele.
