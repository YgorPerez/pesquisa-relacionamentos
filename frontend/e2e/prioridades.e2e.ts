// Prioridades vs. evidência (#33), sobre o conteúdo de fixture
// (`e2e/acervo/dados/prioridades`): os degraus do rascunho real, com as
// Fichas da fixture. Em satisfação: "pesa" tem a química sexual; "quase
// nada", ser parecido; "não sabemos", renda, escolaridade, religião e idade.
import { expect, test, type Page } from '@playwright/test'
import { tocar } from './toque'

const GUIA_B1 = '/escolher-parceiro/que-caracteristicas-preveem'

const chips = (page: Page) => page.getByRole('region', { name: 'Seu topo 3' })
const chip = (page: Page, nome: string) =>
  chips(page).getByRole('button', { name: new RegExp(`${nome}$`) })
const prateleira = (page: Page, nome: string) =>
  page.getByRole('region', { name: nome, exact: true })
const salvo = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem('tem-estudo:prioridades') ?? 'null'),
  )

/** A página hidrata antes do primeiro toque, para o clique não se perder. */
async function abrir(page: Page, caminho = '/prioridades') {
  await page.goto(caminho, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

test.describe('/prioridades', () => {
  test('tocar dá o próximo número, tocar de novo tira e renumera', async ({
    page,
  }) => {
    await abrir(page)
    await expect(
      page.getByRole('status').filter({ hasText: 'Nenhuma escolhida ainda' }),
    ).toBeVisible()

    await tocar(chip(page, 'Renda'))
    await tocar(chip(page, 'Aparência'))
    await expect(chip(page, 'Renda')).toHaveAccessibleName('sua 1ª: Renda')
    await expect(chip(page, 'Aparência')).toHaveAccessibleName(
      'sua 2ª: Aparência',
    )
    await expect(chip(page, 'Aparência')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByText('Falta 1.')).toBeVisible()

    await tocar(chip(page, 'Renda'))
    await expect(chip(page, 'Aparência')).toHaveAccessibleName(
      'sua 1ª: Aparência',
    )
    await expect(chip(page, 'Renda')).toHaveAttribute('aria-pressed', 'false')
    expect(await salvo(page)).toEqual({
      topo3: ['aparencia'],
      desfecho: 'satisfacao',
    })
  })

  test('com três, os outros chips ficam indisponíveis com a dica de troca', async ({
    page,
  }) => {
    await abrir(page)
    for (const nome of ['Gentileza', 'Ser parecido comigo', 'Idade parecida'])
      await tocar(chip(page, nome))
    const dica = 'Pronto. Para trocar, toque numa das escolhidas e ela sai.'
    await expect(
      page.getByRole('status').filter({ hasText: dica }),
    ).toBeVisible()
    const renda = chip(page, 'Renda')
    await expect(renda).toHaveAttribute('aria-disabled', 'true')
    await expect(renda).toHaveAccessibleDescription(dica)
    // O Playwright não toca no que está aria-disabled; o toque forçado é o do dedo.
    await tocar(renda, { force: true })
    expect(await salvo(page)).toMatchObject({
      topo3: ['gentileza', 'parecido', 'idade'],
    })

    for (const botao of await chips(page).getByRole('button').all())
      expect((await botao.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  })

  test('as escolhidas aparecem numeradas na prateleira em que caem, e o alerta diz em frase', async ({
    page,
  }) => {
    await abrir(page)
    for (const nome of ['Renda', 'Química sexual', 'Ser parecido comigo'])
      await tocar(chip(page, nome))

    await expect(
      prateleira(page, 'pesa').getByRole('button', {
        name: 'sua 2ª: Química sexual',
      }),
    ).toBeVisible()
    await expect(
      prateleira(page, 'quase nada').getByRole('button', {
        name: 'sua 3ª: Ser parecido comigo',
      }),
    ).toBeVisible()
    const naoSabemos = prateleira(page, 'não sabemos')
    // A escolhida vem primeiro, em amarelo; as outras ficam apagadas.
    await expect(naoSabemos.getByRole('button')).toHaveText(
      ['1Renda', 'Mesma escolaridade', 'Mesma religião', 'Idade parecida'].map(
        (t) => new RegExp(t.replace(/^1/, '1?')),
      ),
    )
    await expect(naoSabemos.getByRole('button').first()).toHaveCSS(
      'background-color',
      'rgb(236, 211, 111)',
    )
    await expect(naoSabemos.getByRole('button').nth(1)).toHaveCSS(
      'color',
      'rgb(65, 73, 72)',
    )

    await expect(page.locator('.alerta')).toHaveText(
      'No seu topo 3, para satisfação: ser parecido comigo pesa quase nada; para renda não há boa evidência.',
    )
    // Sem nota nem número: o único algarismo é o do "topo 3".
    expect(
      (await page.locator('.alerta').textContent())?.replace('topo 3', ''),
    ).not.toMatch(/\d/)
  })

  test('o desfecho muda as prateleiras; a barra da Joel só aparece em satisfação, recolhível', async ({
    page,
  }) => {
    await abrir(page)
    await tocar(chip(page, 'Aparência'))
    const joel = page.getByRole('img', {
      name: /45% explicado pela relação, 5% pelo parceiro, 50% sem explicação/,
    })
    await expect(joel).toBeVisible()
    await tocar(page.getByText('Antes: o parceiro explica pouco da satisfação'))
    await expect(joel).toBeHidden()

    await page.getByRole('radio', { name: 'Atração' }).check()
    await expect(
      page.getByText('Antes: o parceiro explica pouco da satisfação'),
    ).toHaveCount(0)
    await expect(
      prateleira(page, 'pesa').getByRole('button', {
        name: 'sua 1ª: Aparência',
      }),
    ).toBeVisible()
    await page.getByRole('radio', { name: 'Duração' }).check()
    await expect(
      prateleira(page, 'não sabemos').getByRole('button', {
        name: 'sua 1ª: Aparência',
      }),
    ).toBeVisible()
    expect(await salvo(page)).toEqual({
      topo3: ['aparencia'],
      desfecho: 'duracao',
    })
  })

  test('o seletor de desfecho fica preso no topo ao rolar', async ({
    page,
  }) => {
    await abrir(page)
    await page.locator('.aviso').scrollIntoViewIfNeeded()
    const caixa = await page.locator('.desfecho-preso').boundingBox()
    expect(caixa?.y).toBeLessThanOrEqual(1)
  })

  test('tocar numa característica abre o texto, a medida, a Ficha, a amostra e o viés do gênero', async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() =>
      localStorage.setItem(
        'tem-estudo:perfil',
        JSON.stringify({ genero: 'mulher' }),
      ),
    )
    await abrir(page)

    const aparencia = prateleira(page, 'pesa pouco').getByRole('button', {
      name: 'Aparência',
    })
    await tocar(aparencia)
    await expect(aparencia).toHaveAttribute('aria-expanded', 'true')
    const detalhe = page.getByRole('region', { name: 'Aparência, satisfação' })
    await expect(detalhe).toContainText(
      'Só os maridos ficam um pouco mais satisfeitos, e só no começo.',
    )
    await expect(detalhe).toContainText('Medida: r = 0,10, só maridos')
    await expect(
      detalhe.getByRole('link', { name: 'Costa (2018)' }),
    ).toHaveAttribute('href', '/estudos/costa-2018-satisfacao')
    await expect(detalhe).toContainText('parcial')
    await expect(detalhe).toContainText('evidência moderada')
    await expect(detalhe).toContainText(
      'Amostra: Casais casados recrutados online.',
    )
    await expect(detalhe).toContainText('As pessoas dão menos peso à aparência')

    // Renda tem viés só por gênero: com "mulher" no Perfil, vale o das mulheres.
    await tocar(
      prateleira(page, 'não sabemos').getByRole('button', { name: 'Renda' }),
    )
    await expect(
      page.getByRole('region', { name: 'Aparência, satisfação' }),
    ).toHaveCount(0)
    const renda = page.getByRole('region', { name: 'Renda, satisfação' })
    await expect(renda).toContainText('Mulheres tendem a dar mais peso à renda')
    await expect(renda).not.toContainText('Homens tendem')
  })

  test('avisa que nenhum estudo é brasileiro e traz o bloco do Guia B1', async ({
    page,
  }) => {
    await abrir(page)
    await expect(page.getByRole('note')).toContainText(
      'Nenhum destes estudos é brasileiro',
    )
    await expect(page.getByRole('note')).toContainText('casais homem-mulher')
    const doGuia = page.getByRole('region', { name: 'Do Guia' })
    await expect(doGuia).toContainText(
      'Que características do parceiro preveem uma boa relação?',
    )
    await expect(doGuia).toContainText('moderada')
    await tocar(doGuia.getByRole('link', { name: 'Ler o Guia inteiro' }))
    await expect(page).toHaveURL(GUIA_B1)
  })

  test('por teclado: Tab chega aos chips, espaço escolhe, setas mudam o desfecho', async ({
    page,
  }) => {
    await abrir(page)
    await chip(page, 'Aparência').focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(chip(page, 'Química sexual')).toHaveAccessibleName(
      'sua 2ª: Química sexual',
    )

    await page.getByRole('radio', { name: 'Satisfação' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('radio', { name: 'Duração' })).toBeChecked()

    const livro = prateleira(page, 'não sabemos').getByRole('button', {
      name: 'sua 2ª: Química sexual',
    })
    await livro.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('region', { name: 'Química sexual, duração' }),
    ).toContainText('Nenhum estudo lido mede isso.')
  })

  test('o topo 3 e o desfecho voltam depois de recarregar', async ({
    page,
  }) => {
    await abrir(page)
    await tocar(chip(page, 'Gentileza'))
    await page.getByRole('radio', { name: 'Atração' }).check()
    await page.reload()
    await expect(chip(page, 'Gentileza')).toHaveAccessibleName(
      'sua 1ª: Gentileza',
    )
    await expect(page.getByRole('radio', { name: 'Atração' })).toBeChecked()
  })
})

test.describe('cartão do Guia B1', () => {
  test('sem topo 3, a barra curta e o convite para a página', async ({
    page,
  }) => {
    await page.goto(GUIA_B1)
    const cartao = page.getByRole('region', {
      name: 'Onde ficam as suas prioridades?',
    })
    await expect(
      cartao.getByRole('img', { name: /45% explicado pela relação/ }),
    ).toBeVisible()
    await expect(cartao).not.toContainText('Antes da lista')
    await expect(cartao).not.toContainText('Seu topo 3')
    const botao = cartao.getByRole('link', {
      name: 'Escolher as suas três e comparar',
    })
    expect((await botao.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tocar(botao)
    await expect(page).toHaveURL('/prioridades')
  })

  test('com topo 3, cada um com o degrau em satisfação, mesmo com outro desfecho na página', async ({
    page,
  }) => {
    await abrir(page)
    for (const nome of ['Química sexual', 'Ser parecido comigo', 'Renda'])
      await tocar(chip(page, nome))
    await page.getByRole('radio', { name: 'Duração' }).check()

    await page.goto(GUIA_B1)
    const cartao = page.getByRole('region', {
      name: 'Onde ficam as suas prioridades?',
    })
    await expect(cartao).toContainText('Seu topo 3 cabe na fatia de 5%:')
    await expect(cartao.locator('.topo3-no-cartao li')).toHaveText([
      /Química sexual.*pesa$/,
      /Ser parecido comigo.*quase nada$/,
      /Renda.*não sabemos$/,
    ])
    await tocar(cartao.getByRole('link', { name: 'Ver a lista inteira' }))
    await expect(chip(page, 'Química sexual')).toHaveAccessibleName(
      'sua 1ª: Química sexual',
    )
  })

  test('o Guia sem calculadora não tem o cartão', async ({ page }) => {
    await page.goto('/onde-conhecer-pessoas/app-ou-presencial')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Onde ficam as suas prioridades?' }),
    ).toHaveCount(0)
  })
})
