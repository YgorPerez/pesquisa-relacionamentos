# O tamanho do PR vira rótulo

Quem abre a lista de PRs não vê o que é uma linha e o que é uma tarde de leitura, e um PR que cresceu demais só aparece quando alguém começa a revisá-lo. Do `pr-size.ts` do Festival dos Macacos, que o tirou do `pr-size.yml` do t3code.

## Decisão

- **O `pr-size.yml` põe um rótulo de `tamanho:PP` (0 a 9 linhas) a `tamanho:XG` (1000 ou mais)** a cada push num PR, e tira o velho.
- **Conta só o que alguém escreveu**: lockfile, árvore de rotas, selo, skill vendorizada e binário ficam fora. Num PR que muda código e teste, o teste não conta; num PR só de teste, conta.
- **Só rotula, nunca reprova.** Um PR grande às vezes é o certo, e quem decide é quem revisa.
