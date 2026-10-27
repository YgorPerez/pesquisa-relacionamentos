// "Comentar" (#337) in jsdom (ADR 0035), over the fixture Guide: the form
// under the popover, what reaches GitHub and what the reader sees when it
// works and when it fails. GitHub is MSW (`platform/screens/network.ts`):
// no test reaches the real API. The honeypot and the rate limit are
// `content/comment-issue.test.ts`'s.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { KIND_LABEL } from '#/content/comment-kinds'
import { server } from '#/platform/screens/network'
import { openScreen } from '#/platform/screens/open-screen'
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
      return HttpResponse.json({}, { status })
    }),
  )
  return received
}

beforeEach(() => void vi.stubEnv('COMMENT_GITHUB_TOKEN', 'github_pat_test'))
afterEach(() => void vi.unstubAllEnvs())

/** Opens the Guide, selects the sentence and opens the form. */
async function openForm() {
  const user = userEvent.setup()
  openScreen('/onde-conhecer-pessoas')
  await screen.findByRole('heading', { level: 1 })
  const node = [...document.querySelectorAll('[data-quote] p')]
    .flatMap((p) => [...p.childNodes])
    .find((n) => n.textContent?.includes(SENTENCE))!
  const range = document.createRange()
  const start = node.textContent!.indexOf(SENTENCE)
  range.setStart(node, start)
  range.setEnd(node, start + SENTENCE.length)
  document.getSelection()!.removeAllRanges()
  document.getSelection()!.addRange(range)
  const popover = await screen.findByRole('dialog', { name: POPOVER_LABEL })
  await user.click(
    within(popover).getByRole('button', { name: ACTION_LABEL.comment }),
  )
  return { user, form: within(popover) }
}

it('sends the type, the text, the quote and its link as one issue, and says it went', async () => {
  const received = github(201)
  const { user, form } = await openForm()

  await user.click(form.getByRole('radio', { name: KIND_LABEL.wrong }))
  await user.type(form.getByLabelText(COMMENT.text), 'O número não bate.')
  await user.click(form.getByRole('button', { name: COMMENT.send }))

  expect(await form.findByRole('status')).toHaveTextContent(COMMENT.sent)
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

  github(201)
  await user.click(form.getByRole('button', { name: COMMENT.send }))
  expect(await form.findByRole('status')).toHaveTextContent(COMMENT.sent)
})
