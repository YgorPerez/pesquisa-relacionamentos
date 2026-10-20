import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import html from './no-native-title.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('html/no-native-title', html.rules['no-native-title'], {
  valid: [
    // A component prop.
    '<Cartao title="Do Guia" />',
    '<Page.Section title="x" />',
    // The embedded content's accessible name.
    '<iframe title="O mapa" src="/m" />',
    // The SVG <title> element is not an attribute.
    '<svg><title>Seta</title></svg>',
    '<span aria-label="nota">?</span>',
  ],
  invalid: [
    {
      code: '<span title="lido no original">✓</span>',
      errors: [{ messageId: 'onTouch' }],
    },
    {
      code: '<abbr title="Pesquisa Nacional de Saúde">PNS</abbr>',
      errors: [{ messageId: 'onTouch' }],
    },
  ],
})
