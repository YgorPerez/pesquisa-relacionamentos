// The Oxlint `theme` plugin (ADR 0006), modeled on the Festival dos Macacos
// `lint/cor-do-tema.ts`. There the rule catches the color that does not
// change in dark mode; here, with no dark mode, it catches the color written
// by hand in the code: a `#1a1c1c`, an `rgb()` or a `color-mix()` in a
// string. The site's color is a DESIGN.md token: on screen, the theme class
// (`text-tinta`, `bg-papel`); outside CSS (the `theme-color`, the icons),
// `BRAND_COLORS` from `ui/brand.ts`, which owns them and stays out of the
// rule in the root `vite.config.ts`.
//
// `shadcn/no-raw-colors` already catches the color in classes (`bg-[#fff]`)
// and in SVG attributes. This one catches the rest: the `style`, the meta,
// the loose string.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** A hex of 3, 4, 6 or 8 digits, or a CSS color function. The `#` of an
 * anchor (`#fichas`, `#a-conta`) is not hex. */
const COLOR =
  /(^|[^\w&])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/i

const rawColor = defineRule({
  meta: {
    type: 'problem',
    docs: { description: "The site's color is a DESIGN.md token." },
    messages: {
      raw: 'Color written by hand. On screen, use the theme class (`text-tinta`, `bg-papel`, `border-agua-tinta`, from `ui/tokens.css`); outside CSS, `BRAND_COLORS` from `ui/brand.ts`. A new color goes into DESIGN.md first.',
    },
    schema: [],
  },
  create(context) {
    const raw = (text: unknown) => typeof text === 'string' && COLOR.test(text)
    return {
      Literal(node) {
        if (raw(node.value)) context.report({ node, messageId: 'raw' })
      },
      TemplateElement(node) {
        if (raw(node.value.cooked)) context.report({ node, messageId: 'raw' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'theme' },
  rules: { 'raw-color': rawColor },
})
