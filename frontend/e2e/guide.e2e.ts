// The Guide (the Topic's page, ADR 0042), the home page and the Tips over the
// fixture content (`e2e/library`): "Onde conhecer pessoas" with two Chapters,
// each answering one Question, a Myth, a Tip, the marks inside a sentence and
// "O que não se sabe"; "Escolher parceiro" with one Chapter and the frame
// ("O que levar", a Question of another Topic); one published Tip (an
// inference) and one that rests on a ⬜ Fact sheet and stays off the site.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const FIRST = 'Onde os casais se conhecem hoje?'
const SECOND = 'App ou presencial, onde tenho mais chance?'
const OTHER_GUIDE = '/escolher-parceiro'
const OTHER = 'Que características do parceiro preveem uma boa relação?'
const CHAPTER_1 = 'O app virou um caminho comum'
const CHAPTER_2 = 'O lugar quase não muda a relação'

/** Where the Guide answers a Question. */
const answer = (page: Page, name: string) =>
  page.getByRole('region', { name, exact: true })
const chapter = (page: Page, name: string) =>
  page.getByRole('region', { name, exact: true })

const noSideScroll = async (page: Page) => {
  const { pageWidth, screenWidth } = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    screenWidth: window.innerWidth,
  }))
  expect(pageWidth).toBeLessThanOrEqual(screenWidth)
}

test.describe('Guide page', () => {
  test('has the Chapters, Em resumo, the Profile, the opening, the Chapters and the frame, in order', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await expect(page).toHaveTitle('Onde conhecer pessoas · Tem estudo?')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Onde conhecer pessoas',
    )
    await expect(page.locator('main h2')).toHaveText([
      'Capítulos',
      'Em resumo',
      'Seu Perfil',
      `1${CHAPTER_1}`,
      `2${CHAPTER_2}`,
      // The Possible group card after the second answer.
      'Faça a conta',
      'O que levar',
      'O que não se sabe',
      // The Topic's Readings of Neighbor sites (#179).
      'Para ler além daqui',
      'Fichas citadas',
      'Ajudou?',
      'Perguntas de outros Temas',
    ])
    await expect(page.locator('[data-slot="abertura"]')).toContainText(
      'Onde os casais se conhecem hoje e se o lugar muda a relação.',
    )
    // Each answer is a note in its Chapter, with no block of its own: no
    // findings list, no "E no Brasil?" nor "Varia conforme o Perfil?".
    await expect(chapter(page, CHAPTER_1).locator('h3')).toHaveText([FIRST])
    await expect(page.locator('[data-slot="achados-guia"]')).toHaveCount(0)
    await noSideScroll(page)
  })

  test('the Chapters under the title lead to each Chapter', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const contents = page.getByRole('navigation', { name: 'Capítulos' })
    await expect(contents.getByRole('link')).toHaveText([
      `1${CHAPTER_1}`,
      `2${CHAPTER_2}`,
    ])
    await contents.getByRole('link').nth(1).click()
    await expect(page).toHaveURL(`${GUIDE}#o-lugar-quase-nao-muda-a-relacao`)
    await expect(
      chapter(page, CHAPTER_2).getByRole('heading', { level: 2 }).first(),
    ).toBeInViewport()
  })

  test('Em resumo lists each Question with the first sentence of its short answer, without numbers, and leads to the answer', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const summary = page.getByRole('region', { name: 'Em resumo' })
    const items = summary.locator('ol[data-slot="perguntas"] > li')
    await expect(items.getByRole('link')).toHaveText([FIRST, SECOND])
    await expect(items.nth(0)).toContainText(
      'No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
    )
    await expect(items.nth(0)).not.toContainText('Os estudos divergem')
    await expect(items.nth(0)).toContainText('moderada')
    await expect(summary.locator('a.ref')).toHaveCount(0)
    await items.nth(1).getByRole('link').click()
    await expect(page).toHaveURL(`${GUIDE}#app-ou-presencial`)
    await expect(answer(page, SECOND).locator('h3')).toBeInViewport()
  })
})

test.describe('a Chapter', () => {
  test('the answer shows the Question, the Confidence in three steps with the word, and the key number with the Fact sheet', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const first = answer(page, FIRST)
    await expect(first).toHaveAttribute('data-slot', 'resposta')
    await expect(first.locator('[data-confidence="moderate"]')).toContainText(
      'moderada',
    )
    await expect(
      first.locator('[data-confidence] svg path[fill="currentColor"]'),
    ).toHaveCount(2)
    await expect(first.locator('mark.numero-chave')).toHaveText(
      '18% dos adultos jovens',
    )
    const ref = first.getByRole('link', {
      name: 'Ficha 1: Silva e Souza (2020): apps de namoro no Brasil',
    })
    await expect(ref).toHaveText('1')
    await expect(ref).toHaveAttribute('href', '#ficha-silva-2020-apps-brasil')
  })

  test('the prose carries the "no Brasil" mark, and the Myth and the Tip sit where the body places them', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const one = chapter(page, CHAPTER_1)
    await expect(one.locator('.marca-brasil')).toHaveText('no Brasil')
    // The "vale para você" waits for a Profile.
    await expect(one.locator('[data-voce]')).toBeHidden()
    const myth = one.locator('[data-slot="mito"]')
    await expect(myth.locator('s')).toHaveText(
      'Mais da metade dos casais se conhece por app.',
    )
    await expect(myth).toContainText(
      'No Brasil, foi menos de um em cada cinco1.',
    )
    const tip = chapter(page, CHAPTER_2).locator('[data-slot="dica"]')
    await expect(tip).toContainText(
      'Use o app como complemento, não como o único caminho12.',
    )
    await expect(tip).toContainText('Inferência nossa')
    await expect(tip.locator('[data-strength="moderate"]')).toContainText(
      'moderada',
    )
    // One reference per Fact sheet, glued, before the final period.
    await expect(tip.locator('a.ref')).toHaveText(['1', '2'])
    await expect(tip.locator('.nw').first()).toHaveText('caminho12.')
  })
})

test.describe('a Visual on a small phone', () => {
  test('a relation diagram fits a phone narrower than 340px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto(GUIDE)
    const drawing = page.locator('[data-slot="diagrama"]').first()
    await expect(drawing).toBeVisible()
    // What each SVG draws and each node box, against the column's edges.
    const overflow = await drawing.evaluate((element) => {
      const column = element.getBoundingClientRect()
      const rights = [...element.children].map((child) => {
        const rect = child.getBoundingClientRect()
        if (!(child instanceof SVGSVGElement)) return rect.right
        const drawn = child.getBBox()
        return rect.left + drawn.x + drawn.width
      })
      return Math.max(...rights) - column.right
    })
    expect(overflow).toBeLessThanOrEqual(1)
    await noSideScroll(page)
  })
})

test.describe("the Guide's frame", () => {
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
    // Costa 2018 is number 2 in both Chapters: one list, one number.
    await expect(answer(page, SECOND).locator('a.ref').first()).toHaveAttribute(
      'href',
      '#ficha-costa-2018-satisfacao',
    )
    await expect(answer(page, SECOND).locator('a.ref').first()).toHaveText('2')
    await factSheets
      .nth(1)
      .getByRole('link', {
        name: 'Costa (2018): satisfação e onde os casais se conheceram',
      })
      .click()
    await expect(page).toHaveURL('/estudos/costa-2018-satisfacao')
  })

  test('O que não se sabe is short prose, and no Limitations block is left', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await expect(
      page.getByRole('region', { name: 'O que não se sabe' }),
    ).toHaveText(
      'O que não se sabeNenhum estudo separou app de rede social, e o estudo brasileiro só ouviu capitais.',
    )
    await expect(
      page.getByRole('region', { name: 'Limitações e o que não se sabe' }),
    ).toHaveCount(0)
  })
})

test.describe('the other Guide', () => {
  test('the other Guide: one Chapter, the Priorities card after its answer, O que levar and the Questions of other Topics', async ({
    page,
  }) => {
    await page.goto(OTHER_GUIDE)
    await expect(page.locator('main h2')).toHaveText([
      'Capítulos',
      'Em resumo',
      'Seu Perfil',
      '1Como vocês se tratam pesa mais',
      'Onde ficam as suas prioridades?',
      'O que levar',
      'Fichas citadas',
      'Ajudou?',
      'Perguntas de outros Temas',
    ])
    await expect(answer(page, OTHER)).toContainText(
      'Como vocês se tratam pesa mais que a lista de qualidades do parceiro',
    )
    await expect(
      page
        .getByRole('region', { name: 'O que levar' })
        .locator('[data-slot="dica"]'),
    ).toContainText(['Use o app como complemento'])
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
})

test.describe("the Guide's addresses", () => {
  test('the search description is the opening', async ({ request }) => {
    const html = await (await request.get(GUIDE)).text()
    expect(html).toContain(
      '<meta name="description" content="Onde os casais se conhecem hoje e se o lugar muda a relação.',
    )
  })

  test("a Question's old page answers 301 to its answer, and inside the app it lands there too", async ({
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
    await expect(answer(page, SECOND).locator('h3')).toBeInViewport()
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

  test('the whole Guide is in the HTML, and Em resumo, the Chapters and the old address lead to their place', async ({
    page,
  }) => {
    await page.goto(`${GUIDE}/app-ou-presencial`)
    await expect(page).toHaveURL(`${GUIDE}#app-ou-presencial`)
    await expect(page.locator('main h3')).toContainText([FIRST, SECOND])
    await page
      .getByRole('region', { name: 'Em resumo' })
      .getByRole('link', { name: FIRST })
      .click()
    await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
    await expect(answer(page, FIRST).locator('h3')).toBeInViewport()
    await page
      .getByRole('navigation', { name: 'Capítulos' })
      .getByRole('link')
      .nth(1)
      .click()
    await expect(page).toHaveURL(`${GUIDE}#o-lugar-quase-nao-muda-a-relacao`)
    // The "vale para você" stays hidden without JS, as without a Profile.
    await expect(page.locator('[data-voce]')).toBeHidden()
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

  test("a Topic opens and its Question leads to the Question's answer", async ({
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

  test('/dicas/<slug> shows the Tip, the Fact sheets and the Questions of the Chapter that places it', async ({
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
    await expect(questions).toHaveText([/App ou presencial/])
    await questions.first().click()
    await expect(page).toHaveURL(`${GUIDE}#app-ou-presencial`)
  })

  test('a Tip resting on a ⬜ Fact sheet is not published', async ({
    request,
  }) => {
    expect((await request.get('/dicas/encontros-presenciais')).status()).toBe(
      404,
    )
  })
})
