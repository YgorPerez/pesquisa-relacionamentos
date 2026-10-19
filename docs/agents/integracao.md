# Push, checagem e merge

O que confere uma mudança hoje e o que você roda antes de um push e antes de um merge. O `AGENTS.md` guarda as regras e aponta para cá. Como o site vai ao ar está em `docs/deploy.md`.

## Quais workflows rodam

Leia o estado antes de confiar num check, porque esta lista envelhece e o comando não:

```bash
GH_TOKEN=$(gh auth token --user YgorPerez) gh workflow list --all
GH_TOKEN=$(gh auth token --user YgorPerez) gh run list --workflow "<nome>" --limit 5
```

Em 19/10/2026, a `main` só tinha o `pages-build-deployment` do GitHub Pages. O `ci.yml` e o `deploy.yml` moram em `spec/23-mvp` e passam a valer quando ela entrar na `main`:

| Workflow                | Quando roda                                                                     | O que faz                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `CI` (`ci.yml`)         | todo pull request e todo push na `main`                                         | `pnpm typecheck`, `pnpm check`, o build, o Storybook, `pnpm test:stories` e `pnpm e2e`, no Node 24.      |
| `Deploy` (`deploy.yml`) | push na `main` que muda o site (`frontend/`, `packages/`, o acervo, o lockfile) | Os testes, o build e a troca do contêiner na VPS. Sem os secrets `VPS_*`, pula com um aviso e sai verde. |

Um push num ramo `ticket/*` ou `spec/*` sem pull request não roda nada. Até lá, o que confere o ramo é você.

## Os ramos

- O trabalho de um spec mora em `spec/<n>-<nome>`, que nasce da `main`.
- Cada ticket do spec tem o ramo `ticket/<n>-<nome>`, que nasce da ponta de `origin/spec/<n>-<nome>` e volta para ela por merge.
- A `main` recebe o spec inteiro, e um push nela pode publicar o site (`AGENTS.md`, "Quatro jeitos de se machucar", item 1).

## Antes de cada push

1. `git fetch origin && git merge origin/<ramo de destino>`: o seu ramo com o que já entrou. Resolva o conflito aqui, não no merge do orquestrador.
2. Os testes do que você mudou, o `pnpm check` e o `pnpm typecheck`. Mudou o app, também `pnpm build` e `pnpm e2e` (em segundo plano: `docs/agents/ambiente.md`, "Esperar"). Mudou uma story ou uma peça de `ui/`, `pnpm test:stories`.
3. Só então `git push -u origin <ramo>`.

O `pnpm check` é o mesmo do CI: formato, lint e tipos (`vp check`), as pastas (`frontend/lint/pastas.ts`), os testes com o piso de cobertura, a fallow e o React Doctor. Um piso que cai, um score da fallow abaixo de 90 ou um aviso do React Doctor falham a rodada.

## Uma supressão nova

Um `oxlint-disable`, `@ts-expect-error` ou `'use no memo'` novo leva o motivo no mesmo comentário, e uma pessoa lê antes de entrar. Diga no relatório cada supressão que você acrescentou e por quê. Uma supressão que não suprime mais nada já falha o lint (`reportUnusedDisableDirectives`).
