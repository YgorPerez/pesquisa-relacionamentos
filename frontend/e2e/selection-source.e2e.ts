// "De onde vem isso?" (#336) over the fixture content, in Chrome on phone
// and desktop: the panel lists the sentence's Fact sheet, its link opens
// the Fact sheet, and the count carries the action's name and never the
// text. Which Fact sheets each kind of sentence lists is
// `ui/selection-source.test.tsx`'s.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const STATS = 'https://stats.temestudo.cloud/'
const SENTENCE = 'A satisfação de quem se conheceu online'
const COSTA = 'Costa (2018): satisfação e onde os casais se conheceram'

const popover = (page: Page) =>
  page.getByRole('dialog', { name: 'Trecho selecionado' })

/** Selects `text` inside the page's prose, with a touch pointer around it on
 * the phone (`selection.e2e.ts`). */
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

test('De onde vem isso? lists the sentence’s Fact sheet, counts its name only, and leads to the Fact sheet', async ({
  page,
  isMobile,
}) => {
  const sent: string[] = []
  await page.route(`${STATS}**`, async (route) => {
    sent.push(route.request().url())
    await route.fulfill({ status: 204 })
  })
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  await select(page, SENTENCE, isMobile)
  await popover(page).getByRole('button', { name: 'De onde vem isso?' }).click()
  const panel = popover(page).getByRole('status')
  await expect(panel).toContainText('Esta frase cita:')
  await expect(panel.getByRole('link')).toHaveText([COSTA])
  await expect(panel.getByRole('link', { name: COSTA })).toBeInViewport()

  await expect
    .poll(() => sent.map((url) => new URL(url).searchParams.get('p')))
    .toContain('selection/source')
  for (const url of sent)
    expect(decodeURIComponent(url)).not.toMatch(/satisfa|conheceu/i)

  await panel.getByRole('link', { name: COSTA }).click()
  await expect(page).toHaveURL(/\/estudos\/costa-2018-satisfacao$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(COSTA)
})
