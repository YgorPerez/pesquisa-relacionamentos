# Passar por toda superfície

O defeito que mais volta é a mudança que funciona no caminho que você testou e falta em todo o resto. Antes de dar por pronto um trabalho no front, passe por esta lista e diga no relatório quais itens valeram e o que você conferiu em cada um. "Não vale aqui" é resposta, desde que dita. Os caminhos são de `frontend/src/`.

- **Celular e desktop.** O site é feito para o celular (412 px, toque), e no desktop a coluna vira uma folha sobre a retícula. O e2e roda inteiro nos dois projetos (`playwright.config.ts`); uma tela nova pede o teste nos dois, ou o `test.skip` dizendo por quê.
- **Com e sem Perfil.** O Guia e as calculadoras mudam quando o Perfil está dito (`estado/perfil.ts`, `estado/perfil-no-guia.ts`): o achado que não cobre o Perfil, o selo "vale para você", o número de exemplo do cartão do Grupo possível. Confira a tela sem Perfil, com Perfil, e com um Perfil que nenhuma Ficha cobre (`outro`, por exemplo).
- **Sem JavaScript e antes da hidratação.** As páginas saem do SSR. O `useArmazenado` dá `null` no servidor e na hidratação, e a âncora `#ficha-<slug>` funciona sem JS. Uma peça que lê o navegador mostra algo certo antes de ler.
- **O link compartilhado.** O estado das calculadoras viaja inteiro na query (ADR 0001, `@tem-estudo/rules/link`). Um campo novo nos Requisitos ou nas Prioridades entra no link, numa versão que o leitor das antigas ainda abre, e na prévia (`conteudo/previa.ts`).
- **O que fica no aparelho.** O `localStorage` passa só pelo `armazenado()` (`estado/armazenado.ts`), que valida o que lê e ouve as outras abas. Um valor velho, de antes da mudança, tem de abrir sem quebrar.
- **A contagem.** Um evento novo respeita o opt-out (GPC, DNT, a chave de `/privacidade`) e não leva query nem nada do Perfil (`analytics/contagem.ts`).
- **O acervo real e a fixture.** O e2e builda com `e2e/acervo`, e o site, com o acervo do repositório, onde quase toda Ficha ainda é ⬜. Confira as duas: a página com dado e a que aparece quando falta Ficha publicada.
- **Busca.** Uma rota nova entra no sitemap, ou fica fora de propósito. Um caminho que muda leva `antes`, ou o build falha contra o sitemap no ar (`packages/content/src/search-rules.ts`).
- **O caminho de volta.** Se você acrescentou um jeito de entrar, acrescente o de sair e o de ver: o Perfil se apaga, a Prioridade sai do topo 3, a contagem se religa. Uma porta que só abre é um defeito.
- **Docs.** `DESIGN.md`, `PRODUCT.md`, `GLOSSARY.md` e `docs/adr/` descrevem o site. Confira se a mudança deixou algum deles errado.
