// "Comentar" (#337) in jsdom (ADR 0035), over the fixture Guide: the form
// under the popover, or in the sheet at the bottom of the screen on touch
// (#345), what reaches GitHub and what the reader sees when it works and
// when it fails. GitHub is MSW (`platform/screens/network.ts`):
// no test reaches the real API. The honeypot and the rate limit are
// `content/comment-issue.test.ts`'s.
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { KIND_LABEL } from '#/content/comment-kinds'
import { server } from '#/platform/screens/network'
import { openVisual } from '#/platform/screens/visual'
import { CLOSE } from './bottom-sheet.copy'
import { COMMENT } from './selection-comment.copy'
import { ACTION_LABEL, POPOVER_LABEL } from './selection-popover.copy'

const ISSUES =
  'https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues'

const SENTENCE = 'A satisfação de quem se conheceu online'

/** What GitHub received, with the `Authorization` it came with. */
function github(status: number) {
  const received: { body: unknown; authorization: string | null }[] = []
  server.use(
    http.post(ISSUES, async ({ request }) => {
      received.push({
        body: await request.json(),
        authorization: request.headers.get('authorization'),
      })
      return HttpResponse.json(status === 201 ? { number: ISSUE_NUMBER } : {}, {
        status,
      })
    }),
  )
  return received
}

/** The number GitHub gives the issue it opens. */
const ISSUE_NUMBER = 57

/** What this browser kept of the comments it sent. */
const keptComments = () =>
  JSON.parse(
    localStorage.getItem('tem-estudo:sent-comments') ?? '[]',
  ) as unknown[]

beforeEach(() => void vi.stubEnv('COMMENT_GITHUB_TOKEN', 'github_pat_test'))
afterEach(() => void vi.unstubAllEnvs())

/** Opens the Guide, selects the sentence (with a finger on `touch`) and
 * opens the form: under the popover's actions, or in the sheet on touch. */
async function openForm(pointer: 'mouse' | 'touch' = 'mouse') {
  const user = userEvent.setup()
  // The fixture Guide, drawn once its Visual is. Through the Visual's opener
  // and not `open-screen.tsx`, whose fan-in is at the limit.
  await openVisual('Dois retratos, dois países')
  const node = [...document.querySelectorAll('[data-quote] p')]
    .flatMap((p) => [...p.childNodes])
    .find((n) => n.textContent?.includes(SENTENCE))!
  const range = document.createRange()
  const start = node.textContent!.indexOf(SENTENCE)
  const paragraph = node.parentElement!
  fireEvent.pointerDown(paragraph, { pointerType: pointer })
  range.setStart(node, start)
  range.setEnd(node, start + SENTENCE.length)
  document.getSelection()!.removeAllRanges()
  document.getSelection()!.addRange(range)
  fireEvent.pointerUp(paragraph, { pointerType: pointer })
  const popover = await screen.findByRole('dialog', { name: POPOVER_LABEL })
  await user.click(
    within(popover).getByRole('button', { name: ACTION_LABEL.comment }),
  )
  if (pointer === 'mouse') return { user, form: within(popover) }
  const sheet = await screen.findByRole('dialog', {
    name: ACTION_LABEL.comment,
  })
  return { user, form: within(sheet) }
}

/** The popover and the sheet are gone, the selection with them, and the
 * notice says the comment went. */
async function expectSent() {
  expect(await screen.findByText(COMMENT.sent)).toBeVisible()
  expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).toBeNull()
  expect(
    screen.queryByRole('dialog', { name: ACTION_LABEL.comment }),
  ).toBeNull()
  expect(document.getSelection()!.isCollapsed).toBe(true)
}

it('sends the type, the text, the quote and its link as one issue, and says it went', async () => {
  const received = github(201)
  const { user, form } = await openForm()

  await user.click(form.getByRole('radio', { name: KIND_LABEL.wrong }))
  await user.type(form.getByLabelText(COMMENT.text), 'O número não bate.')
  await user.click(form.getByRole('button', { name: COMMENT.send }))

  await expectSent()
  expect(received).toHaveLength(1)
  expect(received[0]!.authorization).toBe('Bearer github_pat_test')
  const issue = received[0]!.body as { labels: string[]; body: string }
  expect(issue.labels).toEqual(['Está errado'])
  expect(issue.body).toContain(`> ${SENTENCE}`)
  expect(issue.body).toContain('https://temestudo.cloud/onde-conhecer-pessoas#')
  expect(issue.body).toContain('O número não bate.')
  // The reader's IP, as Nginx forwards it (`platform/screens/test-request.ts`).
  expect(JSON.stringify(received)).not.toContain('203.0.113.7')
})

it('keeps the sent comment on the device, with its issue number, and the notice leads to Seus trechos', async () => {
  github(201)
  const { user, form } = await openForm()

  await user.click(form.getByRole('radio', { name: KIND_LABEL.wrong }))
  await user.type(form.getByLabelText(COMMENT.text), 'O número não bate.')
  await user.click(form.getByRole('button', { name: COMMENT.send }))

  await expectSent()
  expect(keptComments()).toEqual([
    expect.objectContaining({
      path: '/onde-conhecer-pessoas',
      text: SENTENCE,
      exact: SENTENCE,
      kind: 'wrong',
      comment: 'O número não bate.',
      issue: ISSUE_NUMBER,
      changed: false,
    }),
  ])
  const [kept] = keptComments() as { link: string }[]
  expect(kept!.link).toMatch(/^\/onde-conhecer-pessoas#.+:~:text=/)
  expect(screen.getByRole('link', { name: COMMENT.seeSent })).toHaveAttribute(
    'href',
    '/trechos',
  )
})

it('without a type or a text, says what is missing and sends nothing', async () => {
  const received = github(201)
  const { user, form } = await openForm()

  await user.click(form.getByRole('button', { name: COMMENT.send }))
  expect(await form.findByRole('alert')).toHaveTextContent(COMMENT.missingKind)

  await user.click(form.getByRole('radio', { name: KIND_LABEL.other }))
  await user.click(form.getByRole('button', { name: COMMENT.send }))
  expect(await form.findByRole('alert')).toHaveTextContent(COMMENT.missingText)
  expect(received).toEqual([])
})

it('when the server cannot open the issue, says so and keeps the text to send again', async () => {
  github(500)
  const { user, form } = await openForm()

  await user.click(form.getByRole('radio', { name: KIND_LABEL.unclear }))
  await user.type(form.getByLabelText(COMMENT.text), 'Não entendi a conta.')
  await user.click(form.getByRole('button', { name: COMMENT.send }))

  expect(await form.findByRole('alert')).toHaveTextContent(COMMENT.failed)
  expect(form.getByLabelText(COMMENT.text)).toHaveValue('Não entendi a conta.')
  expect(keptComments()).toEqual([])

  github(201)
  await user.click(form.getByRole('button', { name: COMMENT.send }))
  await expectSent()
})

it('on touch, opens the form in a sheet with the quote, and closes it once sent', async () => {
  const received = github(201)
  const { user, form } = await openForm('touch')

  expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).toBeNull()
  expect(form.getByText(SENTENCE, { exact: false })).toBeVisible()
  await user.click(
    form.getByRole('radio', { name: KIND_LABEL['missing-study'] }),
  )
  await user.type(form.getByLabelText(COMMENT.text), 'Tem estudo disso?')
  await user.click(form.getByRole('button', { name: COMMENT.send }))

  await expectSent()
  expect(received).toHaveLength(1)
})

it('on touch, "Fechar" closes the sheet and sends nothing', async () => {
  const received = github(201)
  const { user, form } = await openForm('touch')

  await user.click(form.getByRole('button', { name: CLOSE }))

  expect(
    screen.queryByRole('dialog', { name: ACTION_LABEL.comment }),
  ).toBeNull()
  expect(received).toEqual([])
})
