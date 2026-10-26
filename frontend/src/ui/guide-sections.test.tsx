// The Guide in jsdom (ADR 0035), over the fixture content: two Chapters,
// each answering one Question where its reasoning reaches it, with a Myth, a
// Tip and the marks inside a sentence, then "O que levar". The order of the
// blocks without JavaScript stays in the e2e (`e2e/guide.e2e.ts`).
//
// The reading bar (#195): jsdom draws nothing, so each of its tests says
// where the page's pieces sit on the screen, as a reader's scroll would
// leave them, and the scroll event tells the bar to look. With a real
// browser, the journey is the e2e's (`e2e/reading.e2e.ts`).
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { paragraphText } from '#/state/reading'
import { CONTINUE_READING } from './continue-reading.copy'
import { MYTH_LABEL, MYTH_LINE } from './guide-sections.copy'
import { CHAPTER, chapterOf } from './reading-progress.copy'
import {
  ALL_NEIGHBOR_SITES,
  FURTHER_READING,
  FURTHER_READING_LINE,
} from './readings.copy'

const follows = (a: Element, b: Element) =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0

it('the table of contents lists the Chapters in order and leads to each', async () => {
  openScreen('/onde-conhecer-pessoas')
  const contents = await screen.findByRole('navigation', { name: 'Capítulos' })
  const links = within(contents).getAllByRole('link')
  expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
    ['1O app virou um caminho comum', '#o-app-virou-um-caminho-comum'],
    ['2O lugar quase não muda a relação', '#o-lugar-quase-nao-muda-a-relacao'],
  ])
  for (const link of links) {
    const chapter = document.getElementById(link.getAttribute('href')!.slice(1))
    expect(chapter).toHaveAttribute('data-slot', 'capitulo')
  }
})

it('"Em resumo" lists each Question with the first sentence of its answer and leads to where the Guide answers it', async () => {
  openScreen('/onde-conhecer-pessoas')
  const summary = await screen.findByRole('region', { name: 'Em resumo' })
  const links = within(summary).getAllByRole('link')
  expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
    ['Onde os casais se conhecem hoje?', '#onde-os-casais-se-conhecem'],
    ['App ou presencial, onde tenho mais chance?', '#app-ou-presencial'],
  ])
  for (const link of links) {
    const answer = document.getElementById(link.getAttribute('href')!.slice(1))
    expect(answer).toHaveAccessibleName(link.textContent!)
    expect(answer).toHaveAttribute('data-slot', 'resposta')
  }
  expect(summary).toHaveTextContent(
    'No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
  )
  // The rest of the answer is in its Chapter, not in the summary.
  expect(summary).not.toHaveTextContent('Os estudos divergem')
  expect(within(summary).queryByRole('link', { name: /^Ficha/ })).toBeNull()
})

it('a Myth says it is a Myth before its claim, in words a screen reader reads', async () => {
  openScreen('/onde-conhecer-pessoas')
  const chapter = await screen.findByRole('region', {
    name: 'O app virou um caminho comum',
  })
  const myth = within(chapter).getByRole('article')
  const claim = within(myth).getByText(
    'Mais da metade dos casais se conhece por app.',
  )
  const label = within(myth).getByText(MYTH_LABEL)
  expect(label).toBeVisible()
  expect(label.closest('[aria-hidden="true"]')).toBeNull()
  expect(myth.textContent).toMatch(new RegExp(`^${MYTH_LABEL}\\s*${MYTH_LINE}`))
  // The strike alone is not announced: the label comes first in reading
  // order, so the claim is heard as a Myth.
  expect(follows(label, claim)).toBe(true)
})

it('a Chapter reads as prose with its answer, Myth and marks in body order, numbered on the single list', async () => {
  openScreen('/onde-conhecer-pessoas')
  const chapter = await screen.findByRole('region', {
    name: 'O app virou um caminho comum',
  })
  const answer = within(chapter).getByRole('region', {
    name: 'Onde os casais se conhecem hoje?',
  })
  expect(answer).toHaveTextContent('confiança moderada')
  const myth = chapter.querySelector('[data-slot="mito"]')!
  expect(myth).toHaveTextContent(
    'Mais da metade dos casais se conhece por app.',
  )
  expect(follows(answer, myth)).toBe(true)
  expect(within(chapter).getByText('no Brasil')).toHaveClass('marca-brasil')
  // The findings back the answer at build time; the page does not list them.
  expect(
    screen.queryByRole('region', { name: 'O que a evidência diz' }),
  ).toBeNull()
  // Costa 2018 is number 2 in the first Chapter: the Guide has one list, so
  // it is 2 in the second Chapter too, and leads to the second Fact sheet.
  const second = screen.getByRole('region', {
    name: 'O lugar quase não muda a relação',
  })
  const [reference] = within(second).getAllByRole('link', { name: /^Ficha 2:/ })
  const [, costa] = within(
    screen.getByRole('region', { name: 'Fichas citadas' }),
  ).getAllByRole('listitem')
  const target = document.getElementById(
    reference!.getAttribute('href')!.replace(/^#/, ''),
  )
  expect(target?.closest('li')).toBe(costa)
})

it('the frame closes the Guide: O que levar, O que não se sabe, the Fact sheets, one Ajudou? and the Questions of other Topics', async () => {
  openScreen('/onde-conhecer-pessoas')
  const takeaways = await screen.findByRole('region', { name: 'O que levar' })
  const unknowns = screen.getByRole('region', { name: 'O que não se sabe' })
  const factSheets = screen.getByRole('region', { name: 'Fichas citadas' })
  const helped = screen.getByRole('region', { name: 'Ajudou?' })
  const elsewhere = screen.getByRole('region', {
    name: 'Perguntas de outros Temas',
  })
  expect(unknowns).toHaveTextContent('Nenhum estudo separou app de rede social')
  expect(follows(takeaways, unknowns)).toBe(true)
  expect(follows(unknowns, factSheets)).toBe(true)
  expect(follows(factSheets, helped)).toBe(true)
  expect(follows(helped, elsewhere)).toBe(true)
  expect(screen.getAllByRole('region', { name: 'Ajudou?' })).toHaveLength(1)
  expect(within(elsewhere).getByRole('link')).toHaveTextContent(
    'Que características do parceiro preveem uma boa relação?',
  )
})

// The reading bar.

const KEY = 'tem-estudo:reading'
const FIRST = 'o-app-virou-um-caminho-comum'
const SECOND = 'o-lugar-quase-nao-muda-a-relacao'

/** The top of each piece on the screen (px); the rest sits at 0, flat. */
interface Layout {
  readonly [FIRST]: number
  readonly [SECOND]: number
  readonly takeaways: number
  /** The paragraph whose text starts like this, and where it sits. */
  readonly paragraph?: { readonly text: string; readonly top: number }
}

function lay(layout: Layout) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      const box = (top: number, height: number) =>
        DOMRect.fromRect({ x: 0, y: top, width: 400, height })
      if (this.getAttribute('data-slot') === 'capitulos-texto')
        return box(layout[FIRST], layout.takeaways - layout[FIRST])
      if (this.id === FIRST || this.id === SECOND)
        return box(layout[this.id], 1000)
      if (this.id === 'o-que-levar') return box(layout.takeaways, 600)
      if (this.tagName === 'P') {
        const text = paragraphText(this.textContent ?? '')
        const top =
          layout.paragraph && text === layout.paragraph.text
            ? layout.paragraph.top
            : 100
        return box(top, 60)
      }
      return box(0, 0)
    },
  )
}

const scroll = () => fireEvent.scroll(window)
const saved = () =>
  JSON.parse(localStorage.getItem(KEY) ?? 'null') as {
    inProgress: Record<string, unknown>
    finished: string[]
  } | null

/** jsdom's screen is 768px tall: the reading line sits at 40%. */
const LINE = 768 * 0.4

it('into the second Chapter, the bar names it, and its list jumps to another Chapter', async () => {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('region', { name: 'Em resumo' })
  lay({ [FIRST]: -2000, [SECOND]: 100, takeaways: 3000 })
  scroll()

  const bar = await screen.findByRole('button', {
    name: (name) =>
      name.replace(/\s+/g, ' ') ===
      `${CHAPTER} ${chapterOf(2, 2)} O lugar quase não muda a relação`,
  })
  expect(bar).toHaveAttribute('aria-expanded', 'false')
  await user.click(bar)
  expect(bar).toHaveAttribute('aria-expanded', 'true')
  const list = bar.closest('[data-slot="leitura"]')!
  const here = within(list as HTMLElement).getByRole('link', {
    current: 'location',
  })
  expect(here).toHaveAttribute('href', `#${SECOND}`)

  await user.click(
    within(list as HTMLElement).getByRole('link', {
      name: /O app virou um caminho comum/,
    }),
  )
  expect(bar).toHaveAttribute('aria-expanded', 'false')
})

it('where the reader stops is saved: the Chapter, the paragraph at the top and how much was read', async () => {
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('region', { name: 'Em resumo' })
  lay({ [FIRST]: -2000, [SECOND]: 100, takeaways: 3000 })
  scroll()

  const first = paragraphText(
    document.getElementById(SECOND)!.querySelector('p')!.textContent!,
  )
  await waitFor(() =>
    expect(saved()?.inProgress['onde-conhecer-pessoas']).toMatchObject({
      chapter: SECOND,
      chapterTitle: 'O lugar quase não muda a relação',
      chapterNumber: 2,
      chapters: 2,
      paragraph: { index: 0, text: first },
      progress: Math.round(((LINE + 2000) / 5000) * 100) / 100,
    }),
  )
})

it('above the first Chapter nothing is saved, and reaching "O que levar" counts the Guide as read', async () => {
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('region', { name: 'Em resumo' })
  lay({ [FIRST]: 900, [SECOND]: 2000, takeaways: 3000 })
  scroll()
  lay({ [FIRST]: -3000, [SECOND]: -2000, takeaways: 100 })
  scroll()
  await waitFor(() =>
    expect(saved()).toEqual({
      inProgress: {},
      finished: ['onde-conhecer-pessoas'],
    }),
  )
})

/** Leaves the reading in the browser, opens the home page and taps the
 * item: the bar of the Guide takes the reader back. */
async function continueFrom(paragraph: { index: number; text: string }) {
  const user = userEvent.setup()
  localStorage.setItem(
    KEY,
    JSON.stringify({
      inProgress: {
        'onde-conhecer-pessoas': {
          chapter: SECOND,
          chapterTitle: 'O lugar quase não muda a relação',
          chapterNumber: 2,
          chapters: 2,
          paragraph,
          progress: 0.5,
          at: 1,
        },
      },
      finished: [],
    }),
  )
  const jumps = vi.fn<(options: ScrollToOptions) => void>()
  window.scrollTo = jumps as typeof window.scrollTo
  openScreen('/')
  const region = await screen.findByRole('region', { name: CONTINUE_READING })
  await user.click(within(region).getByRole('link'))
  return jumps
}

it('"continuar" brings the saved paragraph to the top, even moved further in its Chapter', async () => {
  // The text the bar kept of the Chapter's first paragraph.
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('region', { name: 'Em resumo' })
  const text = paragraphText(
    document.getElementById(SECOND)!.querySelector('p')!.textContent!,
  )
  cleanup()
  // It was the fourth paragraph then; today it is the first, at 1500.
  lay({
    [FIRST]: -2000,
    [SECOND]: 900,
    takeaways: 3000,
    paragraph: { text, top: 1500 },
  })
  const jumps = await continueFrom({ index: 3, text })
  await waitFor(() =>
    expect(jumps).toHaveBeenCalledWith({ top: 1500 - 16, behavior: 'instant' }),
  )
})

it('"continuar" to a paragraph that is gone lands on its Chapter\'s start', async () => {
  lay({ [FIRST]: -2000, [SECOND]: 900, takeaways: 3000 })
  const jumps = await continueFrom({
    index: 0,
    text: 'Um parágrafo que saiu do Guia na última revisão do texto.',
  })
  await waitFor(() =>
    expect(jumps).toHaveBeenCalledWith({ top: 900 - 16, behavior: 'instant' }),
  )
})

// "Para ler além daqui" (#179), over the fixture's Neighbor sites: three
// Readings of "Onde conhecer pessoas", none of "Escolher parceiro".

it('the Guide ends its text with "Para ler além daqui", after "O que não se sabe" and before the Fact sheets', async () => {
  openScreen('/onde-conhecer-pessoas')
  const block = await screen.findByRole('region', { name: FURTHER_READING })
  const unknowns = screen.getByRole('region', { name: 'O que não se sabe' })
  expect(follows(unknowns, block)).toBe(true)
  expect(
    follows(block, screen.getByRole('region', { name: 'Fichas citadas' })),
  ).toBe(true)
  expect(block).toHaveTextContent(FURTHER_READING_LINE)
  expect(
    within(block)
      .getAllByRole('link', { name: /abre em outra aba/ })
      .map((link) => link.getAttribute('href')),
  ).toEqual([
    'https://revista-daqui.example/onde-se-conhecem',
    'https://revista-daqui.example/primeiro-encontro',
    'https://family-lab.example/how-couples-meet',
  ])
  expect(
    within(block).getByRole('link', { name: ALL_NEIGHBOR_SITES }),
  ).toHaveAttribute('href', '/sites-vizinhos')
})

it('a Guide whose Topic has no Reading has no "Para ler além daqui"', async () => {
  openScreen('/escolher-parceiro')
  await screen.findByRole('region', { name: 'Fichas citadas' })
  expect(
    screen.queryByRole('region', { name: FURTHER_READING }),
  ).not.toBeInTheDocument()
})
