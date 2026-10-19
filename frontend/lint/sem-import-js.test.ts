import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import modulos from './sem-import-js.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('modulos/sem-import-js', modulos.rules['sem-import-js'], {
  valid: [
    "import { laco } from './laco.ts'",
    "import { cn } from '@/platform/cn'",
    // Pacote não é olhado, mesmo com `.js`.
    "import x from 'pacote/dist/index.js'",
    "export { a } from '../a.ts'",
    "const m = await import('./m.ts')",
    "type T = import('./tipos.ts').T",
    // Sem extensão, como o front importa.
    "import tabelas from './cn-tabelas'",
  ],
  invalid: [
    {
      code: "import { laco } from './laco.js'",
      errors: [{ messageId: 'js' }],
    },
    {
      code: "export * from '../todos.js'",
      errors: [{ messageId: 'js' }],
    },
    {
      code: "export { a } from './a.jsx'",
      errors: [{ messageId: 'js' }],
    },
    {
      code: "const m = await import('./m.js')",
      errors: [{ messageId: 'js' }],
    },
    {
      code: "type T = import('./tipos.js').T",
      errors: [{ messageId: 'js' }],
    },
  ],
})
