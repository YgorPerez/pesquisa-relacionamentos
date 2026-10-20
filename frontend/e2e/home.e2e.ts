import { expect, test } from '@playwright/test'

test.describe('home page', () => {
  test('the server answers / with the page already drawn', async ({
    request,
  }) => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain('<html lang="pt-BR"')
    expect(html).toContain('Tem estudo?')
  })

  test('opens with the site name, on the DESIGN.md paper and ink', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Tem estudo\?/)
    await expect(page.getByRole('link', { name: 'Tem estudo?' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const body = page.locator('body')
    await expect(body).toHaveCSS('background-color', 'rgb(245, 248, 248)')
    await expect(body).toHaveCSS('color', 'rgb(26, 28, 28)')

    // One column, no sideways scroll.
    const widths = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      screen: window.innerWidth,
    }))
    expect(widths.page).toBeLessThanOrEqual(widths.screen)
  })

  test('the fonts come from the site itself', async ({ page }) => {
    const fonts: string[] = []
    page.on('request', (request) => {
      if (request.resourceType() === 'font') fonts.push(request.url())
    })
    await page.goto('/')

    // `load` returns the declared faces that serve that text; without an
    // `@font-face` for the family, the list comes back empty.
    // The range of each loaded face says who draws what: Atkinson covers
    // everything, and the 0-to-9-only face is Source Sans 3's.
    const loaded = await page.evaluate(async () => {
      const ranges = async (font: string, text: string) =>
        (await document.fonts.load(font, text))
          .filter((face) => face.status === 'loaded')
          .map((face) => face.unicodeRange)
      return {
        title: await ranges('700 21px "Bricolage Grotesque"', 'Tem estudo?'),
        text: await ranges('400 17px "Atkinson Hyperlegible"', 'Tem estudo?'),
        digits: await ranges('400 17px "Atkinson Hyperlegible"', '2022'),
        note: await ranges('400 17px Kalam', 'nota'),
      }
    })
    const everything = 'U+0-10FFFF'
    expect(loaded).toEqual({
      title: [everything],
      text: [everything],
      digits: expect.arrayContaining(['U+30-39']),
      note: [everything],
    })

    expect(fonts.length).toBeGreaterThan(0)
    const origin = new URL(page.url()).origin
    for (const url of fonts) expect(new URL(url).origin).toBe(origin)
  })

  test('the site name at the top has a 44px touch height', async ({ page }) => {
    await page.goto('/')
    const box = await page
      .getByRole('link', { name: 'Tem estudo?' })
      .boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('the <head> carries the tab icon, the iPhone one and the manifest, and all answer', async ({
    page,
    request,
  }) => {
    await page.goto('/')
    for (const rel of ['icon', 'apple-touch-icon', 'manifest']) {
      const href = await page.locator(`link[rel="${rel}"]`).getAttribute('href')
      expect(href, rel).toBeTruthy()
      expect((await request.get(href!)).status(), rel).toBe(200)
    }
    const manifest = await (await request.get('/manifest.webmanifest')).json()
    expect(manifest.name).toBe('Tem estudo?')
    for (const icon of manifest.icons)
      expect((await request.get(icon.src)).status(), icon.src).toBe(200)
  })
})
