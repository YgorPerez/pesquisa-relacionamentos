// O plugin `telas` do Oxlint (ADR 0006), com a regra que o Festival dos
// Macacos escreve em GritQL (`lint/sem-vi-waitfor-nas-telas.grit`).
//
// `sem-vi-waitfor-nas-telas`: num teste de tela, a espera é a da Testing
// Library. O `waitFor` e o `findBy*` desistem em 10 s
// (`src/platform/telas/telas.ts`); o `vi.waitFor` do Vitest desiste em 1 s, e
// com a máquina cheia a tela que compila a rota no próprio teste passava
// disso: o teste caía com "Timed out in waitFor!" sem nada errado na tela
// (Festival, #1176). Ligada só nos `*.test.tsx`.
import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

const semViWaitFor = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Sem o `vi.waitFor` nos testes de tela.' },
    messages: {
      esperaCurta:
        'Num teste de tela, espere com o `waitFor` da @testing-library/react, que desiste em 10 s como o `findBy`; o `vi.waitFor` desiste em 1 s.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(no) {
        const chamada = no.callee
        if (
          chamada.type === 'MemberExpression' &&
          chamada.object.type === 'Identifier' &&
          chamada.object.name === 'vi' &&
          chamada.property.type === 'Identifier' &&
          chamada.property.name === 'waitFor'
        )
          context.report({ node: no, messageId: 'esperaCurta' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'telas' },
  rules: { 'sem-vi-waitfor-nas-telas': semViWaitFor },
})
