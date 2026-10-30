// A Study table whose numbers mix units, on the fixture Guide, in jsdom
// (ADR 0035): each row is a Study, with its place, year, sample and design
// from the Fact sheet, next to the number it found. A tap on the number
// opens the same detail as a chart's mark; the Guide's country lights its
// rows; the saved Profile tags the Studies that cover it.
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vite-plus/test'
import { openVisual } from '#/platform/screens/visual'
import { saveProfile } from '#/state/profile'

afterEach(() => saveProfile(null))

const TITLE = 'Os dois estudos lado a lado'

const studyRows = (table: HTMLElement) =>
  within(table).getAllByRole('row').slice(1)

it('shows one row per Study, its context taken from the Fact sheet, and its result', async () => {
  const table = await openVisual(TITLE, 'table')
  expect(
    studyRows(table).map((row) => [
      within(row)
        .getByRole('rowheader')
        .textContent?.replace(/\d+(?=Brasil|EUA)/, ''),
      within(row).getByRole('cell').textContent,
    ]),
  ).toEqual([
    [
      'Silva e Souza (2020): apps de namoro no BrasilBrasil · 2019 · 2.400 pessoas · transversalConheceram o parceiro por app',
      '18%',
    ],
    [
      'Costa (2018): satisfação e onde os casais se conheceramEUA · 2017 · transversalDiferença de satisfação, online vs. presencial',
      '0,1 ponto',
    ],
  ])
})

const card = () =>
  document.querySelector<HTMLElement>('[data-slot="detalhe-do-grafico"]')

it('pins the exact value, the country and the Fact sheet on a tap of the number, and closes it', async () => {
  const user = userEvent.setup()
  const table = await openVisual(TITLE, 'table')
  const [, costa] = studyRows(table)
  const number = within(costa!).getByRole('button', { name: /0,1 ponto/ })
  expect(number).toHaveAttribute('aria-expanded', 'false')
  await user.click(number)
  expect(number).toHaveAttribute('aria-expanded', 'true')
  const inCard = within(card()!)
  inCard.getByText('Diferença de satisfação, online vs. presencial')
  inCard.getByText('EUA')
  expect(
    inCard.getByRole('link', { name: /Abrir Ficha: Costa/ }),
  ).toHaveAttribute('href', '/estudos/costa-2018-satisfacao')
  await user.click(inCard.getByRole('button', { name: 'Fechar' }))
  expect(card()).toBeNull()
  expect(number).toHaveAttribute('aria-expanded', 'false')
})

it('shows the card on hover without its buttons, and lights the row', async () => {
  const user = userEvent.setup()
  const table = await openVisual(TITLE, 'table')
  const [silva, costa] = studyRows(table)
  await user.hover(costa!)
  within(card()!).getByText('0,1 ponto')
  expect(within(card()!).queryByRole('button')).toBeNull()
  expect(within(card()!).queryByRole('link')).toBeNull()
  expect(silva).toHaveAttribute('data-apagada')
  expect(costa).not.toHaveAttribute('data-apagada')
  await user.unhover(costa!)
  expect(card()).toBeNull()
  expect(silva).not.toHaveAttribute('data-apagada')
})

it('pins from anywhere on the row, and the same row unpins', async () => {
  const user = userEvent.setup()
  const table = await openVisual(TITLE, 'table')
  const [, costa] = studyRows(table)
  const context = within(costa!).getByText(/transversal/)
  await user.click(context)
  within(card()!).getByRole('button', { name: 'Fechar' })
  await user.click(context)
  expect(card()).toBeNull()
})

it('closes a pinned card with Esc and with a click outside', async () => {
  const user = userEvent.setup()
  const table = await openVisual(TITLE, 'table')
  const [, costa] = studyRows(table)
  await user.click(within(costa!).getByRole('button', { name: /0,1 ponto/ }))
  await user.keyboard('{Escape}')
  expect(card()).toBeNull()
  await user.click(within(costa!).getByRole('button', { name: /0,1 ponto/ }))
  await user.click(document.body)
  expect(card()).toBeNull()
})

it('pins a number with Enter, and Tab goes into the card', async () => {
  const user = userEvent.setup()
  const table = await openVisual(TITLE, 'table')
  const [, costa] = studyRows(table)
  const number = within(costa!).getByRole('button', { name: /0,1 ponto/ })
  number.focus()
  await user.keyboard('{Enter}')
  const link = within(card()!).getByRole('link')
  await user.keyboard('{Tab}')
  expect(link).toHaveFocus()
})

it('dims the rows of other countries when the link picks one the table has', async () => {
  const table = await openVisual(TITLE, 'table', '?pais=eua')
  const [silva, costa] = studyRows(table)
  expect(silva).toHaveAttribute('data-apagada')
  expect(costa).not.toHaveAttribute('data-apagada')
})

it('tags "você" on the Studies that cover the saved Profile', async () => {
  saveProfile({ gender: 'homem', seeks: 'homens', age: 30 })
  const table = await openVisual(TITLE, 'table')
  const [silva, costa] = studyRows(table)
  // Silva covers 18 to 35; Costa only couples of different sexes.
  await within(silva!).findByText('você')
  expect(within(costa!).queryByText('você')).toBeNull()
})
