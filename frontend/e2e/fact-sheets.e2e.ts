// The Fact sheets, over the fixture content (`e2e/library`): one ✅
// (silva-2020), one 🟡 (costa-2018) and one ⬜ (lima-2015).
import { expect, test, type Page } from '@playwright/test'
import { tap } from './touch'

const noSideScroll = async (page: Page) => {
  const { pageWidth, screenWidth } = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    screenWidth: window.innerWidth,
  }))
  expect(pageWidth).toBeLessThanOrEqual(screenWidth)
}

test.describe('/estudos', () => {
  test('lists the Fact sheets with Status and Strength drawn and written', async ({
    page,
  }) => {
    await page.goto('/estudos')
    await expect(page).toHaveTitle('Estudos · Tem estudo?')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'estudos',
    )

    const items = page.locator('ol[data-slot="fichas"] > li')
    // The checked ones first: read in the original, partial, unverified.
    await expect(items.getByRole('link')).toHaveText([
      'Silva e Souza (2020): apps de namoro no Brasil',
      'Costa (2018): satisfação e onde os casais se conheceram',
      'Lima (2015): encontros presenciais e duração',
    ])

    const silva = items.nth(0)
    await expect(silva).toContainText('lido no original')
    await expect(silva).toContainText('forte')
    await expect(silva).toContainText('Brasil · 2019 · n = 2.400')
    await expect(silva.locator('[data-status="verified"] svg')).toBeVisible()
    await expect(
      silva.locator('[data-strength="strong"] svg path[fill="currentColor"]'),
    ).toHaveCount(3)

    const costa = items.nth(1)
    await expect(costa).toContainText('parcial')
    await expect(
      costa.locator('[data-strength="moderate"] svg path[fill="currentColor"]'),
    ).toHaveCount(2)

    const lima = items.nth(2)
    await expect(lima).toContainText('não verificado')
    await expect(
      lima.locator('[data-strength="weak"] svg path[fill="currentColor"]'),
    ).toHaveCount(1)

    await noSideScroll(page)
  })

  test('each Fact sheet title has a 44px touch height and leads to its page', async ({
    page,
  }) => {
    await page.goto('/estudos')
    const link = page.getByRole('link', {
      name: 'Costa (2018): satisfação e onde os casais se conheceram',
    })
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tap(link)
    await expect(page).toHaveURL('/estudos/costa-2018-satisfacao')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Costa (2018): satisfação e onde os casais se conheceram',
    )
    await expect(
      page.getByText('Diferença de satisfação, online vs. presencial'),
    ).toBeVisible()
  })
})

test.describe('/estudos/<slug>', () => {
  test('shows reference, link, sample, design, findings with excerpt, limitations and conflict', async ({
    page,
  }) => {
    await page.goto('/estudos/silva-2020-apps-brasil')
    await expect(page).toHaveTitle(
      'Silva e Souza 2020: apps de namoro no Brasil · Tem estudo?',
    )

    const data = page.locator('[data-slot="ficha-dados"]')
    await expect(data).toContainText(
      'Silva A, Souza B. Apps de namoro no Brasil.',
    )
    await expect(
      page.getByRole('link', { name: /Abrir o estudo/ }),
    ).toHaveAttribute('href', 'https://doi.org/10.1234/exemplo.2020.1')
    await expect(data).toContainText('Lido no original em 19/10/2026.')
    await expect(data).toContainText('2.400. 2.400 adultos de 18 a 35 anos')
    await expect(data).toContainText('Representativa da população.')
    await expect(data).toContainText('transversal')
    await expect(data).toContainText('Brasil · 2019')
    await expect(data).toContainText(
      'Financiado pela universidade; sem conflito declarado.',
    )
    await expect(data).toContainText('CC BY 4.0')
    await expect(page.locator('[data-slot="ficha-meta-grande"]')).toContainText(
      'lido no original',
    )
    await expect(page.locator('[data-slot="ficha-meta-grande"]')).toContainText(
      'evidência forte',
    )

    const findings = page.locator('ol[data-slot="achados"] > li')
    await expect(findings).toHaveCount(2)
    await expect(findings.first()).toContainText('18%')
    await expect(findings.first()).toContainText(
      'Conheceram o parceiro por app',
    )
    await expect(findings.first().locator('blockquote')).toHaveText(
      '"18% dos participantes conheceram o parceiro atual por aplicativo"',
    )
    await expect(findings.first()).toContainText('Onde: Tabela 2, p. 50')

    const limitations = page.getByRole('region', { name: 'Limitações' })
    await expect(limitations.getByRole('listitem')).toHaveText([
      'Autorrelato.',
      'Só capitais.',
    ])

    // "Como usamos" is internal: it stays in the repository, not on the site.
    await expect(page.getByText('Exemplo de fixture.')).toHaveCount(0)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await noSideScroll(page)
  })

  test('a partial Fact sheet goes to search and says how far it was checked', async ({
    page,
  }) => {
    await page.goto('/estudos/costa-2018-satisfacao')
    await expect(page.locator('[data-slot="ficha-dados"]')).toContainText(
      'Conferido em parte em 18/10/2026.',
    )
    await expect(page.locator('[data-slot="ficha-dados"]')).toContainText(
      'Não declarado.',
    )
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  })

  test('a ⬜ Fact sheet shows as unverified and carries noindex', async ({
    page,
    request,
  }) => {
    const html = await (
      await request.get('/estudos/lima-2015-encontros')
    ).text()
    expect(html).toContain('<meta name="robots" content="noindex"')

    await page.goto('/estudos/lima-2015-encontros')
    await expect(page.getByRole('note')).toContainText('Ficha não verificada.')
    await expect(page.locator('[data-slot="ficha-meta-grande"]')).toContainText(
      'não verificado',
    )
    await expect(page.locator('[data-slot="ficha-dados"]')).toContainText(
      'Ainda não conferida na fonte.',
    )
    await expect(
      page.getByText('Trecho do original ainda não conferido.'),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Brasil na amostra' }),
    ).toBeVisible()
  })

  test('lists the Guides and Tips that cite the Fact sheet, with a link', async ({
    page,
  }) => {
    await page.goto('/estudos/silva-2020-apps-brasil')
    const citedIn = page.getByRole('region', { name: 'Citada em' })
    await expect(citedIn.getByRole('heading', { level: 3 })).toHaveText([
      'Guias',
      'Dicas',
    ])
    await expect(citedIn.locator('[data-slot="linha-pergunta"]')).toHaveText([
      /Onde os casais se conhecem hoje\?/,
      /App ou presencial, onde tenho mais chance\?/,
      /Que características do parceiro preveem uma boa relação\?/,
    ])
    const tip = citedIn.getByRole('link', {
      name: 'Use o app como complemento, não como o único caminho.',
    })
    expect((await tip.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tap(tip)
    await expect(page).toHaveURL('/dicas/apps-como-complemento')

    await page.goto('/estudos/silva-2020-apps-brasil')
    await tap(
      page
        .getByRole('region', { name: 'Citada em' })
        .locator('[data-slot="linha-pergunta"]')
        .first(),
    )
    await expect(page).toHaveURL(
      '/onde-conhecer-pessoas#onde-os-casais-se-conhecem',
    )
  })

  test('a Fact sheet no published page cites says so', async ({ page }) => {
    await page.goto('/estudos/lima-2015-encontros')
    await expect(page.getByRole('region', { name: 'Citada em' })).toContainText(
      'Nenhum Guia nem Dica publicada cita esta Ficha ainda.',
    )
  })

  test('back leads to the list', async ({ page }) => {
    await page.goto('/estudos/lima-2015-encontros')
    const back = page.getByRole('link', { name: 'Todos os estudos' })
    expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tap(back)
    await expect(page).toHaveURL('/estudos')
  })

  test('a Fact sheet that does not exist answers 404', async ({ page }) => {
    const response = await page.goto('/estudos/nao-existe-2020')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Essa Ficha não existe',
    )
  })
})
