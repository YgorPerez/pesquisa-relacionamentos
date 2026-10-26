// The bar comparison on the fixture Question, in jsdom (ADR 0035):
// `app-ou-presencial` compares the share of young Brazilians who met
// their partner through an app, by age, with an own calculation for the
// rest. The SVG is drawn on the server (`content/visuals-view.test.ts`);
// here, what the reader and a screen reader get from it.
import { screen, within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { VISUAL_COPY } from './visual.copy'

/** The Guide whose `app-ou-presencial` section has the Visuals. */
const QUESTION = '/onde-conhecer-pessoas'

it('reads each bar as its label and its number, and tags our own calculation', async () => {
  openScreen(QUESTION)
  const figure = await screen.findByRole('figure', {
    name: 'Quem conheceu o parceiro por app, no Brasil',
  })
  const bars = within(figure)
    .getAllByRole('listitem')
    .map((bar) => bar.textContent)
  expect(bars).toEqual([
    '18 a 35 anos18%',
    '18 a 24 anos24%',
    `Por outro caminho (18 a 35 anos)${VISUAL_COPY.own}82%`,
  ])
  expect(figure).toHaveTextContent(
    VISUAL_COPY.ownLine('Por outro caminho (18 a 35 anos)', '100 − 18', '82%'),
  )
  expect(figure).toHaveTextContent('entre os mais novos, a fatia sobe')
})

it("leads from the sources line to the Fact sheet in the page's list", async () => {
  openScreen(QUESTION)
  const figure = await screen.findByRole('figure', {
    name: 'Quem conheceu o parceiro por app, no Brasil',
  })
  const [reference] = within(figure).getAllByRole('link', {
    name: /^Ficha \d+: Silva e Souza \(2020\)/,
  })
  const target = document.getElementById(
    reference!.getAttribute('href')!.replace(/^#/, ''),
  )
  expect(
    within(screen.getByRole('region', { name: 'Fichas citadas' }))
      .getAllByRole('listitem')
      .includes(target!.closest('li')!),
  ).toBe(true)
})
