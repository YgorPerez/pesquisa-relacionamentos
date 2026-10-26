// Where a Fact sheet is cited, over the e2e fixture content: Silva 2020
// appears in the three Questions (in app-ou-presencial through the Tip, in
// que-caracteristicas-preveem in "E no Brasil?") and in the published Tip;
// Lima 2015 only in a ⬜ Tip, which does not go live.
import { resolve } from 'node:path'
import { loadLibrary } from '@tem-estudo/content'
import { describe, expect, it } from 'vite-plus/test'
import { citedIn } from './guide-view'

const result = loadLibrary(resolve(import.meta.dirname, '../../e2e/library'))
if (!result.ok) throw new Error('invalid e2e fixture')
const { library } = result

describe('citadaEm', () => {
  it('lists the Questions that cite the Fact sheet, also through Tips, in site order', () => {
    const { questions } = citedIn('silva-2020-apps-brasil', library)
    expect(questions.map((g) => g.slug)).toEqual([
      'onde-os-casais-se-conhecem',
      'app-ou-presencial',
      'que-caracteristicas-preveem',
    ])
    expect(questions[0]?.question).toBe('Onde os casais se conhecem hoje?')
  })

  it('lists only the published Tips', () => {
    expect(
      citedIn('costa-2018-satisfacao', library).tips.map((d) => d.slug),
    ).toEqual(['apps-como-complemento'])
    expect(citedIn('lima-2015-encontros', library)).toEqual({
      questions: [],
      tips: [],
    })
  })
})
