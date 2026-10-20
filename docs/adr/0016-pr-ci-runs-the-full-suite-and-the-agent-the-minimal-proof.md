# O CI do PR roda a suíte inteira, e o agente roda a menor prova

Até aqui, o agente rodava o `pnpm check`, o build e o e2e inteiros antes de cada push, e o `ci.yml` repetia tudo no PR. Vários agentes dividem a mesma máquina (ADR 0013): a suíte inteira de cada um disputa os núcleos com a dos outros, e a cópia local não prova nada que o CI não prove de novo. Copiado do [ADR-0035 do Festival dos Macacos](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0035-the-pull-requests-ci-runs-the-whole-suite-and-an-agent-runs-the-smallest-proof.md).

## Decisão

- **O `pr.yml` é o portão, e roda a suíte inteira a cada push num PR**, em três jobs paralelos: `check` (`pnpm typecheck` e `pnpm check`), `stories` (o build do Storybook e `pnpm test:stories`) e `e2e` (o build com a conferência do sitemap e `pnpm e2e`). O `ci.yml` virou o `pr.yml`.
- **Na máquina, o agente roda a menor prova do que mudou**: `node scripts/minimal-proof.ts [--base <ramo>]`. Do diff contra o merge-base, ele roda os tipos dos pacotes afetados e do app que os importa, o Vitest com `--changed` em cada pasta afetada, as pastas do app e o `vp check` nos arquivos mudados. Um passo que falha não para os outros.
- **O trabalho acaba quando o CI fica verde no último commit do PR**, e não quando a rodada local passa. Um job vermelho se lê com `gh run view <id> --log-failed`.

## Consequências

- Uma spec do e2e que o agente tocou ainda roda na mão, `pnpm e2e <spec>`; a menor prova não sobe o e2e.
- O repositório é público: o Actions não custa nada, e a regra "não mescle PR vermelho" é das pessoas e dos agentes, porque não há proteção de ramo.
