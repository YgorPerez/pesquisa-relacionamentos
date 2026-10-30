// "De onde vem isso?" in the popover on selected text (#336), in jsdom (ADR
// 0035) over the fixture content: the Fact sheets the selected sentences
// cite, and what a sentence with no citation shows. The count is the e2e's
// (`e2e/selection.e2e.ts`).
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { ACTION_LABEL, POPOVER_LABEL } from './selection-popover.copy'
import {
  CITES,
  CITES_NONE,
  NEARBY,
  NEARBY_OTHERS,
} from './selection-source.copy'

/** The first text node that has `text`, from `after` on (itself included,
 * when it is a text node). */
function textNode(text: string, after: Node = document.body): Text {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  walker.currentNode = after
  for (
    let node = after instanceof Text ? after : walker.nextNode();
    node;
    node = walker.nextNode()
  )
    if (node.textContent?.includes(text)) return node as Text
  throw new Error(`no text node with “${text}”`)
}

/** Selects from the start of `from` to the end of the next `to`, as a
 * keyboard selection does; `inside` is a selector of where `from` is, when
 * it is also earlier on the page. */
function select(from: string, to: string = from, inside?: string) {
  const start = textNode(
    from,
    inside === undefined ? undefined : document.querySelector(inside)!,
  )
  const end = textNode(to, start)
  const range = document.createRange()
  range.setStart(start, start.data.indexOf(from))
  range.setEnd(end, end.data.indexOf(to) + to.length)
  const selection = document.getSelection()!
  selection.removeAllRanges()
  selection.addRange(range)
}

const SILVA = 'Silva e Souza (2020): apps de namoro no Brasil'
const COSTA = 'Costa (2018): satisfação e onde os casais se conheceram'

/** Opens `page`, selects from `from` to `to` and asks where it comes from:
 * the panel, as the reader sees it. */
async function whereFrom(
  page: string,
  from: string,
  to?: string,
  inside?: string,
) {
  const user = userEvent.setup()
  openScreen(page)
  await screen.findByRole('heading', { level: 1 })
  select(from, to, inside)
  const popover = within(
    await screen.findByRole('dialog', { name: POPOVER_LABEL }),
  )
  await user.click(popover.getByRole('button', { name: ACTION_LABEL.source }))
  const panel = await popover.findByRole('status')
  return Object.assign(within(panel), { panel })
}

/** The Fact sheet links of the panel, by their titles. */
const titles = (panel: { queryAllByRole: (role: 'link') => HTMLElement[] }) =>
  panel.queryAllByRole('link').map((link) => link.textContent)

it('a cited sentence lists exactly its Fact sheets, each with its Status and Strength, linking to its page', async () => {
  const panel = await whereFrom(
    '/onde-conhecer-pessoas',
    'A satisfação de quem',
    'perto',
  )
  expect(titles(panel)).toEqual([COSTA])
  expect(panel.getByRole('link', { name: COSTA })).toHaveAttribute(
    'href',
    '/estudos/costa-2018-satisfacao',
  )
  expect(panel.getByText('parcial')).toBeVisible()
  expect(panel.getByText('moderada')).toBeVisible()
  expect(panel.queryByText(/não cita/)).toBeNull()
})

it('a sentence with no citation says so and lists the Fact sheets of its Chapter, not the ring of the sentence after it', async () => {
  // The next sentence cites only Silva; the Chapter cites both.
  const panel = await whereFrom(
    '/escolher-parceiro',
    'Nenhum estudo brasileiro mediu isso',
  )
  expect(panel.panel).toHaveTextContent(`${CITES_NONE.one} ${NEARBY.chapter}`)
  expect(panel.queryByText(CITES.one)).toBeNull()
  expect(titles(panel)).toEqual([COSTA, SILVA])
})

it('a selection across two cited sentences lists both sets, once each', async () => {
  const answer = await whereFrom(
    '/onde-conhecer-pessoas',
    'conheceram o parceiro',
    'junta muitos',
    '#onde-os-casais-se-conhecem',
  )
  expect(answer.getByText(CITES.many)).toBeVisible()
  expect(titles(answer)).toEqual([SILVA, COSTA])
  cleanup()

  // Both sentences cite Silva.
  const prose = await whereFrom(
    '/onde-conhecer-pessoas',
    'Entre adultos jovens',
    'sobe para',
  )
  expect(titles(prose)).toEqual([SILVA])
})

it('a selection with a cited sentence and one that cites nothing lists the citation, then the other Fact sheets of the Chapter', async () => {
  const panel = await whereFrom(
    '/onde-conhecer-pessoas',
    'Depende de quem',
    'pequena',
    '#app-ou-presencial',
  )
  const [cited, others] = panel.getAllByRole('list')
  expect(panel.getByText(CITES.some)).toBeVisible()
  expect(titles(within(cited!))).toEqual([COSTA])
  expect(panel.panel).toHaveTextContent(
    `${CITES_NONE.some} ${NEARBY_OTHERS.chapter}`,
  )
  expect(titles(within(others!))).toEqual([SILVA])
})

it.each([
  [
    'outside a Chapter, the Guide',
    '/onde-conhecer-pessoas',
    'Nenhum estudo separou',
    NEARBY.guide,
    [SILVA, COSTA],
  ],
  [
    'on a Tip, the Tip',
    '/dicas/apps-como-complemento',
    'como complemento',
    NEARBY.tip,
    [SILVA, COSTA],
  ],
  [
    'on a Fact sheet, the Fact sheet',
    '/estudos/costa-2018-satisfacao',
    'Só o resumo foi lido',
    NEARBY['fact-sheet'],
    [COSTA],
  ],
])(
  'a sentence with no citation %s lists the Fact sheets of the page',
  async (_, page, text, label, expected) => {
    const panel = await whereFrom(page, text)
    expect(panel.panel).toHaveTextContent(`${CITES_NONE.one} ${label}`)
    expect(titles(panel)).toEqual(expected)
  },
)

it("a Visual's label rests on the rings of its figure", async () => {
  // The diagram's: a chart the library draws (#470) has its words in the
  // SVG, which is not quotable text.
  const panel = await whereFrom(
    '/onde-conhecer-pessoas',
    'O lugar onde o casal',
  )
  expect(panel.getByText(CITES.one)).toBeVisible()
  expect(titles(panel)).toEqual([SILVA, COSTA])
})
