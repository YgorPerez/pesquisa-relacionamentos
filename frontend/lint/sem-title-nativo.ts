// O plugin `html` do Oxlint (ADR 0006), com a regra que o Festival dos
// Macacos escreve em GritQL (`lint/sem-title-nativo.grit`, a mesma
// `no-native-title-tooltip` do t3code).
//
// `sem-title-nativo`: o `title` num elemento do HTML (`<span title>`) só
// aparece no hover de um mouse parado. No celular, que é onde o site é lido
// primeiro, ele nunca abre. A explicação vai no texto da página. A prop de um
// componente (`<Cartao title>`) passa, e o `title` que é o nome acessível do
// conteúdo (`iframe`, `embed`, `object`, `frame`, `math`) também.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** Onde o `title` é o nome do conteúdo, e não dica. */
const NOME_DO_CONTEUDO = new Set(['iframe', 'embed', 'object', 'frame', 'math'])

const semTitleNativo = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Sem o `title` do HTML como dica.' },
    messages: {
      noToque:
        'O `title` do HTML não abre no toque, e o site é lido no celular. Escreva a explicação no texto, ao lado do que ela explica.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(no) {
        if (no.name.type !== 'JSXIdentifier' || no.name.name !== 'title') return
        const elemento = no.parent
        if (elemento?.type !== 'JSXOpeningElement') return
        const nome = elemento.name
        if (
          nome.type === 'JSXIdentifier' &&
          /^[a-z][a-z0-9]*$/.test(nome.name) &&
          !NOME_DO_CONTEUDO.has(nome.name)
        )
          context.report({ node: no, messageId: 'noToque' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'html' },
  rules: { 'sem-title-nativo': semTitleNativo },
})
