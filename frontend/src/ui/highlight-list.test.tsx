// `/grifos` (#335) in jsdom (ADR 0035): the Grifos saved in this browser,
// grouped by page, each with its quote, its Nota and its link, the one whose
// quote left its page, "Tirar grifo" and the empty page. The Grifos go into
// the storage as Grifar and the page's layer leave them
// (`state/highlights.ts`). Landing on the sentence through the Text Fragment
// is the e2e's (`e2e/highlights.e2e.ts`).
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import type { Highlight } from '#/state/highlight-record'
import { NOTE_HEADING } from './highlight.copy'
import {
  CHANGED,
  EMPTY_HEADING,
  removeLabel,
  saved,
} from './highlight-list.copy'

const KEY = 'tem-estudo:highlights'

afterEach(cleanup)

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
