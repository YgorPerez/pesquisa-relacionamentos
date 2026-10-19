# Os selos do README são SVGs commitados

A nota da fallow, o score do React Doctor e a cobertura mudam a cada merge. Escritos à mão no README, ficam velhos no primeiro. Do `badges.yml` do Festival dos Macacos.

## Decisão

- **O `badges.yml` mede depois de cada push na `main` que mexe no código** (a cobertura de cada pacote, `fallow health --min-score 0`, `react-doctor --json`) e grava `docs/badges/fallow.svg`, `react-doctor.svg` e `cobertura.svg` com `.github/scripts/badges.ts`. Só commita se um selo mudou, com o token do workflow, que não dispara o deploy.
- **A cobertura do selo é a de linhas de todo o código**: o app, os pacotes e os scripts, sem testes, stories e o gerado.
- **O selo não é portão.** Quem cobra a nota e o piso é o `pnpm check` do PR.

## Opções consideradas

**O endpoint do shields.io.** O repositório é público e o shields alcançaria um JSON, mas o selo ficaria dependendo de um serviço de fora; o SVG no repositório não depende de nada.
