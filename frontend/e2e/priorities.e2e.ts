// Priorities vs. evidence (#33), over the fixture content
// (`e2e/library/dados/prioridades`): the real draft's levels, with the
// fixture's Fact sheets. In satisfaction: "pesa" has sexual chemistry; "quase
// nada", being alike; "não sabemos", income, education, religion and age.
import { expect, test, type Page } from '@playwright/test'
import { tap } from './touch'

const GUIDE_B1 = '/escolher-parceiro/que-caracteristicas-preveem'

const chips = (page: Page) => page.getByRole('region', { name: 'Seu topo 3' })
const chip = (page: Page, name: string) =>
  chips(page).getByRole('button', { name: new RegExp(`${name}$`) })
const shelf = (page: Page, name: string) =>
  page.getByRole('region', { name, exact: true })
const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem('tem-estudo:priorities') ?? 'null'),
  )

/** The page hydrates before the first tap, so the click is not lost. */
async function open(page: Page, path = '/prioridades') {
  await page.goto(path, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

test.describe('/prioridades', () => {
  test('tapping gives the next number, tapping again removes it and renumbers', async ({
    page,
  }) => {
    await open(page)
    await expect(
      page.getByRole('status').filter({ hasText: 'Nenhuma escolhida ainda' }),
    ).toBeVisible()

    await tap(chip(page, 'Renda'))
    await tap(chip(page, 'Aparência'))
    await expect(chip(page, 'Renda')).toHaveAccessibleName('sua 1ª: Renda')
    await expect(chip(page, 'Aparência')).toHaveAccessibleName(
      'sua 2ª: Aparência',
    )
    await expect(chip(page, 'Aparência')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByText('Falta 1.')).toBeVisible()

    await tap(chip(page, 'Renda'))
    await expect(chip(page, 'Aparência')).toHaveAccessibleName(
      'sua 1ª: Aparência',
    )
    await expect(chip(page, 'Renda')).toHaveAttribute('aria-pressed', 'false')
    expect(await saved(page)).toEqual({
      top3: ['aparencia'],
      outcome: 'satisfacao',
    })
  })

  test('with three, the other chips become unavailable with the swap hint', async ({
    page,
  }) => {
    await open(page)
    for (const name of ['Gentileza', 'Ser parecido comigo', 'Idade parecida'])
      await tap(chip(page, name))
    const hint = 'Pronto. Para trocar, toque numa das escolhidas e ela sai.'
    await expect(
      page.getByRole('status').filter({ hasText: hint }),
    ).toBeVisible()
    const income = chip(page, 'Renda')
    await expect(income).toHaveAttribute('aria-disabled', 'true')
    await expect(income).toHaveAccessibleDescription(hint)
    // Playwright does not tap what is aria-disabled; the forced tap is the
    // finger's.
    await tap(income, { force: true })
    expect(await saved(page)).toMatchObject({
      top3: ['gentileza', 'parecido', 'idade'],
    })

    for (const button of await chips(page).getByRole('button').all())
      expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  })

  test('the chosen ones show numbered on the shelf they fall on, and the alert says it in a sentence', async ({
    page,
  }) => {
    await open(page)
    for (const name of ['Renda', 'Química sexual', 'Ser parecido comigo'])
      await tap(chip(page, name))

    await expect(
      shelf(page, 'pesa').getByRole('button', {
        name: 'sua 2ª: Química sexual',
      }),
    ).toBeVisible()
    await expect(
      shelf(page, 'quase nada').getByRole('button', {
        name: 'sua 3ª: Ser parecido comigo',
      }),
    ).toBeVisible()
    const weDoNotKnow = shelf(page, 'não sabemos')
    // The chosen one comes first, in yellow; the others are faded.
    await expect(weDoNotKnow.getByRole('button')).toHaveText(
      ['1Renda', 'Mesma escolaridade', 'Mesma religião', 'Idade parecida'].map(
        (t) => new RegExp(t.replace(/^1/, '1?')),
      ),
    )
    await expect(weDoNotKnow.getByRole('button').first()).toHaveCSS(
      'background-color',
      'rgb(236, 211, 111)',
    )
    await expect(weDoNotKnow.getByRole('button').nth(1)).toHaveCSS(
      'color',
      'rgb(65, 73, 72)',
    )

    await expect(page.locator('[data-slot="alerta"]')).toHaveText(
      'No seu topo 3, para satisfação: ser parecido comigo pesa quase nada; para renda não há boa evidência.',
    )
    // No score nor number: the only digit is the one in "topo 3".
    expect(
      (await page.locator('[data-slot="alerta"]').textContent())?.replace(
        'topo 3',
        '',
      ),
    ).not.toMatch(/\d/)
  })

  test("the outcome changes the shelves; Joel's bar only shows in satisfaction, collapsible", async ({
    page,
  }) => {
    await open(page)
    await tap(chip(page, 'Aparência'))
    const joel = page.getByRole('img', {
      name: /45% explicado pela relação, 5% pelo parceiro, 50% sem explicação/,
    })
    await expect(joel).toBeVisible()
    await tap(page.getByText('Antes: o parceiro explica pouco da satisfação'))
    await expect(joel).toBeHidden()

    await page.getByRole('radio', { name: 'Atração' }).check()
    await expect(
      page.getByText('Antes: o parceiro explica pouco da satisfação'),
    ).toHaveCount(0)
    await expect(
      shelf(page, 'pesa').getByRole('button', {
        name: 'sua 1ª: Aparência',
      }),
    ).toBeVisible()
    await page.getByRole('radio', { name: 'Duração' }).check()
    await expect(
      shelf(page, 'não sabemos').getByRole('button', {
        name: 'sua 1ª: Aparência',
      }),
    ).toBeVisible()
    expect(await saved(page)).toEqual({
      top3: ['aparencia'],
      outcome: 'duracao',
    })
  })

  test('the outcome picker sticks to the top on scroll', async ({ page }) => {
    await open(page)
    await page.locator('[data-slot="aviso"]').scrollIntoViewIfNeeded()
    const box = await page.locator('[data-slot="desfecho-preso"]').boundingBox()
    expect(box?.y).toBeLessThanOrEqual(1)
  })

  test("tapping a trait opens the text, the measure, the Fact sheet, the sample and the gender's bias", async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() =>
      localStorage.setItem(
        'tem-estudo:profile',
        JSON.stringify({ gender: 'mulher' }),
      ),
    )
    await open(page)

    const looks = shelf(page, 'pesa pouco').getByRole('button', {
      name: 'Aparência',
    })
    await tap(looks)
    await expect(looks).toHaveAttribute('aria-expanded', 'true')
    const detail = page.getByRole('region', { name: 'Aparência, satisfação' })
    await expect(detail).toContainText(
      'Só os maridos ficam um pouco mais satisfeitos, e só no começo.',
    )
    await expect(detail).toContainText('Medida: r = 0,10, só maridos')
    await expect(
      detail.getByRole('link', { name: 'Costa (2018)' }),
    ).toHaveAttribute('href', '/estudos/costa-2018-satisfacao')
    await expect(detail).toContainText('parcial')
    await expect(detail).toContainText('evidência moderada')
    await expect(detail).toContainText(
      'Amostra: Casais casados recrutados online.',
    )
    await expect(detail).toContainText('As pessoas dão menos peso à aparência')

    // Income has a bias by gender only: with "mulher" in the Profile, the
    // women's one applies.
    await tap(shelf(page, 'não sabemos').getByRole('button', { name: 'Renda' }))
    await expect(
      page.getByRole('region', { name: 'Aparência, satisfação' }),
    ).toHaveCount(0)
    const income = page.getByRole('region', { name: 'Renda, satisfação' })
    await expect(income).toContainText(
      'Mulheres tendem a dar mais peso à renda',
    )
    await expect(income).not.toContainText('Homens tendem')
  })

  test('says no study is Brazilian and brings the B1 Guide block', async ({
    page,
  }) => {
    await open(page)
    await expect(page.getByRole('note')).toContainText(
      'Nenhum destes estudos é brasileiro',
    )
    await expect(page.getByRole('note')).toContainText('casais homem-mulher')
    const fromGuide = page.getByRole('region', { name: 'Do Guia' })
    await expect(fromGuide).toContainText(
      'Que características do parceiro preveem uma boa relação?',
    )
    await expect(fromGuide).toContainText('moderada')
    await tap(fromGuide.getByRole('link', { name: 'Ler o Guia inteiro' }))
    await expect(page).toHaveURL(GUIDE_B1)
  })

  test('by keyboard: Tab reaches the chips, space picks, arrows change the outcome', async ({
    page,
  }) => {
    await open(page)
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

    const book = shelf(page, 'não sabemos').getByRole('button', {
      name: 'sua 2ª: Química sexual',
    })
    await book.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('region', { name: 'Química sexual, duração' }),
    ).toContainText('Nenhum estudo lido mede isso.')
  })

  test('the top 3 and the outcome come back after a reload', async ({
    page,
  }) => {
    await open(page)
    await tap(chip(page, 'Gentileza'))
    await page.getByRole('radio', { name: 'Atração' }).check()
    await page.reload()
    await expect(chip(page, 'Gentileza')).toHaveAccessibleName(
      'sua 1ª: Gentileza',
    )
    await expect(page.getByRole('radio', { name: 'Atração' })).toBeChecked()
  })
})

test.describe('B1 Guide card', () => {
  test('without a top 3, the short bar and the invitation to the page', async ({
    page,
  }) => {
    await page.goto(GUIDE_B1)
    const card = page.getByRole('region', {
      name: 'Onde ficam as suas prioridades?',
    })
    await expect(
      card.getByRole('img', { name: /45% explicado pela relação/ }),
    ).toBeVisible()
    await expect(card).not.toContainText('Antes da lista')
    await expect(card).not.toContainText('Seu topo 3')
    const button = card.getByRole('link', {
      name: 'Escolher as suas três e comparar',
    })
    expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tap(button)
    await expect(page).toHaveURL('/prioridades')
  })

  test('with a top 3, each one with its level in satisfaction, even with another outcome on the page', async ({
    page,
  }) => {
    await open(page)
    for (const name of ['Química sexual', 'Ser parecido comigo', 'Renda'])
      await tap(chip(page, name))
    await page.getByRole('radio', { name: 'Duração' }).check()

    await page.goto(GUIDE_B1)
    const card = page.getByRole('region', {
      name: 'Onde ficam as suas prioridades?',
    })
    await expect(card).toContainText('Seu topo 3 cabe na fatia de 5%:')
    await expect(card.locator('[data-slot="topo3-no-cartao"] li')).toHaveText([
      /Química sexual.*pesa$/,
      /Ser parecido comigo.*quase nada$/,
      /Renda.*não sabemos$/,
    ])
    await tap(card.getByRole('link', { name: 'Ver a lista inteira' }))
    await expect(chip(page, 'Química sexual')).toHaveAccessibleName(
      'sua 1ª: Química sexual',
    )
  })

  test('the Guide without a calculator has no card', async ({ page }) => {
    await page.goto('/onde-conhecer-pessoas/app-ou-presencial')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Onde ficam as suas prioridades?' }),
    ).toHaveCount(0)
  })
})
