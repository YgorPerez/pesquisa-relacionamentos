// The Verbetes (#351) in jsdom (ADR 0035), over the fixture content: the
// fixture marks "satisfação", which varies by Study, in the Guide and in
// Costa's Fact sheet, which defines it; Silva's Fact sheet is of the
// Instituto Exemplo. The look of the underline and the popover's place on
// the screen are the stories'.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import {
  EACH_STUDY,
  IN_STUDY,
  SEE_IN_GLOSSARY,
  STUDIES_OF,
  termLabel,
} from './term-popover.copy'

const COSTA = 'Costa (2018): satisfação e onde os casais se conheceram'
const SILVA = 'Silva e Souza (2020): apps de namoro no Brasil'
const GENERAL = 'Quanto a pessoa diz gostar da relação.'
const COSTA_DEFINITION = 'Uma nota de 1 a 7 que cada cônjuge deu ao casamento.'

/** Opens `page` and taps its first marked "satisfação". */
async function tapSatisfaction(page: string) {
  const user = userEvent.setup()
  openScreen(page)
  await screen.findByRole('heading', { level: 1 })
  const [word] = screen.getAllByRole('link', { name: 'satisfação' })
  // Without JS, the word leads to its entry.
  expect(word).toHaveAttribute('href', '/glossario#satisfacao')
  await user.click(word!)
  return within(
    await screen.findByRole('dialog', { name: termLabel('satisfação') }),
  )
}

it("opens, in a Guide, the general definition and how the sentence's Study defined it", async () => {
  const popover = await tapSatisfaction('/onde-conhecer-pessoas')
  expect(popover.getByText(GENERAL, { exact: false })).toBeVisible()
  expect(popover.getByText(IN_STUDY.one)).toBeVisible()
  expect(popover.getByRole('link', { name: COSTA })).toHaveAttribute(
    'href',
    '/estudos/costa-2018-satisfacao',
  )
  expect(popover.getByText(COSTA_DEFINITION)).toBeVisible()
  expect(popover.getByRole('link', { name: SEE_IN_GLOSSARY })).toHaveAttribute(
    'href',
    '/glossario#satisfacao',
  )
})

it('opens, on a Fact sheet, the definition of that Study', async () => {
  const popover = await tapSatisfaction('/estudos/costa-2018-satisfacao')
  expect(popover.getByText(IN_STUDY.one)).toBeVisible()
  expect(popover.getByText(COSTA_DEFINITION)).toBeVisible()
})

it('lists every Verbete in the Glossário, with each Study’s definition and an institution’s Studies', async () => {
  openScreen('/glossario')
  await screen.findByRole('heading', { level: 1, name: 'Glossário' })
  const entries = screen
    .getAllByRole('region')
    .filter((r) => r.dataset['slot'] === 'verbete-glossario')
  expect(entries.map((e) => e.id)).toEqual(['instituto-exemplo', 'satisfacao'])
  const [institute, satisfaction] = entries.map((e) => within(e))
  expect(institute!.getByText(STUDIES_OF)).toBeVisible()
  expect(institute!.getByRole('link', { name: SILVA })).toHaveAttribute(
    'href',
    '/estudos/silva-2020-apps-brasil',
  )
  expect(satisfaction!.getByText(EACH_STUDY)).toBeVisible()
  expect(satisfaction!.getByText(COSTA_DEFINITION)).toBeVisible()
})
