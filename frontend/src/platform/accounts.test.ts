import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { NICKNAME_INVALID, NICKNAME_TAKEN } from '#/content/nickname-refusal'
import { createAccounts } from './accounts'
import { openDatabase } from './database'
import { createServer } from 'node:http'
import { once } from 'node:events'

const request = (
  path: string,
  cookie = '',
  body?: URLSearchParams,
  origin = 'https://example.org',
) =>
  new Request(`https://example.org${path}`, {
    headers: { cookie, origin },
    ...(body ? { method: 'POST', body } : {}),
  })
const accepted = () =>
  new URLSearchParams({ nickname: 'Leitora', adult: 'on', rules: 'on' })
const cookieOf = (response: Response, name: string) =>
  response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${name}=`))!
    .split(';')[0]!

async function provider() {
  const verifiers: (string | null)[] = [],
    secrets: (string | null)[] = [],
    authorizations: (string | undefined)[] = []
  const google = createServer(async (req, res) => {
    if (req.url === '/token') {
      let body = ''
      for await (const chunk of req) body += chunk
      const form = new URLSearchParams(body)
      verifiers.push(form.get('code_verifier'))
      secrets.push(form.get('client_secret'))
      res.end(JSON.stringify({ access_token: 'access' }))
    } else {
      authorizations.push(req.headers.authorization)
      res.end(
        JSON.stringify({
          sub: 'opaque-google-id',
          email: 'discard@example.org',
          name: 'Discard',
        }),
      )
    }
  })
  google.listen(0, '127.0.0.1')
  await once(google, 'listening')
  const address = google.address()
  if (!address || typeof address === 'string')
    throw new Error('Missing address')
  return { google, address, verifiers, secrets, authorizations }
}

async function setup() {
  const { google, address, verifiers, secrets, authorizations } =
    await provider()
  const folder = mkdtempSync(join(tmpdir(), 'login-'))
  let now = Date.now()
  const accounts = createAccounts({
    databasePath: join(folder, 'app.sqlite'),
    origin: 'https://example.org',
    clientId: 'client',
    clientSecret: 'secret',
    now: () => now,
    tokenEndpoint: `http://127.0.0.1:${address.port}/token`,
    userinfoEndpoint: `http://127.0.0.1:${address.port}/userinfo`,
  })
  async function start() {
    const response = (await accounts.handle(request('/auth/google')))!
    const location = new URL(response.headers.get('location')!)
    return {
      location,
      cookie: cookieOf(response, '__Host-oauth'),
      callback: `/auth/callback?code=code&state=${location.searchParams.get('state')}`,
    }
  }
  async function login() {
    const attempt = await start()
    return (await accounts.handle(request(attempt.callback, attempt.cookie)))!
  }
  return {
    accounts,
    folder,
    verifiers,
    secrets,
    authorizations,
    start,
    login,
    advance: (ms: number) => {
      now += ms
    },
    close: () => {
      google.close()
      rmSync(folder, { recursive: true, force: true })
    },
  }
}
let app: Awaited<ReturnType<typeof setup>>
beforeEach(async () => {
  app = await setup()
})
afterEach(() => {
  app.close()
})

test('Google login requires browser state and a single-use callback', async () => {
  const attempt = await app.start()
  expect(attempt.location.searchParams.get('scope')).toBe('openid')
  expect(attempt.location.searchParams.get('code_challenge_method')).toBe(
    'S256',
  )
  expect((await app.accounts.handle(request(attempt.callback)))?.status).toBe(
    400,
  )
  expect(
    (
      await app.accounts.handle(
        request('/auth/callback?state=wrong&code=code', attempt.cookie),
      )
    )?.status,
  ).toBe(400)
  const response = (await app.accounts.handle(
    request(attempt.callback, attempt.cookie),
  ))!
  const cookie = cookieOf(response, '__Host-session')
  expect(response.headers.getSetCookie().join(' ')).toContain('Secure')
  expect(response.headers.getSetCookie().join(' ')).toContain('HttpOnly')
  expect(response.headers.getSetCookie().join(' ')).toContain('SameSite=Lax')
  expect(app.accounts.current(request('/', cookie))).toMatchObject({
    nickname: null,
    googleSub: 'opaque-google-id',
  })
  expect(
    (await app.accounts.handle(request(attempt.callback, attempt.cookie)))
      ?.status,
  ).toBe(400)
  expect(app.verifiers.map((value) => value?.length)).toEqual([43])
  expect(app.secrets).toEqual(['secret'])
  expect(app.authorizations).toEqual(['Bearer access'])
})

test('first nickname requires same-origin consent and cannot be replaced', async () => {
  const cookie = cookieOf(await app.login(), '__Host-session')
  expect(
    (
      await app.accounts.handle(
        request('/auth/nickname', cookie, accepted(), 'https://evil.org'),
      )
    )?.status,
  ).toBe(403)
  expect(
    (
      await app.accounts.handle(
        request(
          '/auth/nickname',
          cookie,
          new URLSearchParams({ nickname: 'Leitora' }),
        ),
      )
    )?.status,
  ).toBe(303)
  expect(app.accounts.current(request('/', cookie))?.nickname).toBeNull()
  expect(
    (await app.accounts.handle(request('/auth/nickname', cookie, accepted())))
      ?.status,
  ).toBe(303)
  expect(app.accounts.current(request('/', cookie))?.nickname).toBe('Leitora')
  expect(
    (await app.accounts.handle(request('/auth/nickname', cookie, accepted())))
      ?.status,
  ).toBe(409)
})

test('logout revokes the session and returning Google identity retains the nickname only', async () => {
  const cookie = cookieOf(await app.login(), '__Host-session')
  await app.accounts.handle(request('/auth/nickname', cookie, accepted()))
  expect(
    (
      await app.accounts.handle(
        request('/auth/logout', cookie, new URLSearchParams()),
      )
    )?.status,
  ).toBe(303)
  expect(app.accounts.current(request('/', cookie))).toBeNull()
  const returning = cookieOf(await app.login(), '__Host-session')
  expect(app.accounts.current(request('/', returning))?.nickname).toBe(
    'Leitora',
  )
  for (const file of readdirSync(app.folder)) {
    const persisted = readFileSync(join(app.folder, file)).toString()
    expect(persisted).not.toContain('discard@example.org')
    expect(persisted).not.toContain('Discard')
  }
})

test('coming back after deleting the account is a new account with a new id, so a device still joined to the old one is asked again', async () => {
  const cookie = cookieOf(await app.login(), '__Host-session')
  const first = app.accounts.current(request('/', cookie))!
  await app.accounts.handle(request('/auth/nickname', cookie, accepted()))
  expect(
    (
      await app.accounts.handle(
        request(
          '/auth/delete',
          cookie,
          new URLSearchParams({ confirm: 'EXCLUIR' }),
        ),
      )
    )?.status,
  ).toBe(303)
  const returning = cookieOf(await app.login(), '__Host-session')
  const second = app.accounts.current(request('/', returning))!
  expect(second.googleSub).toBe(first.googleSub)
  expect(second.nickname).toBeNull()
  expect(second.id).not.toBe(first.id)
})

/** A second reader, signed in and without a nickname: the fake Google always
 * answers with the first one's subject. */
function otherReader(sub: string) {
  const db = openDatabase(join(app.folder, 'app.sqlite'))
  const account = db
    .prepare(
      'INSERT INTO accounts (id, google_sub) VALUES (NULL, ?) RETURNING id',
    )
    .get(sub)!
  db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
    createHash('sha256').update(sub).digest('base64url'),
    account.id!,
    Date.now() + 60_000,
  )
  db.close()
  return `__Host-session=${sub}`
}
const choosing = (nickname: string) =>
  new URLSearchParams({ nickname, adult: 'on', rules: 'on' })

test.each(['Leitora', 'LEITORA', 'leitora', '  Leitora ', 'Leｉtora'])(
  'a nickname in use is refused to another reader, however it is written: %s',
  async (copy) => {
    const cookie = cookieOf(await app.login(), '__Host-session')
    await app.accounts.handle(request('/auth/nickname', cookie, accepted()))
    const copycat = otherReader('copycat')
    const refused = await app.accounts.handle(
      request('/auth/nickname', copycat, choosing(copy)),
    )
    expect(refused?.status).toBe(303)
    expect(refused?.headers.get('location')).toBe(
      `/conta?recusa=${NICKNAME_TAKEN}`,
    )
    expect(app.accounts.current(request('/', copycat))?.nickname).toBeNull()
    // Refused, not stuck: the same reader can pick another.
    await app.accounts.handle(
      request('/auth/nickname', copycat, choosing('Outra')),
    )
    expect(app.accounts.current(request('/', copycat))?.nickname).toBe('Outra')
  },
)

test('case folds beyond ASCII, which SQLite alone does not do', async () => {
  const cookie = cookieOf(await app.login(), '__Host-session')
  await app.accounts.handle(
    request('/auth/nickname', cookie, choosing('Ágata')),
  )
  const copycat = otherReader('copycat')
  await app.accounts.handle(
    request('/auth/nickname', copycat, choosing('ÁGATA')),
  )
  expect(app.accounts.current(request('/', copycat))?.nickname).toBeNull()
})

test('a nickname cannot pose as a removed reader, and a deleted account frees its own', async () => {
  const cookie = cookieOf(await app.login(), '__Host-session')
  const refused = await app.accounts.handle(
    request('/auth/nickname', cookie, choosing('Leitor Removido')),
  )
  expect(refused?.headers.get('location')).toBe(
    `/conta?recusa=${NICKNAME_TAKEN}`,
  )
  await app.accounts.handle(request('/auth/nickname', cookie, accepted()))
  await app.accounts.handle(
    request(
      '/auth/delete',
      cookie,
      new URLSearchParams({ confirm: 'EXCLUIR' }),
    ),
  )
  const next = otherReader('next')
  await app.accounts.handle(request('/auth/nickname', next, accepted()))
  expect(app.accounts.current(request('/', next))?.nickname).toBe('Leitora')
})

test('an invalid nickname comes back to the page, with no account changed', async () => {
  const cookie = cookieOf(await app.login(), '__Host-session')
  const refused = await app.accounts.handle(
    request('/auth/nickname', cookie, choosing('x')),
  )
  expect(refused?.headers.get('location')).toBe(
    `/conta?recusa=${NICKNAME_INVALID}`,
  )
  expect(app.accounts.current(request('/', cookie))?.nickname).toBeNull()
})

test('a database that already holds equal nicknames still opens, and the oldest keeps the name', () => {
  const path = join(app.folder, 'app.sqlite')
  const before = openDatabase(path)
  before.exec(`DROP INDEX accounts_nickname_key;
    ALTER TABLE accounts DROP COLUMN nickname_key;
    INSERT INTO accounts (id, google_sub, nickname) VALUES (1, 'a', 'Ana'), (2, 'b', 'ANA'), (3, 'c', 'Bia');
    DELETE FROM schema_migrations WHERE version = (SELECT max(version) FROM schema_migrations);`)
  before.close()
  const after = openDatabase(path)
  expect(
    after
      .prepare('SELECT id, nickname_key FROM accounts ORDER BY id')
      .all()
      .map((row) => ({ ...row })),
  ).toEqual([
    { id: 1, nickname_key: 'ana' },
    { id: 2, nickname_key: null },
    { id: 3, nickname_key: 'bia' },
  ])
  after.close()
})

test('sessions and unused OAuth attempts expire', async () => {
  const cookie = cookieOf(await app.login(), '__Host-session')
  app.advance(31 * 24 * 60 * 60 * 1000)
  expect(app.accounts.current(request('/', cookie))).toBeNull()
  const attempt = await app.start()
  app.advance(601_000)
  expect(
    (await app.accounts.handle(request(attempt.callback, attempt.cookie)))
      ?.status,
  ).toBe(400)
})

test('anonymous reads need neither OAuth configuration nor a database', async () => {
  const accounts = createAccounts({})
  expect(accounts.current(request('/'))).toBeNull()
  expect(await accounts.handle(request('/guide'))).toBeNull()
  expect((await accounts.handle(request('/auth/google')))?.status).toBe(503)
})
