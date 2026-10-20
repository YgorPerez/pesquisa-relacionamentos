# Os ícones e o manifesto saem da marca por script

Como no Festival dos Macacos (`frontend/scripts/brand-icons.ts`), os ícones do site são desenhados por script, a partir da marca, e não à mão num editor. `node frontend/scripts/brand-icons.ts` desenha no Chrome o "?" do título em Bricolage sobre o marca-texto amarelo, no papel, e grava em `frontend/public/` o `favicon-32.png`, o `icone-180.png` (o iPhone, que não lê o manifesto), os de 192 e 512px e o `manifest.webmanifest`. As cores, os tamanhos e o manifesto vêm de `src/ui/marca.ts`, que o `marca.test.ts` confere contra o DESIGN.md e contra o que está em `public/`. O `<head>` liga os três (`__root.tsx`), e a `theme-color` também lê de `marca.ts`.

## Consequências

- O manifesto não faz do site um app: `display: browser`, sem service worker (a spec #23 deixa o PWA de fora).
- Mudou a marca, rode o script de novo; o teste falha se o manifesto gravado não for o de `marca.ts`.
