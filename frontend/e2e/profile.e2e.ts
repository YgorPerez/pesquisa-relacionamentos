// The Profile in the Guide (#30) over the fixture content: in the main Guide,
// the 1st finding comes from men and women aged 18 to 35 and the 2nd from
// man-woman couples; the Tip cites both. The other Guide only has the
// man-woman couples finding.
import { expect, test, type Page } from '@playwright/test'

const GUIDE = '/onde-conhecer-pessoas/onde-os-casais-se-conhecem'
const OTHER_GUIDE = '/onde-conhecer-pessoas/app-ou-presencial'
const NO_DATA = 'Não há dado deste estudo para o seu Perfil.'

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
  page
    .getByRole('region', { name: 'O que a evidência diz' })
    .locator('ol[data-slot="achados-guia"] > li')

/** Everything the page shows, in order: section titles, findings, Tips and
 * Fact sheets. */
const content = (page: Page) =>
  page.evaluate(() => ({
    sections: [...document.querySelectorAll('main h2')].map(
      (h) => h.textContent,
    ),
    findings: [
      ...document.querySelectorAll(
        'ol[data-slot="achados-guia"] > li p:first-child',
      ),
    ].map((p) => p.textContent),
    tips: [
      ...document.querySelectorAll(
        '[data-slot="dicas-do-guia"] > li > p:first-child',
      ),
    ].map((p) => p.textContent),
    factSheets: [
      ...document.querySelectorAll('[data-slot="fichas-citadas"] > li'),
    ].map((li) => li.id),
    notes: [...document.querySelectorAll('[data-slot="vale"]')].length,
  }))

test.describe('Profile in the Guide', () => {
  test('without a Profile, the link below the short answer invites and scrolls to the form', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const link = page.getByRole('link', {
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
      page
        .getByRole('region', { name: 'Dicas' })
        .locator('[data-slot="selo-voce"]'),
    ).toHaveText('vale para você')

    const answer = page.getByRole('region', { name: 'Resposta curta' })
    await expect(answer.locator('[data-slot="para-o-seu-perfil"]')).toHaveText(
      'vale para você o número em destaque vem de um estudo com pessoas do seu Perfil.',
    )
    const box = page.getByRole('region', { name: 'Varia conforme o Perfil?' })
    await expect(box).toContainText(
      'Seu Perfil: homem, procura homens, 30 anos',
    )
    await expect(box).toContainText(
      '1 de 2 achados tem dado para o seu Perfil.',
    )
    await expect(
      page.getByRole('link', {
        name: /Seu Perfil: homem, procura homens, 30 anos/,
      }),
    ).toContainText('mudar')
    await expect(page.locator('[data-slot="aviso-perfil"]')).toHaveCount(0)
  })

  test('the Profile applies on the other pages and on the next visit', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'homem', seeks: 'homens', age: '30' })
    await page.reload()
    await expect(
      page.getByRole('link', {
        name: /Seu Perfil: homem, procura homens, 30 anos/,
      }),
    ).toBeVisible()
    await expect(
      findings(page).nth(0).locator('[data-slot="selo-voce"]'),
    ).toBeVisible()

    // In the other Guide, the only finding is about man-woman couples: a
    // notice above the title.
    await page.goto(OTHER_GUIDE)
    const notice = page
      .getByRole('note')
      .filter({ hasText: 'Nenhum estudo deste Guia separou' })
    await expect(notice).toContainText('homem, procura homens, 30 anos')
    const noticeBox = await notice.boundingBox()
    const title = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(noticeBox!.y).toBeLessThan(title!.y)
    await expect(
      page.getByRole('region', { name: 'Varia conforme o Perfil?' }),
    ).toContainText('O único achado não tem dado para o seu Perfil.')
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
    await expect(page.locator('[data-slot="para-o-seu-perfil"]')).toContainText(
      'Para o seu Perfil: o número em destaque vem de outra amostra. O que tem dado para você: Nos EUA, a satisfação',
    )
  })

  test('"outro" only matches what did not split by gender: here, nothing covers', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await enterProfile(page, { gender: 'outro', seeks: 'homens' })
    await expect(page.locator('[data-slot="aviso-perfil"]')).toContainText(
      'outro gênero, procura homens',
    )
    await expect(page.getByText(NO_DATA)).toHaveCount(3)
    await expect(page.locator('[data-slot="para-o-seu-perfil"]')).toContainText(
      'nenhum número deste Guia vem de uma amostra como a sua.',
    )
    await expect(
      page.getByRole('region', { name: 'Varia conforme o Perfil?' }),
    ).toContainText('Nenhum dos 2 achados tem dado para o seu Perfil.')
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
      await expect(page.locator('[data-slot="perfil-contagem"]')).toBeVisible()
      expect(await content(page)).toEqual(before)
    }
  })
})
