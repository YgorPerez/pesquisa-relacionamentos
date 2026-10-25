// Search and stable links (#15), over the fixture content (`e2e/library`):
// the build's sitemap and robots, canonical, `noindex` on a URL with state,
// the Guide's Open Graph and the 301s of the trailing slash and of `antes`
// (the silva-2020 Fact sheet and the app-ou-presencial Guide declare old
// paths).
import { expect, test } from '@playwright/test'

const SITE = 'https://temestudo.cloud'
const GUIDE = '/onde-conhecer-pessoas/app-ou-presencial'

test.describe('sitemap and robots', () => {
  test('the sitemap lists the indexed pages and leaves the ⬜ Fact sheet out', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('xml')
    const locs = [
      ...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g),
    ].map((m) => m[1])
    expect(locs).toEqual([
      `${SITE}/`,
      // The Topics in their `position` order.
      `${SITE}/onde-conhecer-pessoas`,
      `${SITE}/onde-conhecer-pessoas/onde-os-casais-se-conhecem`,
      `${SITE}${GUIDE}`,
      `${SITE}/escolher-parceiro`,
      `${SITE}/escolher-parceiro/que-caracteristicas-preveem`,
      `${SITE}/dicas`,
      `${SITE}/dicas/apps-como-complemento`,
      `${SITE}/estudos`,
      `${SITE}/estudos/costa-2018-satisfacao`,
      `${SITE}/estudos/silva-2020-apps-brasil`,
      `${SITE}/grupo-possivel`,
      `${SITE}/prioridades`,
    ])
  })

  test('robots points to the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })
})

test.describe('canonical and noindex', () => {
  test('the page without query is indexed, with a canonical to itself', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE}${GUIDE}`,
    )
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  })

  test('the URL with a state query carries noindex and a canonical without the query', async ({
    page,
  }) => {
    await page.goto(`${GUIDE}?g=mulher&p=homens&i=30`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE}${GUIDE}`,
    )
  })

  test("the query's noindex already comes in the server HTML", async ({
    request,
  }) => {
    const html = await (await request.get('/estudos?v=1')).text()
    expect(html).toContain('<meta name="robots" content="noindex"')
    expect(html).toContain(`<link rel="canonical" href="${SITE}/estudos"`)
  })

  test('the ⬜ Fact sheet carries noindex', async ({ page }) => {
    await page.goto('/estudos/lima-2015-encontros')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    )
  })
})

test.describe('Open Graph', () => {
  test("the Guide carries the search title and description and the site's fixed image", async ({
    page,
    request,
  }) => {
    await page.goto(GUIDE)
    const og = (property: string) =>
      page.locator(`meta[property="og:${property}"]`)
    await expect(og('title')).toHaveAttribute(
      'content',
      'App ou presencial, onde tenho mais chance?',
    )
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content')
    expect(description).toBe(
      'Depende de quem você procura. A diferença de satisfação entre os dois caminhos é pequena.',
    )
    await expect(og('description')).toHaveAttribute('content', description!)
    await expect(og('url')).toHaveAttribute('content', `${SITE}${GUIDE}`)
    await expect(og('image')).toHaveAttribute('content', `${SITE}/og.png`)

    const image = await request.get('/og.png')
    expect(image.status()).toBe(200)
    expect(image.headers()['content-type']).toBe('image/png')
  })
})

test.describe('301', () => {
  const noFollow = { maxRedirects: 0 }

  test('a path with a trailing slash goes to the one without, with the query', async ({
    request,
  }) => {
    const response = await request.get('/estudos/?v=1', noFollow)
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe('/estudos?v=1')
  })

  test("the Fact sheet's and the Guide's `antes` lead to today's path", async ({
    request,
  }) => {
    const factSheet = await request.get('/estudos/silva-2020', noFollow)
    expect(factSheet.status()).toBe(301)
    expect(factSheet.headers().location).toBe('/estudos/silva-2020-apps-brasil')

    const guide = await request.get(
      '/onde-conhecer-pessoas/app-ou-bar?g=mulher',
      noFollow,
    )
    expect(guide.status()).toBe(301)
    expect(guide.headers().location).toBe(`${GUIDE}?g=mulher`)

    const fromAnotherTopic = await request.get(
      '/escolher-parceiro/onde-procurar',
      noFollow,
    )
    expect(fromAnotherTopic.headers().location).toBe(GUIDE)
  })

  test('the browser reaches the new page', async ({ page }) => {
    await page.goto('/onde-conhecer-pessoas/app-ou-bar/')
    await expect(page).toHaveURL(GUIDE)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'App ou presencial',
    )
  })
})
