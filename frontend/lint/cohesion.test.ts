import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import cohesion from './cohesion.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('cohesion/h1-owner', cohesion.rules['h1-owner'], {
  valid: [
    '<Display>Os estudos</Display>',
    '<h2 className="x">Seção</h2>',
    // The page's component, not the element.
    '<Page.h1 />',
  ],
  invalid: [
    {
      code: '<h1 className="display">Os estudos</h1>',
      errors: [{ messageId: 'owner' }],
    },
  ],
})

tester.run('cohesion/halftone-owner', cohesion.rules['halftone-owner'], {
  valid: [
    '<Painel className="mt-lg" />',
    // `fundo-reticula` and `reticula-x` are other classes.
    '<i className="fundo-reticula" />',
    '<p>a retícula do fundo</p>',
  ],
  invalid: [
    {
      code: '<div className="reticula rounded-mao" />',
      errors: [{ messageId: 'owner' }],
    },
    {
      code: 'const c = `bg-folha data-escolhida:reticula`',
      errors: [{ messageId: 'owner' }],
    },
  ],
})

tester.run('cohesion/hand-drawn-icons', cohesion.rules['hand-drawn-icons'], {
  valid: ["import { Link } from '@tanstack/react-router'"],
  invalid: [
    {
      code: "import { ArrowRight } from 'lucide-react'",
      errors: [{ messageId: 'handDrawn' }],
    },
    {
      code: "import { CheckIcon } from '@heroicons/react/24/solid'",
      errors: [{ messageId: 'handDrawn' }],
    },
  ],
})
