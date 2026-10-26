// The Guide (the Topic's page, ADR 0042), the home page and the Tips over the
// fixture content (`e2e/library`): "Onde conhecer pessoas" with two
// Questions, "Escolher parceiro" with one Question and the whole frame
// ("E no Brasil?", a Myth next to its finding, "O que levar", Limitations by
// Study, a Question of another Topic), one published Tip (an inference) and
// one that rests on a ⬜ Fact sheet and stays off the site.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const FIRST = 'Onde os casais se conhecem hoje?'
const SECOND = 'App ou presencial, onde tenho mais chance?'
const OTHER_GUIDE = '/escolher-parceiro'
const OTHER = 'Que características do parceiro preveem uma boa relação?'

const question = (page: Page, name: string) =>
  page.getByRole('region', { name, exact: true })

const noSideScroll = async (page: Page) => {
  const { pageWidth, screenWidth } = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    screenWidth: window.innerWidth,
  }))
  expect(pageWidth).toBeLessThanOrEqual(screenWidth)
}

test.describe('Guide page', () => {
  test('has the index, the opening, one section per Question and the frame, in order', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await expect(page).toHaveTitle('Onde conhecer pessoas · Tem estudo?')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Onde conhecer pessoas',
    )
    await expect(page.locator('main h2')).toHaveText([
      'Perguntas deste Guia',
      'Seu Perfil',
      FIRST,
      SECOND,
      // The Possible group card of the second Question.
      'Faça a conta',
      'Limitações e o que não se sabe',
      'Fichas citadas',
    ])
    await expect(page.locator('[data-slot="abertura"]')).toContainText(
      'Onde os casais se conhecem hoje e se o lugar muda a relação.',
    )
    await expect(question(page, FIRST).locator('h3')).toHaveText([
      'O que a evidência diz',
      'Dicas',
      'Varia conforme o Perfil?',
      'O que circula por aí e não se sustenta',
      'Ajudou?',
    ])
    await noSideScroll(page)
  })

  test('the index lists each Question with its short answer, without numbers, and leads to its section', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const index = page.getByRole('navigation', { name: 'Perguntas deste Guia' })
    const items = index.locator('ol[data-slot="perguntas"] > li')
    await expect(items.getByRole('link')).toHaveText([FIRST, SECOND])
    await expect(items.nth(0)).toContainText(
      'No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
    )
    await expect(items.nth(0)).toContainText('moderada')
    await expect(index.locator('a.ref')).toHaveCount(0)
    await items.nth(1).getByRole('link').click()
    await expect(page).toHaveURL(`${GUIDE}#app-ou-presencial`)
    await expect(
      question(page, SECOND).getByRole('heading', { level: 2 }).first(),
    ).toBeInViewport()
  })

  test('the short answer shows the Confidence in three steps, with the word, and the key number with the Fact sheet', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const answer = question(page, FIRST).locator('[data-slot="resposta"]')
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
    const tips = question(page, FIRST).getByRole('region', { name: 'Dicas' })
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
    const evidence = question(page, FIRST).getByRole('region', {
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

  test('Profile, struck-out Myths and the Limitations of each Question', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await expect(
      question(page, FIRST).getByRole('region', {
        name: 'Varia conforme o Perfil?',
      }),
    ).toContainText('Entre 18 e 24 anos, a fatia sobe para 24%')
    const myth = question(page, FIRST)
      .getByRole('region', { name: 'O que circula por aí e não se sustenta' })
      .locator('[data-slot="mito"]')
    await expect(myth.locator('s')).toHaveText(
      'Mais da metade dos casais se conhece por app.',
    )
    await expect(myth).toContainText(
      'No Brasil, foi menos de um em cada cinco1.',
    )
    const limitations = page.getByRole('region', {
      name: 'Limitações e o que não se sabe',
    })
    await expect(limitations.locator('h3')).toHaveText([FIRST, SECOND])
    await expect(limitations.getByRole('listitem')).toHaveText([
      'O estudo brasileiro só ouviu capitais.',
      'Ninguém separou app de rede social.',
      'Uma amostra só, dos EUA.',
    ])
  })

  test('the Fact sheets come in one list for the page, numbered, with Status and Strength written, and lead to the Fact sheet', async ({
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
    // Costa 2018 is number 2 in both Questions: one list, one number.
    await expect(
      question(page, SECOND).locator('a.ref').first(),
    ).toHaveAttribute('href', '#ficha-costa-2018-satisfacao')
    await expect(question(page, SECOND).locator('a.ref').first()).toHaveText(
      '2',
    )
    await factSheets
      .nth(1)
      .getByRole('link', {
        name: 'Costa (2018): satisfação e onde os casais se conheceram',
      })
      .click()
    await expect(page).toHaveURL('/estudos/costa-2018-satisfacao')
  })

  test('the whole frame: E no Brasil?, a Myth next to its finding, O que levar, Limitations by Study and the Questions of other Topics', async ({
    page,
  }) => {
    await page.goto(OTHER_GUIDE)
    await expect(page.locator('main h2')).toHaveText([
      'Perguntas deste Guia',
      'Seu Perfil',
      OTHER,
      'Onde ficam as suas prioridades?',
      'O que levar',
      'Limitações e o que não se sabe',
      'Fichas citadas',
      'Perguntas de outros Temas',
    ])
    const section = question(page, OTHER)
    await expect(
      section.getByRole('region', { name: 'E no Brasil?' }),
    ).toContainText('Nenhum estudo brasileiro mediu isso.')
    // The Myth sits right after its finding, with no block of its own.
    const finding = section.locator('ol[data-slot="achados-guia"] > li')
    await expect(finding.locator('[data-slot="mito"] s')).toHaveText(
      'Basta achar a pessoa certa.',
    )
    await expect(
      section.getByRole('region', {
        name: 'O que circula por aí e não se sustenta',
      }),
    ).toHaveCount(0)
    await expect(
      page
        .getByRole('region', { name: 'O que levar' })
        .locator('[data-slot="dica"]'),
    ).toContainText(['Use o app como complemento'])
    const limitations = page.getByRole('region', {
      name: 'Limitações e o que não se sabe',
    })
    const study = limitations.locator('h3')
    await expect(study).toContainText(
      'Costa (2018): satisfação e onde os casais se conheceram',
    )
    await expect(study.locator('a.ref')).toHaveAttribute(
      'href',
      '#ficha-costa-2018-satisfacao',
    )
    await expect(limitations.getByRole('listitem')).toHaveText([
      'Uma amostra só, dos EUA.',
    ])
    const elsewhere = page
      .getByRole('region', { name: 'Perguntas de outros Temas' })
      .getByRole('link', { name: new RegExp(FIRST.replace('?', '\\?')) })
    await expect(elsewhere).toContainText('No Brasil, 18% dos adultos jovens')
    expect((await elsewhere.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await elsewhere.click()
    await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Onde conhecer pessoas',
    )
  })

  test('the search description is the opening', async ({ request }) => {
    const html = await (await request.get(GUIDE)).text()
    expect(html).toContain(
      '<meta name="description" content="Onde os casais se conhecem hoje e se o lugar muda a relação.',
    )
  })

  test("a Question's old page answers 301 to its section, and inside the app it lands there too", async ({
    page,
    request,
  }) => {
    const old = await request.get(`${GUIDE}/app-ou-presencial`, {
      maxRedirects: 0,
    })
    expect(old.status()).toBe(301)
    expect(old.headers().location).toBe(`${GUIDE}#app-ou-presencial`)
    await page.goto(`${GUIDE}/app-ou-presencial`)
    await expect(page).toHaveURL(`${GUIDE}#app-ou-presencial`)
    await expect(
      question(page, SECOND).getByRole('heading', { level: 2 }).first(),
    ).toBeInViewport()
  })

  test('a Question that does not exist, or in the wrong Topic, answers 404, and so does a Topic', async ({
    request,
  }) => {
    expect((await request.get(`${GUIDE}/nao-existe`)).status()).toBe(404)
    expect(
      (await request.get('/outro-tema/onde-os-casais-se-conhecem')).status(),
    ).toBe(404)
    expect((await request.get('/tema-que-nao-existe')).status()).toBe(404)
  })
})

test.describe('Guide page without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the whole Guide is in the HTML, and the index and the old address lead to the section', async ({
    page,
  }) => {
    await page.goto(`${GUIDE}/app-ou-presencial`)
    await expect(page).toHaveURL(`${GUIDE}#app-ou-presencial`)
    await expect(page.locator('main h2')).toContainText([FIRST, SECOND])
    await page
      .getByRole('navigation', { name: 'Perguntas deste Guia' })
      .getByRole('link', { name: FIRST })
      .click()
    await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
    await expect(
      question(page, FIRST).getByRole('heading', { level: 2 }).first(),
    ).toBeInViewport()
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
    ).toHaveAttribute('href', GUIDE)
    await expect(topics.getByRole('link', { name: FIRST })).toHaveAttribute(
      'href',
      `${GUIDE}#onde-os-casais-se-conhecem`,
    )
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
    await topics.getByRole('link', { name: FIRST }).click()
    await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
    await page.goBack()
    await expect(topics.getByRole('link', { name: FIRST })).toBeVisible()
  })
})

test.describe('home page without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test("a Topic opens and its Question leads to the Question's section", async ({
    page,
  }) => {
    await page.goto('/')
    const topics = page.getByRole('region', { name: 'Os Temas' })
    await topics.getByText('Escolher parceiro').click()
    await topics.getByRole('link', { name: OTHER }).click()
    await expect(page).toHaveURL(`${OTHER_GUIDE}#que-caracteristicas-preveem`)
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

  test('/dicas/<slug> shows the Tip, the Fact sheets and the Questions it appears in', async ({
    page,
  }) => {
    await page.goto('/dicas/apps-como-complemento')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Use o app como complemento, não como o único caminho.',
    )
    await expect(
      page.getByRole('region', { name: 'Fichas citadas' }).locator('ol > li'),
    ).toHaveCount(2)
    const questions = page
      .getByRole('region', { name: 'Aparece nos Guias' })
      .getByRole('link')
    await expect(questions).toHaveText([
      /Onde os casais se conhecem hoje\?/,
      /App ou presencial/,
    ])
    await questions.first().click()
    await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
  })

  test('a Tip resting on a ⬜ Fact sheet is not published', async ({
    request,
  }) => {
    expect((await request.get('/dicas/encontros-presenciais')).status()).toBe(
      404,
    )
  })
})
