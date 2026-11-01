import { createHash, randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { openDatabase } from '../src/platform/database'

function signIn(nickname: string | null = 'Leitora') {
  const token = randomUUID()
  const db = openDatabase(process.env.E2E_DATABASE_PATH)
  const account = db
    .prepare(
      'INSERT INTO accounts (google_sub, nickname) VALUES (?, ?) RETURNING id',
    )
    .get(token, nickname)!
  db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
    createHash('sha256').update(token).digest('base64url'),
    account.id!,
    Date.now() + 60_000,
  )
  db.close()
  return token
}
const SYNC_ON = /A sincronização está ligada/
const JOIN = 'Juntar e sincronizar'

test('consent merges the device and another device restores it', async ({
  page,
  context,
  baseURL,
  browser,
}) => {
  const token = signIn()
  await context.addCookies([
    { name: 'local-session', value: token, url: baseURL! },
  ])
  await page.goto('/conta')
  await expect(page.getByText(/Quem administra o servidor/)).toBeVisible()
  await page.evaluate(() =>
    localStorage.setItem('tem-estudo:profile', JSON.stringify({ age: 37 })),
  )
  await page.getByRole('button', { name: JOIN }).click()
  await expect(page.getByText(SYNC_ON)).toBeVisible()
  const second = await browser.newContext()
  await second.addCookies([
    { name: 'local-session', value: token, url: baseURL! },
  ])
  const other = await second.newPage()
  await other.goto(`${baseURL}/conta`)
  await other.getByRole('button', { name: JOIN }).click()
  await expect(other.getByText(SYNC_ON)).toBeVisible()
  expect(
    await other.evaluate(() =>
      JSON.parse(localStorage.getItem('tem-estudo:profile')!),
    ),
  ).toEqual({ age: 37 })
  await second.close()
})

test('declining sends no data and asks no more', async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: 'local-session', value: signIn(), url: baseURL! },
  ])
  const uploads: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('/api/sync') && request.method() === 'POST')
      uploads.push(request.postData() ?? '')
  })
  await page.goto('/conta')
  await page.evaluate(() =>
    localStorage.setItem('tem-estudo:profile', JSON.stringify({ age: 37 })),
  )
  await page.getByRole('button', { name: 'Manter só neste aparelho' }).click()
  await expect(page.getByText(/Nada foi enviado à conta/)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/Nada foi enviado à conta/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Manter só neste aparelho' }),
  ).toHaveCount(0)
  expect(uploads).toEqual([JSON.stringify({ consent: false })])
})

test('a received link stays on the device and the account keeps its version', async ({
  page,
  context,
  baseURL,
  browser,
}) => {
  const token = signIn()
  await context.addCookies([
    { name: 'local-session', value: token, url: baseURL! },
  ])
  await page.goto('/conta')
  await page.evaluate(() =>
    localStorage.setItem('tem-estudo:profile', JSON.stringify({ age: 37 })),
  )
  await page.getByRole('button', { name: JOIN }).click()
  await expect(page.getByText(SYNC_ON)).toBeVisible()

  await page.goto('/grupo-possivel?v=1&genero=mulher&idade=22')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('tem-estudo:profile')))
    .toContain('22')
  await page.goto('/conta')
  await expect(page.getByText(/Um link recebido trocou/)).toBeVisible()

  const second = await browser.newContext()
  await second.addCookies([
    { name: 'local-session', value: token, url: baseURL! },
  ])
  const other = await second.newPage()
  await other.goto(`${baseURL}/conta`)
  await other.getByRole('button', { name: JOIN }).click()
  await expect(other.getByText(SYNC_ON)).toBeVisible()
  expect(
    await other.evaluate(() =>
      JSON.parse(localStorage.getItem('tem-estudo:profile')!),
    ),
  ).toEqual({ age: 37 })
  await second.close()

  await page.getByRole('button', { name: 'Voltar aos dados da conta' }).click()
  await expect(page.getByText(/Um link recebido trocou/)).toHaveCount(0)
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('tem-estudo:profile')!),
    ),
  ).toEqual({ age: 37 })
})

test('reading without an account never calls sync', async ({ page }) => {
  const calls: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/sync')) calls.push(request.url())
  })
  await page.goto('/grupo-possivel')
  await page.goto('/conta')
  await expect(page.getByRole('heading', { name: 'Sua conta' })).toBeVisible()
  expect(calls).toEqual([])
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
