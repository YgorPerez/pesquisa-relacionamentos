import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import theme from './theme-color.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('theme/raw-color', theme.rules['raw-color'], {
  valid: [
    "const meta = { name: 'theme-color', content: BRAND_COLORS.papel }",
    '<p className="text-tinta bg-papel" />',
    // Anchors and ids are not colors.
    '<a href="#fichas">Fichas</a>',
    '<a href="#a-conta">ver a conta</a>',
    "const id = '#ficha-silva-2020'",
    // The HTML entity is not a color.
    "const s = '&#123;'",
  ],
  invalid: [
    {
      code: "const meta = { name: 'theme-color', content: '#f5f8f8' }",
      errors: [{ messageId: 'raw' }],
    },
    {
      code: '<p style={{ color: "#1a1c1c" }} />',
      errors: [{ messageId: 'raw' }],
    },
    {
      code: "const background = 'rgba(26, 28, 28, 0.62)'",
      errors: [{ messageId: 'raw' }],
    },
    {
      code: 'const f = `color-mix(in srgb, ${a} 30%, transparent)`',
      errors: [{ messageId: 'raw' }],
    },
    {
      code: "const c = '#FFF'",
      errors: [{ messageId: 'raw' }],
    },
  ],
})
