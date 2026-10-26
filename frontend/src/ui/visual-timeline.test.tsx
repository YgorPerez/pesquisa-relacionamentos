// The time line on the fixture Question, in jsdom (ADR 0035): two findings,
// 2017 in the USA and 2019 in Brazil. The axis is a drawing; the list under
// it carries the words and the Fact sheets.
import { screen, within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'

it('lists each point in year order, with what it measured, its number and its Fact sheet', async () => {
  openScreen('/onde-conhecer-pessoas')
  const figure = await screen.findByRole('figure', {
    name: 'Dois retratos, dois países',
  })
  const points = within(figure).getAllByRole('listitem')
  expect(points.map((p) => p.textContent?.replace(/\d+$/, ''))).toEqual([
    '2017 · Nos EUA, diferença de satisfação entre online e presencial: 0,1 ponto',
    '2019 · No Brasil, conheceram o parceiro por app: 18%',
  ])
  expect(
    within(points[0]!).getByRole('link', {
      name: /^Ficha \d+: Costa \(2018\)/,
    }),
  ).toBeInTheDocument()
})
