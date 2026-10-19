# Os tickets fecham por PR

Até o spec #23, um ticket fechava com um comentário e um `gh issue close`, e o código entrava por merge direto no ramo do spec. Nada mostrava, num lugar só, o diff, os checks e a conversa de cada ticket. Com o `pr.yml` e os outros checks (ADR 0016 a 0018), o PR é esse lugar, como no Festival dos Macacos.

## Decisão

- **Um ticket de código entra por um PR do ramo `ticket/<n>-<nome>` para o ramo do spec** (ou para a `main`, num ticket fora de spec), no modelo `.github/pull_request_template.md`, com `Closes #<n>`.
- **O PR entra verde**: todos os checks do último commit passaram e nenhum comentário ficou sem resposta. O merge é `gh pr merge <pr> --merge`, sem squash.
- **O GitHub só fecha a issue sozinho num PR para o ramo padrão.** Num PR para um `spec/*`, quem faz o merge fecha a issue: `gh issue close <n> --comment "Entrou em spec/<n> por #<pr>."`. O PR do spec para a `main` leva `Closes #<spec>`.
- **Ticket sem código** (`research`, `grilling`, `prototype` sem código para entrar) segue fechando por comentário.
- **O implementador abre o PR quando o orquestrador pede**; senão, dá push no ramo e o orquestrador abre (`docs/agents/orquestrar.md`).

## Consequências

- A linha em "Decisions so far" do mapa aponta para o PR, que guarda o diff e a conversa.
