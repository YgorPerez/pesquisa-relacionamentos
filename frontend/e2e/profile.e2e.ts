// The Profile in the Guide (#30, #194) over the fixture content. The Guide
// has one Profile box. The first answer's key number comes from men and women
// aged 18 to 35 (Silva), and its other finding from man-woman couples
// (Costa); a sentence of the first Chapter marks the finding about ages 18 to
// 24, and the Tip of the second Chapter cites both Fact sheets.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const FIRST = 'Onde os casais se conhecem hoje?'
const NO_DATA = 'Não há dado deste estudo para o seu Perfil.'

const answer = (page: Page, name = FIRST) =>
  page.getByRole('region', { name, exact: true })
const forYourProfile = (page: Page) =>
  answer(page).locator('[data-slot="para-o-seu-perfil"]')
const markInText = (page: Page) =>
  page.locator('[data-voce="app-entre-os-mais-novos"]')
const tip = (page: Page) => page.locator('main [data-slot="dica"]').first()
const profileBox = (page: Page) =>
  page.getByRole('region', { name: 'Seu Perfil' })

interface ProfileInForm {
  gender?: 'homem' | 'mulher' | 'outro'
  seeks?: 'homens' | 'mulheres' | 'ambos'
  age?: string
}

async function enterProfile(page: Page, { gender, seeks, age }: ProfileInForm) {
  const form = page.getByRole('form', { name: 'Seu Perfil' })
  if (gender)
    await form
      .getByRole('group', { name: 'Você é' })
      .getByRole('radio', { name: gender, exact: true })
      .check()
  if (seeks)
    await form
      .getByRole('group', { name: 'Você procura' })
      .getByRole('radio', { name: seeks, exact: true })
      .check()
  if (age !== undefined) await form.getByLabel('Sua idade').fill(age)
  await form.getByRole('button', { name: 'Ver o que vale para mim' }).click()
}

/** Everything the page shows, in order: section titles, answers, Tips and
 * Fact sheets. */
const content = (page: Page) =>
  page.evaluate(() => ({
    // The Possible group card's title says whether it was used, which the
    // Profile changes on purpose.
    sections: [...document.querySelectorAll('main h2:not(#t-cartao-gp)')].map(
      (h) => h.textContent,
    ),
    answers: [...document.querySelectorAll('[data-slot="resposta"] h3')].map(
      (h) => h.textContent,
    ),
    tips: [
      ...document.querySelectorAll('[data-slot="dica"] > p:first-child'),
    ].map((p) => p.textContent),
    factSheets: [
      ...document.querySelectorAll('[data-slot="fichas-citadas"] > li'),
    ].map((li) => li.id),
    notes: [...document.querySelectorAll('[data-slot="vale"]')].length,
  }))

test.describe('Profile in the Guide', () => {
  test('without a Profile, nothing is marked, and the box near the top invites', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await expect(profileBox(page)).toContainText('Opcional')
    await expect(page.locator('[data-slot="selo-voce"]')).toHaveCount(0)
    await expect(page.getByText(NO_DATA)).toHaveCount(0)
    await expect(markInText(page)).toBeHidden()
    await expect(forYourProfile(page)).toHaveCount(0)
    // The box comes before the first Chapter.
    const box = await profileBox(page).boundingBox()
    const chapter = await page
      .locator('[data-slot="capitulo"]')
      .first()
      .boundingBox()
    expect(box!.y).toBeLessThan(chapter!.y)
  })
})

test.describe('the Profile form', () => {
  test('the Profile options are at least 44px and the age starts at 18', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const form = page.getByRole('form', { name: 'Seu Perfil' })
    for (const option of await form
      .locator('[data-slot="radio-group-item"]')
      .all()) {
      expect((await option.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    }
    expect(
      (await form.getByLabel('Sua idade').boundingBox())?.height,
    ).toBeGreaterThanOrEqual(44)
    await enterProfile(page, { age: '17' })
    // The browser blocks the submit: nothing is saved.
    await expect(form).toBeVisible()
    expect(
      await page.evaluate(() => localStorage.getItem('tem-estudo:profile')),
    ).toBeNull()
  })
})

test.describe('Profile in the Guide, marks', () => {
  test("with a Profile, the answer says its key number is the reader's, and the sentence and the Tip that cover it get the yellow mark", async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'homem', seeks: 'homens', age: '22' })
    await expect(profileBox(page)).toContainText(
      'Seu Perfil: homem, procura homens, 22 anos',
    )
    await expect(forYourProfile(page)).toHaveText(
      'vale para você o número em destaque vem de um estudo com pessoas do seu Perfil.',
    )
    await expect(markInText(page)).toBeVisible()
    await expect(markInText(page)).toHaveText('vale para você')
    await expect(tip(page).locator('[data-slot="selo-voce"]')).toHaveText(
      'vale para você',
    )
    // The Vale para note of the Tip stays.
    await expect(tip(page)).toContainText('Vale para:')
  })

  test('the Profile holds on the next visit, and the mark follows the age', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'homem', seeks: 'homens', age: '30' })
    await page.reload()
    await expect(profileBox(page)).toContainText(
      'Seu Perfil: homem, procura homens, 30 anos',
    )
    await expect(forYourProfile(page)).toContainText('vale para você')
    // The sentence is about ages 18 to 24.
    await expect(markInText(page)).toBeHidden()
  })
})

test.describe('Profile in the Guide, other samples', () => {
  test('when the key number does not apply, the line says which finding does', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, {
      gender: 'mulher',
      seeks: 'homens',
      age: '50',
    })
    await expect(forYourProfile(page)).toContainText(
      'Para o seu Perfil: o número em destaque vem de outra amostra. O que tem dado para você: Nos EUA, a satisfação',
    )
  })

  test('"outro" only matches what did not split by gender: no number of the answer is the reader\'s', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'outro', seeks: 'homens' })
    await expect(forYourProfile(page)).toContainText(
      'nenhum número desta Pergunta vem de uma amostra como a sua.',
    )
    await expect(tip(page)).toContainText(NO_DATA)
  })

  test('someone seeking both gets the yellow mark where one side has data', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'homem', seeks: 'ambos', age: '30' })
    await expect(tip(page).locator('[data-slot="selo-voce"]')).toHaveText(
      'vale para você',
    )
  })
})

test.describe('changing and deleting the Profile', () => {
  test('"mudar" opens the filled-in form, and deleting goes back to the Guide without a Profile', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, {
      gender: 'mulher',
      seeks: 'mulheres',
      age: '24',
    })
    await profileBox(page).getByRole('button', { name: 'mudar' }).click()
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
    await expect(profileBox(page)).toContainText(
      'Seu Perfil: mulher, procura homens, 24 anos',
    )
    await profileBox(page).getByRole('button', { name: 'mudar' }).click()
    await page.getByRole('button', { name: 'Apagar o Perfil' }).click()
    await expect(page.locator('[data-slot="selo-voce"]')).toHaveCount(0)
    await expect(markInText(page)).toBeHidden()
  })
})

test.describe('the Profile hides nothing', () => {
  test('nothing changes order or disappears with the Profile', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const before = await content(page)
    for (const profile of [
      { gender: 'homem', seeks: 'homens', age: '30' },
      { gender: 'outro', seeks: 'ambos', age: '60' },
    ] as const) {
      if (await page.getByRole('button', { name: 'mudar' }).isVisible())
        await page.getByRole('button', { name: 'mudar' }).click()
      await enterProfile(page, profile)
      await expect(forYourProfile(page)).toBeVisible()
      expect(await content(page)).toEqual(before)
    }
  })
})
