import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test as base } from 'vite-plus/test'
import { createAccounts } from './accounts'
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

async function setup() {
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
const test = base.extend<{ app: Awaited<ReturnType<typeof setup>> }>({
  app: async ({}, use) => {
    const app = await setup()
    try {
      await use(app)
    } finally {
      app.close()
    }
  },
})

test('Google login requires browser state and a single-use callback', async ({
  app,
}) => {
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

test('first nickname requires same-origin consent and cannot be replaced', async ({
  app,
}) => {
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
  ).toBe(400)
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

test('logout revokes the session and returning Google identity retains the nickname only', async ({
  app,
}) => {
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

test('sessions and unused OAuth attempts expire', async ({ app }) => {
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

base(
  'anonymous reads need neither OAuth configuration nor a database',
  async () => {
    const accounts = createAccounts({})
    expect(accounts.current(request('/'))).toBeNull()
    expect(await accounts.handle(request('/guide'))).toBeNull()
    expect((await accounts.handle(request('/auth/google')))?.status).toBe(503)
  },
)
