// Managing login methods in `/conta` without JavaScript, against the real server.
// Nothing here submits the add-email form or follows "Ligar Google": the first sends
// mail and the second leaves for Google. `platform/login-methods.test.ts` runs both
// against fakes, and a confirmation link is seeded here as the mail would bring it.
import { createHash, randomBytes } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import { hashPassword } from '../src/platform/email-accounts.ts'
import { seed, signIn, unique } from './accounts'

test.use({ javaScriptEnabled: false })

const PASSWORD = 'a long password'

/** One address per test, as Nginx would forward it: without one, every run shares
 * the email limit of the `local` bucket, ten attempts in fifteen minutes. */
test.beforeEach(async ({ page }) => {
  const [a, b, c] = randomBytes(3)
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `10.${a}.${b}.${c}` })
})

async function registerByEmail(page: Page) {
  const suffix = unique()
  const email = `methods-${suffix}@example.org`
  await page.goto('/conta')
  await page.getByLabel('E-mail para criar conta').fill(email)
  await page.getByLabel('Crie uma senha').fill(PASSWORD)
  await page.getByLabel('Apelido').fill(`Leitora ${suffix}`)
  await page.getByRole('checkbox', { name: /18 anos/ }).check()
  await page.getByRole('checkbox', { name: /Li e aceito/ }).check()
  await page.getByRole('button', { name: 'Criar conta com e-mail' }).click()
  await expect(page.getByText('E-mail ligado:')).toBeVisible()
  return email
}

async function loginByEmail(page: Page, email: string, password: string) {
  await page.getByLabel('E-mail para entrar').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Entrar com e-mail' }).click()
}

const accountIdOf = (nickname: string) =>
  seed(
    (db) =>
      db.prepare('SELECT id FROM accounts WHERE nickname = ?').get(nickname)!
        .id!,
  )

/** The row `/auth/add-email` writes; returns what the mail's link carries. */
function seedLink(accountId: unknown, email: string, passwordHash: string) {
  const token = randomBytes(32).toString('base64url')
  seed((db) =>
    db
      .prepare('INSERT INTO email_links VALUES (?, ?, ?, ?, ?)')
      .run(
        Number(accountId),
        email,
        passwordHash,
        createHash('sha256').update(token).digest('base64url'),
        Date.now() + 30 * 60_000,
      ),
  )
  return `/auth/confirm-email?token=${token}`
}

test('an email account sees Google to link, changes the password, and keeps its only method', async ({
  page,
}) => {
  const email = await registerByEmail(page)
  await expect(page.getByRole('button', { name: 'Ligar Google' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tirar e-mail' })).toHaveCount(
    0,
  )

  await page.getByLabel('Senha atual').fill('not the password')
  await page.getByLabel('Nova senha').fill('a new password')
  await page.getByRole('button', { name: 'Trocar senha' }).click()
  await expect(page.getByRole('alert')).toContainText('não confere')

  await page.getByLabel('Senha atual').fill(PASSWORD)
  await page.getByLabel('Nova senha').fill('a new password')
  await page.getByRole('button', { name: 'Trocar senha' }).click()
  await expect(page.getByRole('status')).toContainText('Senha trocada')

  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await loginByEmail(page, email, 'a new password')
  await expect(page.getByText('E-mail ligado:')).toBeVisible()
})

test('a confirmation link joins the email for its account, and does nothing for anyone else', async ({
  page,
  context,
  browser,
}) => {
  const nickname = await signIn(context)
  await page.goto('/conta')
  await expect(page.getByLabel('E-mail que vai ligar')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Enviar link de confirmação' }),
  ).toBeVisible()
  const email = `added-${unique()}@example.org`
  const link = seedLink(
    accountIdOf(nickname),
    email,
    await hashPassword(PASSWORD),
  )
  await page.reload()
  await expect(page.getByText(`Falta confirmar ${email}.`)).toBeVisible()

  const stranger = await browser.newContext({ javaScriptEnabled: false })
  const scanner = await stranger.newPage()
  const requests: string[] = []
  scanner.on('request', (request) => requests.push(request.url()))
  const shown = await scanner.goto(link)
  expect(shown!.headers()['referrer-policy']).toBe('strict-origin')
  await expect(scanner.getByRole('status')).toContainText('entre na conta')
  await expect(scanner.getByText(email)).toHaveCount(0)
  expect(
    requests.every(
      (url) => new URL(url).origin === new URL(scanner.url()).origin,
    ),
  ).toBe(true)
  await stranger.close()

  await page.goto(link)
  await expect(page.getByText(email)).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar e-mail' }).click()
  await expect(page.getByRole('status')).toContainText('E-mail confirmado')
  await expect(page.getByText(email)).toBeVisible()

  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await loginByEmail(page, email, PASSWORD)
  await expect(page.getByText(`Você entrou como ${nickname}.`)).toBeVisible()
  await page.goto(link)
  await expect(page.getByRole('status')).toContainText('já foi usado')
})

test('with two methods either can go, and the last one stays', async ({
  page,
  context,
}) => {
  const nickname = await signIn(context)
  const email = `both-${unique()}@example.org`
  seed((db) =>
    db
      .prepare('INSERT INTO email_credentials VALUES (?, ?, ?)')
      .run(Number(accountIdOf(nickname)), email, 'not-a-login-hash'),
  )
  await page.goto('/conta')
  await page.getByRole('button', { name: 'Tirar Google' }).click()
  await expect(page.getByRole('status')).toContainText('saiu')
  await expect(page.getByText('Google não ligado.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tirar e-mail' })).toHaveCount(
    0,
  )
  await expect(
    page.getByText('Ligue outro para poder tirar este.'),
  ).toBeVisible()
})

test('the curator is warned, and the browser holds the removal until it is ticked', async ({
  page,
  context,
}) => {
  await signIn(context, 'e2e-curator')
  seed((db) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO email_credentials
        SELECT id, 'curator@example.org', 'not-a-login-hash' FROM accounts WHERE google_sub = 'e2e-curator'`,
      )
      .run(),
  )
  await page.goto('/conta')
  await expect(page.getByText(/perde a Curadoria/)).toBeVisible()
  await page.getByRole('button', { name: 'Tirar Google' }).click()
  await expect(page.getByText('Google ligado.')).toBeVisible()
  await expect(
    page.getByRole('checkbox', { name: /vou perder a Curadoria/ }),
  ).toBeVisible()
})
