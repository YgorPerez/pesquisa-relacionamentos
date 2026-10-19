// O plugin `tema` do Oxlint (ADR 0006), no molde do `lint/cor-do-tema.ts` do
// Festival dos Macacos. Lá a regra pega a cor que não muda no modo escuro;
// aqui, sem modo escuro, pega a cor escrita à mão no código: um `#1a1c1c`,
// um `rgb()` ou um `color-mix()` numa string. A cor do site é um token do
// DESIGN.md: na tela, a classe do tema (`text-tinta`, `bg-papel`); fora do
// CSS (a `theme-color`, os ícones), `CORES_DA_MARCA` de `ui/marca.ts`, que é
// a dona e fica fora da regra no `vite.config.ts` da raiz.
//
// O `shadcn/no-raw-colors` já pega a cor nas classes (`bg-[#fff]`) e nos
// atributos de SVG. Esta pega o resto: o `style`, a meta, a string solta.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** Um hex de 3, 4, 6 ou 8 dígitos, ou uma função de cor do CSS. O `#` de
 * uma âncora (`#fichas`, `#a-conta`) não é hex. */
const COR =
  /(^|[^\w&])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/i

const corCrua = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'A cor do site é um token do DESIGN.md.' },
    messages: {
      crua: 'Cor escrita à mão. Na tela, use a classe do tema (`text-tinta`, `bg-papel`, `border-agua-tinta`, de `ui/tokens.css`); fora do CSS, `CORES_DA_MARCA` de `ui/marca.ts`. Uma cor nova entra primeiro no DESIGN.md.',
    },
    schema: [],
  },
  create(context) {
    const crua = (texto: unknown) =>
      typeof texto === 'string' && COR.test(texto)
    return {
      Literal(no) {
        if (crua(no.value)) context.report({ node: no, messageId: 'crua' })
      },
      TemplateElement(no) {
        if (crua(no.value.cooked))
          context.report({ node: no, messageId: 'crua' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'tema' },
  rules: { 'cor-crua': corCrua },
})
