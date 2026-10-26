// The Readings in jsdom (ADR 0035), over the fixture's Neighbor sites
// (`e2e/library/data/neighbor-sites.yaml`, through `readings.example.ts`):
// three Readings of "Onde conhecer pessoas", the English one first in the
// file. The Guide's block is in `guide-sections.test.tsx`; the grouping of
// the page, in `content/neighbor-sites-view.test.ts`; the page without
// JavaScript and the counted click, in the e2e (`e2e/neighbor-sites.e2e.ts`,
// `e2e/analytics.e2e.ts`).
import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { READINGS } from './readings.example'
import { ReadingList } from './readings'
import { NEW_TAB, NOTICE_TAG } from './readings.copy'

const items = () =>
  within(screen.getAllByRole('list')[0]!)
    .getAllByRole('listitem')
    .filter((item) => item.dataset['slot'] === 'leitura-vizinha')

it('lists the Readings Portuguese first, each title opening its page in another tab', () => {
  render(<ReadingList readings={READINGS} />)
  const titles = items().map((item) => within(item).getByRole('link'))
  expect(titles.map((link) => link.textContent)).toEqual([
    `Onde os brasileiros se conhecem ${NEW_TAB}`,
    `Conversa de primeiro encontro ${NEW_TAB}`,
    `How couples meet now ${NEW_TAB}`,
  ])
  for (const link of titles) {
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')
  }
  expect(titles[2]).toHaveAttribute(
    'href',
    'https://family-lab.example/how-couples-meet',
  )
})

it("shows each Reading's site, its line and its notices: its own, and its site's on every one of the site's Readings", () => {
  render(<ReadingList readings={READINGS} />)
  const [withNotice, withCaveat, english] = items()
  expect(withNotice).toHaveTextContent('Revista Daqui')
  expect(withNotice).not.toHaveTextContent('em inglês')
  expect(withNotice).toHaveTextContent(
    'Uma reportagem que junta os estudos brasileiros',
  )
  expect(withNotice).toHaveTextContent(
    `${NOTICE_TAG.commercial}A autora vende um curso sobre namoro.`,
  )
  expect(withCaveat).toHaveTextContent(
    `${NOTICE_TAG.caveat}O estudo achou um efeito menor do que a reportagem diz.`,
  )
  expect(withCaveat).not.toHaveTextContent(NOTICE_TAG.commercial)
  expect(english).toHaveTextContent('Family Lab · em inglês')
  expect(english).toHaveTextContent(
    `${NOTICE_TAG.cause}O Family Lab defende o casamento.`,
  )
})
