// The Oxlint `html` plugin (ADR 0006), with the rule the Festival dos Macacos
// writes in GritQL (`lint/sem-title-nativo.grit`, the same
// `no-native-title-tooltip` as t3code).
//
// `no-native-title`: the `title` on an HTML element (`<span title>`) only
// shows on the hover of a still mouse. On a phone, which is where the site is
// read first, it never opens. The explanation goes in the page text. A
// component prop (`<Cartao title>`) passes, and so does the `title` that is
// the content's accessible name (`iframe`, `embed`, `object`, `frame`,
// `math`).

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** Where the `title` is the content's name, and not a tooltip. */
const CONTENT_NAME = new Set(['iframe', 'embed', 'object', 'frame', 'math'])

const noNativeTitle = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'No HTML `title` as a tooltip.' },
    messages: {
      onTouch:
        'The HTML `title` does not open on touch, and the site is read on phones. Write the explanation in the text, next to what it explains.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'title')
          return
        const element = node.parent
        if (element?.type !== 'JSXOpeningElement') return
        const name = element.name
        if (
          name.type === 'JSXIdentifier' &&
          /^[a-z][a-z0-9]*$/.test(name.name) &&
          !CONTENT_NAME.has(name.name)
        )
          context.report({ node, messageId: 'onTouch' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'html' },
  rules: { 'no-native-title': noNativeTitle },
})
