// O cartão do Grupo possível no Guia B5 (#32), sobre a fixture: o Guia
// `app-ou-presencial` declara `calculadora: grupo-possivel`, e os dados são
// só os do Acre (o "Brasil" da fixture).
import { expect, test, type Page } from '@playwright/test'
import { tocar } from './toque'

const GUIA_B5 = '/onde-conhecer-pessoas/app-ou-presencial'
const SEM_USO = 'Faça a conta'
const COM_USO = 'Seu Grupo possível'

const cartao = (page: Page, nome: string) =>
  page.getByRole('region', { name: nome, exact: true })

/** A página hidrata antes do primeiro toque, para o clique não se perder. */
async function abrir(page: Page, caminho: string) {
  await page.goto(caminho, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

test.describe('cartão do Guia B5', () => {
  test('sem uso, um número do Brasil inteiro em rosa e "Fazer a conta"', async ({
    page,
  }) => {
    await abrir(page, GUIA_B5)
    const sem = cartao(page, SEM_USO)
    await expect(sem.locator('[data-slot="cartao-gp-frase"]')).toHaveText(
      /^No Brasil, [\d,]+ (mil|milhão de|milhões de) adultos não moram com companheiro\(a\)\. Quantos deles atendem ao que você procura\?$/,
    )
    await expect(sem.locator('mark.numero-chave')).toHaveText(
      /^[\d,]+ (mil|milhão|milhões)$/,
    )
    await expect(cartao(page, COM_USO)).toHaveCount(0)

    // Entre as Dicas e "O que a evidência diz".
    const titulos = await page
      .locator('main h2[data-slot="headline"]')
      .allTextContents()
    expect(titulos.indexOf(SEM_USO)).toBe(
      titulos.indexOf('O que a evidência diz') - 1,
    )

    const botao = sem.getByRole('link', { name: 'Fazer a conta' })
    expect((await botao.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tocar(botao)
    await expect(page).toHaveURL('/grupo-possivel')
  })

  test('com Perfil, a faixa, os Requisitos ligados e o que mais pesa', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'tem-estudo:perfil',
        JSON.stringify({ genero: 'homem', procura: 'mulheres', idade: 30 }),
      ),
    )
    await abrir(page, GUIA_B5)
    const com = cartao(page, COM_USO)
    await expect(com.locator('[data-slot="gp-faixa"]')).toHaveText(
      /^entre .+ e .+/,
    )
    await expect(
      com.locator('[data-slot="gp-faixa"] mark.numero-chave'),
    ).toBeVisible()
    await expect(com.locator('[data-slot="cartao-gp-ligados"]')).toHaveText(
      'Seus Requisitos: 25 a 35 anos, não mora com companheiro(a), se interessa por homens.',
    )
    await expect(com.locator('[data-slot="cartao-gp-pesa"]')).toHaveText(
      /^o que mais pesa: .+ \(×[\d,]+\)$/,
    )
    await expect(
      com.getByRole('link', { name: 'Ajustar os Requisitos' }),
    ).toBeVisible()
    await expect(cartao(page, SEM_USO)).toHaveCount(0)
  })

  test('reflete o que o visitante deixou em /grupo-possivel, indo e voltando', async ({
    page,
  }) => {
    await abrir(page, GUIA_B5)
    await tocar(
      cartao(page, SEM_USO).getByRole('link', { name: 'Fazer a conta' }),
    )
    await expect(page).toHaveURL('/grupo-possivel')
    await page.waitForLoadState('networkidle')

    const faixa = page.locator('[data-slot="gp-preso"] [data-slot="gp-faixa"]')
    const antes = (await faixa.textContent()) ?? ''
    await tocar(
      page
        .locator('#req-escolaridade')
        .getByRole('radio', { name: 'superior completo' }),
    )
    await expect(faixa).not.toHaveText(antes)
    await expect(page.locator('[data-slot="gp-preso"]')).toHaveAttribute(
      'aria-busy',
      'false',
    )
    const naPagina = (await faixa.textContent()) ?? ''

    await tocar(page.getByRole('link', { name: 'Ler o Guia inteiro' }))
    await expect(page).toHaveURL(GUIA_B5)
    const com = cartao(page, COM_USO)
    await expect(com.locator('[data-slot="gp-faixa"]')).toHaveText(naPagina)
    await expect(com.locator('[data-slot="cartao-gp-ligados"]')).toHaveText(
      'Seus Requisitos: não mora com companheiro(a), pelo menos superior completo.',
    )
    await expect(com.locator('[data-slot="cartao-gp-pesa"]')).toContainText(
      'escolaridade',
    )

    // E de volta pelo botão do cartão, com a conta onde ficou.
    await tocar(com.getByRole('link', { name: 'Ajustar os Requisitos' }))
    await expect(page).toHaveURL('/grupo-possivel')
    await expect(
      page
        .locator('#req-escolaridade')
        .getByRole('radio', { name: 'superior completo' }),
    ).toBeChecked()
    await expect(faixa).toHaveText(naPagina)
  })
})
