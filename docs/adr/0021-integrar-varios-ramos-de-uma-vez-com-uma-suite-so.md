# Integrar vários ramos de uma vez, com uma suíte só

Um ticket entra pelo merge do PR dele. Quando o orquestrador junta vários tickets num spec, um merge por vez roda o CI de cada um sobre um destino que já mudou, e o conflito entre dois só aparece no último. Do `merge-branches.ts` e do `before-merge.ts` do Festival dos Macacos.

## Decisão

- **`node scripts/merge-branches.ts [--target <ramo>] <ramo...>`**, de uma worktree limpa só para isso, faz merge de cada ramo sobre o `origin/<destino>` buscado (sem squash), roda a auditoria, o `before-merge.ts` e a suíte do diff, e dá push sem force pelo hook. O destino padrão é a `main`.
- **Uma integração por repositório de cada vez**: a vez é um arquivo com o PID em `<git-common-dir>/merge-branches.lock`; a de um dono morto é tomada sem matar nada.
- **Num conflito, ou num vermelho, para sem publicar.** Se o destino andou durante a suíte, para e pede outra rodada.
- **`--dry-run`** faz merge de cada ramo numa worktree temporária e diz ok ou os arquivos em conflito, sem suíte e sem push.
- **`node scripts/before-merge.ts [--base <ref>]`** confere em segundos o que o `pnpm check` só barra no fim: a `fallow dead-code`, o React Doctor, e se alguma penalidade da `fallow health` subiu desde a base. O front está com 90 e o piso é 90.

## Opções consideradas

**Fazer merge da ponta sobre o destino novo e rodar de novo, até três vezes, como o Festival.** Lá várias integrações por hora disputavam a `main`. Aqui elas são poucas, e parar é mais simples.

## Consequências

- Cada teste que só passou na repetição vira um comentário na issue "Testes intermitentes".
