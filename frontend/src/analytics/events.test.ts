import { describe, expect, test } from 'vite-plus/test'
import { EVENTS } from './events'

// The names are what the GoatCounter dashboard shows (#21): changing one
// breaks the series already there.
describe('EVENTS', () => {
  test('each event goes out with the name the dashboard knows', () => {
    expect(EVENTS.helpedYes('onde-os-casais-se-conhecem')).toBe(
      'helped/yes/onde-os-casais-se-conhecem',
    )
    expect(EVENTS.helpedNo('do-not-trust', 'app-ou-presencial')).toBe(
      'helped/no/do-not-trust/app-ou-presencial',
    )
    expect(EVENTS.factSheetOpened('app-ou-presencial', 'rosenfeld-2019')).toBe(
      'fact-sheet/app-ou-presencial/rosenfeld-2019',
    )
    expect(EVENTS.calculator('grupo-possivel')).toBe(
      'calculator/possible-group',
    )
    expect(EVENTS.calculator('prioridades')).toBe('calculator/priorities')
    expect(EVENTS.continueReading('onde-conhecer-pessoas')).toBe(
      'continue-reading/onde-conhecer-pessoas',
    )
    expect(EVENTS.neighborSite('pew')).toBe('neighbor-site/pew')
    expect(EVENTS.selection('copy')).toBe('selection/copy')
    expect(EVENTS.selection('link')).toBe('selection/link')
    expect(EVENTS.chartCard('visual-app-ou-presencial-idade')).toBe(
      'chart-card/visual-app-ou-presencial-idade',
    )
  })
})
