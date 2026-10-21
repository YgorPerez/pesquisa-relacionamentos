// The partner's word follows its measured range: the page cannot say
// "quase nada" over a range that is not.
import { expect, it } from 'vite-plus/test'
import { barLabel, cardTop3Lead } from './priorities.copy'

it('says "quase nada" for the Joel 2020 range and "pouco" for a wider one', () => {
  expect(cardTop3Lead({ min: 0, max: 1.9 })).toBe(
    'Seu topo 3 cabe na fatia do parceiro, que soma quase nada (0% a 1,9%):',
  )
  expect(cardTop3Lead({ min: 5, max: 8 })).toBe(
    'Seu topo 3 cabe na fatia do parceiro, que soma pouco (5% a 8%):',
  )
  expect(
    barLabel({
      relationship: 40,
      unexplained: 60,
      partnerAdded: { baseline: { min: 5, max: 8 } },
    }),
  ).toBe(
    'Satisfação: 40% explicado pela relação, pouco a mais pelo parceiro (5% a 8%), 60% sem explicação',
  )
})
