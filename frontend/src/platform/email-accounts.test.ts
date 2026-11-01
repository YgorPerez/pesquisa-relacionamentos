import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'

const folder = mkdtempSync(join(tmpdir(), 'email-accounts-'))
afterEach(() => rmSync(folder, { recursive: true, force: true }))

test('an email reader registers, leaves and logs in with a normalized address without Google', async () => {
  const accounts = createAccounts({ databasePath: join(folder, 'app.sqlite'), origin: 'https://example.org', emailRateLimitKey: 'test-only-key' })
  const post = (path: string, form: Record<string, string>, cookie = '') => accounts.handle(new Request(`https://example.org/auth/${path}`, { method: 'POST', headers: { origin: 'https://example.org', cookie }, body: new URLSearchParams(form) }))
  const created = (await post('register', { email: ' Reader@Example.org ', password: 'long password', nickname: 'Leitora', adult: 'on', rules: 'on' }))!
  expect(created.status).toBe(303)
  const cookie = created.headers.getSetCookie()[0]!.split(';')[0]!
  const current = () => accounts.current(new Request('https://example.org/conta', { headers: { cookie } }))
  expect(current()).toMatchObject({ nickname: 'Leitora', googleSub: null })
  const id = current()!.id
  await post('logout', {}, cookie)
  expect(current()).toBeNull()
  const login = (await post('login', { email: 'READER@example.org', password: 'long password' }))!
  expect(login.status).toBe(303)
  expect(accounts.current(new Request('https://example.org', { headers: { cookie: login.headers.getSetCookie()[0]!.split(';')[0]! } }))?.id).toBe(id)
})
