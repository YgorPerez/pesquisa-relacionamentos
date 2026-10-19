// O plugin `modulos` do Oxlint (ADR 0006), com a regra que o Festival dos
// Macacos escreve em GritQL (`lint/sem-import-js.grit`).
//
// `sem-import-js`: um import relativo nomeia o arquivo que existe,
// `./laco.ts`, e não `./laco.js`. O `.js` que aponta para um `.ts` só resolve
// pelo Vite ou pelo `tsc`; o `node` sozinho, que roda os scripts do repo
// tirando os tipos (`node scripts/conferir-ficha.ts`), não o acha. Pega o
// `import` e o `export ... from`, o `import()` e o tipo `import('...')`; não
// olha pacote.

import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

const RELATIVO_JS = /^\.\.?\/.*\.jsx?$/

const semImportJs = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Import relativo nomeia o `.ts` ou o `.tsx`.' },
    messages: {
      js: 'Import relativo com `.js`: nomeie o arquivo de verdade, o `.ts` ou o `.tsx`.',
    },
    schema: [],
  },
  create(context) {
    const ver = (fonte: { type: string; value?: unknown } | null | undefined) =>
      fonte?.type === 'Literal' &&
      typeof fonte.value === 'string' &&
      RELATIVO_JS.test(fonte.value)
    return {
      ImportDeclaration(no) {
        if (ver(no.source)) context.report({ node: no.source, messageId: 'js' })
      },
      ExportNamedDeclaration(no) {
        if (no.source && ver(no.source))
          context.report({ node: no.source, messageId: 'js' })
      },
      ExportAllDeclaration(no) {
        if (ver(no.source)) context.report({ node: no.source, messageId: 'js' })
      },
      ImportExpression(no) {
        if (ver(no.source)) context.report({ node: no.source, messageId: 'js' })
      },
      TSImportType(no) {
        // O `import('./x.js')` do tipo. O Oxlint dá a fonte em `source`; o
        // TS-ESTree antigo, num tipo literal em `argument`.
        const { source, argument } = no as unknown as {
          source?: { type: string; value?: unknown }
          argument?: {
            type: string
            literal?: { type: string; value?: unknown }
          }
        }
        const literal = source ?? argument?.literal
        if (literal && ver(literal))
          context.report({ node: no, messageId: 'js' })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'modulos' },
  rules: { 'sem-import-js': semImportJs },
})
