// The Oxlint `screens` plugin (ADR 0006), with the rule the Festival dos
// Macacos writes in GritQL (`lint/sem-vi-waitfor-nas-telas.grit`).
//
// `no-vi-waitfor-in-screens`: in a screen test, the wait is Testing
// Library's. `waitFor` and `findBy*` give up after 10 s
// (`src/platform/screens/setup.ts`); Vitest's `vi.waitFor` gives up after
// 1 s, and with the machine busy the screen that compiles the route inside
// the test went past it: the test failed with "Timed out in waitFor!" with
// nothing wrong on screen (Festival, #1176). Turned on only in `*.test.tsx`.
import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

const noViWaitFor = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'No `vi.waitFor` in screen tests.' },
    messages: {
      shortWait:
        'In a screen test, wait with the `waitFor` from @testing-library/react, which gives up after 10 s like `findBy`; `vi.waitFor` gives up after 1 s.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'vi' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'waitFor'
        )
          context.report({ node, messageId: 'shortWait' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'screens' },
  rules: { 'no-vi-waitfor-in-screens': noViWaitFor },
})
