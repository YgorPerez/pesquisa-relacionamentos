import { expect, test } from '@playwright/test'

test.describe('página inicial', () => {
  test('o servidor responde / já com a página desenhada', async ({
    request,
  }) => {
    const resposta = await request.get('/')
    expect(resposta.status()).toBe(200)
    const html = await resposta.text()
    expect(html).toContain('<html lang="pt-BR"')
    expect(html).toContain('Tem estudo?')
  })

  test('abre com o nome do site, no papel e na tinta do DESIGN.md', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Tem estudo\?/)
    await expect(page.getByRole('link', { name: 'Tem estudo?' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const corpo = page.locator('body')
    await expect(corpo).toHaveCSS('background-color', 'rgb(245, 248, 248)')
    await expect(corpo).toHaveCSS('color', 'rgb(26, 28, 28)')

    // Uma coluna, sem rolagem para o lado.
    const larguras = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      tela: window.innerWidth,
    }))
    expect(larguras.pagina).toBeLessThanOrEqual(larguras.tela)
  })

  test('as fontes vêm do próprio site', async ({ page }) => {
    const fontes: string[] = []
    page.on('request', (pedido) => {
      if (pedido.resourceType() === 'font') fontes.push(pedido.url())
    })
    await page.goto('/')

    // O `load` devolve as faces declaradas que servem àquele texto; sem
    // `@font-face` para a família, a lista vem vazia.
    // A faixa de cada face carregada diz quem desenha o quê: a Atkinson cobre
    // tudo, e a face só de 0 a 9 é a da Source Sans 3.
    const carregadas = await page.evaluate(async () => {
      const faixas = async (fonte: string, texto: string) =>
        (await document.fonts.load(fonte, texto))
          .filter((face) => face.status === 'loaded')
          .map((face) => face.unicodeRange)
      return {
        titulo: await faixas('700 21px "Bricolage Grotesque"', 'Tem estudo?'),
        texto: await faixas('400 17px "Atkinson Hyperlegible"', 'Tem estudo?'),
        algarismos: await faixas('400 17px "Atkinson Hyperlegible"', '2022'),
        nota: await faixas('400 17px Kalam', 'nota'),
      }
    })
    const tudo = 'U+0-10FFFF'
    expect(carregadas).toEqual({
      titulo: [tudo],
      texto: [tudo],
      algarismos: expect.arrayContaining(['U+30-39']),
      nota: [tudo],
    })

    expect(fontes.length).toBeGreaterThan(0)
    const origem = new URL(page.url()).origin
    for (const url of fontes) expect(new URL(url).origin).toBe(origem)
  })

  test('o nome do site no topo tem altura de toque de 44px', async ({
    page,
  }) => {
    await page.goto('/')
    const caixa = await page
      .getByRole('link', { name: 'Tem estudo?' })
      .boundingBox()
    expect(caixa?.height).toBeGreaterThanOrEqual(44)
  })

  test('o <head> leva o ícone da aba, o do iPhone e o manifesto, e todos respondem', async ({
    page,
    request,
  }) => {
    await page.goto('/')
    for (const rel of ['icon', 'apple-touch-icon', 'manifest']) {
      const href = await page.locator(`link[rel="${rel}"]`).getAttribute('href')
      expect(href, rel).toBeTruthy()
      expect((await request.get(href!)).status(), rel).toBe(200)
    }
    const manifesto = await (await request.get('/manifest.webmanifest')).json()
    expect(manifesto.name).toBe('Tem estudo?')
    for (const icone of manifesto.icons)
      expect((await request.get(icone.src)).status(), icone.src).toBe(200)
  })
})
