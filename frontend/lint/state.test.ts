import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import state from './state.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()
const rule = state.rules['localstorage-through-stored']

tester.run('state/localstorage-through-stored', rule, {
  valid: [
    "stored('profile', readProfile)",
    "sessionStorage.setItem('tem-estudo:visit', '1')",
    // A local name that only looks like the global is not localStorage.
    'const { localStorage } = options; localStorage.getItem("x")',
    'object.localStorage',
  ],
  invalid: [
    {
      code: "localStorage.getItem('tem-estudo:profile')",
      errors: [{ messageId: 'throughStored' }],
    },
    {
      code: "window.localStorage.setItem('tem-estudo:profile', '{}')",
      errors: [{ messageId: 'throughStored' }],
    },
    {
      code: 'globalThis.localStorage.clear()',
      errors: [{ messageId: 'throughStored' }],
    },
  ],
})
