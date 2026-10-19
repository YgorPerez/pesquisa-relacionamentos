// O Grupo possível (#31) sobre os dados de fixture `e2e/acervo/dados/`: as
// linhas do Acre tiradas dos dados de verdade (o "Brasil" da fixture é só o
// Acre). O Guia `app-ou-presencial` da fixture hospeda a calculadora.
import { expect, test, type Page } from '@playwright/test'

const PAGINA = '/grupo-possivel'
const faixa = (page: Page) => page.locator('.gp-preso .gp-faixa')
const requisito = (page: Page, id: string) => page.locator(`#req-${id}`)

async function dizerPerfil(page: Page, genero: string, procura: string, idade: string) {
  const form = page.getByRole('form', { name: 'Seu Perfil' })
  await form.getByRole('group', { name: 'Você é' }).getByRole('radio', { name: genero, exact: true }).check()
  await form.getByRole('group', { name: 'Você procura' }).getByRole('radio', { name: procura, exact: true }).check()
  await form.getByLabel('Sua idade').fill(idade)
  await form.getByRole('button', { name: 'Usar na conta' }).click()
}

/** Espera o número mudar e devolve o novo. */
async function mudou(page: Page, antes: string): Promise<string> {
  await expect(faixa(page)).not.toHaveText(antes)
  await expect(page.locator('.gp-preso [aria-live]')).not.toHaveClass(/gp-carregando/)
  return (await faixa(page).textContent()) ?? ''
}

test.describe('Grupo possível', () => {
  test('sem nada dito, o servidor já traz o número e o Perfil vem primeiro', async ({ page }) => {
    await page.goto(PAGINA)
    await expect(faixa(page)).toHaveText(/^entre .+ e .+/)
    await expect(page.getByRole('form', { name: 'Seu Perfil' })).toBeVisible()
    // Sem gênero, a conta não desconta orientação e diz que o número é um teto.
    await expect(page.getByRole('note').filter({ hasText: 'é um teto' })).toBeVisible()
    const titulos = await page.locator('main h2.headline').allTextContents()
    expect(titulos.slice(0, 3)).toEqual(['Seu Perfil', 'Seus Requisitos', 'A conta'])
  })

  test('o Perfil preenche a idade procurada (±5) e a orientação entra na conta', async ({ page }) => {
    await page.goto(PAGINA)
    const antes = (await faixa(page).textContent()) ?? ''
    await dizerPerfil(page, 'homem', 'mulheres', '30')
    await mudou(page, antes)
    await expect(requisito(page, 'idade').getByLabel('Idade de', { exact: true })).toHaveValue('25')
    await expect(requisito(page, 'idade').getByLabel('até', { exact: true })).toHaveValue('35')
    await expect(page.getByText('a conta só conta quem se interessa por homens')).toBeVisible()
    await expect(page.getByRole('note').filter({ hasText: 'é um teto' })).toHaveCount(0)
  })

  test('por toque: o número fica preso no topo e muda a cada toque', async ({ page }) => {
    await page.goto(PAGINA)
    await dizerPerfil(page, 'mulher', 'homens', '28')
    let atual = await mudou(page, '')

    const escolaridade = requisito(page, 'escolaridade')
    await escolaridade.getByRole('radio', { name: 'superior completo' }).tap()
    atual = await mudou(page, atual)
    await expect(faixa(page)).toBeInViewport()
    await expect(escolaridade.locator('.gp-req-custo')).toHaveText(/^soltar só este: ×[\d,]+ \(\+.+\)$/)

    await requisito(page, 'idade').getByRole('button', { name: 'até: mais 1' }).tap()
    atual = await mudou(page, atual)
    await expect(requisito(page, 'idade').locator('.gp-req-valor')).toHaveText('23 a 34 anos')

    // "o que mais pesa" com "soltar": soltar a escolaridade volta ao "qualquer".
    await page.getByRole('link', { name: 'ver a conta' }).tap()
    await page.getByRole('button', { name: 'Soltar escolaridade' }).tap()
    await mudou(page, atual)
    await expect(escolaridade.getByRole('radio', { name: 'qualquer' })).toBeChecked()
  })

  test('por teclado: passos, opções e caixas respondem a Enter e espaço', async ({ page }) => {
    await page.goto(PAGINA)
    let atual = (await faixa(page).textContent()) ?? ''

    const mais = requisito(page, 'idade').getByRole('button', { name: 'Idade de: mais 1' })
    await mais.focus()
    await page.keyboard.press('Enter')
    atual = await mudou(page, atual)
    await expect(requisito(page, 'idade').getByLabel('Idade de', { exact: true })).toHaveValue('19')

    const fuma = requisito(page, 'fumo').getByRole('checkbox', { name: 'Só quem não fuma' })
    await fuma.focus()
    await page.keyboard.press('Space')
    await expect(fuma).toBeChecked()
    atual = await mudou(page, atual)

    const preta = requisito(page, 'cor').getByRole('checkbox', { name: 'preta' })
    await preta.focus()
    await page.keyboard.press('Space')
    await mudou(page, atual)
    await expect(requisito(page, 'cor').locator('.gp-req-valor')).toHaveText('cor preta')

    // A idade também se digita.
    const ate = requisito(page, 'idade').getByLabel('até', { exact: true })
    await ate.fill('40')
    await expect(requisito(page, 'idade').locator('.gp-req-valor')).toHaveText('19 a 40 anos')
  })

  test('"sem filhos" fica desabilitado procurando homens e parcial procurando ambos', async ({ page }) => {
    await page.goto(PAGINA)
    await dizerPerfil(page, 'homem', 'homens', '30')
    const filhos = requisito(page, 'filhos')
    await expect(filhos.getByRole('checkbox', { name: 'Só quem não tem filhos' })).toBeDisabled()
    await expect(filhos).toContainText('O Censo só pergunta filhos às mulheres. Procurando homens, não dá para filtrar.')

    await page.getByRole('button', { name: 'mudar' }).click()
    await dizerPerfil(page, 'homem', 'ambos', '30')
    const caixa = filhos.getByRole('checkbox', { name: 'Só quem não tem filhos' })
    await expect(caixa).toBeEnabled()
    await caixa.check()
    await expect(filhos).toContainText('o filtro vale só para elas')
    await expect(page.getByRole('note').filter({ hasText: '"sem filhos" vale para elas' })).toBeVisible()
  })

  test('gênero "outro" não desconta orientação e leva o aviso forte', async ({ page }) => {
    await page.goto(PAGINA)
    await dizerPerfil(page, 'outro', 'mulheres', '30')
    await expect(page.getByRole('note').filter({ hasText: 'não pergunta identidade de gênero' })).toContainText('é um teto')
    await expect(page.getByText('a conta só conta quem')).toHaveCount(0)
  })

  test('UF e município, e os Requisitos continuam salvos depois de recarregar', async ({ page }) => {
    await page.goto(PAGINA)
    await dizerPerfil(page, 'homem', 'mulheres', '30')
    const lugar = requisito(page, 'lugar')
    await lugar.getByLabel('Estado').selectOption('AC')
    await lugar.getByLabel('Município').selectOption({ label: 'Rio Branco' })
    await expect(lugar.locator('.gp-req-valor')).toHaveText('Rio Branco (AC)')
    await expect(page.locator('#a-conta')).toContainText('mulheres em Rio Branco (AC) atendem')

    const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('tem-estudo:grupo-possivel') ?? 'null'))
    expect(salvo).toMatchObject({ lugar: { uf: 'AC', municipio: '1200401' }, companheiro: true })

    const antes = await faixa(page).textContent()
    await page.reload()
    await expect(lugar.getByLabel('Município')).toHaveValue('1200401')
    await expect(faixa(page)).toHaveText(antes ?? '')
  })

  test('as dobras ficam recolhidas, com o funil e a conta ingênua', async ({ page }) => {
    await page.goto(PAGINA)
    await dizerPerfil(page, 'mulher', 'homens', '25')
    const incerteza = page.locator('#gp-incerteza')
    await expect(incerteza).not.toHaveAttribute('open')
    await incerteza.locator('summary').tap()
    await expect(incerteza).toContainText(/Se só multiplicássemos .+ daria .+ \([+−]\d+%\)/)
    await expect(incerteza).toContainText('inclui quem namora')
    await page.locator('#gp-corte-a-corte summary').tap()
    await expect(page.locator('.gp-funil li').first()).toContainText('homens de 18 anos ou mais no Brasil')
  })

  test('o bloco "Do Guia" traz a resposta curta e leva ao Guia', async ({ page }) => {
    await page.goto(PAGINA)
    const bloco = page.getByRole('region', { name: 'Do Guia' })
    await expect(bloco).toContainText('App ou presencial, onde tenho mais chance?')
    await expect(bloco).toContainText('A diferença de satisfação entre os dois caminhos é pequena.')
    await bloco.getByRole('link', { name: 'Ler o Guia inteiro' }).tap()
    await expect(page).toHaveURL('/onde-conhecer-pessoas/app-ou-presencial')
  })

  test('os controles têm pelo menos 44px', async ({ page }) => {
    await page.goto(PAGINA)
    const controles = page.locator('#req-idade button, #req-idade input, .gp-req label.opcao, .gp-req select, .gp-preso a')
    expect(await controles.count()).toBeGreaterThan(20)
    for (const c of await controles.all()) expect((await c.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  })
})
