import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import tema from './cor-do-tema.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('tema/cor-crua', tema.rules['cor-crua'], {
  valid: [
    "const meta = { name: 'theme-color', content: CORES_DA_MARCA.papel }",
    '<p className="text-tinta bg-papel" />',
    // Âncoras e ids não são cor.
    '<a href="#fichas">Fichas</a>',
    '<a href="#a-conta">ver a conta</a>',
    "const id = '#ficha-silva-2020'",
    // A entidade do HTML não é cor.
    "const s = '&#123;'",
  ],
  invalid: [
    {
      code: "const meta = { name: 'theme-color', content: '#f5f8f8' }",
      errors: [{ messageId: 'crua' }],
    },
    {
      code: '<p style={{ color: "#1a1c1c" }} />',
      errors: [{ messageId: 'crua' }],
    },
    {
      code: "const fundo = 'rgba(26, 28, 28, 0.62)'",
      errors: [{ messageId: 'crua' }],
    },
    {
      code: 'const f = `color-mix(in srgb, ${a} 30%, transparent)`',
      errors: [{ messageId: 'crua' }],
    },
    {
      code: "const c = '#FFF'",
      errors: [{ messageId: 'crua' }],
    },
  ],
})
