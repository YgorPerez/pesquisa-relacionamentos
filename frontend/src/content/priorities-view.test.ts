// The Priorities view over the e2e fixture content: ten traits citing Silva
// 2020 (✅) and Costa 2018 (🟡), and the B1 Guide that hosts the calculator.
import { resolve } from 'node:path'
import { loadLibrary } from '@tem-estudo/content'
import { describe, expect, it } from 'vite-plus/test'
import { buildPrioritiesView } from './priorities-view'

const result = loadLibrary(resolve(import.meta.dirname, '../../e2e/library'))
if (!result.ok) throw new Error('invalid e2e fixture')
const { library } = result

describe('vistaDasPrioridades', () => {
  it('brings each cell with the Fact sheet summarized: short name, Status, Strength and sample', () => {
    const view = buildPrioritiesView(library)
    const looks = view?.traits.find((c) => c.id === 'aparencia')
    expect(looks?.satisfacao).toEqual({
      degrau: 2,
      measure: 'r = 0,10, só maridos',
      text: 'Só os maridos ficam um pouco mais satisfeitos, e só no começo.',
      factSheet: {
        slug: 'costa-2018-satisfacao',
        name: 'Costa (2018)',
        status: 'parcial',
        strength: 'moderada',
        sample: 'Casais casados recrutados online.',
      },
    })
    expect(looks?.duracao).toEqual({
      degrau: 0,
      measure: null,
      text: 'Nenhum estudo lido mede isso.',
      factSheet: null,
    })
  })

  it('brings the satisfaction bar and the Guide that hosts the calculator', () => {
    const view = buildPrioritiesView(library)
    expect(view?.bar).toMatchObject({
      relationship: 45,
      partner: 5,
      unexplained: 50,
      factSheet: { slug: 'silva-2020-apps-brasil' },
    })
    expect(view?.fromGuide).toEqual({
      topic: 'escolher-parceiro',
      slug: 'que-caracteristicas-preveem',
      question: 'Que características do parceiro preveem uma boa relação?',
      confidence: 'moderada',
      answer:
        'Como vocês se tratam pesa mais que a lista de qualidades do parceiro.',
    })
  })

  it('without the Priorities file, there is no view', () => {
    expect(buildPrioritiesView({ ...library, priorities: null })).toBeNull()
  })
})
