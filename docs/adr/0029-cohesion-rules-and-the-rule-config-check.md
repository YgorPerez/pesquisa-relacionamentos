# As regras da coesão, e a chave das regras confere as ligadas

O Festival dos Macacos prende cada peça ao dono por lint (`lint/coesao.ts`, `lint/cor-do-tema.ts`) e tem duas regras em GritQL (`sem-title-nativo`, `sem-import-js`). Aqui elas são `jsPlugins` do Oxlint (ADR 0006), cada uma com o `RuleTester`, e o conteúdo é o deste site:

- `cohesion/h1-owner`: o `<h1>` é o `Display` de `ui/sheet.tsx`.
- `cohesion/halftone-owner`: a retícula, a única elevação, é das peças de `src/ui/` (o `Painel`, o `Botao`).
- `cohesion/hand-drawn-icons`: pacote de ícones prontos não entra.
- `theme/raw-color`: uma cor escrita à mão numa string (`#f5f8f8`, `rgb()`). A dona das cores fora do CSS é `ui/brand.ts`. Sem modo escuro, a regra do Festival (a cor que não muda no escuro) não se aplica.
- `html/no-native-title`: o `title` do HTML não abre no toque.
- `modules/no-js-import`: o import relativo nomeia o `.ts`, para o `node` rodar os scripts.

O `lint/chave-das-regras.ts` do Festival é a chave de cache do ESLint. O Oxlint não tem esse cache, e o `vp run --cache` anota sozinho o que o lint lê. Aqui o `frontend/lint/rule-config.ts` confere o outro lado: que todo plugin local está em `lint.jsPlugins`, que toda regra dele está ligada, que nenhuma regra ligada falta no plugin, e que as do `@shadcn/lint` valem no app e não em `ui/shadcn/`. O `frontend/lint/rule-config.test.ts` roda isso sobre a config de verdade.

## Consequências

- Um plugin novo em `frontend/lint/` sem regra ligada falha o teste, e não fica esquecido.
