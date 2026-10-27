// The table of Studies on the fixture Question, in jsdom (ADR 0035): each
// row is a Study, with its place, year, sample and design from the Fact
// sheet, next to the number it found.
import { within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { openVisual } from '#/platform/screens/visual'

it('shows one row per Study, its context taken from the Fact sheet, and its result', async () => {
  const table = await openVisual('Os dois estudos lado a lado', 'table')
  const [, ...rows] = within(table).getAllByRole('row')
  expect(
    rows.map((row) => [
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
