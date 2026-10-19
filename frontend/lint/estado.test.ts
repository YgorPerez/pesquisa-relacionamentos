import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import estado from './estado.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()
const regra = estado.rules['localstorage-pelo-armazenado']

tester.run('estado/localstorage-pelo-armazenado', regra, {
  valid: [
    "armazenado('perfil', lerPerfil)",
    "sessionStorage.setItem('tem-estudo:visita', '1')",
    // Um nome local que só se parece com o global não é o localStorage.
    'const { localStorage } = opcoes; localStorage.getItem("x")',
    'objeto.localStorage',
  ],
  invalid: [
    {
      code: "localStorage.getItem('tem-estudo:perfil')",
      errors: [{ messageId: 'peloArmazenado' }],
    },
    {
      code: "window.localStorage.setItem('tem-estudo:perfil', '{}')",
      errors: [{ messageId: 'peloArmazenado' }],
    },
    {
      code: 'globalThis.localStorage.clear()',
      errors: [{ messageId: 'peloArmazenado' }],
    },
  ],
})
