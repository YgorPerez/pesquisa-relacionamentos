// The Profile in the Guide (#30) over the fixture content. The Guide has one
// Profile box and two Questions: in the first, the 1st finding comes from
// men and women aged 18 to 35 and the 2nd from man-woman couples, and the Tip
// cites both; the second only has the man-woman couples finding.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas'
const FIRST = 'Onde os casais se conhecem hoje?'
const SECOND = 'App ou presencial, onde tenho mais chance?'
const NO_DATA = 'Não há dado deste estudo para o seu Perfil.'

const question = (page: Page, name = FIRST) =>
  page.getByRole('region', { name, exact: true })
const variesByProfile = (page: Page, name = FIRST) =>
  question(page, name).getByRole('region', {
    name: 'Varia conforme o Perfil?',
  })
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

const findings = (page: Page) =>
  question(page)
    .getByRole('region', { name: 'O que a evidência diz' })
    .locator('ol[data-slot="achados-guia"] > li')

/** Everything the page shows, in order: section titles, findings, Tips and
 * Fact sheets. */
const content = (page: Page) =>
  page.evaluate(() => ({
    // The Possible group card's title says whether it was used, which the
    // Profile changes on purpose.
    sections: [...document.querySelectorAll('main h2:not(#t-cartao-gp)')].map(
      (h) => h.textContent,
    ),
    findings: [
      ...document.querySelectorAll(
        'ol[data-slot="achados-guia"] > li p:first-child',
      ),
    ].map((p) => p.textContent),
    tips: [
      ...document.querySelectorAll('[data-slot="dica"] > p:first-child'),
    ].map((p) => p.textContent),
    factSheets: [
      ...document.querySelectorAll('[data-slot="fichas-citadas"] > li'),
    ].map((li) => li.id),
    notes: [...document.querySelectorAll('[data-slot="vale"]')].length,
  }))

test.describe('Profile in the Guide', () => {
  test("without a Profile, the link in a Question's Varia conforme o Perfil? invites and scrolls to the form", async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const link = variesByProfile(page, SECOND).getByRole('link', {
      name: /Diga seu Perfil e veja o que vale para você/,
    })
    await expect(link).toContainText('opcional')
    await expect(page.locator('[data-slot="selo-voce"]')).toHaveCount(0)
    await expect(page.getByText(NO_DATA)).toHaveCount(0)
    await link.click()
    await expect(page).toHaveURL(`${GUIDE}#perfil`)
    await expect(
      page.getByRole('form', { name: 'Seu Perfil' }),
    ).toBeInViewport()
  })

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

  test('with a Profile, marks what applies and what has no data, without removing the Vale para note', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'homem', seeks: 'homens', age: '30' })

    await expect(
      findings(page).nth(0).locator('[data-slot="selo-voce"]'),
    ).toHaveText('vale para você')
    await expect(findings(page).nth(0)).toContainText(
      'Vale para: homens e mulheres, de 18 a 35 anos.',
    )
    await expect(findings(page).nth(0)).not.toContainText(NO_DATA)
    // Man-woman couples do not apply to a man seeking men.
    await expect(
      findings(page).nth(1).locator('[data-slot="selo-voce"]'),
    ).toHaveCount(0)
    await expect(
      findings(page).nth(1).locator('[data-slot="anel-vazio"]'),
    ).toHaveCount(1)
    await expect(findings(page).nth(1)).toContainText(
      `Vale para: casais homem-mulher. ${NO_DATA}`,
    )
    await expect(
      question(page)
        .getByRole('region', { name: 'Dicas' })
        .locator('[data-slot="selo-voce"]'),
    ).toHaveText('vale para você')

    const answer = question(page).locator('[data-slot="resposta"]')
    await expect(answer.locator('[data-slot="para-o-seu-perfil"]')).toHaveText(
      'vale para você o número em destaque vem de um estudo com pessoas do seu Perfil.',
    )
    await expect(profileBox(page)).toContainText(
      'Seu Perfil: homem, procura homens, 30 anos',
    )
    await expect(variesByProfile(page)).toContainText(
      '1 de 2 achados tem dado para o seu Perfil.',
    )
    await expect(
      variesByProfile(page).getByRole('link', {
        name: /Seu Perfil: homem, procura homens, 30 anos/,
      }),
    ).toContainText('mudar')
    await expect(
      question(page).locator('[data-slot="aviso-perfil"]'),
    ).toHaveCount(0)
  })

  test('the Profile applies to each Question and on the next visit', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'homem', seeks: 'homens', age: '30' })
    await page.reload()
    await expect(profileBox(page)).toContainText(
      'Seu Perfil: homem, procura homens, 30 anos',
    )
    await expect(
      findings(page).nth(0).locator('[data-slot="selo-voce"]'),
    ).toBeVisible()

    // In the second Question, the only finding is about man-woman couples: a
    // notice above its short answer, and none in the first.
    const notice = question(page, SECOND)
      .getByRole('note')
      .filter({ hasText: 'Nenhum estudo desta Pergunta separou' })
    await expect(notice).toContainText('homem, procura homens, 30 anos')
    const noticeBox = await notice.boundingBox()
    const answer = await question(page, SECOND)
      .locator('[data-slot="resposta"]')
      .boundingBox()
    expect(noticeBox!.y).toBeLessThan(answer!.y)
    await expect(
      question(page).locator('[data-slot="aviso-perfil"]'),
    ).toHaveCount(0)
    await expect(variesByProfile(page, SECOND)).toContainText(
      'O único achado não tem dado para o seu Perfil.',
    )
  })

  test('when the key number does not apply, the line says which finding does', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, {
      gender: 'mulher',
      seeks: 'homens',
      age: '50',
    })
    await expect(
      question(page).locator('[data-slot="para-o-seu-perfil"]'),
    ).toContainText(
      'Para o seu Perfil: o número em destaque vem de outra amostra. O que tem dado para você: Nos EUA, a satisfação',
    )
  })

  test('"outro" only matches what did not split by gender: here, nothing covers', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'outro', seeks: 'homens' })
    await expect(
      question(page).locator('[data-slot="aviso-perfil"]'),
    ).toContainText('outro gênero, procura homens')
    await expect(question(page).getByText(NO_DATA)).toHaveCount(3)
    await expect(
      question(page).locator('[data-slot="para-o-seu-perfil"]'),
    ).toContainText(
      'nenhum número desta Pergunta vem de uma amostra como a sua.',
    )
    await expect(variesByProfile(page)).toContainText(
      'Nenhum dos 2 achados tem dado para o seu Perfil.',
    )
  })

  test('someone seeking both sees which side has data', async ({ page }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'homem', seeks: 'ambos', age: '30' })
    await expect(
      findings(page).nth(0).locator('[data-slot="selo-voce"]'),
    ).toHaveText('vale para você')
    await expect(
      findings(page).nth(1).locator('[data-slot="selo-voce"]'),
    ).toHaveText('vale para você quando procura mulheres')
  })

  test('"mudar" opens the filled-in form, and deleting goes back to the Guide without a Profile', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, {
      gender: 'mulher',
      seeks: 'mulheres',
      age: '24',
    })
    await variesByProfile(page)
      .getByRole('link', { name: /Seu Perfil: mulher/ })
      .click()
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
    await expect(
      variesByProfile(page).getByRole('link', { name: /Diga seu Perfil/ }),
    ).toBeVisible()
    await expect(page.locator('[data-slot="selo-voce"]')).toHaveCount(0)
  })

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
      await expect(
        page.locator('[data-slot="perfil-contagem"]').first(),
      ).toBeVisible()
      expect(await content(page)).toEqual(before)
    }
  })
})
