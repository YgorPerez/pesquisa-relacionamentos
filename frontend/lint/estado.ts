// O plugin `estado` do Oxlint, carregado por `lint.jsPlugins` no
// `vite.config.ts` da raiz (ADR 0006). É o primeiro plugin local e o molde
// dos outros: um arquivo em `frontend/lint/`, um `.test.ts` ao lado com o
// `RuleTester`, e a regra ligada no `lint` da raiz para as pastas onde vale.
//
// `localstorage-pelo-armazenado`: o localStorage só passa por `armazenado()`
// (`src/estado/armazenado.ts`), que valida o que lê e avisa as outras abas.
// Quem lê direto recebe o que outra versão do site gravou, sem validar.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** Os nomes do objeto global no navegador e no Node. */
const GLOBAIS = new Set(['window', 'globalThis', 'self'])

const localstoragePeloArmazenado = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'O localStorage só passa por `armazenado()`.',
    },
    messages: {
      peloArmazenado:
        'Use `armazenado(chave, validar)` de `#/estado/armazenado.ts`: ele valida o que lê do localStorage.',
    },
    schema: [],
  },
  create(context) {
    return {
      // O `localStorage` solto que não é variável do arquivo: o global.
      'Program:exit'(programa) {
        const escopo = context.sourceCode.getScope(programa)
        for (const referencia of escopo.through) {
          if (referencia.identifier.name === 'localStorage') {
            context.report({
              node: referencia.identifier,
              messageId: 'peloArmazenado',
            })
          }
        }
      },
      // O `window.localStorage` e os outros nomes do global.
      MemberExpression(no) {
        if (
          no.object.type === 'Identifier' &&
          GLOBAIS.has(no.object.name) &&
          !no.computed &&
          no.property.type === 'Identifier' &&
          no.property.name === 'localStorage'
        ) {
          context.report({ node: no, messageId: 'peloArmazenado' })
        }
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'estado' },
  rules: { 'localstorage-pelo-armazenado': localstoragePeloArmazenado },
})
