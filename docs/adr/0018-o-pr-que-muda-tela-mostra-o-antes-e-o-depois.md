# O PR que muda tela mostra o antes e o depois

Nenhum check compara telas. Quem revisa só vê uma tela que mudou se o PR a mostrar, e um print não mostra a entrada de uma animação nem o que um toque abre. Do `screen-evidence.ts` do Festival dos Macacos.

## Decisão

- **Um PR que muda um arquivo de tela traz, na seção `## Screen`, pelo menos dois prints e dois vídeos diferentes**, antes e depois. Arquivo de tela é o que mora em `frontend/src/` ou `frontend/public/`, menos testes, stories, tipos, `platform/`, `analytics/`, `server.ts` e a árvore de rotas gerada.
- **`- [x] No screen change` passa**, para o refactor que deixa toda tela igual. O PR diz por quê.
- **O `screen-evidence.yml` confere** a cada push e a cada edição da descrição. Conta pelo `body_html` da API: só o HTML diz se um anexo é imagem ou vídeo.
- **`frontend/scripts/capturar.ts` tira os dois**, no celular e no desktop, e a skill `testar-app` diz como subir o antes e o depois.
- **Roda também no rascunho**, ao contrário do Festival: leva segundos, e o rascunho já mostra o que vai faltar.

## Consequências

- Uma mudança só no acervo (`estudos/`, `dicas/`) não pede prints: a Ficha tem a revisão dela (skill `acervo`).
- Os anexos ficam no PR, nunca no git (`AGENTS.md`, "Documentação").
