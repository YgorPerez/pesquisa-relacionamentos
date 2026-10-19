// Compartilhar as calculadoras por link (#34): "Copiar link" leva o estado na
// query, quem abre num outro navegador recebe esse estado no lugar do salvo,
// a query sai da barra, a página com query fica fora da busca e a prévia das
// redes mostra o resultado sem o Perfil de quem mandou. Sobre a fixture
// `e2e/acervo` (dados do Grupo possível só do Acre).
import { devices, expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { tocar } from './toque'

const SITE = 'https://temestudo.com'
const faixa = (page: Page) => page.locator('.gp-preso .gp-faixa')
const salvo = (page: Page, chave: string) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(`tem-estudo:${k}`) ?? 'null'), chave)
const compartilhar = (page: Page) => page.getByRole('region', { name: 'Compartilhar' })

async function comAreaDeTransferencia(context: BrowserContext) {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
}

async function copiarLink(page: Page): Promise<string> {
  await compartilhar(page).getByRole('button', { name: 'Copiar link' }).click()
  await expect(compartilhar(page).getByRole('status')).toHaveText('Link copiado.')
  return page.evaluate(() => navigator.clipboard.readText())
}

/** Outro aparelho: um contexto novo, com um estado salvo diferente do do link. */
async function outroAparelho(browser: Browser, salvos: Record<string, unknown>) {
  const context = await browser.newContext({ ...devices['Pixel 7'] })
  await context.addInitScript((itens) => {
    // Só na primeira carga: depois, vale o que a página gravou.
    if (sessionStorage.getItem('semeado')) return
    sessionStorage.setItem('semeado', '1')
    for (const [chave, valor] of Object.entries(itens)) localStorage.setItem(`tem-estudo:${chave}`, JSON.stringify(valor))
  }, salvos)
  return { context, page: await context.newPage() }
}

async function dizerPerfil(page: Page, genero: string, procura: string, idade: string) {
  const form = page.getByRole('form', { name: 'Seu Perfil' })
  await form.getByRole('group', { name: 'Você é' }).getByRole('radio', { name: genero, exact: true }).check()
  await form.getByRole('group', { name: 'Você procura' }).getByRole('radio', { name: procura, exact: true }).check()
  await form.getByLabel('Sua idade').fill(idade)
  await form.getByRole('button', { name: 'Usar na conta' }).click()
}

test.describe('link do Grupo possível', () => {
  test('copiar, abrir em outro aparelho: o estado do link troca o salvo e a query sai da barra', async ({ page, context, browser }) => {
    await comAreaDeTransferencia(context)
    await page.goto('/grupo-possivel', { waitUntil: 'networkidle' })
    await expect(compartilhar(page)).toContainText('Este link mostra só a conta do Brasil inteiro, sem nada seu.')

    await dizerPerfil(page, 'homem', 'mulheres', '30')
    await page.locator('#req-escolaridade').getByRole('radio', { name: 'superior completo' }).check()
    const lugar = page.locator('#req-lugar')
    await lugar.getByLabel('Estado').selectOption('AC')
    await lugar.getByLabel('Município').selectOption({ label: 'Rio Branco' })
    await expect(compartilhar(page)).toContainText(
      'Este link mostra: homem, 30, procura mulheres, ensino superior, em Rio Branco (AC).',
    )
    await expect(compartilhar(page)).toContainText('sem guardar o gênero')
    await expect(page.locator('.gp-preso [aria-live]')).not.toHaveClass(/gp-carregando/)
    const numero = (await faixa(page).textContent()) ?? ''

    const link = await copiarLink(page)
    const url = new URL(link)
    expect(url.pathname).toBe('/grupo-possivel')
    expect(url.search).toBe('?v=1&genero=homem&procura=mulheres&idade=30&uf=AC&municipio=1200401&escolaridade=superior')

    const outro = await outroAparelho(browser, {
      perfil: { genero: 'mulher', procura: 'homens', idade: 50 },
      'grupo-possivel': { idade: null, lugar: null, companheiro: false, escolaridade: null, renda: null, cores: [], religioes: [], semFilhos: false, altura: { min: 140, max: 200 }, naoFuma: true },
    })
    await outro.page.goto(`${url.pathname}${url.search}`)
    await expect(outro.page).toHaveURL(/\/grupo-possivel$/)
    await expect(outro.page.getByRole('status').filter({ hasText: 'trocou' })).toContainText(
      'Este link trocou o seu Perfil e os seus Requisitos salvos pelos de quem mandou.',
    )
    await expect(faixa(outro.page)).toHaveText(numero)
    expect(await salvo(outro.page, 'perfil')).toEqual({ genero: 'homem', procura: 'mulheres', idade: 30 })
    expect(await salvo(outro.page, 'grupo-possivel')).toMatchObject({
      lugar: { uf: 'AC', municipio: '1200401' },
      escolaridade: 'superior',
      naoFuma: false,
      companheiro: true,
    })

    // Recarregar sem a query fica com o estado novo, sem o aviso.
    await outro.page.reload()
    await expect(faixa(outro.page)).toHaveText(numero)
    await expect(outro.page.getByRole('status').filter({ hasText: 'trocou' })).toHaveCount(0)
    await outro.context.close()
  })

  test('com query: noindex, canonical sem query e a prévia sem o Perfil, já no HTML do servidor', async ({ request }) => {
    const html = await (
      await request.get('/grupo-possivel?v=1&genero=homem&procura=mulheres&idade=30&uf=AC&municipio=1200401&nao-fuma=sim')
    ).text()
    expect(html).toContain('<meta name="robots" content="noindex"')
    expect(html).toContain(`<link rel="canonical" href="${SITE}/grupo-possivel"`)
    const og = (p: string) => html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`))?.[1]
    expect(og('title')).toMatch(/^Entre .+ e .+ mulheres em Rio Branco \(AC\), na idade procurada$/)
    expect(og('description')).toBe('Pela conta do Grupo possível, com o Censo 2022 e a PNS 2019. Também pediu: não fuma. Faça a sua conta.')
    expect(og('url')).toBe(`${SITE}/grupo-possivel`)
    for (const texto of [og('title'), og('description')]) expect(texto).not.toMatch(/homem|homens|30|25|35|interessa/)
  })

  test('sem query, a prévia é a da página e não há noindex', async ({ request }) => {
    const html = await (await request.get('/grupo-possivel')).text()
    expect(html).not.toContain('name="robots"')
    expect(html).not.toContain('<meta property="og:title" content="Entre')
  })

  test('a chave de não ser contado não vai no link e o link não a toca', async ({ browser }) => {
    const outro = await outroAparelho(browser, { 'nao-contar': true })
    await outro.page.goto('/grupo-possivel?v=1&genero=mulher&nao-contar=nao&contar=sim')
    await expect(outro.page).toHaveURL(/\/grupo-possivel$/)
    expect(await salvo(outro.page, 'nao-contar')).toBe(true)
    const chaves = await outro.page.evaluate(() => Object.keys(localStorage).sort())
    expect(chaves).toEqual(['tem-estudo:nao-contar', 'tem-estudo:perfil'])
    await outro.context.close()
  })
})

test.describe('link de Prioridades', () => {
  const chip = (page: Page, nome: string) =>
    page.getByRole('region', { name: 'Seu topo 3' }).getByRole('button', { name: new RegExp(`${nome}$`) })

  test('copiar, abrir em outro aparelho: o topo 3 do link troca o salvo', async ({ page, context, browser }) => {
    await comAreaDeTransferencia(context)
    await page.goto('/prioridades', { waitUntil: 'networkidle' })
    for (const nome of ['Renda', 'Química sexual', 'Ser parecido comigo']) await tocar(chip(page, nome))
    await page.getByRole('radio', { name: 'Duração' }).check()
    await expect(compartilhar(page)).toContainText(
      'Este link mostra: topo 3 renda, química sexual e ser parecido comigo, em duração.',
    )
    const link = new URL(await copiarLink(page))
    expect(link.search).toBe('?v=1&topo=renda,sexo,parecido&desfecho=duracao')

    const outro = await outroAparelho(browser, { prioridades: { topo3: ['gentileza'], desfecho: 'atracao' } })
    await outro.page.goto(`${link.pathname}${link.search}`)
    await expect(outro.page).toHaveURL(/\/prioridades$/)
    await expect(chip(outro.page, 'Química sexual')).toHaveAccessibleName('sua 2ª: Química sexual')
    await expect(outro.page.getByRole('radio', { name: 'Duração' })).toBeChecked()
    expect(await salvo(outro.page, 'prioridades')).toEqual({ topo3: ['renda', 'sexo', 'parecido'], desfecho: 'duracao' })
    await outro.context.close()
  })

  test('do Perfil, o link leva só o gênero, e quem abre guarda o resto do seu', async ({ page, context, browser }) => {
    await comAreaDeTransferencia(context)
    await context.addInitScript(() =>
      localStorage.setItem('tem-estudo:perfil', JSON.stringify({ genero: 'mulher', procura: 'homens', idade: 41 })),
    )
    await page.goto('/prioridades', { waitUntil: 'networkidle' })
    await tocar(chip(page, 'Renda'))
    await expect(compartilhar(page)).toContainText('Este link mostra: mulher, topo 3 renda, em satisfação.')
    const link = new URL(await copiarLink(page))
    expect(link.search).toBe('?v=1&genero=mulher&topo=renda&desfecho=satisfacao')

    const outro = await outroAparelho(browser, { perfil: { genero: 'homem', procura: 'mulheres', idade: 30 } })
    await outro.page.goto(`${link.pathname}${link.search}`)
    await expect(outro.page.getByRole('status').filter({ hasText: 'trocou' })).toHaveText(
      'Este link trocou o seu topo 3 e o gênero do seu Perfil pelos de quem mandou.',
    )
    expect(await salvo(outro.page, 'perfil')).toEqual({ genero: 'mulher', procura: 'mulheres', idade: 30 })
    await outro.context.close()
  })

  test('a prévia mostra o topo 3 e o alerta', async ({ request }) => {
    const html = await (await request.get('/prioridades?v=1&genero=homem&idade=33&topo=sexo,renda&desfecho=satisfacao')).text()
    expect(html).toContain('<meta name="robots" content="noindex"')
    expect(html).toContain('<meta property="og:title" content="Topo 3: química sexual e renda"')
    expect(html).toContain('<meta property="og:description" content="No seu topo 3, para satisfação: para renda não há boa evidência."')
    expect(html).not.toMatch(/<meta[^>]+content="[^"]*(homem|33)[^"]*"/)
  })

  test('query inválida não troca o estado salvo e sai da barra', async ({ browser }) => {
    const outro = await outroAparelho(browser, { prioridades: { topo3: ['gentileza'], desfecho: 'atracao' } })
    await outro.page.goto('/prioridades?v=99&topo=renda')
    await expect(outro.page).toHaveURL(/\/prioridades$/)
    await expect(chip(outro.page, 'Gentileza')).toHaveAccessibleName('sua 1ª: Gentileza')
    expect(await salvo(outro.page, 'prioridades')).toEqual({ topo3: ['gentileza'], desfecho: 'atracao' })
    await outro.context.close()
  })
})

test('o Compartilhar do Guia copia o link sem query', async ({ page, context }) => {
  await comAreaDeTransferencia(context)
  await page.goto('/onde-conhecer-pessoas/app-ou-presencial?genero=homem', { waitUntil: 'networkidle' })
  const link = await copiarLink(page)
  expect(link).toMatch(/^http:\/\/localhost:\d+\/onde-conhecer-pessoas\/app-ou-presencial$/)
  await expect(compartilhar(page)).toContainText('O link leva só o endereço do Guia, sem o seu Perfil.')
})
