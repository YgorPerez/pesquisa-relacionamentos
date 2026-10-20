# Regras locais são `jsPlugins` do Oxlint

O Festival escreve as regras dele em GritQL para o Biome e em plugins do ESLint (`coesao`, `tema`, o `@shadcn/lint`). Aqui uma regra do repositório é um plugin JavaScript do Oxlint: um arquivo em `frontend/lint/` que exporta `definePlugin` de `vite-plus/lint/plugins`, com um `.test.ts` ao lado que roda o `RuleTester` de `vite-plus/lint/plugins-dev`. O arquivo entra em `lint.jsPlugins` no `vite.config.ts` da raiz, e a regra é ligada em `lint.overrides` só nas pastas onde vale.

O primeiro é o `state` (`frontend/lint/state.ts`), com a regra `state/localstorage-through-stored`: no app, o `localStorage` só passa por `stored()`, que valida o que lê. O dono, `src/state/stored.ts`, fica fora do override.

## Consequências

- O plugin é TypeScript, e o Oxlint o carrega pelo Node, que tira os tipos sozinho. Nada é compilado antes.
- Os plugins importam a API do Vite+, não `oxlint` nem `@oxlint/plugins` direto: assim a API é a do Oxlint que carrega o plugin.
- Regra de plugin JavaScript não lê tipos. Uma regra que precisa deles fica fora daqui.
- O `@shadcn/lint` e os plugins `cohesion` e `theme` entram no #54 do mesmo jeito. Se o `@shadcn/lint` não rodar no Oxlint, ele vai para um ESLint mínimo de reserva, só com ele.
