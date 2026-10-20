// The Oxlint `cohesion` plugin (ADR 0006), modeled on the Festival dos
// Macacos `lint/coesao.ts`: what DESIGN.md unified has an owner, and these
// rules tie each piece to it. The owners are not here: each rule is turned
// on in the root `vite.config.ts` only outside the owners' folders, with the
// reason.
//
// `h1-owner`: the page's `<h1>` is the `Display` (`ui/sheet.tsx`).
// `halftone-owner`: the halftone (`reticula`), the site's only elevation (The
// Halftone Rule), belongs to the `src/ui/` pieces: the `Painel`, the `Botao`,
// the Question's big row. The screen asks for the piece.
// `hand-drawn-icons`: the site's icons are hand-drawn in DESIGN.md (the
// arrow, the check, the steps). A ready-made icon package, like
// `lucide-react`, does not come in.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** The `reticula` class, with or without a variant in front
 * (`data-x:reticula`). */
const HALFTONE = /(^|[\s:])reticula(?=\s|$)/

/** The ready-made icon packages. */
const ICON_PACKAGES =
  /^(lucide-react|@heroicons\/|react-icons|@tabler\/icons|@phosphor-icons\/)/

const h1Owner = defineRule({
  meta: {
    type: 'problem',
    docs: { description: "The page's `<h1>` is the `Display`." },
    messages: {
      owner:
        'The page title is the `Display` from `ui/sheet.tsx`: pass the text to it (DESIGN.md, Typography, `display`).',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'h1')
          context.report({ node, messageId: 'owner' })
      },
    }
  },
})

const halftoneOwner = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'The halftone belongs to the `src/ui/` pieces.' },
    messages: {
      owner:
        "The halftone is the site's only elevation, and a `src/ui/` piece draws it: the `Painel` (`ui/section.tsx`), the `Botao`, the Question's big row. Use the piece, or create the variant there (DESIGN.md, Elevation & Depth).",
    },
    schema: [],
  },
  create(context) {
    const has = (text: unknown) =>
      typeof text === 'string' && HALFTONE.test(text)
    return {
      Literal(node) {
        if (has(node.value)) context.report({ node, messageId: 'owner' })
      },
      TemplateElement(node) {
        if (has(node.value.cooked)) context.report({ node, messageId: 'owner' })
      },
    }
  },
})

const handDrawnIcons = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'The icons are hand-drawn.' },
    messages: {
      handDrawn:
        "The site's icons are hand-drawn, as single-stroke SVG with rounded caps (DESIGN.md, Shapes). Draw the icon next to the piece that uses it, instead of importing a ready-made one.",
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (
          typeof node.source.value === 'string' &&
          ICON_PACKAGES.test(node.source.value)
        )
          context.report({ node, messageId: 'handDrawn' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'cohesion' },
  rules: {
    'h1-owner': h1Owner,
    'halftone-owner': halftoneOwner,
    'hand-drawn-icons': handDrawnIcons,
  },
})
