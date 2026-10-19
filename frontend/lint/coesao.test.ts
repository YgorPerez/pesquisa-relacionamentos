import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import coesao from './coesao.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('coesao/h1-do-dono', coesao.rules['h1-do-dono'], {
  valid: [
    '<Display>Os estudos</Display>',
    '<h2 className="x">Seção</h2>',
    // O componente da página, e não o elemento.
    '<Pagina.h1 />',
  ],
  invalid: [
    {
      code: '<h1 className="display">Os estudos</h1>',
      errors: [{ messageId: 'doDono' }],
    },
  ],
})

tester.run('coesao/reticula-do-dono', coesao.rules['reticula-do-dono'], {
  valid: [
    '<Painel className="mt-lg" />',
    // `fundo-reticula` e `reticula-x` são outras classes.
    '<i className="fundo-reticula" />',
    '<p>a retícula do fundo</p>',
  ],
  invalid: [
    {
      code: '<div className="reticula rounded-mao" />',
      errors: [{ messageId: 'doDono' }],
    },
    {
      code: 'const c = `bg-folha data-escolhida:reticula`',
      errors: [{ messageId: 'doDono' }],
    },
  ],
})

tester.run('coesao/icone-a-mao', coesao.rules['icone-a-mao'], {
  valid: ["import { Link } from '@tanstack/react-router'"],
  invalid: [
    {
      code: "import { ArrowRight } from 'lucide-react'",
      errors: [{ messageId: 'aMao' }],
    },
    {
      code: "import { CheckIcon } from '@heroicons/react/24/solid'",
      errors: [{ messageId: 'aMao' }],
    },
  ],
})
