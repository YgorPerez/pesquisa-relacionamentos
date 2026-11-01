import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'

let folder: string
beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'email-accounts-'))
})
afterEach(() => rmSync(folder, { recursive: true, force: true }))

test('an email reader registers, leaves and logs in with a normalized address without Google', async () => {
  const accounts = createAccounts({
    databasePath: join(folder, 'app.sqlite'),
    origin: 'https://example.org',
    emailRateLimitKey: 'test-only-key',
  })
  const post = (path: string, form: Record<string, string>, cookie = '') =>
    accounts.handle(
      new Request(`https://example.org/auth/${path}`, {
        method: 'POST',
        headers: { origin: 'https://example.org', cookie },
        body: new URLSearchParams(form),
      }),
    )
  const created = (await post('register', {
    email: ' Reader@Example.org ',
    password: 'long password',
    nickname: 'Leitora',
    adult: 'on',
    rules: 'on',
  }))!
  expect(created.status).toBe(303)
  const cookie = created.headers.getSetCookie()[0]!.split(';')[0]!
  const current = () =>
    accounts.current(
      new Request('https://example.org/conta', { headers: { cookie } }),
    )
  expect(current()).toMatchObject({ nickname: 'Leitora', googleSub: null })
  const id = current()!.id
  await post('logout', {}, cookie)
  expect(current()).toBeNull()
  const login = (await post('login', {
    email: 'READER@example.org',
    password: 'long password',
  }))!
  expect(login.status).toBe(303)
  expect(
    accounts.current(
      new Request('https://example.org', {
        headers: { cookie: login.headers.getSetCookie()[0]!.split(';')[0]! },
      }),
    )?.id,
  ).toBe(id)
})

function setup(key: string | undefined = 'test-only-key') {
  let now = Date.now()
  const path = join(folder, 'app.sqlite')
  const accounts = createAccounts({
    databasePath: path,
    origin: 'https://example.org',
    emailRateLimitKey: key,
  })
  const service = createAccounts({
    databasePath: path,
    origin: 'https://example.org',
    emailRateLimitKey: key,
    now: () => now,
  })
  const post = (
    action: string,
    form: Record<string, string>,
    headers: Record<string, string> = {},
  ) =>
    service.handle(
      new Request(`https://example.org/auth/${action}`, {
        method: 'POST',
        headers: { origin: 'https://example.org', ...headers },
        body: new URLSearchParams(form),
      }),
    )
  return {
    accounts,
    path,
    post,
    advance: () => {
      now += 16 * 60_000
    },
  }
}
const registration = {
  email: 'reader@example.org',
  password: 'long password',
  nickname: 'Leitora',
  adult: 'on',
  rules: 'on',
}

test('registration rejects missing declarations, short passwords and duplicate normalized emails', async () => {
  const { post } = setup()
  for (const invalid of [
    { ...registration, adult: '' },
    { ...registration, rules: '' },
    { ...registration, password: 'short' },
  ])
    expect((await post('register', invalid))?.status).toBe(400)
  expect((await post('register', registration))?.status).toBe(303)
  const duplicate = (await post('register', {
    ...registration,
    email: ' READER@EXAMPLE.ORG ',
    nickname: 'Outra',
  }))!
  expect(duplicate.status).toBe(400)
  expect(await duplicate.text()).toContain('Esqueci minha senha')
})

test('wrong passwords and unknown emails have the same refusal', async () => {
  const { post } = setup()
  await post('register', registration)
  const wrong = (await post('login', {
    email: registration.email,
    password: 'wrong password',
  }))!
  const unknown = (await post('login', {
    email: 'unknown@example.org',
    password: 'wrong password',
  }))!
  expect(wrong.status).toBe(unknown.status)
  expect(await wrong.text()).toBe(await unknown.text())
})

test('email writes require the configured origin and a rate limit key', async () => {
  const { post } = setup()
  expect(
    (await post('register', registration, { origin: 'https://evil.example' }))
      ?.status,
  ).toBe(403)
  const disabled = createAccounts({
    origin: 'https://example.org',
    databasePath: join(folder, 'disabled.sqlite'),
  })
  expect(
    (
      await disabled.handle(
        new Request('https://example.org/auth/register', {
          method: 'POST',
          headers: { origin: 'https://example.org' },
          body: new URLSearchParams(registration),
        }),
      )
    )?.status,
  ).toBe(503)
})

test('IP throttling uses the last Nginx hop and expires, while email throttling follows changing IPs', async () => {
  const { post, advance, path } = setup()
  for (let n = 0; n < 10; n++)
    expect(
      (
        await post(
          'register',
          { email: `reader${n}@example.org`, password: 'bad' },
          { 'x-forwarded-for': `203.0.113.${n}, 198.51.100.1` },
        )
      )?.status,
    ).toBe(400)
  expect(
    (
      await post('register', registration, {
        'x-forwarded-for': 'forged, 198.51.100.1',
      })
    )?.status,
  ).toBe(429)
  advance()
  for (let n = 0; n < 10; n++)
    expect(
      (
        await post(
          'login',
          { email: ' READER@EXAMPLE.ORG ', password: 'x'.repeat(1025) },
          { 'x-forwarded-for': `198.51.100.${n + 2}` },
        )
      )?.status,
    ).toBe(400)
  expect(
    (
      await post('register', registration, {
        'x-forwarded-for': '198.51.100.99',
      })
    )?.status,
  ).toBe(429)
  const db = new DatabaseSync(path)
  expect(
    JSON.stringify(db.prepare('SELECT * FROM email_rate_limits').all()),
  ).not.toMatch(/reader|198\.51|203\.0/)
  db.close()
})

test('equal passwords have different salts, and deleting the account removes its credentials', async () => {
  const { post, path, accounts } = setup()
  const created = (await post('register', registration))!
  const cookie = created.headers.getSetCookie()[0]!.split(';')[0]!
  const id = accounts.current(
    new Request('https://example.org', { headers: { cookie } }),
  )!.id
  await post('register', {
    ...registration,
    email: 'other@example.org',
    nickname: 'Outra',
  })
  const db = new DatabaseSync(path)
  const hashes = db.prepare('SELECT password_hash FROM email_credentials').all()
  expect(hashes[0]!.password_hash).not.toBe(hashes[1]!.password_hash)
  expect(JSON.stringify(hashes)).not.toContain(registration.password)
  expect(
    (await post('delete', { confirm: 'EXCLUIR' }, { cookie }))?.status,
  ).toBe(303)
  expect(
    db.prepare('SELECT * FROM email_credentials WHERE account_id = ?').get(id),
  ).toBeUndefined()
  db.close()
})
