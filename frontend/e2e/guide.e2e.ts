// The Guide, the Topic, the home page and the Tips over the fixture content
// (`e2e/library`): one Topic with two Guides, one published Tip (an
// inference) and one that rests on a ⬜ Fact sheet and stays off the site.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas/onde-os-casais-se-conhecem'

const noSideScroll = async (page: Page) => {
  const { pageWidth, screenWidth } = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    screenWidth: window.innerWidth,
  }))
  expect(pageWidth).toBeLessThanOrEqual(screenWidth)
}

test.describe('Guide page', () => {
  test('has the sections in #7 order', async ({ page }) => {
    await page.goto(GUIDE)
    await expect(page).toHaveTitle(
      'Onde os casais se conhecem hoje? · Tem estudo?',
    )
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Onde os casais se conhecem hoje?',
    )
    await expect(page.locator('main h2')).toHaveText([
      'Resposta curta',
      'Dicas',
      'O que a evidência diz',
      'Varia conforme o Perfil?',
      'O que circula por aí e não se sustenta',
      'Limitações e o que não se sabe',
      'Fichas citadas',
      'Ajudou?',
      'Perguntas relacionadas',
    ])
    await noSideScroll(page)
  })

  test('the short answer shows the Confidence in three steps, with the word, and the key number with the Fact sheet', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const answer = page.getByRole('region', { name: 'Resposta curta' })
    await expect(answer).toContainText('Confiança da resposta')
    await expect(answer.locator('[data-confidence="moderate"]')).toContainText(
      'moderada',
    )
    await expect(
      answer.locator('[data-confidence] svg path[fill="currentColor"]'),
    ).toHaveCount(2)
    await expect(answer.locator('mark.numero-chave')).toHaveText(
      '18% dos adultos jovens',
    )
    const ref = answer.getByRole('link', {
      name: 'Ficha 1: Silva e Souza (2020): apps de namoro no Brasil',
    })
    await expect(ref).toHaveText('1')
    await expect(ref).toHaveAttribute('href', '#ficha-silva-2020-apps-brasil')
  })

  test('the Tip states the Strength and marks our inference', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const tips = page.getByRole('region', { name: 'Dicas' })
    await expect(tips).toContainText(
      'Use o app como complemento, não como o único caminho12.',
    )
    await expect(tips).toContainText('Inferência nossa')
    await expect(tips.locator('[data-strength="moderate"]')).toContainText(
      'moderada',
    )
    // One reference per Fact sheet, glued, before the final period.
    await expect(tips.locator('a.ref')).toHaveText(['1', '2'])
    await expect(tips.locator('.nw').first()).toHaveText('caminho12.')
  })

  test('each finding shows country and year and the Vale para note', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const evidence = page.getByRole('region', {
      name: 'O que a evidência diz',
    })
    const findings = evidence.locator('ol[data-slot="achados-guia"] > li')
    await expect(findings).toHaveCount(2)
    await expect(findings.nth(0).locator('[data-slot="onde"]')).toHaveText(
      'Brasil2019',
    )
    await expect(findings.nth(0)).toContainText(
      'Vale para: homens e mulheres, de 18 a 35 anos.',
    )
    await expect(findings.nth(1).locator('[data-slot="onde"]')).toHaveText(
      'EUA2017',
    )
    await expect(findings.nth(1)).toContainText(
      'Vale para: casais homem-mulher.',
    )
  })

  test('the divergence shows in a table with both sides and the better design', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const table = page.getByRole('table', { name: 'A evidência diverge' })
    await expect(table.getByRole('columnheader')).toHaveText([
      'O app junta muitos casais',
      'O lugar quase não importa',
    ])
    await expect(table.getByRole('cell')).toHaveCount(2)
    await expect(page.locator('[data-slot="melhor-desenho"]')).toContainText(
      'A amostra brasileira foi sorteada',
    )
  })

  test('Profile, struck-out Myths and Limitations', async ({ page }) => {
    await page.goto(GUIDE)
    await expect(
      page.getByRole('region', { name: 'Varia conforme o Perfil?' }),
    ).toContainText('Entre 18 e 24 anos, a fatia sobe para 24%')
    const myth = page
      .getByRole('region', { name: 'O que circula por aí e não se sustenta' })
      .locator('[data-slot="mito"]')
    await expect(myth.locator('s')).toHaveText(
      'Mais da metade dos casais se conhece por app.',
    )
    await expect(myth).toContainText(
      'No Brasil, foi menos de um em cada cinco1.',
    )
    await expect(
      page
        .getByRole('region', { name: 'Limitações e o que não se sabe' })
        .getByRole('listitem'),
    ).toHaveText([
      'O estudo brasileiro só ouviu capitais.',
      'Ninguém separou app de rede social.',
    ])
  })

  test('the cited Fact sheets come numbered, with Status and Strength written, and lead to the Fact sheet', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const factSheets = page
      .getByRole('region', { name: 'Fichas citadas' })
      .locator('ol > li')
    await expect(factSheets).toHaveCount(2)
    await expect(factSheets.nth(0)).toHaveAttribute(
      'id',
      'ficha-silva-2020-apps-brasil',
    )
    await expect(factSheets.nth(0)).toContainText('1')
    await expect(factSheets.nth(0)).toContainText('lido no original')
    await expect(factSheets.nth(0)).toContainText('forte')
    await expect(factSheets.nth(1)).toContainText('parcial')
    await factSheets
      .nth(1)
      .getByRole('link', {
        name: 'Costa (2018): satisfação e onde os casais se conheceram',
      })
      .click()
    await expect(page).toHaveURL('/estudos/costa-2018-satisfacao')
  })

  test('the related Questions lead to the other Guide, with the first sentence of the answer', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const related = page
      .getByRole('region', { name: 'Perguntas relacionadas' })
      .getByRole('link', {
        name: /App ou presencial, onde tenho mais chance\?/,
      })
    await expect(related).toContainText('Depende de quem você procura.')
    expect((await related.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await related.click()
    await expect(page).toHaveURL('/onde-conhecer-pessoas/app-ou-presencial')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'App ou presencial, onde tenho mais chance?',
    )
  })

  test('the search description is the short answer, and the header leads to the Topic', async ({
    page,
    request,
  }) => {
    const html = await (await request.get(GUIDE)).text()
    expect(html).toContain(
      '<meta name="description" content="No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
    )
    await page.goto(GUIDE)
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Onde conhecer pessoas' })
      .click()
    await expect(page).toHaveURL('/onde-conhecer-pessoas')
  })

  test('a Guide that does not exist, or in the wrong Topic, answers 404', async ({
    request,
  }) => {
    expect(
      (await request.get('/onde-conhecer-pessoas/nao-existe')).status(),
    ).toBe(404)
    expect(
      (await request.get('/outro-tema/onde-os-casais-se-conhecem')).status(),
    ).toBe(404)
  })
})

test.describe('Topic page', () => {
  test('shows the context and the Questions in order, each with its short answer', async ({
    page,
  }) => {
    await page.goto('/onde-conhecer-pessoas')
    await expect(page).toHaveTitle('Onde conhecer pessoas · Tem estudo?')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Onde conhecer pessoas',
    )
    await expect(page.locator('[data-slot="contexto"]')).toContainText(
      'Onde os casais se conhecem hoje e se o lugar muda a relação.',
    )
    const questions = page.locator('ol[data-slot="perguntas"] > li')
    await expect(questions.getByRole('heading', { level: 2 })).toHaveText([
      'Onde os casais se conhecem hoje?',
      'App ou presencial, onde tenho mais chance?',
    ])
    await expect(questions.nth(0)).toContainText(
      'No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
    )
    await expect(questions.nth(0)).toContainText('moderada')
    // The Topic cites no Fact sheets: they stay in the Guide.
    await expect(questions.locator('a.ref')).toHaveCount(0)
    await questions.nth(1).getByRole('link').first().click()
    await expect(page).toHaveURL('/onde-conhecer-pessoas/app-ou-presencial')
    await noSideScroll(page)
  })

  test('a Topic that does not exist answers 404', async ({ request }) => {
    expect((await request.get('/tema-que-nao-existe')).status()).toBe(404)
  })
})

test.describe('home page', () => {
  test('has the site sentence, the Topics with the Questions and the shortcuts to the calculators', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const topics = page.getByRole('region', { name: 'Os Temas' })
    await topics.getByText('Onde conhecer pessoas').click()
    await expect(
      topics.getByRole('link', { name: 'Abrir o Tema: Onde conhecer pessoas' }),
    ).toHaveAttribute('href', '/onde-conhecer-pessoas')
    await expect(
      topics.getByRole('link', { name: 'Onde os casais se conhecem hoje?' }),
    ).toHaveAttribute('href', GUIDE)
    const calculators = page.getByRole('region', { name: 'Faça a conta' })
    await expect(
      calculators.getByRole('link', { name: /Grupo possível/ }),
    ).toHaveAttribute('href', '/grupo-possivel')
    await expect(
      calculators.getByRole('link', { name: /Prioridades/ }),
    ).toHaveAttribute('href', '/prioridades')
    await noSideScroll(page)
  })

  test('back from a Guide, the Topic that was open is open again', async ({
    page,
  }) => {
    await page.goto('/')
    const topics = page.getByRole('region', { name: 'Os Temas' })
    await topics.getByText('Onde conhecer pessoas').click()
    await topics
      .getByRole('link', { name: 'Onde os casais se conhecem hoje?' })
      .click()
    await expect(page).toHaveURL(GUIDE)
    await page.goBack()
    await expect(
      topics.getByRole('link', { name: 'Onde os casais se conhecem hoje?' }),
    ).toBeVisible()
  })
})

test.describe('home page without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('a Topic opens and its Question leads to the Guide', async ({
    page,
  }) => {
    await page.goto('/')
    const topics = page.getByRole('region', { name: 'Os Temas' })
    await topics.getByText('Escolher parceiro').click()
    await topics
      .getByRole('link', {
        name: 'Que características do parceiro preveem uma boa relação?',
      })
      .click()
    await expect(page).toHaveURL(
      '/escolher-parceiro/que-caracteristicas-preveem',
    )
  })
})

test.describe('Tips', () => {
  test('/dicas lists only the published Tips, with the Strength', async ({
    page,
  }) => {
    await page.goto('/dicas')
    await expect(page).toHaveTitle('Dicas · Tem estudo?')
    const tips = page.locator('ol[data-slot="dicas"] > li')
    await expect(tips).toHaveCount(1)
    await expect(tips.first()).toContainText(
      'Use o app como complemento, não como o único caminho.',
    )
    await expect(tips.first()).toContainText('moderada')
    await expect(tips.first()).toContainText('Inferência nossa')
    await tips.first().getByRole('link').click()
    await expect(page).toHaveURL('/dicas/apps-como-complemento')
  })

  test('/dicas/<slug> shows the Tip, the Fact sheets and the Guides it appears in', async ({
    page,
  }) => {
    await page.goto('/dicas/apps-como-complemento')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Use o app como complemento, não como o único caminho.',
    )
    await expect(
      page.getByRole('region', { name: 'Fichas citadas' }).locator('ol > li'),
    ).toHaveCount(2)
    const guides = page
      .getByRole('region', { name: 'Aparece nos Guias' })
      .getByRole('link')
    await expect(guides).toHaveText([
      /Onde os casais se conhecem hoje\?/,
      /App ou presencial/,
    ])
    await guides.first().click()
    await expect(page).toHaveURL(GUIDE)
  })

  test('a Tip resting on a ⬜ Fact sheet is not published', async ({
    request,
  }) => {
    expect((await request.get('/dicas/encontros-presenciais')).status()).toBe(
      404,
    )
  })
})
