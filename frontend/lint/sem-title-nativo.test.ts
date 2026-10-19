import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import html from './sem-title-nativo.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('html/sem-title-nativo', html.rules['sem-title-nativo'], {
  valid: [
    // A prop de um componente.
    '<Cartao title="Do Guia" />',
    '<Pagina.Secao title="x" />',
    // O nome acessível do conteúdo embutido.
    '<iframe title="O mapa" src="/m" />',
    // O elemento <title> do SVG não é atributo.
    '<svg><title>Seta</title></svg>',
    '<span aria-label="nota">?</span>',
  ],
  invalid: [
    {
      code: '<span title="lido no original">✓</span>',
      errors: [{ messageId: 'noToque' }],
    },
    {
      code: '<abbr title="Pesquisa Nacional de Saúde">PNS</abbr>',
      errors: [{ messageId: 'noToque' }],
    },
  ],
})
