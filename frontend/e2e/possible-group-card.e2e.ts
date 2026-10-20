// The Possible group card in the B5 Guide (#32), over the fixture: the
// `app-ou-presencial` Guide declares `calculadora: grupo-possivel`, and the
// data is only Acre's (the fixture's "Brazil").
import { expect, test, type Page } from '@playwright/test'
import { tap } from './touch'

const GUIDE_B5 = '/onde-conhecer-pessoas/app-ou-presencial'
const UNUSED = 'Faça a conta'
const USED = 'Seu Grupo possível'

const card = (page: Page, name: string) =>
  page.getByRole('region', { name, exact: true })

/** The page hydrates before the first tap, so the click is not lost. */
async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

test.describe('the B5 Guide card', () => {
  test('unused, a whole-of-Brazil number in pink and "Fazer a conta"', async ({
    page,
  }) => {
    await open(page, GUIDE_B5)
    const unused = card(page, UNUSED)
    await expect(unused.locator('[data-slot="cartao-gp-frase"]')).toHaveText(
      /^No Brasil, [\d,]+ (mil|milhão de|milhões de) adultos não moram com companheiro\(a\)\. Quantos deles atendem ao que você procura\?$/,
    )
    await expect(unused.locator('mark.numero-chave')).toHaveText(
      /^[\d,]+ (mil|milhão|milhões)$/,
    )
    await expect(card(page, USED)).toHaveCount(0)

    // Between the Tips and "O que a evidência diz".
    const titles = await page
      .locator('main h2[data-slot="headline"]')
      .allTextContents()
    expect(titles.indexOf(UNUSED)).toBe(
      titles.indexOf('O que a evidência diz') - 1,
    )

    const button = unused.getByRole('link', { name: 'Fazer a conta' })
    expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tap(button)
    await expect(page).toHaveURL('/grupo-possivel')
  })

  test('with a Profile, the range, the active Requirements and what weighs most', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'tem-estudo:profile',
        JSON.stringify({ gender: 'homem', seeks: 'mulheres', age: 30 }),
      ),
    )
    await open(page, GUIDE_B5)
    const used = card(page, USED)
    await expect(used.locator('[data-slot="gp-faixa"]')).toHaveText(
      /^entre .+ e .+/,
    )
    await expect(
      used.locator('[data-slot="gp-faixa"] mark.numero-chave'),
    ).toBeVisible()
    await expect(used.locator('[data-slot="cartao-gp-ligados"]')).toHaveText(
      'Seus Requisitos: 25 a 35 anos, não mora com companheiro(a), se interessa por homens.',
    )
    await expect(used.locator('[data-slot="cartao-gp-pesa"]')).toHaveText(
      /^o que mais pesa: .+ \(×[\d,]+\)$/,
    )
    await expect(
      used.getByRole('link', { name: 'Ajustar os Requisitos' }),
    ).toBeVisible()
    await expect(card(page, UNUSED)).toHaveCount(0)
  })

  test('reflects what the visitor left on /grupo-possivel, going and coming back', async ({
    page,
  }) => {
    await open(page, GUIDE_B5)
    await tap(card(page, UNUSED).getByRole('link', { name: 'Fazer a conta' }))
    await expect(page).toHaveURL('/grupo-possivel')
    await page.waitForLoadState('networkidle')

    const range = page.locator('[data-slot="gp-preso"] [data-slot="gp-faixa"]')
    const before = (await range.textContent()) ?? ''
    await tap(
      page
        .locator('#req-education')
        .getByRole('radio', { name: 'superior completo' }),
    )
    await expect(range).not.toHaveText(before)
    await expect(page.locator('[data-slot="gp-preso"]')).toHaveAttribute(
      'aria-busy',
      'false',
    )
    const onPage = (await range.textContent()) ?? ''

    await tap(page.getByRole('link', { name: 'Ler o Guia inteiro' }))
    await expect(page).toHaveURL(GUIDE_B5)
    const used = card(page, USED)
    await expect(used.locator('[data-slot="gp-faixa"]')).toHaveText(onPage)
    await expect(used.locator('[data-slot="cartao-gp-ligados"]')).toHaveText(
      'Seus Requisitos: não mora com companheiro(a), pelo menos superior completo.',
    )
    await expect(used.locator('[data-slot="cartao-gp-pesa"]')).toContainText(
      'escolaridade',
    )

    // And back through the card's button, with the count where it was.
    await tap(used.getByRole('link', { name: 'Ajustar os Requisitos' }))
    await expect(page).toHaveURL('/grupo-possivel')
    await expect(
      page
        .locator('#req-education')
        .getByRole('radio', { name: 'superior completo' }),
    ).toBeChecked()
    await expect(range).toHaveText(onPage)
  })
})
