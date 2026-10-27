// Grifar and the Nota (#334) in jsdom (ADR 0035), over the fixture content:
// the paint, what survives a reload, the Nota, "Tirar grifo" and the Grifo
// whose quote left the page; then `/grifos` (#335), at the end. One file for
// both keeps `open-screen.tsx` under before-merge's fan-in limit. jsdom has neither the CSS Custom Highlight API
// nor layout, so the test gives it a registry of painted ranges and a box
// for each painted range; the paint itself, in a real Chrome, is the e2e's
// (`e2e/highlight.e2e.ts`).
import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import type { Highlight } from '#/state/highlights'
import {
  ADD_NOTE,
  DELETE_NOTE,
  EDIT_NOTE,
  HIGHLIGHT_LABEL,
  NOTE_FIELD,
  NOTE_HEADING,
  REMOVE_HIGHLIGHT,
  SAVE_NOTE,
  SEE_HIGHLIGHT,
} from './highlight.copy'
import {
  ALL_HIGHLIGHTS,
  CHANGED,
  EMPTY_HEADING,
  removeLabel,
  saved,
} from './highlight-list.copy'
import { ACTION_LABEL, POPOVER_LABEL } from './selection-popover.copy'

const GUIDE = '/onde-conhecer-pessoas'
const SECTION = 'o-lugar-quase-nao-muda-a-relacao'
const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto'
const KEY = 'tem-estudo:highlights'

/** Where a tap lands on a painted Grifo: jsdom has no layout, so each painted
 * range is drawn in this box. */
const TAP = { clientX: 5, clientY: 5 }

class FakeHighlight extends Set<Range> {
  constructor(...ranges: Range[]) {
    super(ranges)
  }
}

beforeEach(() => {
  const highlights = new Map<string, FakeHighlight>()
  vi.stubGlobal('Highlight', FakeHighlight)
  vi.stubGlobal('CSS', { highlights })
  // jsdom's Range has no `getClientRects` at all.
  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    value(this: Range) {
      const drawn = [...(highlights.get('grifo') ?? [])].includes(this)
      return drawn ? [new DOMRect(0, 0, 10, 10)] : []
    },
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(Range.prototype, 'getClientRects')
})

/** The ranges painted as Grifos. */
const paintedRanges = (): Range[] => [
  ...((CSS.highlights.get('grifo') as unknown as Set<Range> | undefined) ?? []),
]

/** The painted text of each Grifo's parts, joined. */
const paintedText = () =>
  paintedRanges()
    .map((range) => range.toString())
    .join('')

const savedHighlights = (): Highlight[] =>
  JSON.parse(localStorage.getItem(KEY) ?? '[]') as Highlight[]

/** The first text node that has `text`, from `after` on. */
function textNode(text: string, after?: Node): Text {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  if (after) walker.currentNode = after
  for (
    let node = after ? after : walker.nextNode();
    node;
    node = walker.nextNode()
  )
    if (node.textContent?.includes(text)) return node as Text
  throw new Error(`no text node with “${text}”`)
}

/** Selects from `from` to the end of `to` in the Chapter's sentence, as a
 * keyboard does. `skip` skips that many earlier `from`s in the node. */
function select(from: string, to: string = from, skip = 0) {
  const start = textNode(SENTENCE.slice(0, 20))
  let at = -1
  for (let i = 0; i <= skip; i++) at = start.data.indexOf(from, at + 1)
  const end = textNode(to, start)
  const range = document.createRange()
  range.setStart(start, at)
  range.setEnd(end, end.data.indexOf(to, start === end ? at : 0) + to.length)
  document.getSelection()!.removeAllRanges()
  document.getSelection()!.addRange(range)
}

const selectionPopover = () =>
  screen.findByRole('dialog', { name: POPOVER_LABEL })
const grifoPopover = () =>
  screen.findByRole('dialog', { name: HIGHLIGHT_LABEL })

async function openGuide() {
  openScreen(GUIDE)
  await screen.findByRole('heading', { level: 1 })
}

/** Selects and clicks "Grifar"; the Grifo's popover opens. */
async function highlight(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    within(await selectionPopover()).getByRole('button', {
      name: ACTION_LABEL.highlight,
    }),
  )
  return grifoPopover()
}

/** A tap on the painted Grifo. */
const tapGrifo = (user: ReturnType<typeof userEvent.setup>) =>
  user.pointer({
    keys: '[MouseLeft]',
    target: textNode(SENTENCE.slice(0, 20)).parentElement!,
    coords: TAP,
  })

const reload = async () => {
  cleanup()
  await openGuide()
}

it('Grifar paints the selection, and the paint comes back after a reload', async () => {
  const user = userEvent.setup()
  await openGuide()
  select('A satisfação de quem', 'perto')
  await highlight(user)
  expect(paintedText()).toBe(SENTENCE)
  expect(document.getSelection()!.isCollapsed).toBe(true)

  await reload()
  await waitFor(() => expect(paintedText()).toBe(SENTENCE))
  const [saved] = savedHighlights()
  expect(saved).toMatchObject({
    path: GUIDE,
    text: SENTENCE,
    changed: false,
    note: '',
  })
  expect(saved!.link).toBe(
    `${GUIDE}#${SECTION}:~:text=A%20satisfa%C3%A7%C3%A3o%20de%20quem,conheceu%20pessoalmente%20fica%20perto`,
  )
})

it("the Grifo's popover leads to the list of every Grifo", async () => {
  const user = userEvent.setup()
  await openGuide()
  select('A satisfação de quem', 'perto')
  const popover = await highlight(user)
  await user.click(within(popover).getByRole('link', { name: ALL_HIGHLIGHTS }))
  expect(
    await screen.findByRole('heading', { name: saved(1, 1) }),
  ).toBeInTheDocument()
})

it('a repeated phrase comes back where it was made, and not on its first copy', async () => {
  const user = userEvent.setup()
  await openGuide()
  // "de quem se conheceu" twice in the sentence: the second one.
  select('de quem se conheceu', 'de quem se conheceu', 1)
  await highlight(user)

  await reload()
  await waitFor(() => expect(paintedText()).toBe('de quem se conheceu'))
  const [range] = paintedRanges()
  const before = range!.startContainer.textContent!.slice(0, range!.startOffset)
  expect(before).toBe('A satisfação de quem se conheceu online e ')
  expect(
    range!.startContainer.parentElement!.closest('[data-quote]'),
  ).toHaveAttribute('data-quote', SECTION)
})

it('a Nota is written, edited and removed on the Grifo, and each survives a reload', async () => {
  const user = userEvent.setup()
  await openGuide()
  select('A satisfação de quem', 'perto')
  let popover = await highlight(user)

  await user.click(within(popover).getByRole('button', { name: ADD_NOTE }))
  await user.type(within(popover).getByLabelText(NOTE_FIELD), 'Ver o estudo')
  await user.click(within(popover).getByRole('button', { name: SAVE_NOTE }))
  expect(await within(popover).findByText('Ver o estudo')).toBeVisible()

  await reload()
  await waitFor(() => expect(paintedText()).toBe(SENTENCE))
  await tapGrifo(user)
  popover = await grifoPopover()
  expect(within(popover).getByText('Ver o estudo')).toBeVisible()
  await user.click(within(popover).getByRole('button', { name: EDIT_NOTE }))
  const field = within(popover).getByLabelText(NOTE_FIELD)
  await user.clear(field)
  await user.type(field, 'Ler de novo')
  await user.click(within(popover).getByRole('button', { name: SAVE_NOTE }))
  expect(await within(popover).findByText('Ler de novo')).toBeVisible()

  await reload()
  await waitFor(() => expect(paintedText()).toBe(SENTENCE))
  await tapGrifo(user)
  popover = await grifoPopover()
  expect(within(popover).getByText('Ler de novo')).toBeVisible()
  await user.click(within(popover).getByRole('button', { name: EDIT_NOTE }))
  await user.click(within(popover).getByRole('button', { name: DELETE_NOTE }))
  expect(
    await within(popover).findByRole('button', { name: ADD_NOTE }),
  ).toBeVisible()
  expect(within(popover).queryByText('Ler de novo')).toBeNull()

  await reload()
  await waitFor(() => expect(paintedText()).toBe(SENTENCE))
  expect(savedHighlights()[0]!.note).toBe('')
})

it('Tirar grifo takes the paint off and forgets the Grifo', async () => {
  const user = userEvent.setup()
  await openGuide()
  select('A satisfação de quem', 'perto')
  const popover = await highlight(user)
  await user.click(
    within(popover).getByRole('button', { name: REMOVE_HIGHLIGHT }),
  )
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: HIGHLIGHT_LABEL })).toBeNull(),
  )
  await waitFor(() => expect(paintedText()).toBe(''))
  expect(localStorage.getItem(KEY)).toBeNull()
})

it('a tap off the Grifo opens nothing, and a selection inside it offers Ver grifo', async () => {
  const user = userEvent.setup()
  await openGuide()
  select('A satisfação de quem', 'perto')
  await highlight(user)
  await user.keyboard('{Escape}')
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: HIGHLIGHT_LABEL })).toBeNull(),
  )

  await user.pointer({
    keys: '[MouseLeft]',
    target: screen.getByRole('heading', { level: 1 }),
    coords: { clientX: 50, clientY: 50 },
  })
  expect(screen.queryByRole('dialog', { name: HIGHLIGHT_LABEL })).toBeNull()

  // The keyboard's way in: select a word inside the Grifo.
  select('satisfação')
  const row = await selectionPopover()
  expect(
    within(row).queryByRole('button', { name: ACTION_LABEL.highlight }),
  ).toBeNull()
  await user.click(within(row).getByRole('button', { name: SEE_HIGHLIGHT }))
  expect(await grifoPopover()).toBeVisible()
})

it('a Grifo whose quote left the page is kept, marked changed and not painted; a Grifo of another page is left alone', async () => {
  const grifo = (id: string, path: string, exact: string): Highlight => ({
    id,
    path,
    pageTitle: 'Onde conhecer pessoas',
    link: path,
    text: exact,
    exact,
    prefix: '',
    suffix: '',
    note: 'minha nota',
    changed: false,
    at: 1,
  })
  localStorage.setItem(
    KEY,
    JSON.stringify([
      grifo('gone', GUIDE, 'uma frase que o Guia não tem mais'),
      grifo('elsewhere', '/dicas/apps-como-complemento', 'como complemento'),
      'junk from another version',
    ]),
  )
  await openGuide()
  await waitFor(() => expect(savedHighlights()[0]!.changed).toBe(true))
  expect(paintedText()).toBe('')
  expect(savedHighlights()).toMatchObject([
    { id: 'gone', changed: true, note: 'minha nota' },
    { id: 'elsewhere', changed: false },
  ])
})

it('without the CSS Custom Highlight API there is no Grifar', async () => {
  vi.stubGlobal('CSS', {})
  await openGuide()
  select('A satisfação de quem', 'perto')
  const row = await selectionPopover()
  expect(
    within(row).getByRole('button', { name: ACTION_LABEL.copy }),
  ).toBeVisible()
  expect(
    within(row).queryByRole('button', { name: ACTION_LABEL.highlight }),
  ).toBeNull()
})

// /grifos (#335): the list of every Grifo, seeded in the storage as Grifar
// and the page layer leave them. Landing on the sentence through the Text
// Fragment is the e2e one (`e2e/highlights.e2e.ts`).

let made = 0

function grifo(
  path: string,
  pageTitle: string,
  text: string,
  more: Partial<Highlight> = {},
): Highlight {
  made += 1
  return {
    id: `g${made}`,
    path,
    pageTitle,
    link: `${path}#secao:~:text=${encodeURIComponent(text)}`,
    text,
    exact: text,
    prefix: '',
    suffix: '',
    note: '',
    changed: false,
    at: made,
    ...more,
  }
}

const save = (...highlights: Highlight[]) =>
  localStorage.setItem(KEY, JSON.stringify(highlights))

const savedTexts = (): string[] =>
  (JSON.parse(localStorage.getItem(KEY) ?? '[]') as Highlight[]).map(
    (h) => h.text,
  )

const GUIDE_B = grifo(
  '/onde-conhecer-pessoas',
  'Onde conhecer pessoas',
  'A satisfação de quem se conheceu online',
  { note: 'Ver a amostra' },
)
const GUIDE_B_LATER = grifo(
  '/onde-conhecer-pessoas',
  'Onde conhecer pessoas',
  'fica perto',
)
const TIP = grifo(
  '/dicas/apps-como-complemento',
  'Use o app como complemento',
  'Use o app como complemento',
)
const FACT_SHEET = grifo(
  '/estudos/silva-2020-apps-brasil',
  'Silva 2020',
  'Uma amostra de usuários de aplicativos',
)
const GUIDE_A = grifo(
  '/escolher-parceiro',
  'Escolher parceiro',
  'O que pesa na escolha',
)

const pages = () =>
  screen
    .getAllByRole('listitem')
    .filter((item) => item.dataset['slot'] === 'pagina-grifada')

it('lists every Grifo by page, Guides then Tips then Fact sheets, each with its Nota and a link to its sentence', async () => {
  // Stored out of order on purpose: the page orders them, not the store.
  save(GUIDE_B_LATER, FACT_SHEET, TIP, GUIDE_B, GUIDE_A)
  openScreen('/grifos')

  expect(
    await screen.findByRole('heading', { name: saved(5, 4) }),
  ).toBeInTheDocument()
  expect(
    pages().map((page) => within(page).getAllByRole('heading')[0]!.textContent),
  ).toEqual([
    'GuiaEscolher parceiro',
    'GuiaOnde conhecer pessoas',
    'DicaUse o app como complemento',
    'FichaSilva 2020',
  ])
  const guide = pages()[1]!
  expect(
    within(guide).getByRole('link', { name: 'Onde conhecer pessoas' }),
  ).toHaveAttribute('href', '/onde-conhecer-pessoas')
  const quotes = within(guide).getAllByRole('link', {
    name: /satisfação|perto/,
  })
  // In the order they were made.
  expect(quotes.map((link) => link.textContent)).toEqual([
    GUIDE_B.text,
    GUIDE_B_LATER.text,
  ])
  expect(quotes[0]).toHaveAttribute('href', GUIDE_B.link)
  expect(within(guide).getByText(NOTE_HEADING)).toBeInTheDocument()
  expect(within(guide).getByText('Ver a amostra')).toBeInTheDocument()
  expect(screen.queryByText(CHANGED)).not.toBeInTheDocument()
})

it('a Grifo whose quote left its page says the passage changed, and keeps its quote and Nota', async () => {
  save({ ...GUIDE_B, changed: true }, TIP)
  openScreen('/grifos')

  const changed = (await screen.findByText(CHANGED)).closest('li')!
  expect(within(changed).getByText(GUIDE_B.text)).toBeInTheDocument()
  expect(within(changed).getByText('Ver a amostra')).toBeInTheDocument()
  expect(screen.getAllByText(CHANGED)).toHaveLength(1)
})

it('"Tirar grifo" takes the Grifo off the list and out of the storage, and the last one leaves the empty page', async () => {
  const user = userEvent.setup()
  save(GUIDE_B, TIP)
  openScreen('/grifos')

  await user.click(
    await screen.findByRole('button', { name: removeLabel(TIP.text) }),
  )
  expect(screen.queryByText(TIP.text)).not.toBeInTheDocument()
  expect(savedTexts()).toEqual([GUIDE_B.text])
  expect(screen.getByRole('heading', { name: saved(1, 1) })).toBeInTheDocument()

  await user.click(
    screen.getByRole('button', { name: removeLabel(GUIDE_B.text) }),
  )
  expect(savedTexts()).toEqual([])
  expect(
    await screen.findByRole('heading', { name: EMPTY_HEADING }),
  ).toBeInTheDocument()
})

it('with no Grifo, says how to make one', async () => {
  openScreen('/grifos')
  expect(
    await screen.findByRole('heading', { name: EMPTY_HEADING }),
  ).toBeInTheDocument()
  expect(screen.getByText(/Grifar/)).toBeInTheDocument()
})

it('every page links to the Grifos from its footer', async () => {
  openScreen('/privacidade')
  const footer = await screen.findByRole('contentinfo')
  expect(within(footer).getByRole('link', { name: 'Grifos' })).toHaveAttribute(
    'href',
    '/grifos',
  )
})
