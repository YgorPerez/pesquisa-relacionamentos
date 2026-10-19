# O `@shadcn/lint` roda no Oxlint, sem ESLint

O Festival dos Macacos mantém um ESLint só para o `@shadcn/lint` e as regras locais (o `eslint.config.js` dele). Aqui o `@shadcn/lint` 0.2 roda como `jsPlugin` do Oxlint do Vite+, que ele suporta, e o ESLint de reserva da ADR 0006 não foi preciso. As regras são as do Festival: `no-unknown-classes`, `no-raw-colors`, `require-static-classes`, `no-arbitrary-values` (com `layout` e `transition` liberados) e `no-restyle` (só `layout`), ligadas em `frontend/src/**` e desligadas em `src/ui/shadcn/**`, onde a classe é a definição da variante.

## Consequências

- O plugin acha o tema pelo `frontend/components.json`, a partir de cada arquivo lintado; a config dele mora no bloco `lint` do `vite.config.ts` da raiz, como o resto (ADR 0002).
- Uma classe que pede um retoque num componente do shadcn (`<Button className="gap-2.5">`) vira variante no componente, e não exceção na config.
- O `@shadcn/lint` é dependência da raiz, onde está a config do lint.
