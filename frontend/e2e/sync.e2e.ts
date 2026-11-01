import { createHash, randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { openDatabase } from '../src/platform/database'

test('consent merges the device and another device restores it', async ({
  page,
  context,
  baseURL,
  browser,
}) => {
  test.skip(
    !process.env.DATABASE_PATH || !process.env.GOOGLE_CLIENT_ID,
    'Needs an isolated account database and local OAuth configuration',
  )
  const token = randomUUID()
  const db = openDatabase()
  const account = db
    .prepare(
      'INSERT INTO accounts (google_sub, nickname) VALUES (?, ?) RETURNING id',
    )
    .get(token, 'Leitora')!
  db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
    createHash('sha256').update(token).digest('base64url'),
    account.id!,
    Date.now() + 60_000,
  )
  db.close()
  await context.addCookies([
    { name: 'local-session', value: token, url: baseURL! },
  ])
  await page.goto('/conta')
  await expect(
    page.getByRole('button', { name: 'Juntar e sincronizar' }),
  ).toBeVisible()
  await page.evaluate(() =>
    localStorage.setItem('tem-estudo:profile', JSON.stringify({ age: 37 })),
  )
  await page.getByRole('button', { name: 'Juntar e sincronizar' }).click()
  await expect(page.getByText(/A sincronização está ligada/)).toBeVisible()
  const second = await browser.newContext()
  await second.addCookies([
    { name: 'local-session', value: token, url: baseURL! },
  ])
  const other = await second.newPage()
  await other.goto(`${baseURL}/conta`)
  await other.getByRole('button', { name: 'Juntar e sincronizar' }).click()
  await expect(other.getByText(/A sincronização está ligada/)).toBeVisible()
  expect(
    await other.evaluate(() =>
      JSON.parse(localStorage.getItem('tem-estudo:profile')!),
    ),
  ).toEqual({ age: 37 })
  await second.close()
})

test('account reading works without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`${baseURL}/conta`)
  await expect(page.getByRole('heading', { name: 'Sua conta' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Entrar com Google' }),
  ).toBeVisible()
  await context.close()
})
