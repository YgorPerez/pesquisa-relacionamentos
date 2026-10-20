// O plugin `coesao` do Oxlint (ADR 0006), no molde do `lint/coesao.ts` do
// Festival dos Macacos: o que o DESIGN.md unificou tem um dono, e estas
// regras prendem cada peça a ele. Quem é dono não está aqui: cada regra é
// ligada no `vite.config.ts` da raiz só fora das pastas dos donos, com o
// motivo.
//
// `h1-do-dono`: o `<h1>` da página é o `Display` (`ui/folha.tsx`).
// `reticula-do-dono`: a retícula, a única elevação do site (The Halftone
// Rule), é das peças de `src/ui/`: o `Painel`, o `Botao`, a linha grande da
// Pergunta. A tela pede a peça.
// `icone-a-mao`: os ícones do site são desenhados à mão no DESIGN.md (a seta,
// o visto, os degraus). Um pacote de ícones prontos, como o `lucide-react`,
// não entra.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** A classe `reticula`, com ou sem variante na frente (`data-x:reticula`). */
const RETICULA = /(^|[\s:])reticula(?=\s|$)/

/** Os pacotes de ícones prontos. */
const ICONES =
  /^(lucide-react|@heroicons\/|react-icons|@tabler\/icons|@phosphor-icons\/)/

const h1DoDono = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'O `<h1>` da página é o `Display`.' },
    messages: {
      doDono:
        'O título da página é o `Display` de `ui/folha.tsx`: passe o texto a ele (DESIGN.md, Typography, `display`).',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(no) {
        if (no.name.type === 'JSXIdentifier' && no.name.name === 'h1')
          context.report({ node: no, messageId: 'doDono' })
      },
    }
  },
})

const reticulaDoDono = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'A retícula é das peças de `src/ui/`.' },
    messages: {
      doDono:
        'A retícula é a única elevação do site, e quem a desenha é uma peça de `src/ui/`: o `Painel` (`ui/secao.tsx`), o `Botao`, a linha grande da Pergunta. Use a peça, ou crie a variante lá (DESIGN.md, Elevation & Depth).',
    },
    schema: [],
  },
  create(context) {
    const tem = (texto: unknown) =>
      typeof texto === 'string' && RETICULA.test(texto)
    return {
      Literal(no) {
        if (tem(no.value)) context.report({ node: no, messageId: 'doDono' })
      },
      TemplateElement(no) {
        if (tem(no.value.cooked))
          context.report({ node: no, messageId: 'doDono' })
      },
    }
  },
})

const iconeAMao = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Os ícones são desenhados à mão.' },
    messages: {
      aMao: 'Os ícones do site são desenhados à mão, em SVG de traço único com a ponta arredondada (DESIGN.md, Shapes). Desenhe o ícone ao lado da peça que o usa, em vez de importar um pronto.',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(no) {
        if (typeof no.source.value === 'string' && ICONES.test(no.source.value))
          context.report({ node: no, messageId: 'aMao' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'coesao' },
  rules: {
    'h1-do-dono': h1DoDono,
    'reticula-do-dono': reticulaDoDono,
    'icone-a-mao': iconeAMao,
  },
})
