// `/conta` without JavaScript (ADR 0045): a reader who logged in finishes the
// nickname with the browser alone. The session is written straight to the
// database: Google is `platform/accounts.test.ts`'s.
import { expect, test, type Page } from '@playwright/test'
import { signInWithoutNickname, unique } from './accounts'

test.use({ javaScriptEnabled: false })

test('without JavaScript a reader registers with email, signs out and logs in again', async ({
  page,
}) => {
  const suffix = unique()
  const email = `reader-${suffix}@example.org`
  const nickname = `Leitora ${suffix}`
  await page.goto('/conta')
  await page.getByLabel('E-mail para criar conta').fill(email)
  await page.getByLabel('Crie uma senha').fill('a long password')
  await page.getByLabel('Apelido').fill(nickname)
  await page.getByRole('checkbox', { name: /18 anos/ }).check()
  await page.getByRole('checkbox', { name: /Li e aceito/ }).check()
  await page.getByRole('button', { name: 'Criar conta com e-mail' }).click()
  await expect(page.getByText(`Você entrou como ${nickname}.`)).toBeVisible()
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await page.getByLabel('E-mail para entrar').fill(email.toUpperCase())
  await page.getByLabel('Senha', { exact: true }).fill('a long password')
  await page.getByRole('button', { name: 'Entrar com e-mail' }).click()
  await expect(page.getByText(`Você entrou como ${nickname}.`)).toBeVisible()
})

async function chooseNickname(page: Page, nickname: string) {
  await page.goto('/conta')
  await page.getByLabel('Apelido').fill(nickname)
  await page.getByRole('checkbox', { name: /18 anos/ }).check()
  await page.getByRole('checkbox', { name: /Li e aceito/ }).check()
  await page.getByRole('button', { name: 'Criar apelido' }).click()
}

test('without JavaScript the nickname is chosen, and one in use comes back with why', async ({
  page,
  context,
  browser,
}) => {
  const nickname = `Leitora ${unique()}`
  await signInWithoutNickname(context)
  await chooseNickname(page, nickname)
  await expect(page.getByText(`Você entrou como ${nickname}.`)).toBeVisible()

  const other = await browser.newContext({ javaScriptEnabled: false })
  await signInWithoutNickname(other)
  const copycat = await other.newPage()
  await chooseNickname(copycat, nickname.toUpperCase())
  await expect(copycat.getByRole('alert')).toContainText('já está em uso')
  await expect(copycat.getByLabel('Apelido')).toBeVisible()
  await other.close()
})

test('without JavaScript the browser holds back a form missing a declaration', async ({
  page,
  context,
}) => {
  await signInWithoutNickname(context)
  await page.goto('/conta')
  await page.getByLabel('Apelido').fill(`Leitora ${unique()}`)
  await page.getByRole('button', { name: 'Criar apelido' }).click()
  await expect(page.getByRole('checkbox', { name: /18 anos/ })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(page.url()).toMatch(/\/conta$/)
})

test('without JavaScript a refused sign-up comes back to /conta with why', async ({
  page,
}) => {
  const suffix = unique()
  const register = async (email: string, nickname: string) => {
    await page.goto('/conta')
    await page.getByLabel('E-mail para criar conta').fill(email)
    await page.getByLabel('Crie uma senha').fill('a long password')
    await page.getByLabel('Apelido').fill(nickname)
    await page.getByRole('checkbox', { name: /18 anos/ }).check()
    await page.getByRole('checkbox', { name: /Li e aceito/ }).check()
    await page.getByRole('button', { name: 'Criar conta com e-mail' }).click()
  }
  await register(`reader-${suffix}@example.org`, `Leitora ${suffix}`)
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await register(`reader-${suffix}@example.org`, `Outra ${suffix}`)
  await expect(page.getByRole('alert')).toContainText('já tem conta')
  await expect(page.getByRole('alert')).toBeInViewport()
  await expect(page.getByLabel('E-mail para criar conta')).toBeVisible()
})

test.describe('with JavaScript', () => {
  test.use({ javaScriptEnabled: true })

  test('a reader signs up one step at a time, and a nickname in use keeps the rest', async ({
    page,
    browser,
  }) => {
    const suffix = unique()
    const nickname = `Leitora ${suffix}`
    const other = await browser.newContext({ javaScriptEnabled: false })
    await signInWithoutNickname(other)
    await chooseNickname(await other.newPage(), nickname)
    await other.close()

    await page.goto('/conta')
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible()
    await page
      .getByLabel('E-mail para criar conta')
      .fill(`reader-${suffix}@example.org`)
    await page.getByLabel('Crie uma senha').fill('a long password')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByLabel('Apelido').fill(nickname)
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('checkbox', { name: /18 anos/ }).check()
    await page.getByRole('checkbox', { name: /Li e aceito/ }).check()
    await page.getByRole('button', { name: 'Criar conta com e-mail' }).click()

    await expect(page.getByRole('alert')).toContainText('já está em uso')
    await expect(page.getByLabel('Apelido')).toHaveValue(nickname)
    await page.getByLabel('Apelido').fill(`Outra ${suffix}`)
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: 'Criar conta com e-mail' }).click()
    await expect(
      page.getByText(`Você entrou como Outra ${suffix}.`),
    ).toBeVisible()
  })
})
