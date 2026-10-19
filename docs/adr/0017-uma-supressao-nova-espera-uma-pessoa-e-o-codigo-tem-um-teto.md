# Uma supressão nova espera uma pessoa, e o código tem um teto

Um `oxlint-disable` é o caminho mais curto para passar de um lint vermelho, e vários agentes dão push aqui todo dia. O código tem hoje zero supressões (fora o `routeTree.gen.ts`, gerado). Do [ADR-0036 do Festival dos Macacos](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0036-a-new-suppression-waits-for-a-person.md), com um teto que o Festival recusou.

## Decisão

- **`.github/scripts/supressoes.ts` conta e lê.** As diretivas são `oxlint-disable`, `eslint-disable` (que o Oxlint também obedece), `react-doctor-disable`, `@ts-expect-error`, `@ts-ignore`, `@ts-nocheck`, `@effect-diagnostics`, `fallow-ignore`, os `ignore` de cobertura e o `'use no memo'`. Só vale a que abre um comentário; a citada no meio de uma frase não conta.
- **O teto.** `.github/teto-de-supressoes.json` diz quantas de cada a árvore pode ter. Passou, falha, com ou sem rótulo. Quem tira uma baixa o número; subir é mudar a configuração de um auditor.
- **Sem motivo falha sempre.** O motivo vai depois do `--` no Oxlint, no React Doctor e na fallow, depois da diretiva no TypeScript, e num comentário na mesma linha do `'use no memo'`.
- **Com motivo, ou com a configuração de um auditor mudada, o PR espera uma pessoa** pôr o rótulo `supressao-revisada`. Configuração é o `vite.config.ts` de cada pacote, o `vitest.*config.ts`, o `doctor.config.ts`, o `.fallowrc.jsonc`, cada `tsconfig*.json`, as regras de `frontend/lint/`, o teto, e as linhas dos scripts de auditoria nos `package.json`. Agente nenhum põe o rótulo.
- **Roda no `supressoes.yml`**, a cada PR e a cada rótulo, e **no hook de push** (ADR 0020), onde o teto e o motivo barram e o resto só avisa.

## Opções consideradas

**Só o diff, como o Festival.** O Festival recusou o teto porque trocar uma supressão lida por outra não lida mantém a contagem. Aqui o diff continua lido: a troca aparece como supressão nova e pede o rótulo. O teto acrescenta o que o diff não vê, a soma que só sobe.

**A aprovação num terminal (`--aprovar`), como no hook do Festival.** Lá, a maior parte das mudanças vai direto para a `main`, sem PR. Aqui tudo passa por PR, e o rótulo basta.

## Consequências

- Mover código que carrega uma supressão conta como acrescentá-la.
- Um PR que mexe no `vite.config.ts` fica vermelho no `Supressões` até alguém ler.
