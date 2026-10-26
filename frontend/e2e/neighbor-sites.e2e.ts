// The Neighbor sites (#179) over the fixture (`e2e/library/data/
// neighbor-sites.yaml`): the `/sites-vizinhos` page, with and without
// JavaScript, the footer's way there, and "Para ler além daqui" at the end of
// a Guide. The outside pages never load: every request to them is answered
// here. The counted click is `analytics.e2e.ts`'s.
import { expect, test, type Page } from '@playwright/test'

const PAGE = '/sites-vizinhos'
const TOPIC = 'Onde conhecer pessoas'
const IN_ORDER = [
  'Onde os brasileiros se conhecem',
  'Conversa de primeiro encontro',
  'How couples meet now',
]

/** The outside sites of the fixture answer with an empty page. */
async function stubOutsideSites(page: Page) {
  await page
    .context()
    .route(/^https:\/\/(family-lab|revista-daqui)\.example\//, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<p>fora</p>',
      }),
    )
}

const readingTitles = (page: Page, region: string) =>
  page
    .getByRole('region', { name: region })
    .locator('[data-slot=leitura-vizinha] a')
    .evaluateAll((links) =>
      links.map((a) => a.firstChild?.textContent?.trim() ?? ''),
    )

test.describe('Neighbor sites page', () => {
  test('the footer leads to it, and it groups the Readings by Topic, Portuguese first, with the notices', async ({
    page,
  }) => {
    await page.goto('/')
    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Sites vizinhos' })
      .click()
    await expect(page).toHaveURL(PAGE)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Sites vizinhos',
    )
    await expect(page).toHaveTitle('Sites vizinhos · Tem estudo?')
    expect(await readingTitles(page, TOPIC)).toEqual(IN_ORDER)
    await expect(
      page.getByRole('region', { name: 'Escolher parceiro' }),
    ).toHaveCount(0)
    const group = page.getByRole('region', { name: TOPIC })
    await expect(group).toContainText('A autora vende um curso sobre namoro.')
    await expect(group).toContainText('O Family Lab defende o casamento.')
    // No rating next to a Reading: no Confidence, no Strength.
    await expect(group).not.toContainText(/confiança|forte|moderada|fraca/i)
  })

  test('a Reading opens in another tab, with no way back to this page', async ({
    page,
  }) => {
    await stubOutsideSites(page)
    await page.goto(PAGE)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('link', { name: /How couples meet now/ }).click(),
    ])
    await expect(popup).toHaveURL('https://family-lab.example/how-couples-meet')
    expect(await popup.evaluate(() => window.opener)).toBeNull()
    await expect(page).toHaveURL(PAGE)
  })
})

test.describe('Neighbor sites without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the page and the Guide block are in the HTML, links included', async ({
    page,
  }) => {
    await page.goto(PAGE)
    expect(await readingTitles(page, TOPIC)).toEqual(IN_ORDER)
    await expect(
      page.getByRole('link', { name: /Onde os brasileiros se conhecem/ }),
    ).toHaveAttribute('href', 'https://revista-daqui.example/onde-se-conhecem')

    await page.goto('/onde-conhecer-pessoas')
    expect(await readingTitles(page, 'Para ler além daqui')).toEqual(IN_ORDER)
  })
})

test.describe('"Para ler além daqui" in the Guide', () => {
  test('closes the text after "O que não se sabe", and leads to every Topic', async ({
    page,
  }) => {
    await page.goto('/onde-conhecer-pessoas')
    const headings = await page
      .locator('main h2')
      .evaluateAll((all) => all.map((h) => h.textContent))
    const unknowns = headings.indexOf('O que não se sabe')
    expect(unknowns).toBeGreaterThan(-1)
    expect(headings[unknowns + 1]).toBe('Para ler além daqui')
    const block = page.getByRole('region', { name: 'Para ler além daqui' })
    await expect(block).toContainText('O Family Lab defende o casamento.')
    await block
      .getByRole('link', { name: 'Leituras de todos os Temas' })
      .click()
    await expect(page).toHaveURL(PAGE)
  })

  test('is absent from a Guide whose Topic has no Reading', async ({
    page,
  }) => {
    await page.goto('/escolher-parceiro')
    await expect(
      page.getByRole('region', { name: 'Fichas citadas' }),
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Para ler além daqui' }),
    ).toHaveCount(0)
  })
})
