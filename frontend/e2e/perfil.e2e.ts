// O Perfil no Guia (#30) sobre o conteúdo de fixture: no Guia principal, o
// 1º achado vem de homens e mulheres de 18 a 35 anos e o 2º de casais
// homem-mulher; a Dica cita os dois. O outro Guia só tem o achado dos casais
// homem-mulher.
import { expect, test, type Page } from '@playwright/test'

const GUIA = '/onde-conhecer-pessoas/onde-os-casais-se-conhecem'
const OUTRO_GUIA = '/onde-conhecer-pessoas/app-ou-presencial'
const SEM_DADO = 'Não há dado deste estudo para o seu Perfil.'

interface PerfilNoForm {
  genero?: 'homem' | 'mulher' | 'outro'
  procura?: 'homens' | 'mulheres' | 'ambos'
  idade?: string
}

async function dizerPerfil(
  page: Page,
  { genero, procura, idade }: PerfilNoForm,
) {
  const form = page.getByRole('form', { name: 'Seu Perfil' })
  if (genero)
    await form
      .getByRole('group', { name: 'Você é' })
      .getByRole('radio', { name: genero, exact: true })
      .check()
  if (procura)
    await form
      .getByRole('group', { name: 'Você procura' })
      .getByRole('radio', { name: procura, exact: true })
      .check()
  if (idade !== undefined) await form.getByLabel('Sua idade').fill(idade)
  await form.getByRole('button', { name: 'Ver o que vale para mim' }).click()
}

const achados = (page: Page) =>
  page
    .getByRole('region', { name: 'O que a evidência diz' })
    .locator('ol.achados-guia > li')

/** Tudo o que a página mostra, na ordem: títulos das seções, achados, Dicas e Fichas. */
const conteudo = (page: Page) =>
  page.evaluate(() => ({
    secoes: [...document.querySelectorAll('main h2')].map((h) => h.textContent),
    achados: [
      ...document.querySelectorAll('ol.achados-guia > li p:first-child'),
    ].map((p) => p.textContent),
    dicas: [
      ...document.querySelectorAll('.dicas-do-guia > li > p:first-child'),
    ].map((p) => p.textContent),
    fichas: [...document.querySelectorAll('.fichas-citadas > li')].map(
      (li) => li.id,
    ),
    notas: [...document.querySelectorAll('.vale')].length,
  }))

test.describe('Perfil no Guia', () => {
  test('sem Perfil, o link abaixo da resposta curta convida e rola até o formulário', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const link = page.getByRole('link', {
      name: /Diga seu Perfil e veja o que vale para você/,
    })
    await expect(link).toContainText('opcional')
    await expect(page.locator('.selo-voce')).toHaveCount(0)
    await expect(page.getByText(SEM_DADO)).toHaveCount(0)
    await link.click()
    await expect(page).toHaveURL(`${GUIA}#perfil`)
    await expect(
      page.getByRole('form', { name: 'Seu Perfil' }),
    ).toBeInViewport()
  })

  test('as opções do Perfil têm pelo menos 44px e a idade começa em 18', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const form = page.getByRole('form', { name: 'Seu Perfil' })
    for (const opcao of await form.locator('label.opcao').all()) {
      expect((await opcao.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    }
    expect(
      (await form.getByLabel('Sua idade').boundingBox())?.height,
    ).toBeGreaterThanOrEqual(44)
    await dizerPerfil(page, { idade: '17' })
    // O navegador barra o envio: nada é salvo.
    await expect(form).toBeVisible()
    expect(
      await page.evaluate(() => localStorage.getItem('tem-estudo:perfil')),
    ).toBeNull()
  })

  test('com Perfil, marca o que vale e o que não tem dado, sem tirar a nota Vale para', async ({
    page,
  }) => {
    await page.goto(GUIA)
    await dizerPerfil(page, { genero: 'homem', procura: 'homens', idade: '30' })

    await expect(achados(page).nth(0).locator('.selo-voce')).toHaveText(
      'vale para você',
    )
    await expect(achados(page).nth(0)).toContainText(
      'Vale para: homens e mulheres, de 18 a 35 anos.',
    )
    await expect(achados(page).nth(0)).not.toContainText(SEM_DADO)
    // Casais homem-mulher não valem para homem que procura homens.
    await expect(achados(page).nth(1).locator('.selo-voce')).toHaveCount(0)
    await expect(achados(page).nth(1).locator('.anel-vazio')).toHaveCount(1)
    await expect(achados(page).nth(1)).toContainText(
      `Vale para: casais homem-mulher. ${SEM_DADO}`,
    )
    await expect(
      page.getByRole('region', { name: 'Dicas' }).locator('.selo-voce'),
    ).toHaveText('vale para você')

    const resposta = page.getByRole('region', { name: 'Resposta curta' })
    await expect(resposta.locator('.para-o-seu-perfil')).toHaveText(
      'vale para você o número em destaque vem de um estudo com pessoas do seu Perfil.',
    )
    const caixa = page.getByRole('region', { name: 'Varia conforme o Perfil?' })
    await expect(caixa).toContainText(
      'Seu Perfil: homem, procura homens, 30 anos',
    )
    await expect(caixa).toContainText(
      '1 de 2 achados tem dado para o seu Perfil.',
    )
    await expect(
      page.getByRole('link', {
        name: /Seu Perfil: homem, procura homens, 30 anos/,
      }),
    ).toContainText('mudar')
    await expect(page.locator('.aviso-perfil')).toHaveCount(0)
  })

  test('o Perfil vale nas outras páginas e no próximo acesso', async ({
    page,
  }) => {
    await page.goto(GUIA)
    await dizerPerfil(page, { genero: 'homem', procura: 'homens', idade: '30' })
    await page.reload()
    await expect(
      page.getByRole('link', {
        name: /Seu Perfil: homem, procura homens, 30 anos/,
      }),
    ).toBeVisible()
    await expect(achados(page).nth(0).locator('.selo-voce')).toBeVisible()

    // No outro Guia, o único achado é de casais homem-mulher: aviso acima do título.
    await page.goto(OUTRO_GUIA)
    const aviso = page
      .getByRole('note')
      .filter({ hasText: 'Nenhum estudo deste Guia separou' })
    await expect(aviso).toContainText('homem, procura homens, 30 anos')
    const caixaDoAviso = await aviso.boundingBox()
    const titulo = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(caixaDoAviso!.y).toBeLessThan(titulo!.y)
    await expect(
      page.getByRole('region', { name: 'Varia conforme o Perfil?' }),
    ).toContainText('O único achado não tem dado para o seu Perfil.')
  })

  test('quando o número-chave não vale, a linha diz qual achado vale', async ({
    page,
  }) => {
    await page.goto(GUIA)
    await dizerPerfil(page, {
      genero: 'mulher',
      procura: 'homens',
      idade: '50',
    })
    await expect(page.locator('.para-o-seu-perfil')).toContainText(
      'Para o seu Perfil: o número em destaque vem de outra amostra. O que tem dado para você: Nos EUA, a satisfação',
    )
  })

  test('"outro" só casa com o que não separou por gênero: aqui, nada cobre', async ({
    page,
  }) => {
    await page.goto(GUIA)
    await dizerPerfil(page, { genero: 'outro', procura: 'homens' })
    await expect(page.locator('.aviso-perfil')).toContainText(
      'outro gênero, procura homens',
    )
    await expect(page.getByText(SEM_DADO)).toHaveCount(3)
    await expect(page.locator('.para-o-seu-perfil')).toContainText(
      'nenhum número deste Guia vem de uma amostra como a sua.',
    )
    await expect(
      page.getByRole('region', { name: 'Varia conforme o Perfil?' }),
    ).toContainText('Nenhum dos 2 achados tem dado para o seu Perfil.')
  })

  test('quem procura ambos vê de qual lado há dado', async ({ page }) => {
    await page.goto(GUIA)
    await dizerPerfil(page, { genero: 'homem', procura: 'ambos', idade: '30' })
    await expect(achados(page).nth(0).locator('.selo-voce')).toHaveText(
      'vale para você',
    )
    await expect(achados(page).nth(1).locator('.selo-voce')).toHaveText(
      'vale para você quando procura mulheres',
    )
  })

  test('"mudar" abre o formulário preenchido, e apagar volta ao Guia sem Perfil', async ({
    page,
  }) => {
    await page.goto(GUIA)
    await dizerPerfil(page, {
      genero: 'mulher',
      procura: 'mulheres',
      idade: '24',
    })
    await page.getByRole('link', { name: /Seu Perfil: mulher/ }).click()
    const form = page.getByRole('form', { name: 'Seu Perfil' })
    await expect(
      form.getByRole('radio', { name: 'mulher', exact: true }),
    ).toBeChecked()
    await expect(
      form.getByRole('radio', { name: 'mulheres', exact: true }),
    ).toBeChecked()
    await expect(form.getByLabel('Sua idade')).toHaveValue('24')
    await form.getByRole('radio', { name: 'homens', exact: true }).check()
    await form.getByRole('button', { name: 'Ver o que vale para mim' }).click()
    await expect(
      page.getByRole('region', { name: 'Varia conforme o Perfil?' }),
    ).toContainText('Seu Perfil: mulher, procura homens, 24 anos')
    await page.getByRole('button', { name: 'mudar' }).click()
    await page.getByRole('button', { name: 'Apagar o Perfil' }).click()
    await expect(
      page.getByRole('link', { name: /Diga seu Perfil/ }),
    ).toBeVisible()
    await expect(page.locator('.selo-voce')).toHaveCount(0)
  })

  test('nada muda de ordem nem desaparece com o Perfil', async ({ page }) => {
    await page.goto(GUIA)
    const antes = await conteudo(page)
    for (const perfil of [
      { genero: 'homem', procura: 'homens', idade: '30' },
      { genero: 'outro', procura: 'ambos', idade: '60' },
    ] as const) {
      if (await page.getByRole('button', { name: 'mudar' }).isVisible())
        await page.getByRole('button', { name: 'mudar' }).click()
      await dizerPerfil(page, perfil)
      await expect(page.locator('.perfil-contagem')).toBeVisible()
      expect(await conteudo(page)).toEqual(antes)
    }
  })
})
