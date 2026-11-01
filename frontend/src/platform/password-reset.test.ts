import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'

let folder: string
beforeEach(() => { folder = mkdtempSync(join(tmpdir(), 'reset-')) })
afterEach(() => rmSync(folder, { recursive: true, force: true }))
function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

test('a recovery response does not wait for Resend; its link resets the password once and ends sessions', async () => {
  const received = deferred<string>()
  const release = deferred<void>()
  const fake = createServer(async (request, response) => {
    let body = ''
    for await (const chunk of request) body += String(chunk)
    received.resolve(body)
    await release.promise
    response.writeHead(200).end('{}')
  })
  await new Promise<void>((resolve) => fake.listen(0, '127.0.0.1', resolve))
  const address = fake.address()
  if (!address || typeof address === 'string') throw new Error('No fake port')
  const accounts = createAccounts({
    databasePath: join(folder, 'app.sqlite'), origin: 'https://example.org',
    emailRateLimitKey: 'test-key', resendApiKey: 'fake', emailFrom: 'reset@example.org',
    resendEndpoint: `http://127.0.0.1:${address.port}/emails`,
  })
  const post = (action: string, form: Record<string, string>) => accounts.handle(new Request(`https://example.org/auth/${action}`, {
    method: 'POST', headers: { origin: 'https://example.org' }, body: new URLSearchParams(form),
  }))
  try {
    const registered = (await post('register', { email: 'reader@example.org', password: 'old password', nickname: 'Leitora', adult: 'on', rules: 'on' }))!
    const cookie = registered.headers.getSetCookie()[0]!.split(';')[0]!
    expect((await post('forgot', { email: ' READER@example.org ' }))!.status).toBe(200)
    const mail = JSON.parse(await received.promise) as { text: string; html?: string }
    expect(mail.html).toBeUndefined()
    const link = new URL(mail.text.match(/https:\/\/\S+/)![0])
    expect(link.origin).toBe('https://example.org')
    const token = link.searchParams.get('token')!
    const db = new DatabaseSync(join(folder, 'app.sqlite'))
    const id = accounts.current(new Request('https://example.org', { headers: { cookie } }))!.id
    db.prepare(`INSERT INTO account_sync VALUES (?, 1, '{"note":"keep me"}')`).run(id)
    const stored = JSON.stringify(db.prepare('SELECT * FROM password_resets').all())
    expect(stored).not.toContain(token)
    expect(stored).not.toContain('reader@example.org')
    const page = (await accounts.handle(new Request(link)))!
    expect(page.headers.get('referrer-policy')).toBe('no-referrer')
    expect(page.headers.get('content-security-policy')).toContain("default-src 'none'")
    expect(await page.text()).not.toMatch(/<script|https:\/\//)
    const reset = (await post('reset', { token, password: 'new password' }))!
    expect(reset.status).toBe(200)
    expect(accounts.current(new Request('https://example.org', { headers: { cookie } }))).toBeNull()
    expect((await post('reset', { token, password: 'another password' }))!.status).toBe(400)
    expect((await post('login', { email: 'reader@example.org', password: 'old password' }))!.status).toBe(400)
    expect((await post('login', { email: 'reader@example.org', password: 'new password' }))!.status).toBe(303)
    expect(db.prepare('SELECT data FROM account_sync WHERE account_id = ?').get(id)?.data).toContain('keep me')
    db.close()
  } finally {
    release.resolve()
    await new Promise<void>((resolve) => fake.close(() => resolve()))
  }
})
