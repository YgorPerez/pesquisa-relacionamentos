// As Fichas no celular, sobre o conteúdo de fixture (`e2e/acervo`): uma ✅
// (silva-2020), uma 🟡 (costa-2018) e uma ⬜ (lima-2015).
import { expect, test, type Page } from '@playwright/test'

const semRolagemLateral = async (page: Page) => {
  const { pagina, tela } = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    tela: window.innerWidth,
  }))
  expect(pagina).toBeLessThanOrEqual(tela)
}

test.describe('/estudos', () => {
  test('lista as Fichas com Status e Força desenhados e escritos', async ({ page }) => {
    await page.goto('/estudos')
    await expect(page).toHaveTitle('Estudos · Tem estudo?')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('estudos')

    const itens = page.locator('ol.fichas > li')
    // As conferidas primeiro: lida no original, parcial, não verificada.
    await expect(itens.getByRole('link')).toHaveText([
      'Silva e Souza (2020): apps de namoro no Brasil',
      'Costa (2018): satisfação e onde os casais se conheceram',
      'Lima (2015): encontros presenciais e duração',
    ])

    const silva = itens.nth(0)
    await expect(silva).toContainText('lido no original')
    await expect(silva).toContainText('forte')
    await expect(silva).toContainText('Brasil · 2019 · n = 2.400')
    await expect(silva.locator('[data-status="ok"] svg')).toBeVisible()
    await expect(silva.locator('[data-forca="forte"] svg path[fill="currentColor"]')).toHaveCount(3)

    const costa = itens.nth(1)
    await expect(costa).toContainText('parcial')
    await expect(costa.locator('[data-forca="moderada"] svg path[fill="currentColor"]')).toHaveCount(2)

    const lima = itens.nth(2)
    await expect(lima).toContainText('não verificado')
    await expect(lima.locator('[data-forca="fraca"] svg path[fill="currentColor"]')).toHaveCount(1)

    await semRolagemLateral(page)
  })

  test('o título de cada Ficha tem altura de toque de 44px e leva à página dela', async ({
    page,
  }) => {
    await page.goto('/estudos')
    const link = page.getByRole('link', { name: 'Costa (2018): satisfação e onde os casais se conheceram' })
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await link.tap()
    await expect(page).toHaveURL('/estudos/costa-2018-satisfacao')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Costa (2018): satisfação e onde os casais se conheceram',
    )
    await expect(page.getByText('Diferença de satisfação, online vs. presencial')).toBeVisible()
  })
})

test.describe('/estudos/<slug>', () => {
  test('mostra referência, link, amostra, desenho, achados com trecho, limitações e conflito', async ({
    page,
  }) => {
    await page.goto('/estudos/silva-2020-apps-brasil')
    await expect(page).toHaveTitle('Silva e Souza (2020): apps de namoro no Brasil · Tem estudo?')

    const dados = page.locator('.ficha-dados')
    await expect(dados).toContainText('Silva A, Souza B. Apps de namoro no Brasil.')
    await expect(page.getByRole('link', { name: /Abrir o estudo/ })).toHaveAttribute(
      'href',
      'https://doi.org/10.1234/exemplo.2020.1',
    )
    await expect(dados).toContainText('Lido no original em 19/10/2026.')
    await expect(dados).toContainText('2.400. 2.400 adultos de 18 a 35 anos')
    await expect(dados).toContainText('Representativa da população.')
    await expect(dados).toContainText('transversal')
    await expect(dados).toContainText('Brasil · 2019')
    await expect(dados).toContainText('Financiado pela universidade; sem conflito declarado.')
    await expect(dados).toContainText('CC BY 4.0')
    await expect(page.locator('.ficha-meta-grande')).toContainText('lido no original')
    await expect(page.locator('.ficha-meta-grande')).toContainText('evidência forte')

    const achados = page.locator('ol.achados > li')
    await expect(achados).toHaveCount(2)
    await expect(achados.first()).toContainText('18%')
    await expect(achados.first()).toContainText('Conheceram o parceiro por app')
    await expect(achados.first().locator('blockquote')).toHaveText(
      '"18% dos participantes conheceram o parceiro atual por aplicativo"',
    )
    await expect(achados.first()).toContainText('Onde: Tabela 2, p. 50')

    const limitacoes = page.getByRole('region', { name: 'Limitações' })
    await expect(limitacoes.getByRole('listitem')).toHaveText(['Autorrelato.', 'Só capitais.'])

    // "Como usamos" é interno: fica no repositório, não no site.
    await expect(page.getByText('Exemplo de fixture.')).toHaveCount(0)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await semRolagemLateral(page)
  })

  test('Ficha parcial vai para a busca e diz até onde foi conferida', async ({ page }) => {
    await page.goto('/estudos/costa-2018-satisfacao')
    await expect(page.locator('.ficha-dados')).toContainText('Conferido em parte em 18/10/2026.')
    await expect(page.locator('.ficha-dados')).toContainText('Não declarado.')
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  })

  test('Ficha ⬜ aparece como não verificada e leva noindex', async ({ page, request }) => {
    const html = await (await request.get('/estudos/lima-2015-encontros')).text()
    expect(html).toContain('<meta name="robots" content="noindex"')

    await page.goto('/estudos/lima-2015-encontros')
    await expect(page.getByRole('note')).toContainText('Ficha não verificada.')
    await expect(page.locator('.ficha-meta-grande')).toContainText('não verificado')
    await expect(page.locator('.ficha-dados')).toContainText('Ainda não conferida na fonte.')
    await expect(page.getByText('Trecho do original ainda não conferido.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Brasil na amostra' })).toBeVisible()
  })

  test('lista os Guias e as Dicas que citam a Ficha, com link', async ({ page }) => {
    await page.goto('/estudos/silva-2020-apps-brasil')
    const citada = page.getByRole('region', { name: 'Citada em' })
    await expect(citada.getByRole('heading', { level: 3 })).toHaveText(['Guias', 'Dicas'])
    await expect(citada.locator('.linha-pergunta')).toHaveText([
      /Onde os casais se conhecem hoje\?/,
      /App ou presencial, onde tenho mais chance\?/,
    ])
    const dica = citada.getByRole('link', { name: 'Use o app como complemento, não como o único caminho.' })
    expect((await dica.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await dica.tap()
    await expect(page).toHaveURL('/dicas/apps-como-complemento')

    await page.goto('/estudos/silva-2020-apps-brasil')
    await page.getByRole('region', { name: 'Citada em' }).locator('.linha-pergunta').first().tap()
    await expect(page).toHaveURL('/onde-conhecer-pessoas/onde-os-casais-se-conhecem')
  })

  test('Ficha que nada publicado cita diz isso', async ({ page }) => {
    await page.goto('/estudos/lima-2015-encontros')
    await expect(page.getByRole('region', { name: 'Citada em' })).toContainText(
      'Nenhum Guia nem Dica publicada cita esta Ficha ainda.',
    )
  })

  test('voltar leva à lista', async ({ page }) => {
    await page.goto('/estudos/lima-2015-encontros')
    const voltar = page.getByRole('link', { name: 'Todos os estudos' })
    expect((await voltar.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await voltar.tap()
    await expect(page).toHaveURL('/estudos')
  })

  test('Ficha que não existe responde 404', async ({ page }) => {
    const resposta = await page.goto('/estudos/nao-existe-2020')
    expect(resposta?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Essa Ficha não existe')
  })
})
