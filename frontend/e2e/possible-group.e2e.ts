// The Possible group (#31) over the fixture data `e2e/library/dados/`: Acre's
// rows taken from the real data (the fixture's "Brazil" is only Acre). The
// fixture's `app-ou-presencial` Guide hosts the calculator.
import { expect, test, type Page } from '@playwright/test'
import { choose, tap } from './touch'

const PAGE = '/grupo-possivel'
const range = (page: Page) =>
  page.locator('[data-slot="gp-preso"] [data-slot="gp-faixa"]')
const requirement = (page: Page, id: string) => page.locator(`#req-${id}`)

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

/** Waits for the number to change and returns the new one. */
async function changed(page: Page, before: string): Promise<string> {
  await expect(range(page)).not.toHaveText(before)
  await expect(page.locator('[data-slot="gp-preso"]')).toHaveAttribute(
    'aria-busy',
    'false',
  )
  return (await range(page).textContent()) ?? ''
}

test.describe('Possible group', () => {
  test('with nothing said, the server already brings the number and the Profile comes first', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await expect(range(page)).toHaveText(/^entre .+ e .+/)
    await expect(page.getByRole('form', { name: 'Seu Perfil' })).toBeVisible()
    // Without a gender, the count does not discount orientation and says the
    // number is a ceiling.
    await expect(
      page.getByRole('note').filter({ hasText: 'é um teto' }),
    ).toBeVisible()
    const titles = await page
      .locator('main h2[data-slot="headline"]')
      .allTextContents()
    expect(titles.slice(0, 3)).toEqual([
      'Seu Perfil',
      'Seus Requisitos',
      'A conta',
    ])
  })

  test('the Profile fills the sought age (±5) and orientation enters the count', async ({
    page,
  }) => {
    await page.goto(PAGE)
    const before = (await range(page).textContent()) ?? ''
    await fillProfile(page, 'homem', 'mulheres', '30')
    await changed(page, before)
    await expect(
      requirement(page, 'age').getByLabel('Idade de', { exact: true }),
    ).toHaveValue('25')
    await expect(
      requirement(page, 'age').getByLabel('até', { exact: true }),
    ).toHaveValue('35')
    await expect(
      page.getByText('a conta só conta quem se interessa por homens'),
    ).toBeVisible()
    await expect(
      page.getByRole('note').filter({ hasText: 'é um teto' }),
    ).toHaveCount(0)
  })

  test('by touch (click on desktop): the number stays pinned at the top and changes on each tap', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await fillProfile(page, 'mulher', 'homens', '28')
    let current = await changed(page, '')

    const education = requirement(page, 'education')
    await tap(education.getByRole('radio', { name: 'superior completo' }))
    current = await changed(page, current)
    await expect(range(page)).toBeInViewport()
    await expect(education.locator('[data-slot="gp-req-custo"]')).toHaveText(
      /^soltar só este: ×[\d,]+ \(\+.+\)$/,
    )

    await tap(
      requirement(page, 'age').getByRole('button', { name: 'até: mais 1' }),
    )
    current = await changed(page, current)
    await expect(
      requirement(page, 'age').locator('[data-slot="gp-req-valor"]'),
    ).toHaveText('23 a 34 anos')

    // "o que mais pesa" with "soltar": releasing education goes back to
    // "qualquer".
    await tap(page.getByRole('link', { name: 'ver a conta' }))
    await tap(page.getByRole('button', { name: 'Soltar escolaridade' }))
    await changed(page, current)
    await expect(
      education.getByRole('radio', { name: 'qualquer' }),
    ).toBeChecked()
  })

  test('by keyboard: steps, options and checkboxes answer Enter and space', async ({
    page,
  }) => {
    await page.goto(PAGE)
    let current = (await range(page).textContent()) ?? ''

    const plus = requirement(page, 'age').getByRole('button', {
      name: 'Idade de: mais 1',
    })
    await plus.focus()
    await page.keyboard.press('Enter')
    current = await changed(page, current)
    await expect(
      requirement(page, 'age').getByLabel('Idade de', { exact: true }),
    ).toHaveValue('19')

    const smokes = requirement(page, 'smoking').getByRole('checkbox', {
      name: 'Só quem não fuma',
    })
    await smokes.focus()
    await page.keyboard.press('Space')
    await expect(smokes).toBeChecked()
    current = await changed(page, current)

    const black = requirement(page, 'color').getByRole('checkbox', {
      name: 'preta',
    })
    await black.focus()
    await page.keyboard.press('Space')
    await changed(page, current)
    await expect(
      requirement(page, 'color').locator('[data-slot="gp-req-valor"]'),
    ).toHaveText('cor preta')

    // The age can also be typed.
    const upTo = requirement(page, 'age').getByLabel('até', { exact: true })
    await upTo.fill('40')
    await expect(
      requirement(page, 'age').locator('[data-slot="gp-req-valor"]'),
    ).toHaveText('19 a 40 anos')
  })

  test('"sem filhos" is disabled seeking men and partial seeking both', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await fillProfile(page, 'homem', 'homens', '30')
    const children = requirement(page, 'children')
    await expect(
      children.getByRole('checkbox', { name: 'Só quem não tem filhos' }),
    ).toBeDisabled()
    await expect(children).toContainText(
      'O Censo só pergunta filhos às mulheres. Procurando homens, não dá para filtrar.',
    )

    await page.getByRole('button', { name: 'mudar' }).click()
    await fillProfile(page, 'homem', 'ambos', '30')
    const checkbox = children.getByRole('checkbox', {
      name: 'Só quem não tem filhos',
    })
    await expect(checkbox).toBeEnabled()
    await checkbox.check()
    await expect(children).toContainText('o filtro vale só para elas')
    await expect(
      page.getByRole('note').filter({ hasText: '"sem filhos" vale para elas' }),
    ).toBeVisible()
  })

  test('gender "outro" does not discount orientation and carries the strong warning', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await fillProfile(page, 'outro', 'mulheres', '30')
    await expect(
      page
        .getByRole('note')
        .filter({ hasText: 'não pergunta identidade de gênero' }),
    ).toContainText('é um teto')
    await expect(page.getByText('a conta só conta quem')).toHaveCount(0)
  })

  test('state and municipality, and the Requirements stay saved after a reload', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await fillProfile(page, 'homem', 'mulheres', '30')
    const place = requirement(page, 'place')
    await choose(place, 'Estado', 'Acre')
    await choose(place, 'Município', 'Rio Branco')
    await expect(place.locator('[data-slot="gp-req-valor"]')).toHaveText(
      'Rio Branco (AC)',
    )
    await expect(page.locator('#a-conta')).toContainText(
      'mulheres em Rio Branco (AC) atendem',
    )

    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('tem-estudo:requirements') ?? 'null'),
    )
    expect(saved).toMatchObject({
      place: { state: 'AC', municipality: '1200401' },
      noLiveInPartner: true,
    })

    const before = await range(page).textContent()
    await page.reload()
    await expect(place.getByRole('combobox', { name: 'Município' })).toHaveText(
      'Rio Branco',
    )
    await expect(range(page)).toHaveText(before ?? '')
  })

  test('the folds stay closed, with the funnel and the naive count', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await fillProfile(page, 'mulher', 'homens', '25')
    const uncertainty = page.locator('#gp-incerteza')
    await expect(uncertainty).not.toHaveAttribute('open')
    await tap(
      uncertainty.getByRole('button', { name: 'De onde vem a incerteza' }),
    )
    await expect(uncertainty).toContainText(
      /Se só multiplicássemos .+ daria .+ \([+−]\d+%\)/,
    )
    await expect(uncertainty).toContainText('inclui quem namora')
    await tap(page.locator('#gp-corte-a-corte button'))
    await expect(
      page.locator('[data-slot="gp-funil"] li').first(),
    ).toContainText('homens de 18 anos ou mais no Brasil')
  })

  test('the "Do Guia" block carries the short answer and leads to the Guide', async ({
    page,
  }) => {
    await page.goto(PAGE)
    const block = page.getByRole('region', { name: 'Do Guia' })
    await expect(block).toContainText(
      'App ou presencial, onde tenho mais chance?',
    )
    await expect(block).toContainText(
      'A diferença de satisfação entre os dois caminhos é pequena.',
    )
    await tap(block.getByRole('link', { name: 'Ler o Guia inteiro' }))
    await expect(page).toHaveURL('/onde-conhecer-pessoas#app-ou-presencial')
  })

  test('the controls are at least 44px', async ({ page }) => {
    await page.goto(PAGE)
    const controls = page.locator(
      '#req-age button, #req-age input:not([aria-hidden="true"]), [id^="req-"] [data-slot="radio-group-item"], [id^="req-"] [data-slot="checkbox"], [id^="req-"] [role="combobox"], [data-slot="gp-preso"] a',
    )
    expect(await controls.count()).toBeGreaterThan(20)
    for (const c of await controls.all())
      expect((await c.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  })
})
