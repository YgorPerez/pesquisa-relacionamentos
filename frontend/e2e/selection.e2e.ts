// The popover on selected text (#333) over the fixture content, with real
// layout: the side it opens on (above with a mouse, below on touch), the
// link that opens the page on the sentence, the selection kept through the
// keyboard, the count that never carries the text, and the page without JS.
// What each action puts on the clipboard, and where the popover opens at
// all, is `ui/selection-popover.test.tsx`'s.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const STATS = 'https://stats.temestudo.cloud/'
const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto'

const popover = (page: Page) =>
  page.getByRole('dialog', { name: 'Trecho selecionado' })

/** Selects `text` inside the page's prose. On touch, the long press that
 * starts a selection reaches the page as a touch pointer, which Playwright
 * cannot do; the test sends that pointer around the selection. On desktop,
 * the selection is the keyboard's: no pointer. */
async function select(page: Page, text: string, touch: boolean) {
  await page.evaluate(
    ({ text, touch }) => {
      const walker = document.createTreeWalker(
        document.querySelector('main')!,
        NodeFilter.SHOW_TEXT,
      )
      let node = walker.nextNode() as Text | null
      while (node && !node.data.includes(text))
        node = walker.nextNode() as Text | null
      if (!node) throw new Error(`no “${text}”`)
      const range = document.createRange()
      const at = node.data.indexOf(text)
      range.setStart(node, at)
      range.setEnd(node, at + text.length)
      const press = (type: string) =>
        node!.parentElement!.dispatchEvent(
          new PointerEvent(type, { bubbles: true, pointerType: 'touch' }),
        )
      if (touch) press('pointerdown')
      document.getSelection()!.removeAllRanges()
      document.getSelection()!.addRange(range)
      if (touch) press('pointerup')
    },
    { text, touch },
  )
}

/** The selection's box and the popover's. */
async function boxes(page: Page) {
  const selection = await page.evaluate(() => {
    const r = document.getSelection()!.getRangeAt(0).getBoundingClientRect()
    return { top: r.top, bottom: r.bottom }
  })
  const box = (await popover(page).boundingBox())!
  return { selection, popover: { top: box.y, bottom: box.y + box.height } }
}

test('opens below the selection on touch and above it with a mouse', async ({
  page,
  isMobile,
}) => {
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  const sentence = page.getByText(SENTENCE.slice(0, 30))
  await sentence.scrollIntoViewIfNeeded()
  // Room on both sides: the sentence in the middle of the screen.
  await sentence.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  if (isMobile) await select(page, 'de quem se conheceu online', true)
  else await sentence.dblclick({ position: { x: 30, y: 10 } })
  await expect(popover(page)).toBeVisible()
  const { selection, popover: box } = await boxes(page)
  if (isMobile) expect(box.top).toBeGreaterThanOrEqual(selection.bottom)
  else expect(box.bottom).toBeLessThanOrEqual(selection.top)
})

test('a double click selects a whole word and the popover copies it', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(isMobile, 'a double click is the mouse’s')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  await page
    .getByText(SENTENCE.slice(0, 30))
    .dblclick({ position: { x: 30, y: 10 } })
  await popover(page)
    .getByRole('button', { name: 'Copiar', exact: true })
    .click()
  await expect(popover(page).getByRole('status')).toHaveText('Trecho copiado.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await page.evaluate(() => document.getSelection()!.toString().trim()),
  )
})

test('a mouse drag from inside a word to inside another snaps to both whole words', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'a drag is the mouse’s')
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  const sentence = page.getByText(SENTENCE.slice(0, 30))
  await sentence.scrollIntoViewIfNeeded()
  // Along the first line, from inside a word to inside another.
  const box = (await sentence.boundingBox())!
  await page.mouse.move(box.x + 33, box.y + 12)
  await page.mouse.down()
  await page.mouse.move(box.x + 233, box.y + 12, { steps: 10 })
  await page.mouse.up()
  await expect(popover(page)).toBeVisible()
  const selected = await page.evaluate(() =>
    document.getSelection()!.toString(),
  )
  const words = SENTENCE.split(' ')
  expect(selected.split(' ').length).toBeGreaterThan(2)
  for (const word of selected.split(' ')) expect(words).toContain(word)
})

test('Copiar link opens the page on the sentence', async ({
  page,
  context,
  isMobile,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  await select(page, SENTENCE.slice(0, 40), isMobile)
  await popover(page).getByRole('button', { name: 'Copiar link' }).click()
  await expect(popover(page).getByRole('status')).toHaveText('Link copiado.')
  const link = await page.evaluate(() => navigator.clipboard.readText())
  expect(link).toMatch(/#o-lugar-quase-nao-muda-a-relacao:~:text=/)

  // The browser applies a Text Fragment only to a followed link.
  await page.goto('/busca')
  await page.evaluate((href) => {
    const a = document.createElement('a')
    a.href = href
    a.id = 'ir'
    a.textContent = 'ir'
    document.body.prepend(a)
  }, link)
  await page.locator('#ir').click()
  await expect(page).toHaveURL(new RegExp(`${GUIDE}#`))
  await page.locator('[data-slot="leitura"]').waitFor({ state: 'attached' })
  await expect(page.getByText(SENTENCE.slice(0, 40))).toBeInViewport()
})

test('the keyboard reaches the popover, and Escape closes it keeping the selection', async ({
  page,
}) => {
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  await select(page, SENTENCE.slice(0, 40), false)
  await expect(popover(page)).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(
    popover(page).getByRole('button', { name: 'Copiar', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(popover(page)).toBeHidden()
  expect(await page.evaluate(() => document.getSelection()!.toString())).toBe(
    SENTENCE.slice(0, 40),
  )
})

test('each action counts its name, never the text', async ({
  page,
  context,
  isMobile,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const sent: string[] = []
  await page.route(`${STATS}**`, async (route) => {
    sent.push(route.request().url())
    await route.fulfill({ status: 204 })
  })
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  await select(page, SENTENCE.slice(0, 40), isMobile)
  await popover(page)
    .getByRole('button', { name: 'Copiar', exact: true })
    .click()
  await popover(page).getByRole('button', { name: 'Copiar link' }).click()
  await expect
    .poll(() => sent.map((url) => new URL(url).searchParams.get('p')))
    .toEqual(expect.arrayContaining(['selection/copy', 'selection/link']))
  for (const url of sent) {
    expect(decodeURIComponent(url)).not.toMatch(/satisfa|conheceu/i)
  }
})

test.describe('selection without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the text is there to select and nothing opens', async ({ page }) => {
    await page.goto(GUIDE)
    await page
      .getByText(SENTENCE.slice(0, 30))
      .dblclick({ position: { x: 30, y: 10 } })
    await expect(page.getByText(SENTENCE.slice(0, 30))).toBeVisible()
    await expect(popover(page)).toHaveCount(0)
  })
})
