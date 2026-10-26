// Reading progress (#195) over the fixture content: the Guide's reading bar,
// "Continuar lendo" on the home page after the browser is reopened, and the
// Guide read to the end. The fixture Guide has two Chapters, then "O que
// levar".
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test'
import { tap } from './touch'

const GUIDE = '/onde-conhecer-pessoas'
const TOPIC = 'onde-conhecer-pessoas'
const SECOND = 'o-lugar-quase-nao-muda-a-relacao'
const KEY = 'tem-estudo:reading'

/** The bar mounts after hydration: before it, a scroll is not seen. */
async function openGuide(page: Page) {
  await page.goto(GUIDE)
  await page.locator('[data-slot="leitura"]').waitFor({ state: 'attached' })
}

/** The bar's line: the Chapter being read, which opens the Chapters. */
const bar = (page: Page) =>
  page.locator('[data-slot="leitura"]').getByRole('button')

/** Brings `selector`'s element to `top` px from the top of the screen. */
const scrollTo = (page: Page, selector: string, top: number) =>
  page.evaluate(
    ([s, t]) => {
      const el = document.querySelector(s)!
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - t,
        behavior: 'instant',
      })
    },
    [selector, top] as const,
  )

const saved = (page: Page) =>
  page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key) ?? 'null') as {
        inProgress: Record<
          string,
          { chapterNumber: number; paragraph: { text: string } | null }
        >
        finished: string[]
      } | null,
    KEY,
  )

/** A browser opened again, with only what the last one left on disk. */
async function reopen(browser: Browser, context: BrowserContext) {
  const {
    viewport,
    isMobile,
    hasTouch,
    userAgent,
    deviceScaleFactor,
    baseURL,
  } = test.info().project.use
  return browser.newContext({
    viewport,
    isMobile,
    hasTouch,
    userAgent,
    deviceScaleFactor,
    baseURL,
    storageState: await context.storageState(),
  })
}

test('read into the second Chapter, reopen the browser, and "continuar" lands on the same paragraph', async ({
  page,
  context,
  browser,
}) => {
  await openGuide(page)
  const paragraph = `#${SECOND} p`
  await scrollTo(page, paragraph, 90)
  await expect(bar(page)).toHaveAccessibleName(
    /^Capítulo 2 de 2 O lugar quase não muda a relação$/,
  )
  await expect
    .poll(async () => (await saved(page))?.inProgress[TOPIC]?.paragraph?.text)
    .toMatch(/^A satisfação de quem se conheceu online/)

  const again = await reopen(browser, context)
  const home = await again.newPage()
  const hits: string[] = []
  await home.route('https://stats.temestudo.cloud/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/count' && url.searchParams.get('e') === 'true')
      hits.push(url.searchParams.get('p')!)
    await route.fulfill({ status: 204 })
  })
  await home.goto('/')
  const block = home.getByRole('region', { name: 'Continuar lendo' })
  const item = block.getByRole('link', { name: /Onde conhecer pessoas/ })
  await expect(item).toContainText('Capítulo 2 de 2')
  await tap(item)
  await expect(home).toHaveURL(GUIDE)

  // The paragraph is at the top, just under the bar.
  await expect
    .poll(() =>
      home
        .locator(paragraph)
        .first()
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBeGreaterThan(0)
  const top = await home
    .locator(paragraph)
    .first()
    .evaluate((el) => el.getBoundingClientRect().top)
  expect(top).toBeLessThan(90)
  // The count says which Guide, never where.
  await expect.poll(() => hits).toContain(`continue-reading/${TOPIC}`)
  await again.close()
})

test('reaching "O que levar" takes the Guide out of the list, and the home index says "lido"', async ({
  page,
}) => {
  await openGuide(page)
  await scrollTo(page, `#${SECOND}`, 90)
  await expect
    .poll(async () => (await saved(page))?.inProgress[TOPIC])
    .toBeTruthy()
  await scrollTo(page, '#o-que-levar', 90)
  await expect
    .poll(async () => await saved(page))
    .toEqual({ inProgress: {}, finished: [TOPIC] })

  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Os Temas' })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Continuar lendo' }),
  ).toHaveCount(0)
  const topic = page
    .getByRole('region', { name: 'Os Temas' })
    .getByRole('group')
    .filter({ hasText: 'Onde conhecer pessoas' })
  await expect(topic.getByText('lido', { exact: true })).toBeVisible()
})

test('the Chapter list in the bar jumps to another Chapter', async ({
  page,
}) => {
  await openGuide(page)
  await scrollTo(page, `#${SECOND}`, 90)
  await expect(bar(page)).toHaveAccessibleName(/^Capítulo 2 de 2/)
  // A keyboard press, and not a click: Playwright scrolls a sticky element
  // "into view" before clicking it, which moves the page.
  await bar(page).press('Enter')
  const list = page.locator('[data-slot="leitura"]')
  await tap(list.getByRole('link', { name: /O app virou um caminho comum/ }))
  await expect(bar(page)).toHaveAttribute('aria-expanded', 'false')
  await expect(bar(page)).toHaveAccessibleName(/^Capítulo 1 de 2/)
})

test('on the phone the line slides away on the way down and comes back on the way up; on desktop it stays', async ({
  page,
  isMobile,
}) => {
  const by = (top: number) =>
    page.evaluate((t) => window.scrollBy({ top: t, behavior: 'instant' }), top)
  const progress = page.locator('[data-slot="leitura"] [data-slot="progresso"]')
  await openGuide(page)
  await scrollTo(page, `#${SECOND}`, 90)
  await expect(bar(page)).toHaveAccessibleName(/^Capítulo 2 de 2/)
  await by(-50)
  await expect(bar(page)).toBeInViewport()
  await by(300)
  if (isMobile) await expect(bar(page)).not.toBeInViewport()
  else await expect(bar(page)).toBeInViewport()
  await expect(progress).toBeInViewport()
  await by(-100)
  await expect(bar(page)).toBeInViewport()
})

test('without JavaScript the Guide has only its Chapter list, and the home page no block', async ({
  browser,
}) => {
  const { viewport, isMobile, hasTouch, userAgent, baseURL } =
    test.info().project.use
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch,
    userAgent,
    baseURL,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()
  await page.goto(GUIDE)
  await expect(
    page.getByRole('navigation', { name: 'Capítulos' }),
  ).toBeVisible()
  await expect(page.locator('[data-slot="leitura"]')).toHaveCount(0)
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Os Temas' })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Continuar lendo' }),
  ).toHaveCount(0)
  await context.close()
})
