// O Guia, o Tema, o início e as Dicas sobre o conteúdo de fixture
// (`e2e/acervo`): um Tema com dois Guias, uma Dica publicada (inferência) e
// uma que se apoia numa Ficha ⬜ e fica fora do site.
import { expect, test, type Page } from '@playwright/test'

const GUIA = '/onde-conhecer-pessoas/onde-os-casais-se-conhecem'

const semRolagemLateral = async (page: Page) => {
  const { pagina, tela } = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    tela: window.innerWidth,
  }))
  expect(pagina).toBeLessThanOrEqual(tela)
}

test.describe('página do Guia', () => {
  test('tem as seções na ordem do #7', async ({ page }) => {
    await page.goto(GUIA)
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
    await semRolagemLateral(page)
  })

  test('a resposta curta traz a Confiança em três degraus, com a palavra, e o número-chave com a Ficha', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const resposta = page.getByRole('region', { name: 'Resposta curta' })
    await expect(resposta).toContainText('Confiança da resposta')
    await expect(resposta.locator('[data-confianca="moderada"]')).toContainText(
      'moderada',
    )
    await expect(
      resposta.locator('[data-confianca] svg path[fill="currentColor"]'),
    ).toHaveCount(2)
    await expect(resposta.locator('mark.numero-chave')).toHaveText(
      '18% dos adultos jovens',
    )
    const ref = resposta.getByRole('link', {
      name: 'Ficha 1: Silva e Souza (2020): apps de namoro no Brasil',
    })
    await expect(ref).toHaveText('1')
    await expect(ref).toHaveAttribute('href', '#ficha-silva-2020-apps-brasil')
  })

  test('a Dica diz a Força e marca a inferência nossa', async ({ page }) => {
    await page.goto(GUIA)
    const dicas = page.getByRole('region', { name: 'Dicas' })
    await expect(dicas).toContainText(
      'Use o app como complemento, não como o único caminho12.',
    )
    await expect(dicas).toContainText('Inferência nossa')
    await expect(dicas.locator('[data-forca="moderada"]')).toContainText(
      'moderada',
    )
    // Uma referência por Ficha, grudadas, antes do ponto final.
    await expect(dicas.locator('a.ref')).toHaveText(['1', '2'])
    await expect(dicas.locator('.nw').first()).toHaveText('caminho12.')
  })

  test('cada achado mostra país e ano e a nota Vale para', async ({ page }) => {
    await page.goto(GUIA)
    const evidencia = page.getByRole('region', {
      name: 'O que a evidência diz',
    })
    const achados = evidencia.locator('ol.achados-guia > li')
    await expect(achados).toHaveCount(2)
    await expect(achados.nth(0).locator('.onde')).toHaveText('Brasil2019')
    await expect(achados.nth(0)).toContainText(
      'Vale para: homens e mulheres, de 18 a 35 anos.',
    )
    await expect(achados.nth(1).locator('.onde')).toHaveText('EUA2017')
    await expect(achados.nth(1)).toContainText(
      'Vale para: casais homem-mulher.',
    )
  })

  test('a divergência aparece numa tabela com os dois lados e o melhor desenho', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const tabela = page.getByRole('table', { name: 'A evidência diverge' })
    await expect(tabela.getByRole('columnheader')).toHaveText([
      'O app junta muitos casais',
      'O lugar quase não importa',
    ])
    await expect(tabela.getByRole('cell')).toHaveCount(2)
    await expect(page.locator('.melhor-desenho')).toContainText(
      'A amostra brasileira foi sorteada',
    )
  })

  test('Perfil, Mitos riscados e Limitações', async ({ page }) => {
    await page.goto(GUIA)
    await expect(
      page.getByRole('region', { name: 'Varia conforme o Perfil?' }),
    ).toContainText('Entre 18 e 24 anos, a fatia sobe para 24%')
    const mito = page
      .getByRole('region', { name: 'O que circula por aí e não se sustenta' })
      .locator('.mito')
    await expect(mito.locator('s')).toHaveText(
      'Mais da metade dos casais se conhece por app.',
    )
    await expect(mito).toContainText(
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

  test('as Fichas citadas vêm numeradas, com Status e Força escritos, e levam à Ficha', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const fichas = page
      .getByRole('region', { name: 'Fichas citadas' })
      .locator('ol > li')
    await expect(fichas).toHaveCount(2)
    await expect(fichas.nth(0)).toHaveAttribute(
      'id',
      'ficha-silva-2020-apps-brasil',
    )
    await expect(fichas.nth(0)).toContainText('1')
    await expect(fichas.nth(0)).toContainText('lido no original')
    await expect(fichas.nth(0)).toContainText('forte')
    await expect(fichas.nth(1)).toContainText('parcial')
    await fichas
      .nth(1)
      .getByRole('link', {
        name: 'Costa (2018): satisfação e onde os casais se conheceram',
      })
      .click()
    await expect(page).toHaveURL('/estudos/costa-2018-satisfacao')
  })

  test('as Perguntas relacionadas levam ao outro Guia, com a primeira frase da resposta', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const relacionada = page
      .getByRole('region', { name: 'Perguntas relacionadas' })
      .getByRole('link', {
        name: /App ou presencial, onde tenho mais chance\?/,
      })
    await expect(relacionada).toContainText('Depende de quem você procura.')
    expect((await relacionada.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await relacionada.click()
    await expect(page).toHaveURL('/onde-conhecer-pessoas/app-ou-presencial')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'App ou presencial, onde tenho mais chance?',
    )
  })

  test('a descrição de busca é a resposta curta, e o topo leva ao Tema', async ({
    page,
    request,
  }) => {
    const html = await (await request.get(GUIA)).text()
    expect(html).toContain(
      '<meta name="description" content="No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
    )
    await page.goto(GUIA)
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Onde conhecer pessoas' })
      .click()
    await expect(page).toHaveURL('/onde-conhecer-pessoas')
  })

  test('Guia que não existe, ou no Tema errado, responde 404', async ({
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

test.describe('página do Tema', () => {
  test('mostra o contexto e as Perguntas na ordem, cada uma com a resposta curta', async ({
    page,
  }) => {
    await page.goto('/onde-conhecer-pessoas')
    await expect(page).toHaveTitle('Onde conhecer pessoas · Tem estudo?')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Onde conhecer pessoas',
    )
    await expect(page.locator('.contexto')).toContainText(
      'Onde os casais se conhecem hoje e se o lugar muda a relação.',
    )
    const perguntas = page.locator('ol.perguntas > li')
    await expect(perguntas.getByRole('heading', { level: 2 })).toHaveText([
      'Onde os casais se conhecem hoje?',
      'App ou presencial, onde tenho mais chance?',
    ])
    await expect(perguntas.nth(0)).toContainText(
      'No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
    )
    await expect(perguntas.nth(0)).toContainText('moderada')
    // O Tema não cita Fichas: elas ficam no Guia.
    await expect(perguntas.locator('a.ref')).toHaveCount(0)
    await perguntas.nth(1).getByRole('link').first().click()
    await expect(page).toHaveURL('/onde-conhecer-pessoas/app-ou-presencial')
    await semRolagemLateral(page)
  })

  test('Tema que não existe responde 404', async ({ request }) => {
    expect((await request.get('/tema-que-nao-existe')).status()).toBe(404)
  })
})

test.describe('página inicial', () => {
  test('traz a frase do site, os Temas com as Perguntas e os atalhos para as calculadoras', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const temas = page.getByRole('region', { name: 'Os Temas' })
    await expect(
      temas.getByRole('link', { name: 'Onde conhecer pessoas' }),
    ).toHaveAttribute('href', '/onde-conhecer-pessoas')
    await expect(
      temas.getByRole('link', { name: 'Onde os casais se conhecem hoje?' }),
    ).toHaveAttribute('href', GUIA)
    const calculadoras = page.getByRole('region', { name: 'Faça a conta' })
    await expect(
      calculadoras.getByRole('link', { name: /Grupo possível/ }),
    ).toHaveAttribute('href', '/grupo-possivel')
    await expect(
      calculadoras.getByRole('link', { name: /Prioridades/ }),
    ).toHaveAttribute('href', '/prioridades')
    await semRolagemLateral(page)
  })
})

test.describe('Dicas', () => {
  test('/dicas lista só as Dicas publicadas, com a Força', async ({ page }) => {
    await page.goto('/dicas')
    await expect(page).toHaveTitle('Dicas · Tem estudo?')
    const dicas = page.locator('ol.dicas > li')
    await expect(dicas).toHaveCount(1)
    await expect(dicas.first()).toContainText(
      'Use o app como complemento, não como o único caminho.',
    )
    await expect(dicas.first()).toContainText('moderada')
    await expect(dicas.first()).toContainText('Inferência nossa')
    await dicas.first().getByRole('link').click()
    await expect(page).toHaveURL('/dicas/apps-como-complemento')
  })

  test('/dicas/<slug> mostra a Dica, as Fichas e os Guias em que ela aparece', async ({
    page,
  }) => {
    await page.goto('/dicas/apps-como-complemento')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Use o app como complemento, não como o único caminho.',
    )
    await expect(
      page.getByRole('region', { name: 'Fichas citadas' }).locator('ol > li'),
    ).toHaveCount(2)
    const guias = page
      .getByRole('region', { name: 'Aparece nos Guias' })
      .getByRole('link')
    await expect(guias).toHaveText([
      /Onde os casais se conhecem hoje\?/,
      /App ou presencial/,
    ])
    await guias.first().click()
    await expect(page).toHaveURL(GUIA)
  })

  test('Dica apoiada em Ficha ⬜ não é publicada', async ({ request }) => {
    expect((await request.get('/dicas/encontros-presenciais')).status()).toBe(
      404,
    )
  })
})
