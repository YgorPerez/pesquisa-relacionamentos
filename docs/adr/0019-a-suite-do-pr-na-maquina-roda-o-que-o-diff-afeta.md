# A suíte do PR na máquina roda o que o diff afeta

Às vezes um ramo precisa da suíte antes do PR, ou o CI não rodou. Rodar tudo em sequência leva minutos e ocupa a máquina dos outros agentes. Do `pr-suite.ts` do Festival dos Macacos, sem os certificados dele.

## Decisão

- **`node scripts/pr-suite.ts [--base <ramo>] [--full] [--plan]`** roda os passos do `pr.yml` em quatro filas ao mesmo tempo: o `check` em partes (o `vp check`, as pastas, os testes, a fallow, o doctor), os tipos e a auditoria, as stories, e o build com o e2e. O build e o e2e ficam na mesma fila porque os dois escrevem o `frontend/.output`.
- **Por padrão, só o que o diff afeta** (`scripts/affected.ts`): o Vitest com `--changed` nas pastas afetadas, as stories se o app mudou, e as specs do e2e dos termos que mudaram, pela tabela `TERMOS_DAS_SPECS`. Um lockfile, uma config, `platform/`, um pacote de `packages/` ou um estilo de todas as páginas rodam tudo. Um arquivo do app sem termo roda o e2e inteiro.
- **Um teste que falha roda de novo, sozinho, uma vez** (`scripts/flaky.ts`). Passou, o passo conta verde e o manifesto anota o intermitente.
- **Cada rodada guarda os logs e um `manifest.json` numa pasta só dela** (`scripts/suite-log.ts`).
- **Antes de rodar, lista os PRs abertos que mexem nos mesmos arquivos** (`scripts/overlapping-prs.ts`).

## Opções consideradas

**O certificado do Festival**, que o hook cobra antes de um push na `main`. Lá o Actions estava desligado, e a suíte local era o único portão. Aqui o portão é o CI do PR (ADR 0016), e um certificado local repetiria o que ele prova.

## Consequências

- Uma spec nova entra em `TERMOS_DAS_SPECS`; o teste de `affected.ts` falha até ela entrar.
