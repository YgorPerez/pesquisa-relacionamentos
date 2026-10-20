# ts-reset e o patch do `@effect/tsgo`, no `tsc` e no Oxlint

Dois ajustes de tipos vêm do Festival.

O `@total-typescript/ts-reset` entra por um `reset.d.ts` em cada projeto TypeScript (o app e os dois pacotes). Com ele, `JSON.parse` e `Response.json()` devolvem `unknown`, e quem lê um JSON confere a forma antes de usar. Ele achou três lugares que passavam o pacote do Grupo possível direto do JSON para `abrirPacote`, que agora recebe `unknown` e confere a versão por um type guard.

O `prepare` da raiz roda `effect-tsgo patch --typescript --oxlint`. O patch troca o `tsc` do TypeScript 7 e o binário do Oxlint do Vite+ pelos do `@effect/tsgo`, e os diagnósticos do Effect saem nos dois. O Festival roda com `--no-oxlint`, porque lá o Oxlint não existe. Aqui o pacote do Conteúdo, o único com Effect, liga no `tsconfig.json` o plugin `@effect/language-service` e, no `lint.overrides`, o preset `recommended` do plugin `effecttsgo`.

## Consequências

- Cada versão do `@effect/tsgo` aceita uma lista curta de versões do Oxlint e do `oxlint-tsgolint`, e o patch falha o `pnpm install` fora dela. Subir o `vite-plus` pede subir o `@effect/tsgo` junto, pelo catálogo.
- O React Doctor traz um Oxlint 1.81 dele, que o patch recusa. Ele fica com o seu, que é o único em que o plugin dele roda, e o `hoistPattern` o tira de `node_modules/.pnpm/node_modules`. Dali, o `NODE_PATH` que o pnpm dá aos scripts o entregava ao patch.
- O mesmo diagnóstico do Effect pode sair duas vezes, no `tsc` e no `vp check`.
