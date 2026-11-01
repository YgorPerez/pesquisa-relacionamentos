import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'

let folder: string
beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'reset-'))
})
afterEach(() => rmSync(folder, { recursive: true, force: true }))
function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
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
    databasePath: join(folder, 'app.sqlite'),
    origin: 'https://example.org',
    emailRateLimitKey: 'test-key',
    resendApiKey: 'fake',
    emailFrom: 'reset@example.org',
    resendEndpoint: `http://127.0.0.1:${address.port}/emails`,
  })
  const post = (action: string, form: Record<string, string>) =>
    accounts.handle(
      new Request(`https://example.org/auth/${action}`, {
        method: 'POST',
        headers: { origin: 'https://example.org' },
        body: new URLSearchParams(form),
      }),
    )
  try {
    const registered = (await post('register', {
      email: 'reader@example.org',
      password: 'old password',
      nickname: 'Leitora',
      adult: 'on',
      rules: 'on',
    }))!
    const cookie = registered.headers.getSetCookie()[0]!.split(';')[0]!
    expect(
      (await post('forgot', { email: ' READER@example.org ' }))!.status,
    ).toBe(200)
    const mail = JSON.parse(await received.promise) as {
      text: string
      html?: string
    }
    expect(mail.html).toBeUndefined()
    const link = new URL(mail.text.match(/https:\/\/\S+/)![0])
    expect(link.origin).toBe('https://example.org')
    const token = link.searchParams.get('token')!
    const db = new DatabaseSync(join(folder, 'app.sqlite'))
    const id = accounts.current(
      new Request('https://example.org', { headers: { cookie } }),
    )!.id
    db.prepare(
      `INSERT INTO account_sync VALUES (?, 1, '{"note":"keep me"}')`,
    ).run(id)
    const stored = JSON.stringify(
      db.prepare('SELECT * FROM password_resets').all(),
    )
    expect(stored).not.toContain(token)
    expect(stored).not.toContain('reader@example.org')
    const page = (await accounts.handle(new Request(link)))!
    expect(page.headers.get('referrer-policy')).toBe('strict-origin')
    expect(page.headers.get('content-security-policy')).toContain(
      "default-src 'none'",
    )
    expect(await page.text()).not.toMatch(/<script|https:\/\//)
    const reset = (await post('reset', { token, password: 'new password' }))!
    expect(reset.status).toBe(200)
    expect(
      accounts.current(
        new Request('https://example.org', { headers: { cookie } }),
      ),
    ).toBeNull()
    expect(
      (await post('reset', { token, password: 'another password' }))!.status,
    ).toBe(400)
    expect(
      (await post('login', {
        email: 'reader@example.org',
        password: 'old password',
      }))!.status,
    ).toBe(400)
    expect(
      (await post('login', {
        email: 'reader@example.org',
        password: 'new password',
      }))!.status,
    ).toBe(303)
    expect(
      db.prepare('SELECT data FROM account_sync WHERE account_id = ?').get(id)
        ?.data,
    ).toContain('keep me')
    db.close()
  } finally {
    release.resolve()
    fake.closeAllConnections()
    await new Promise<void>((resolve) => fake.close(() => resolve()))
  }
})

test('new requests replace links, expiry is 30 minutes, and unknown notices share the bounded response', async () => {
  let next = deferred<{ text: string }>()
  const mails: { text: string }[] = []
  let fail = false
  const fake = createServer(async (request, response) => {
    let body = ''
    for await (const chunk of request) body += String(chunk)
    const mail = JSON.parse(body) as { text: string }
    mails.push(mail)
    next.resolve(mail)
    response.writeHead(fail ? 500 : 200).end('{}')
  })
  await new Promise<void>((resolve) => fake.listen(0, '127.0.0.1', resolve))
  const address = fake.address()
  if (!address || typeof address === 'string') throw new Error('No fake port')
  let now = Date.now()
  const accounts = createAccounts({
    databasePath: join(folder, 'app.sqlite'),
    origin: 'https://example.org',
    emailRateLimitKey: 'test-key',
    resendApiKey: 'fake',
    emailFrom: 'reset@example.org',
    resendEndpoint: `http://127.0.0.1:${address.port}/emails`,
    now: () => now,
  })
  const post = (
    action: string,
    form: Record<string, string>,
    ip = '198.51.100.1',
    origin = 'https://example.org',
  ) =>
    accounts.handle(
      new Request(`https://example.org/auth/${action}`, {
        method: 'POST',
        headers: { origin, 'x-forwarded-for': ip },
        body: new URLSearchParams(form),
      }),
    )
  const ask = async (email: string, ip?: string) => {
    next = deferred<{ text: string }>()
    const response = (await post('forgot', { email }, ip))!
    const mail = await next.promise
    return { screen: await response.text(), mail }
  }
  const tokenOf = (text: string) =>
    new URL(text.match(/https:\/\/\S+/)![0]).searchParams.get('token')!
  try {
    await post('register', {
      email: 'reader@example.org',
      password: 'old password',
      nickname: 'Leitora',
      adult: 'on',
      rules: 'on',
    })
    const first = await ask('reader@example.org')
    const second = await ask('reader@example.org')
    expect(tokenOf(first.mail.text)).not.toBe(tokenOf(second.mail.text))
    expect(
      (await post('reset', {
        token: tokenOf(first.mail.text),
        password: 'new password',
      }))!.status,
    ).toBe(400)
    now += 30 * 60_000
    expect(
      (await post('reset', {
        token: tokenOf(second.mail.text),
        password: 'new password',
      }))!.status,
    ).toBe(400)
    const unknown = await ask('unknown@example.org')
    expect(unknown.mail.text).toContain('não há conta')
    expect(unknown.mail.text).not.toMatch(/https?:|<img/)
    expect(unknown.screen).toBe(first.screen)
    fail = true
    expect((await ask('reader@example.org')).screen).toBe(first.screen)
    // Nine notices plus the previous unknown request exhaust this address,
    // even as its IP changes. Each accepted notice is observed at the fake.
    for (let n = 0; n < 9; n++)
      await ask('unknown@example.org', `198.51.100.${n + 2}`)
    expect(
      await (await post(
        'forgot',
        { email: 'unknown@example.org' },
        '203.0.113.1',
      ))!.text(),
    ).toBe(first.screen)
    // Origin is checked before scheduling any delivery.
    expect(
      (await post(
        'forgot',
        { email: 'reader@example.org' },
        undefined,
        'https://evil.org',
      ))!.status,
    ).toBe(403)
    expect(
      mails.filter((mail) => mail.text.includes('não há conta')),
    ).toHaveLength(10)
    const fresh = await ask('reader@example.org', '203.0.113.2')
    const attempts = await Promise.all(
      [1, 2].map(() =>
        post('reset', {
          token: tokenOf(fresh.mail.text),
          password: 'new password',
        }),
      ),
    )
    expect(attempts.map((r) => r!.status).sort((a, b) => a - b)).toEqual([
      200, 400,
    ])
  } finally {
    fake.closeAllConnections()
    await new Promise<void>((resolve) => fake.close(() => resolve()))
  }
})

test('missing Resend configuration shows a clear unavailable screen', async () => {
  const service = createAccounts({
    origin: 'https://example.org',
    emailRateLimitKey: 'key',
  })
  const response = (await service.handle(
    new Request('https://example.org/auth/forgot'),
  ))!
  expect(response.status).toBe(503)
  expect(await response.text()).toContain(
    'recuperação de senha está indisponível',
  )
})
