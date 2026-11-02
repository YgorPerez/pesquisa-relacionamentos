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
