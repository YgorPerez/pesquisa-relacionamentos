// The Oxlint `state` plugin, loaded by `lint.jsPlugins` in the root
// `vite.config.ts` (ADR 0006). It is the first local plugin and the mold for
// the others: a file in `frontend/lint/`, a `.test.ts` next to it with the
// `RuleTester`, and the rule turned on in the root `lint` for the folders
// where it applies.
//
// `localstorage-through-stored`: localStorage only goes through `stored()`
// (`src/state/stored.ts`), which validates what it reads and notifies the
// other tabs. Whoever reads it directly gets what another version of the site
// saved, unvalidated.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** The names of the global object in the browser and in Node. */
const GLOBALS = new Set(['window', 'globalThis', 'self'])

const localstorageThroughStored = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'localStorage only goes through `stored()`.',
    },
    messages: {
      throughStored:
        'Use `stored(key, validate)` from `#/state/stored.ts`: it validates what it reads from localStorage.',
    },
    schema: [],
  },
  create(context) {
    return {
      // The bare `localStorage` that is not a variable of the file: the
      // global.
      'Program:exit'(program) {
        const scope = context.sourceCode.getScope(program)
        for (const reference of scope.through) {
          if (reference.identifier.name === 'localStorage') {
            context.report({
              node: reference.identifier,
              messageId: 'throughStored',
            })
          }
        }
      },
      // `window.localStorage` and the other names of the global.
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          GLOBALS.has(node.object.name) &&
          !node.computed &&
          node.property.type === 'Identifier' &&
          node.property.name === 'localStorage'
        ) {
          context.report({ node, messageId: 'throughStored' })
        }
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'state' },
  rules: { 'localstorage-through-stored': localstorageThroughStored },
})
