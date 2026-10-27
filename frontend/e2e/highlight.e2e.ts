// Grifar and the Nota (#334) in a real Chrome, over the fixture content: the
// CSS Custom Highlight API paints the Grifo, a tap on the painted text opens
// its popover, the Nota survives a reload, and the count carries the
// action's name only. What is stored, the Grifo whose quote left the page
// and the keyboard's "Ver grifo" are `ui/highlight-layer.test.tsx`'s.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const STATS = 'https://stats.temestudo.cloud/'
// The start of a Chapter's sentence, in whole words: the selection snaps to
// them.
const GRIFO = 'A satisfação de quem se conheceu online'

const selectionPopover = (page: Page) =>
  page.getByRole('dialog', { name: 'Trecho selecionado' })
const grifoPopover = (page: Page) => page.getByRole('dialog', { name: 'Grifo' })

/** Selects `text` in the page's prose; on touch, with the touch pointer
 * around it (see `selection.e2e.ts`). */
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

/** The text the browser paints as Grifos. */
const painted = (page: Page) =>
  page.evaluate(() =>
    [...(CSS.highlights.get('grifo') ?? [])]
      .map((range) => (range as Range).toString())
      .join(''),
  )

/** The middle of the painted Grifo's first line, on the screen. */
const grifoCenter = (page: Page) =>
  page.evaluate(() => {
    const [range] = [...CSS.highlights.get('grifo')!] as Range[]
    const rect = range!.getClientRects()[0]!
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })

async function tapGrifo(page: Page, isMobile: boolean) {
  const { x, y } = await grifoCenter(page)
  if (isMobile) await page.touchscreen.tap(x, y)
  else await page.mouse.click(x, y)
}

test('Grifar paints the selection, a tap opens it, and its Nota survives a reload', async ({
  page,
  isMobile,
}) => {
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  await page
    .getByText(GRIFO)
    .evaluate((el) =>
      el.scrollIntoView({ block: 'center', behavior: 'instant' }),
    )
  await select(page, GRIFO, isMobile)
  await selectionPopover(page).getByRole('button', { name: 'Grifar' }).click()
  await expect(grifoPopover(page)).toBeVisible()
  expect(await painted(page)).toBe(GRIFO)

  await grifoPopover(page)
    .getByRole('button', { name: 'Escrever nota' })
    .click()
  await grifoPopover(page).getByLabel('Nota').fill('Ver a amostra')
  await grifoPopover(page).getByRole('button', { name: 'Salvar nota' }).click()
  await expect(grifoPopover(page).getByText('Ver a amostra')).toBeVisible()

  await page.reload({ waitUntil: 'networkidle' })
  await expect.poll(() => painted(page)).toBe(GRIFO)
  await page
    .getByText(GRIFO)
    .evaluate((el) =>
      el.scrollIntoView({ block: 'center', behavior: 'instant' }),
    )
  await tapGrifo(page, isMobile)
  await expect(grifoPopover(page).getByText('Ver a amostra')).toBeVisible()

  await grifoPopover(page).getByRole('button', { name: 'Tirar grifo' }).click()
  await expect(grifoPopover(page)).toBeHidden()
  await expect.poll(() => painted(page)).toBe('')
  await page.reload({ waitUntil: 'networkidle' })
  expect(await painted(page)).toBe('')
})

test('Grifar counts its name, never the text', async ({ page, isMobile }) => {
  const sent: string[] = []
  await page.route(`${STATS}**`, async (route) => {
    sent.push(route.request().url())
    await route.fulfill({ status: 204 })
  })
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  await select(page, GRIFO, isMobile)
  await selectionPopover(page).getByRole('button', { name: 'Grifar' }).click()
  await expect
    .poll(() => sent.map((url) => new URL(url).searchParams.get('p')))
    .toContain('selection/highlight')
  for (const url of sent)
    expect(decodeURIComponent(url)).not.toMatch(/satisfa|conheceu/i)
})
