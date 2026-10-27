// "Comentar" (#337) in a real browser, against the real server with no
// `COMMENT_GITHUB_TOKEN` (`playwright.config.ts`), so no comment reaches
// GitHub: the form opens under the popover, its text field takes the focus
// on a press without closing it, and the server's "not sent" keeps the text.
// The issue a comment becomes is `ui/selection-comment.test.tsx`'s, with
// GitHub faked.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const STATS = 'https://stats.temestudo.cloud/'
const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto'

/** The form opened, with a type picked and a text typed. */
async function openForm(page: Page) {
  const { popover, counted } = await openComment(page)
  await popover.getByRole('radio', { name: 'Está errado' }).click()
  const field = popover.getByLabel('Seu comentário')
  await field.click()
  await expect(field).toBeFocused()
  await field.pressSequentially('O número não bate.')
  return { popover, field, counted }
}

/** Counts the sends to GoatCounter, opens the Guide, selects the sentence
 * and presses "Comentar". Each test comes from an address of its own, as
 * Nginx would forward it: the server's per-IP limit (5 an hour) would
 * otherwise answer the later tests, and every retry, with its neutral
 * "sent". */
async function openComment(page: Page) {
  const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
  const counted: string[] = []
  await page.route(`${STATS}**`, async (route) => {
    counted.push(route.request().url())
    await route.fulfill({ status: 204 })
  })
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  const sentence = page.getByText(SENTENCE.slice(0, 30))
  await sentence.evaluate((el) => {
    const range = document.createRange()
    range.selectNodeContents(el.firstChild!)
    document.getSelection()!.removeAllRanges()
    document.getSelection()!.addRange(range)
  })
  const popover = page.getByRole('dialog', { name: 'Trecho selecionado' })
  await popover.waitFor()
  // The sentence in the middle of the screen, the popover with it.
  await sentence.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect(sentence).toBeInViewport()
  await popover.getByRole('button', { name: 'Comentar' }).click()
  return { popover, counted }
}

/** The sends of an event (`selection/…`), not the page views. */
const commentEvents = (counted: string[]) =>
  counted.filter((url) => new URL(url).searchParams.get('e') === 'true')

test('a send that fails keeps the text, and counts nothing', async ({
  page,
}) => {
  const { popover, field, counted } = await openForm(page)
  await popover.getByRole('button', { name: 'Enviar' }).click()

  await expect(popover.getByRole('alert')).toContainText('Não deu para enviar')
  await expect(field).toHaveValue('O número não bate.')
  expect(commentEvents(counted)).toEqual([])
})

test('on a small phone the form stays inside the screen: the row of actions on top, the form scrolling under it', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'a phone')
  await page.setViewportSize({ width: 375, height: 667 })
  const { popover } = await openComment(page)
  await expect(popover.getByLabel('Seu comentário')).toBeVisible()
  await expect
    .poll(async () => {
      const box = (await popover.boundingBox())!
      return box.y >= 0 && box.y + box.height <= 667
    })
    .toBe(true)
  await expect(
    popover.getByRole('button', { name: 'Comentar' }),
  ).toBeInViewport()
  const send = popover.getByRole('button', { name: 'Enviar' })
  await send.scrollIntoViewIfNeeded()
  await expect(send).toBeInViewport()
})

test('a comment sent says so in the popover, which stays open, and counts the name only', async ({
  page,
}) => {
  // The server's own reply, turned into "sent": without a token it never
  // is (`playwright.config.ts`).
  await page.route('**/_serverFn/**', async (route) => {
    const response = await route.fetch()
    // Start's wire format (seroval): the constant 3 is `false`, 2 `true`.
    const body = (await response.text()).replace(
      '"sent"],"v":[{"t":2,"s":3}',
      '"sent"],"v":[{"t":2,"s":2}',
    )
    await route.fulfill({ response, body })
  })
  const { popover, counted } = await openForm(page)
  await popover.getByRole('button', { name: 'Enviar' }).click()

  await expect(popover.getByRole('status')).toHaveText(
    'Comentário enviado. Obrigado!',
  )
  await expect
    .poll(() =>
      commentEvents(counted).map((url) => new URL(url).searchParams.get('p')),
    )
    .toEqual(['selection/comment'])
  expect(decodeURIComponent(commentEvents(counted)[0]!)).not.toMatch(
    /bate|satisfa|onde-conhecer/,
  )
})
