// Sharing the calculators by link (#34): "Copiar link" carries the state in
// the query, whoever opens it in another browser gets that state in place of
// the saved one, the query leaves the bar, the page with a query stays out of
// search, and the networks' preview shows the result without the sender's
// Profile. Over the `e2e/library` fixture (Possible group data from Acre
// only).
import {
  devices,
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test'
import { choose, tap } from './touch'

const SITE = 'https://temestudo.cloud'
const range = (page: Page) =>
  page.locator('[data-slot="gp-preso"] [data-slot="gp-faixa"]')
const saved = (page: Page, key: string) =>
  page.evaluate(
    (k) => JSON.parse(localStorage.getItem(`tem-estudo:${k}`) ?? 'null'),
    key,
  )
const share = (page: Page) => page.getByRole('region', { name: 'Compartilhar' })

async function withClipboard(context: BrowserContext) {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
}

async function copyLink(page: Page): Promise<string> {
  await share(page).getByRole('button', { name: 'Copiar link' }).click()
  await expect(share(page).getByRole('status')).toHaveText('Link copiado.')
  return page.evaluate(() => navigator.clipboard.readText())
}

/** Another device: a new context, with a saved state different from the
 * link's. */
async function otherDevice(browser: Browser, stored: Record<string, unknown>) {
  const context = await browser.newContext({ ...devices['Pixel 7'] })
  await context.addInitScript((items) => {
    // Only on the first load: after that, what the page saved counts.
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    for (const [key, value] of Object.entries(items))
      localStorage.setItem(`tem-estudo:${key}`, JSON.stringify(value))
  }, stored)
  return { context, page: await context.newPage() }
}

async function fillProfile(
  page: Page,
  gender: string,
  seeks: string,
  age: string,
) {
  const form = page.getByRole('form', { name: 'Seu Perfil' })
  await form
    .getByRole('group', { name: 'Você é' })
    .getByRole('radio', { name: gender, exact: true })
    .check()
  await form
    .getByRole('group', { name: 'Você procura' })
    .getByRole('radio', { name: seeks, exact: true })
    .check()
  await form.getByLabel('Sua idade').fill(age)
  await form.getByRole('button', { name: 'Usar na conta' }).click()
}

test.describe('Possible group link', () => {
  test('copy, open on another device: the link state replaces the saved one and the query leaves the bar', async ({
    page,
    context,
    browser,
  }) => {
    await withClipboard(context)
    await page.goto('/grupo-possivel', { waitUntil: 'networkidle' })
    await expect(share(page)).toContainText(
      'Este link mostra só a conta do Brasil inteiro, sem nada seu.',
    )

    await fillProfile(page, 'homem', 'mulheres', '30')
    await page
      .locator('#req-education')
      .getByRole('radio', { name: 'superior completo' })
      .check()
    const place = page.locator('#req-place')
    await choose(place, 'Estado', 'Acre')
    await choose(place, 'Município', 'Rio Branco')
    await expect(share(page)).toContainText(
      'Este link mostra: homem, 30, procura mulheres, ensino superior, em Rio Branco (AC).',
    )
    await expect(share(page)).toContainText('sem guardar o gênero')
    await expect(page.locator('[data-slot="gp-preso"]')).toHaveAttribute(
      'aria-busy',
      'false',
    )
    const number = (await range(page).textContent()) ?? ''

    const link = await copyLink(page)
    const url = new URL(link)
    expect(url.pathname).toBe('/grupo-possivel')
    expect(url.search).toBe(
      '?v=1&genero=homem&procura=mulheres&idade=30&uf=AC&municipio=1200401&escolaridade=superior',
    )

    const other = await otherDevice(browser, {
      profile: { gender: 'mulher', seeks: 'homens', age: 50 },
      requirements: {
        age: null,
        place: null,
        noLiveInPartner: false,
        education: null,
        income: null,
        colors: [],
        religions: [],
        noChildren: false,
        height: { min: 140, max: 200 },
        nonSmoker: true,
      },
    })
    await other.page.goto(`${url.pathname}${url.search}`)
    await expect(other.page).toHaveURL(/\/grupo-possivel$/)
    await expect(
      other.page.getByRole('status').filter({ hasText: 'trocou' }),
    ).toContainText(
      'Este link trocou o seu Perfil e os seus Requisitos salvos pelos de quem mandou.',
    )
    await expect(range(other.page)).toHaveText(number)
    expect(await saved(other.page, 'profile')).toEqual({
      gender: 'homem',
      seeks: 'mulheres',
      age: 30,
    })
    expect(await saved(other.page, 'requirements')).toMatchObject({
      place: { state: 'AC', municipality: '1200401' },
      education: 'superior',
      nonSmoker: false,
      noLiveInPartner: true,
    })

    // Reloading without the query keeps the new state, without the notice.
    await other.page.reload()
    await expect(range(other.page)).toHaveText(number)
    await expect(
      other.page.getByRole('status').filter({ hasText: 'trocou' }),
    ).toHaveCount(0)
    await other.context.close()
  })

  test('with a query: noindex, canonical without query and the preview without the Profile, already in the server HTML', async ({
    request,
  }) => {
    const html = await (
      await request.get(
        '/grupo-possivel?v=1&genero=homem&procura=mulheres&idade=30&uf=AC&municipio=1200401&nao-fuma=sim',
      )
    ).text()
    expect(html).toContain('<meta name="robots" content="noindex"')
    expect(html).toContain(
      `<link rel="canonical" href="${SITE}/grupo-possivel"`,
    )
    const og = (p: string) =>
      html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`))?.[1]
    expect(og('title')).toMatch(
      /^Entre .+ e .+ mulheres em Rio Branco \(AC\), na idade procurada$/,
    )
    expect(og('description')).toBe(
      'Pela conta do Grupo possível, com o Censo 2022 e a PNS 2019. Também pediu: não fuma. Faça a sua conta.',
    )
    expect(og('url')).toBe(`${SITE}/grupo-possivel`)
    for (const text of [og('title'), og('description')])
      expect(text).not.toMatch(/homem|homens|30|25|35|interessa/)
  })

  test("without a query, the preview is the page's and there is no noindex", async ({
    request,
  }) => {
    const html = await (await request.get('/grupo-possivel')).text()
    expect(html).not.toContain('name="robots"')
    expect(html).not.toContain('<meta property="og:title" content="Entre')
  })

  test('the opt-out of being counted does not go in the link and the link does not touch it', async ({
    browser,
  }) => {
    const other = await otherDevice(browser, { 'do-not-count': true })
    await other.page.goto(
      '/grupo-possivel?v=1&genero=mulher&nao-contar=nao&contar=sim',
    )
    await expect(other.page).toHaveURL(/\/grupo-possivel$/)
    expect(await saved(other.page, 'do-not-count')).toBe(true)
    const keys = await other.page.evaluate(() =>
      Object.keys(localStorage).sort(),
    )
    expect(keys).toEqual(['tem-estudo:do-not-count', 'tem-estudo:profile'])
    await other.context.close()
  })
})

test.describe('Priorities link', () => {
  const chip = (page: Page, name: string) =>
    page
      .getByRole('region', { name: 'Seu topo 3' })
      .getByRole('button', { name: new RegExp(`${name}$`) })

  test('copy, open on another device: the link top 3 replaces the saved one', async ({
    page,
    context,
    browser,
  }) => {
    await withClipboard(context)
    await page.goto('/prioridades', { waitUntil: 'networkidle' })
    for (const name of ['Renda', 'Química sexual', 'Ser parecido comigo'])
      await tap(chip(page, name))
    await page.getByRole('radio', { name: 'Duração' }).check()
    await expect(share(page)).toContainText(
      'Este link mostra: topo 3 renda, química sexual e ser parecido comigo, em duração.',
    )
    const link = new URL(await copyLink(page))
    expect(link.search).toBe('?v=1&topo=renda,sexo,parecido&desfecho=duracao')

    const other = await otherDevice(browser, {
      priorities: { top3: ['gentileza'], outcome: 'atracao' },
    })
    await other.page.goto(`${link.pathname}${link.search}`)
    await expect(other.page).toHaveURL(/\/prioridades$/)
    await expect(chip(other.page, 'Química sexual')).toHaveAccessibleName(
      'sua 2ª: Química sexual',
    )
    await expect(
      other.page.getByRole('radio', { name: 'Duração' }),
    ).toBeChecked()
    expect(await saved(other.page, 'priorities')).toEqual({
      top3: ['renda', 'sexo', 'parecido'],
      outcome: 'duracao',
    })
    await other.context.close()
  })

  test('from the Profile, the link carries only the gender, and whoever opens it keeps the rest of theirs', async ({
    page,
    context,
    browser,
  }) => {
    await withClipboard(context)
    await context.addInitScript(() =>
      localStorage.setItem(
        'tem-estudo:profile',
        JSON.stringify({ gender: 'mulher', seeks: 'homens', age: 41 }),
      ),
    )
    await page.goto('/prioridades', { waitUntil: 'networkidle' })
    await tap(chip(page, 'Renda'))
    await expect(share(page)).toContainText(
      'Este link mostra: mulher, topo 3 renda, em satisfação.',
    )
    const link = new URL(await copyLink(page))
    expect(link.search).toBe(
      '?v=1&genero=mulher&topo=renda&desfecho=satisfacao',
    )

    const other = await otherDevice(browser, {
      profile: { gender: 'homem', seeks: 'mulheres', age: 30 },
    })
    await other.page.goto(`${link.pathname}${link.search}`)
    await expect(
      other.page.getByRole('status').filter({ hasText: 'trocou' }),
    ).toHaveText(
      'Este link trocou o seu topo 3 e o gênero do seu Perfil pelos de quem mandou.',
    )
    expect(await saved(other.page, 'profile')).toEqual({
      gender: 'mulher',
      seeks: 'mulheres',
      age: 30,
    })
    await other.context.close()
  })

  test('the preview shows the top 3 and the alert', async ({ request }) => {
    const html = await (
      await request.get(
        '/prioridades?v=1&genero=homem&idade=33&topo=sexo,renda&desfecho=satisfacao',
      )
    ).text()
    expect(html).toContain('<meta name="robots" content="noindex"')
    expect(html).toContain(
      '<meta property="og:title" content="Topo 3: química sexual e renda"',
    )
    expect(html).toContain(
      '<meta property="og:description" content="No seu topo 3, para satisfação: para renda não há boa evidência."',
    )
    expect(html).not.toMatch(/<meta[^>]+content="[^"]*(homem|33)[^"]*"/)
  })

  test('an invalid query does not replace the saved state and leaves the bar', async ({
    browser,
  }) => {
    const other = await otherDevice(browser, {
      priorities: { top3: ['gentileza'], outcome: 'atracao' },
    })
    await other.page.goto('/prioridades?v=99&topo=renda')
    await expect(other.page).toHaveURL(/\/prioridades$/)
    await expect(chip(other.page, 'Gentileza')).toHaveAccessibleName(
      'sua 1ª: Gentileza',
    )
    expect(await saved(other.page, 'priorities')).toEqual({
      top3: ['gentileza'],
      outcome: 'atracao',
    })
    await other.context.close()
  })
})

test("the Guide's Compartilhar copies the link without query", async ({
  page,
  context,
}) => {
  await withClipboard(context)
  await page.goto('/onde-conhecer-pessoas/app-ou-presencial?genero=homem', {
    waitUntil: 'networkidle',
  })
  const link = await copyLink(page)
  expect(link).toMatch(
    /^http:\/\/localhost:\d+\/onde-conhecer-pessoas\/app-ou-presencial$/,
  )
  await expect(share(page)).toContainText(
    'O link leva só o endereço do Guia, sem o seu Perfil.',
  )
})
