# As variáveis de ambiente passam pelo T3 Env

Como no Festival dos Macacos (`frontend/src/env.server.ts`, `platform/variaveis-do-servidor.ts`), o repositório lê as variáveis com o `createEnv` do `@t3-oss/env-core`, e não com `process.env.X ?? padrão` espalhado. `scripts/variaveis.ts` tem os tipos (`porta`, `pasta`, `arquivoOpcional`, `ligada`) e `lerVariaveis`. `scripts/portas.ts` (`portaPedida`) lê `DEV_PORTA`, `START_PORTA`, `E2E_PORTA`, `STORYBOOK_PORTA` e `STORIES_PORTA`; `frontend/vite/environment.ts` lê `CONTENT_ROOT`, `SITEMAP_ANTERIOR` e `VITE_COUNT_ON_LOCALHOST`, uma vez, quando o `vite.config.ts` carrega. O `frontend/scripts/vps.ts` lê o `GOATCOUNTER_EMAIL` antes da primeira etapa do deploy.

O porquê é falhar no começo. Antes, uma `CONTENT_ROOT` com erro de digitação só aparecia como acervo vazio ou erro no meio do build, e `E2E_PORTA=abc` virava `NaN` no Playwright. Agora o comando para antes de começar, com uma mensagem que diz cada variável errada, o valor e o que se esperava.

Diferente do Festival, os tipos são Standard Schema escritos à mão, e não Schema do Effect: o app não usa Effect (spec #23), e um zod pesaria mais que as linhas de `variaveis.ts`. Também não há `env.ts` no navegador: a única variável do bundle, `VITE_CONTAR_EM_LOCALHOST`, já é validada no build.

## Consequências

- Variável nova: um tipo em `variaveis.ts`, se faltar, e uma chave no `lerVariaveis` de quem a usa. Chave em branco conta como ausente.
- As `VPS_*` do deploy ainda são lidas direto: a falta do `VPS_HOST` já para o `vps.ts` com o uso.
