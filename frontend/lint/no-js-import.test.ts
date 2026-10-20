import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import modules from './no-js-import.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('modules/no-js-import', modules.rules['no-js-import'], {
  valid: [
    "import { loop } from './loop.ts'",
    "import { cn } from '@/platform/cn'",
    // A package is not checked, even with `.js`.
    "import x from 'package/dist/index.js'",
    "export { a } from '../a.ts'",
    "const m = await import('./m.ts')",
    "type T = import('./types.ts').T",
    // No extension, as the front imports.
    "import tables from './cn-tables'",
  ],
  invalid: [
    {
      code: "import { loop } from './loop.js'",
      errors: [{ messageId: 'js' }],
    },
    {
      code: "export * from '../all.js'",
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
      code: "type T = import('./types.js').T",
      errors: [{ messageId: 'js' }],
    },
  ],
})
