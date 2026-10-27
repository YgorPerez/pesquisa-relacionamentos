// "Comentar" (#337) in a real browser, against the real server with no
// `COMMENT_GITHUB_TOKEN` (`playwright.config.ts`), so no comment reaches
// GitHub. On the phone the sentence is selected as a finger would and the
// form opens in a sheet at the bottom of the screen (#345); on the desktop,
// under the popover, where its text field takes the focus on a press
// without closing it. The server's "not sent" keeps the text; a sent one
// closes the form and says so at the bottom of the screen.
// The issue a comment becomes is `ui/selection-comment.test.tsx`'s, with
// GitHub faked.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const STATS = 'https://stats.temestudo.cloud/'
const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto'

/** The form opened, with a type picked and a text typed. */
async function openForm(page: Page, touch: boolean) {
  const { form, counted } = await openComment(page, touch)
  await form.getByRole('radio', { name: 'Está errado' }).click()
  const field = form.getByLabel('Seu comentário')
  await field.click()
  await expect(field).toBeFocused()
  await field.pressSequentially('O número não bate.')
  return { form, field, counted }
}

/** Counts the sends to GoatCounter, opens the Guide, selects the sentence
 * and presses "Comentar". Each test comes from an address of its own, as
 * Nginx would forward it: the server's per-IP limit (5 an hour) would
 * otherwise answer the later tests, and every retry, with its neutral
 * "sent". */
async function openComment(page: Page, touch: boolean) {
  const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
  const counted: string[] = []
  await page.route(`${STATS}**`, async (route) => {
    counted.push(route.request().url())
    await route.fulfill({ status: 204 })
  })
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  const sentence = page.getByText(SENTENCE.slice(0, 30))
  // A finger presses and lifts around the selection; a script's selection
  // with no press reads as a mouse's.
  await sentence.evaluate(
    (el, pointerType) => {
      const press = (type: string) =>
        el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType }))
      if (pointerType) press('pointerdown')
      const range = document.createRange()
      range.selectNodeContents(el.firstChild!)
      document.getSelection()!.removeAllRanges()
      document.getSelection()!.addRange(range)
      if (pointerType) press('pointerup')
    },
    touch ? 'touch' : '',
  )
  const popover = page.getByRole('dialog', { name: 'Trecho selecionado' })
  await popover.waitFor()
  // The sentence in the middle of the screen, the popover with it.
  await sentence.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect(sentence).toBeInViewport()
  await popover.getByRole('button', { name: 'Comentar' }).click()
  if (!touch) return { form: popover, counted }
  await expect(popover).toBeHidden()
  return { form: page.getByRole('dialog', { name: 'Comentar' }), counted }
}

/** The sends of an event (`selection/…`), not the page views. */
const commentEvents = (counted: string[]) =>
  counted.filter((url) => new URL(url).searchParams.get('e') === 'true')

test('a send that fails keeps the text, and counts nothing', async ({
  page,
  isMobile,
}) => {
  const { form, field, counted } = await openForm(page, isMobile)
  await form.getByRole('button', { name: 'Enviar' }).click()

  await expect(form.getByRole('alert')).toContainText('Não deu para enviar')
  await expect(field).toHaveValue('O número não bate.')
  expect(commentEvents(counted)).toEqual([])
})

test('on a small phone the sheet stays inside the screen: its title on top, the form scrolling under it', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'a phone')
  // About what a keyboard leaves of a small phone.
  await page.setViewportSize({ width: 375, height: 380 })
  const { form } = await openComment(page, true)
  await expect(form.getByLabel('Seu comentário')).toBeVisible()
  await expect
    .poll(async () => {
      const box = (await form.boundingBox())!
      return box.y >= 0 && box.y + box.height <= 380
    })
    .toBe(true)
  await expect(form.getByRole('button', { name: 'Fechar' })).toBeInViewport()
  const send = form.getByRole('button', { name: 'Enviar' })
  await send.scrollIntoViewIfNeeded()
  await expect(send).toBeInViewport()
})

test('a comment sent closes the form, says so at the bottom of the screen, and counts the name only', async ({
  page,
  isMobile,
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
  const { form, counted } = await openForm(page, isMobile)
  await form.getByRole('button', { name: 'Enviar' }).click()

  await expect(page.getByText('Comentário enviado. Obrigado!')).toBeVisible()
  await expect(form).toBeHidden()
  await expect(
    page.getByRole('dialog', { name: 'Trecho selecionado' }),
  ).toBeHidden()
  await expect
    .poll(() =>
      commentEvents(counted).map((url) => new URL(url).searchParams.get('p')),
    )
    .toEqual(['selection/comment'])
  expect(decodeURIComponent(commentEvents(counted)[0]!)).not.toMatch(
    /bate|satisfa|onde-conhecer/,
  )
})
