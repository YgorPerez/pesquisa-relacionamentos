// The relation diagram on the fixture Question, in jsdom (ADR 0035): two
// associations and one inference of ours. The drawing is hidden from screen
// readers; the list under it says each arrow, what backs it and its Fact
// sheets.
import { screen, within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { VISUAL_COPY } from './visual.copy'

it('says each arrow in words, with what backs it and the Fact sheets', async () => {
  openScreen('/onde-conhecer-pessoas/app-ou-presencial')
  const figure = await screen.findByRole('figure', {
    name: 'O app, o encontro e a satisfação',
  })
  const arrows = within(figure).getAllByRole('listitem')
  expect(arrows.map((a) => a.textContent?.replace(/[\d]+$/, ''))).toEqual([
    `Usar app de namoro → Conhecer o parceiro (${VISUAL_COPY.evidence.association}): Quase um em cada cinco adultos jovens conheceu o parceiro por app.`,
    `Conhecer o parceiro → Satisfação no casamento (${VISUAL_COPY.evidence.association}): O lugar onde o casal se conheceu quase não muda a satisfação.`,
    `Usar app de namoro → Satisfação no casamento (${VISUAL_COPY.evidence.inference}): Se o lugar quase não muda a satisfação, o app não deixa a relação pior.`,
  ])
  expect(
    within(arrows[2]!).getAllByRole('link', { name: /^Ficha/ }),
  ).toHaveLength(2)
  expect(figure.querySelector('[data-slot="diagrama"]')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
})
