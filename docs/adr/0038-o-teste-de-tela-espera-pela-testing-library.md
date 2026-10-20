# O teste de tela espera pela Testing Library

O `vi.waitFor` do Vitest desiste em 1 s. Num teste de tela, a primeira tela de um arquivo compila as rotas dentro do teste, e com a máquina cheia isso passa de 1 s: o teste cai com "Timed out in waitFor!" sem nada errado na tela. O Festival dos Macacos viu isso acontecer e escreveu uma regra em GritQL (`lint/sem-vi-waitfor-nas-telas.grit`).

## Decisão

O `waitFor` e o `findBy*` da Testing Library desistem em 10 s (`src/platform/telas/telas.ts`, ADR 0035). A regra `telas/sem-vi-waitfor-nas-telas` (`frontend/lint/sem-vi-waitfor-nas-telas.ts`, um `jsPlugin` do Oxlint como os da ADR 0006) falha o `vi.waitFor` nos `*.test.tsx`. Os `*.test.ts` de lógica continuam livres.

## Consequências

- Uma espera que acha o que procura não demora mais por isso; só o teste que já ia falhar espera os 10 s.
