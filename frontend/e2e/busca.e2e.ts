// Busca e links estáveis (#15), sobre o conteúdo de fixture (`e2e/acervo`):
// sitemap e robots do build, canonical, `noindex` na URL com estado, Open
// Graph do Guia e os 301 da barra final e do `antes` (a Ficha silva-2020 e
// o Guia app-ou-presencial declaram caminhos antigos).
import { expect, test } from '@playwright/test'

const SITE = 'https://temestudo.com'
const GUIA = '/onde-conhecer-pessoas/app-ou-presencial'

test.describe('sitemap e robots', () => {
  test('o sitemap lista as páginas indexadas e deixa a Ficha ⬜ de fora', async ({ request }) => {
    const resposta = await request.get('/sitemap.xml')
    expect(resposta.status()).toBe(200)
    expect(resposta.headers()['content-type']).toContain('xml')
    const locs = [...(await resposta.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs).toEqual([
      `${SITE}/`,
      `${SITE}/escolher-parceiro`,
      `${SITE}/escolher-parceiro/que-caracteristicas-preveem`,
      `${SITE}/onde-conhecer-pessoas`,
      `${SITE}/onde-conhecer-pessoas/onde-os-casais-se-conhecem`,
      `${SITE}${GUIA}`,
      `${SITE}/dicas`,
      `${SITE}/dicas/apps-como-complemento`,
      `${SITE}/estudos`,
      `${SITE}/estudos/costa-2018-satisfacao`,
      `${SITE}/estudos/silva-2020-apps-brasil`,
      `${SITE}/grupo-possivel`,
      `${SITE}/prioridades`,
    ])
  })

  test('o robots aponta o sitemap', async ({ request }) => {
    const resposta = await request.get('/robots.txt')
    expect(resposta.status()).toBe(200)
    expect(await resposta.text()).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })
})

test.describe('canonical e noindex', () => {
  test('a página sem query é indexada, com canonical para ela mesma', async ({ page }) => {
    await page.goto(GUIA)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${GUIA}`)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  })

  test('a URL com query de estado leva noindex e canonical sem a query', async ({ page }) => {
    await page.goto(`${GUIA}?g=mulher&p=homens&i=30`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${GUIA}`)
  })

  test('o noindex da query já vem no HTML do servidor', async ({ request }) => {
    const html = await (await request.get('/estudos?v=1')).text()
    expect(html).toContain('<meta name="robots" content="noindex"')
    expect(html).toContain(`<link rel="canonical" href="${SITE}/estudos"`)
  })

  test('a Ficha ⬜ leva noindex', async ({ page }) => {
    await page.goto('/estudos/lima-2015-encontros')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  })
})

test.describe('Open Graph', () => {
  test('o Guia leva o título e a descrição de busca e a imagem fixa do site', async ({ page, request }) => {
    await page.goto(GUIA)
    const og = (propriedade: string) => page.locator(`meta[property="og:${propriedade}"]`)
    await expect(og('title')).toHaveAttribute('content', 'App ou presencial, onde tenho mais chance?')
    const descricao = await page.locator('meta[name="description"]').getAttribute('content')
    expect(descricao).toBe('Depende de quem você procura. A diferença de satisfação entre os dois caminhos é pequena.')
    await expect(og('description')).toHaveAttribute('content', descricao!)
    await expect(og('url')).toHaveAttribute('content', `${SITE}${GUIA}`)
    await expect(og('image')).toHaveAttribute('content', `${SITE}/og.png`)

    const imagem = await request.get('/og.png')
    expect(imagem.status()).toBe(200)
    expect(imagem.headers()['content-type']).toBe('image/png')
  })
})

test.describe('301', () => {
  const semSeguir = { maxRedirects: 0 }

  test('caminho com barra final vai para o sem barra, com a query', async ({ request }) => {
    const resposta = await request.get('/estudos/?v=1', semSeguir)
    expect(resposta.status()).toBe(301)
    expect(resposta.headers().location).toBe('/estudos?v=1')
  })

  test('o `antes` da Ficha e do Guia leva ao caminho de hoje', async ({ request }) => {
    const ficha = await request.get('/estudos/silva-2020', semSeguir)
    expect(ficha.status()).toBe(301)
    expect(ficha.headers().location).toBe('/estudos/silva-2020-apps-brasil')

    const guia = await request.get('/onde-conhecer-pessoas/app-ou-bar?g=mulher', semSeguir)
    expect(guia.status()).toBe(301)
    expect(guia.headers().location).toBe(`${GUIA}?g=mulher`)

    const deOutroTema = await request.get('/escolher-parceiro/onde-procurar', semSeguir)
    expect(deOutroTema.headers().location).toBe(GUIA)
  })

  test('o navegador chega à página nova', async ({ page }) => {
    await page.goto('/onde-conhecer-pessoas/app-ou-bar/')
    await expect(page).toHaveURL(GUIA)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('App ou presencial')
  })
})
