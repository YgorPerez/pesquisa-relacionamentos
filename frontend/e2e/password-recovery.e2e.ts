import { createHash, randomBytes, randomInt } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { seed } from './accounts'

test.use({ javaScriptEnabled: false })

test('recovery opens from login and an expired link offers another request without JavaScript', async ({
  page,
}) => {
  await page.goto('/conta')
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click()
  await expect(page.getByLabel('E-mail da conta')).toBeVisible()
  await page.goto('/auth/reset?token=expired')
  await expect(page.getByRole('status')).toContainText('expirou')
  await expect(page.getByLabel('E-mail da conta')).toBeVisible()
})

test('a valid link changes the password without JavaScript or third-party requests', async ({
  page,
}) => {
  const token = randomBytes(32).toString('base64url')
  const id = randomInt(1, 2 ** 48 - 1)
  seed((db) => {
    db.prepare('INSERT INTO accounts (id, nickname) VALUES (?, ?)').run(
      id,
      `Reset ${id}`,
    )
    db.prepare('INSERT INTO email_credentials VALUES (?, ?, ?)').run(
      id,
      `reset-${id}@example.org`,
      'not-a-login-hash',
    )
    db.prepare('INSERT INTO password_resets VALUES (?, ?, ?)').run(
      id,
      createHash('sha256').update(token).digest('base64url'),
      Date.now() + 30 * 60_000,
    )
  })
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  const response = await page.goto(`/auth/reset?token=${token}`)
  expect(response!.headers()['referrer-policy']).toBe('strict-origin')
  await page.getByLabel('Nova senha').fill('a new password')
  await page.getByRole('button', { name: 'Salvar nova senha' }).click()
  await expect(page.getByRole('status')).toContainText('Senha alterada')
  expect(
    requests.every((url) => new URL(url).origin === new URL(page.url()).origin),
  ).toBe(true)
  expect(new URL(page.url()).search).toBe('')
  await page.goto(`/auth/reset?token=${token}`)
  await expect(page.getByRole('status')).toContainText('já foi usado')
})
