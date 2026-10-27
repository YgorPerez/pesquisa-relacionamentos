// The popover on selected text (#333) in jsdom (ADR 0035), over the fixture
// content: where it opens, what "Copiar" and "Copiar link" put on the
// clipboard, the words the selection snaps to and the keyboard. The expected
// links are the site search's own, written by hand in
// `content/site-search-view.test.ts`: the same sentence lands the same way.
// The side it opens on, the browser painting the sentence and the count
// are the e2e's (`e2e/selection.e2e.ts`), with real layout.
import {
  act,
  cleanup,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import {
  ACTION_LABEL,
  COPY_BY_HAND,
  COPY_FAILED,
  POPOVER_LABEL,
} from './selection-popover.copy'

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

/** Selects from the start of `from` to the end of the next `to`, as a
 * keyboard selection does: no pointer. */
function select(from: string, to: string = from) {
  const start = textNode(from)
  const end = textNode(to, start)
  const range = document.createRange()
  range.setStart(start, start.data.indexOf(from))
  range.setEnd(end, end.data.indexOf(to) + to.length)
  const selection = document.getSelection()!
  selection.removeAllRanges()
  selection.addRange(range)
}

const popover = () => screen.findByRole('dialog', { name: POPOVER_LABEL })

// "perto" sits in a span of its own, with the reference ring after it.
const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto'
const selectSentence = () => select('A satisfação de quem', 'perto')
const SENTENCE_LINK =
  'http://localhost/onde-conhecer-pessoas#o-lugar-quase-nao-muda-a-relacao:~:text=A%20satisfa%C3%A7%C3%A3o%20de%20quem,conheceu%20pessoalmente%20fica%20perto'

it('selecting a sentence of a Guide opens the popover, and Copiar puts exactly that text on the clipboard', async () => {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  selectSentence()
  await user.click(
    within(await popover()).getByRole('button', { name: ACTION_LABEL.copy }),
  )
  expect(await navigator.clipboard.readText()).toBe(SENTENCE)
})

it('Copiar link puts the address of the sentence: its section and the Text Fragment the site search builds', async () => {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  selectSentence()
  await user.click(
    within(await popover()).getByRole('button', { name: ACTION_LABEL.link }),
  )
  expect(await navigator.clipboard.readText()).toBe(SENTENCE_LINK)
})

it.each([
  [
    'a Tip',
    '/dicas/apps-como-complemento',
    'como complemento',
    'http://localhost/dicas/apps-como-complemento#:~:text=como%20complemento',
  ],
  [
    "a Fact sheet's limitations",
    '/estudos/costa-2018-satisfacao',
    'Só o resumo foi lido',
    'http://localhost/estudos/costa-2018-satisfacao#limitacoes:~:text=S%C3%B3%20o%20resumo%20foi%20lido',
  ],
  [
    "a Fact sheet's data",
    '/estudos/costa-2018-satisfacao',
    'Amostra única e transversal',
    'http://localhost/estudos/costa-2018-satisfacao#:~:text=Amostra%20%C3%BAnica%20e%20transversal',
  ],
])(
  'selecting text of %s opens the popover with its link',
  async (_, page, text, link) => {
    const user = userEvent.setup()
    openScreen(page)
    await screen.findByRole('heading', { level: 1 })
    select(text)
    await user.click(
      within(await popover()).getByRole('button', { name: ACTION_LABEL.link }),
    )
    expect(await navigator.clipboard.readText()).toBe(link)
  },
)

it('a selection outside the text the search reads opens nothing: the Profile box, a calculator', async () => {
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  // The Guide's text opens it, and the Profile box's closes it again.
  select(SENTENCE.slice(0, 20))
  await popover()
  select('Opcional. Com ele')
  await waitForElementToBeRemoved(() =>
    screen.queryByRole('dialog', { name: POPOVER_LABEL }),
  )

  cleanup()
  openScreen('/prioridades')
  await screen.findByRole('heading', { level: 1 })
  const title = document.createRange()
  title.selectNodeContents(screen.getByRole('heading', { level: 1 }))
  const changed = new Promise((done) =>
    document.addEventListener('selectionchange', done, { once: true }),
  )
  document.getSelection()!.removeAllRanges()
  document.getSelection()!.addRange(title)
  await act(() => changed)
  expect(document.getSelection()!.toString()).not.toBe('')
  expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).toBeNull()
})

it('a mouse selection that starts and ends inside words snaps to the whole words', async () => {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  const node = textNode('A satisfação de quem')
  // From "sat|isfação" to "onl|ine".
  await user.pointer([
    { keys: '[MouseLeft>]', target: node.parentElement!, node, offset: 5 },
    { node, offset: node.data.indexOf('online') + 3 },
    { keys: '[/MouseLeft]' },
  ])
  expect(document.getSelection()!.toString()).toBe(
    'satisfação de quem se conheceu online',
  )
  await user.click(
    within(await popover()).getByRole('button', { name: ACTION_LABEL.copy }),
  )
  expect(await navigator.clipboard.readText()).toBe(
    'satisfação de quem se conheceu online',
  )
})

// jsdom drops the selection when an element takes focus; Chrome keeps it,
// and the e2e checks that.
it('after a keyboard selection, Tab goes into the popover and Escape closes it', async () => {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  selectSentence()
  const actions = within(await popover())
  await user.keyboard('{Tab}')
  expect(actions.getByRole('button', { name: ACTION_LABEL.copy })).toHaveFocus()
  await user.keyboard('{Tab}')
  expect(actions.getByRole('button', { name: ACTION_LABEL.link })).toHaveFocus()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).toBeNull()
})

it('when the browser refuses the clipboard, the link shows up in a field to copy by hand', async () => {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
    new DOMException('denied', 'NotAllowedError'),
  )
  selectSentence()
  await user.click(
    within(await popover()).getByRole('button', { name: ACTION_LABEL.link }),
  )
  expect(
    await screen.findByRole('textbox', { name: COPY_BY_HAND.link }),
  ).toHaveValue(SENTENCE_LINK)
  expect(within(await popover()).getByRole('status')).toHaveTextContent(
    COPY_FAILED.link,
  )
})

it('a selection across the "no Brasil" mark copies all of it, and its link keeps the plain text after the mark', async () => {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  // "app" sits in a span of its own, with the reference ring after it.
  select('no Brasil', 'app')
  const actions = within(await popover())
  await user.click(actions.getByRole('button', { name: ACTION_LABEL.copy }))
  expect(await navigator.clipboard.readText()).toBe(
    'no Brasil Entre adultos jovens, 18% conheceram o parceiro por app',
  )
  await user.click(actions.getByRole('button', { name: ACTION_LABEL.link }))
  expect(await navigator.clipboard.readText()).toBe(
    'http://localhost/onde-conhecer-pessoas#o-app-virou-um-caminho-comum:~:text=Entre%20adultos%20jovens%2C%2018%25,o%20parceiro%20por%20app',
  )
})
