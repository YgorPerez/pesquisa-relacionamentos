import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
type Mail = { text: string; html?: string }
let folder: string
let next = deferred<Mail>()
let release = deferred<void>()
let fail = false
let now: number
let service: ReturnType<typeof createAccounts>
let fake: ReturnType<typeof createServer>
const mails: Mail[] = []
const registration = {
  email: 'reader@example.org',
  password: 'old password',
  nickname: 'Leitora',
  adult: 'on',
  rules: 'on',
}
const cookieOf = (response: Response) =>
  response.headers.getSetCookie()[0]!.split(';')[0]!
const tokenOf = (mail: Mail) =>
  new URL(mail.text.match(/https:\/\/\S+/)![0]).searchParams.get('token')!
const current = (cookie: string) =>
  service.current(new Request('https://example.org', { headers: { cookie } }))
const post = (
  action: string,
  form: Record<string, string>,
  ip = '198.51.100.1',
  origin = 'https://example.org',
) =>
  service.handle(
    new Request(`https://example.org/auth/${action}`, {
      method: 'POST',
      headers: { origin, 'x-forwarded-for': ip },
      body: new URLSearchParams(form),
    }),
  )
const reset = (token: string) =>
  post('reset', { token, password: 'new password' })
async function ask(email = registration.email, ip?: string) {
  next = deferred<Mail>()
  const response = (await post('forgot', { email }, ip))!
  expect(response.status).toBe(200)
  const screen = await response.text()
  const mail = await next.promise
  return { screen, mail }
}

beforeEach(async () => {
  folder = mkdtempSync(join(tmpdir(), 'reset-'))
  mails.length = 0
  fail = false
  now = Date.now()
  release = deferred<void>()
  fake = createServer(async (request, response) => {
    // Tools on this machine probe any port that opens; only the app posts here.
    if (request.method !== 'POST') return response.end()
    let body = ''
    for await (const chunk of request) body += String(chunk)
    const mail = JSON.parse(body) as Mail
    mails.push(mail)
    next.resolve(mail)
    await release.promise
    response.writeHead(fail ? 500 : 200).end('{}')
  })
  await new Promise<void>((resolve) => fake.listen(0, '127.0.0.1', resolve))
  const address = fake.address()
  if (!address || typeof address === 'string') throw new Error('No fake port')
  service = createAccounts({
    databasePath: join(folder, 'app.sqlite'),
    origin: 'https://example.org',
    emailRateLimitKey: 'test-key',
    resendApiKey: 'fake',
    emailFrom: 'reset@example.org',
    resendEndpoint: `http://127.0.0.1:${address.port}/emails`,
    now: () => now,
  })
})
afterEach(async () => {
  release.resolve()
  fake.closeAllConnections()
  await new Promise<void>((resolve) => fake.close(() => resolve()))
  rmSync(folder, { recursive: true, force: true })
})

test('the link resets once, ends every session and keeps data, without waiting for Resend', async () => {
  const cookie = cookieOf((await post('register', registration))!)
  const otherCookie = cookieOf((await post('login', registration))!)
  const id = current(cookie)!.id
  const { mail } = await ask(' READER@example.org ')
  expect(mail.html).toBeUndefined()
  expect(new URL(mail.text.match(/https:\/\/\S+/)![0]).origin).toBe(
    'https://example.org',
  )
  const token = tokenOf(mail)
  const db = new DatabaseSync(join(folder, 'app.sqlite'))
  try {
    db.prepare(
      `INSERT INTO account_sync VALUES (?, 1, '{"note":"keep me"}')`,
    ).run(id)
    const stored = JSON.stringify(
      db.prepare('SELECT * FROM password_resets').all(),
    )
    expect(stored).not.toContain(token)
    expect(stored).not.toContain(registration.email)
    expect((await reset(token))!.status).toBe(200)
    expect(current(cookie)).toBeNull()
    expect(current(otherCookie)).toBeNull()
    expect((await reset(token))!.status).toBe(400)
    expect((await post('login', registration))!.status).toBe(400)
    expect(
      (await post('login', { ...registration, password: 'new password' }))!
        .status,
    ).toBe(303)
    expect(
      db.prepare('SELECT data FROM account_sync WHERE account_id = ?').get(id)
        ?.data,
    ).toContain('keep me')
  } finally {
    db.close()
  }
})

test('new requests replace links, expiry is 30 minutes, and concurrent use has one winner', async () => {
  await post('register', registration)
  const first = await ask()
  const second = await ask()
  expect(tokenOf(first.mail)).not.toBe(tokenOf(second.mail))
  expect((await reset(tokenOf(first.mail)))!.status).toBe(400)
  now += 30 * 60_000
  expect((await reset(tokenOf(second.mail)))!.status).toBe(400)
  const fresh = await ask()
  const results = await Promise.all([
    reset(tokenOf(fresh.mail)),
    reset(tokenOf(fresh.mail)),
  ])
  expect(results.map((r) => r!.status).sort((a, b) => a - b)).toEqual([
    200, 400,
  ])
})

test('unknown notices and provider failures show the same answer as a known address', async () => {
  release.resolve()
  await post('register', registration)
  const known = await ask()
  const unknown = await ask('unknown@example.org')
  expect(unknown.mail.text).toContain('não há conta')
  expect(unknown.mail.text).not.toMatch(/https?:|<img/)
  expect(unknown.screen).toBe(known.screen)
  fail = true
  expect((await ask()).screen).toBe(known.screen)
})

test('limits follow email across IPs and IP across emails, with the same screen', async () => {
  release.resolve()
  const known = await ask('unknown@example.org')
  for (let n = 0; n < 9; n++)
    await ask('unknown@example.org', `198.51.100.${n + 2}`)
  expect(
    await (await post(
      'forgot',
      { email: 'unknown@example.org' },
      '203.0.113.1',
    ))!.text(),
  ).toBe(known.screen)
  for (let n = 0; n < 9; n++) await ask(`notice${n}@example.org`)
  const count = mails.length
  expect(
    await (await post('forgot', { email: 'another@example.org' }))!.text(),
  ).toBe(known.screen)
  await ask('marker@example.org', '203.0.113.3')
  expect(mails).toHaveLength(count + 1)
})

test('reset pages reject outside writes and third-party requests; short passwords keep the link', async () => {
  await post('register', registration)
  const { mail } = await ask()
  const page = (await service.handle(
    new Request(`https://example.org/auth/reset?token=${tokenOf(mail)}`),
  ))!
  expect(page.headers.get('referrer-policy')).toBe('strict-origin')
  expect(page.headers.get('content-security-policy')).toContain(
    "default-src 'none'",
  )
  expect(await page.text()).not.toMatch(/<script|https:\/\//)
  expect(
    (await post('reset', { token: tokenOf(mail), password: 'short' }))!.status,
  ).toBe(400)
  expect(
    (await post(
      'reset',
      { token: tokenOf(mail), password: 'new password' },
      undefined,
      'https://evil.org',
    ))!.status,
  ).toBe(403)
  expect(
    (await post(
      'forgot',
      { email: registration.email },
      undefined,
      'https://evil.org',
    ))!.status,
  ).toBe(403)
  expect((await reset(tokenOf(mail)))!.status).toBe(200)
})

test('missing Resend configuration shows a clear unavailable screen', async () => {
  const disabled = createAccounts({
    origin: 'https://example.org',
    emailRateLimitKey: 'key',
  })
  const response = (await disabled.handle(
    new Request('https://example.org/auth/forgot'),
  ))!
  expect(response.status).toBe(503)
  expect(await response.text()).toContain(
    'recuperação de senha está indisponível',
  )
})
