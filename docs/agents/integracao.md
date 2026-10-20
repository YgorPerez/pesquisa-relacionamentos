# Push, PR e merge

O que confere uma mudança, o que você roda antes de um push, e como um ticket entra. O `AGENTS.md` guarda as regras e aponta para cá. Como o site vai ao ar está em `docs/deploy.md`.

## Quais workflows rodam

Leia o estado antes de confiar num check, porque esta lista envelhece e o comando não:

```bash
GH_TOKEN=$(gh auth token --user YgorPerez) gh workflow list --all
GH_TOKEN=$(gh auth token --user YgorPerez) gh run list --workflow "<nome>" --limit 5
```

O repositório é público, e o Actions roda de graça. Um workflow de `pull_request` roda a versão dele que está no ramo do PR; os de `push` e de agendamento, a da `main`.

| Workflow                                      | Quando roda                                            | O que faz                                                                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PR` (`pr.yml`)                               | todo PR                                                | A suíte inteira em três jobs: `check` (`pnpm typecheck`, `pnpm check`), `stories` (Storybook, `pnpm test:stories` e `pnpm test:storybook`) e `e2e` (build e `pnpm e2e`). |
| `Supressões` (`supressoes.yml`)               | todo PR, e quando um rótulo entra ou sai               | O teto de supressões e as supressões novas ([ADR 0017](../adr/0017-uma-supressao-nova-espera-uma-pessoa-e-o-codigo-tem-um-teto.md)).                                     |
| `Evidência de tela` (`evidencia-de-tela.yml`) | todo PR, rascunho inclusive, e quando a descrição muda | Os prints e vídeos de antes e depois ([`evidencia-de-tela.md`](evidencia-de-tela.md)).                                                                                   |
| `Tamanho do PR` (`tamanho-do-pr.yml`)         | todo PR                                                | O rótulo `tamanho:PP` a `tamanho:XG`. Nunca reprova.                                                                                                                     |
| `Suíte noturna` (`suite-noturna.yml`)         | 04:00 de Brasília, na `main`                           | Os jobs do `pr.yml`; a noite vermelha abre a issue "Suíte noturna vermelha".                                                                                             |
| `Badges` (`badges.yml`)                       | push na `main` que muda o código                       | Mede e grava os selos de `docs/badges/`.                                                                                                                                 |
| `Deploy` (`deploy.yml`)                       | push na `main` que muda o site                         | Os testes, o build e a troca do contêiner na VPS. Sem os secrets `VPS_*`, pula com um aviso.                                                                             |

## Os ramos

- O trabalho de um spec mora em `spec/<n>-<nome>`, que nasce da `main`.
- Cada ticket do spec tem o ramo `ticket/<n>-<nome>`, que nasce da ponta de `origin/spec/<n>-<nome>` e volta para ela por um PR.
- A `main` recebe o spec inteiro, também por PR, e um push nela pode publicar o site (`AGENTS.md`, "Quatro jeitos de se machucar", item 1).

## Antes de cada push

1. `git fetch origin && git merge origin/<ramo de destino>`: o seu ramo com o que já entrou. Resolva o conflito aqui.
2. A menor prova do que você mudou: `node scripts/prova-minima.ts --base origin/<ramo de destino>` ([ADR 0016](../adr/0016-o-ci-do-pr-roda-a-suite-inteira-e-o-agente-a-menor-prova.md)). Ela roda os tipos dos pacotes afetados, o Vitest com `--changed`, as pastas e o `vp check` nos arquivos mudados. Mexeu numa spec do e2e, rode-a: `pnpm e2e <spec>`.
3. `git push -u origin <ramo>`. O hook de push confere de novo (abaixo).

A suíte inteira roda no CI do PR. Na máquina, `node scripts/suite-do-pr.ts --base origin/<ramo de destino>` roda os mesmos passos em quatro filas, só no que o diff afeta (`--completa` para tudo, `--plano` para só ver o que rodaria). Ela leva minutos: rode em segundo plano (`docs/agents/ambiente.md`, "Esperar").

## O hook de push

O `.githooks/pre-push` roda `node scripts/verificar-push.ts` para cada ref que o push atualiza ([ADR 0020](../adr/0020-o-pre-push-roda-a-auditoria-e-so-os-testes-afetados.md)). O `preparar-worktree.ts` o liga (`node scripts/instalar-hooks.ts`, que põe `core.hooksPath = .githooks` no repositório). Para cada ref:

- Apagar um ramo passa. Apagar a `main`, não.
- A auditoria das supressões contra o destino, que é o ramo do remoto de que o commit está mais perto (a `main` ou um `spec/*`).
- O Vitest só das pastas que o push afeta, com `--changed`: no primeiro push do ramo, desde o merge-base com o destino; nos seguintes, desde o que o remoto já tinha.
- Na `main`, só para a frente.

Para mandar sem os testes, diga o motivo: `SEM_TESTES="<motivo>" git push ...`. A auditoria continua, e o motivo vai para `<git-common-dir>/push-sem-testes.log`. Use só quando o usuário pedir esse push. `git push --no-verify` pula o hook inteiro; não o use para passar por cima de uma recusa.

## Uma supressão nova

Um `oxlint-disable`, `@ts-expect-error` ou `'use no memo'` novo leva o motivo no mesmo comentário (depois do `--` no Oxlint), e uma pessoa o lê antes de entrar. O código tem um teto de supressões em `.github/teto-de-supressoes.json`, hoje zero de cada:

- Passar do teto falha o `Supressões`, com ou sem rótulo. Tire a supressão; subir o teto é decisão de uma pessoa.
- Uma supressão com motivo, ou uma mudança na configuração de um auditor (um `vite.config.ts`, o `doctor.config.ts`, o `.fallowrc.jsonc`, um `tsconfig*.json`, uma regra de `frontend/lint/`, o teto), deixa o `Supressões` vermelho até uma pessoa pôr o rótulo `supressao-revisada`. Um agente nunca põe esse rótulo.
- Quem tira uma supressão baixa o número no teto, no mesmo PR.

Diga no PR cada supressão que você acrescentou e por quê. Uma supressão que não suprime mais nada já falha o lint (`reportUnusedDisableDirectives`). Na mão: `node .github/scripts/supressoes.ts --base origin/<destino>`.

## O pull request

O ticket entra por um PR do ramo dele para o ramo do spec ([ADR 0025](../adr/0025-os-tickets-fecham-por-pr.md)), no modelo de `.github/pull_request_template.md`, com `Closes #<ticket>`. As regras de título e corpo estão no `AGENTS.md`, "Pull requests".

```bash
GH_TOKEN=$(gh auth token --user YgorPerez) gh pr create --base spec/<n>-<nome> --head ticket/<n>-<nome> --title "Ticket #<n>: <o que mudou>" --body-file corpo.md
```

Depois de cada push, acompanhe o PR até ele ficar verde no último commit: `gh pr checks <pr>`, e `gh run view <id> --log-failed` no job vermelho. Leia cada comentário que chegou depois do push.

## O merge

- O PR verde entra com `gh pr merge <pr> --merge`, sem squash: os commits do ticket ficam.
- O GitHub só fecha a issue do `Closes` num PR para a `main`. Num PR para um `spec/*`, quem faz o merge fecha a issue: `gh issue close <n> --comment "Entrou em spec/<n> por #<pr>."`.
- Antes de um merge que mexe no front, `node scripts/antes-de-integrar.ts --base origin/<destino>` confere em segundos a `fallow dead-code`, o React Doctor e se a `fallow health` piorou. O front está com 90, e o piso do `pnpm check` é 90.
- Para juntar vários ramos de uma vez com uma suíte só, de uma worktree limpa só para isso ([ADR 0021](../adr/0021-integrar-varios-ramos-de-uma-vez-com-uma-suite-so.md)):

  ```bash
  node scripts/integrar-main.ts --ensaio --destino spec/<n>-<nome> ticket/a ticket/b   # só os conflitos
  node scripts/integrar-main.ts --destino spec/<n>-<nome> ticket/a ticket/b
  ```

  Ele faz merge de cada ramo sobre o destino buscado, roda a auditoria, o `antes-de-integrar.ts` e a suíte do diff, e dá push sem force. Num conflito ou num vermelho, para sem publicar; a worktree volta para onde estava. Uma integração por repositório de cada vez. Os PRs dos ramos integrados fecham sozinhos como `merged`; feche as issues como acima.

- Um teste que passou só na repetição (`scripts/intermitentes.ts`) vira um comentário na issue "Testes intermitentes". Um teste que volta lá várias vezes pede conserto.
