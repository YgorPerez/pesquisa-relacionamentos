import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'
import { createServer } from 'node:http'
import { once } from 'node:events'

test('Google login requires browser state, creates a nickname once and revokes logout', async () => {
  const verifiers: (string | null)[] = []
  const secrets: (string | null)[] = []
  const authorizations: (string | undefined)[] = []
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
  try {
    const start = await accounts.handle(request('/auth/google'))
    const location = new URL(start!.headers.get('location')!)
    expect(location.searchParams.get('scope')).toBe('openid')
    expect(location.searchParams.get('code_challenge_method')).toBe('S256')
    const cookie = start!.headers.get('set-cookie')!.split(';')[0]!
    const callback = `/auth/callback?code=code&state=${location.searchParams.get('state')}`
    expect((await accounts.handle(request(callback)))?.status).toBe(400)
    expect(
      (
        await accounts.handle(
          request('/auth/callback?state=wrong&code=code', cookie),
        )
      )?.status,
    ).toBe(400)
    const loggedIn = await accounts.handle(request(callback, cookie))
    const session = loggedIn!.headers
      .getSetCookie()
      .find((value) => value.startsWith('__Host-session='))!
      .split(';')[0]!
    expect(loggedIn!.headers.getSetCookie().join(' ')).toContain('Secure')
    expect(loggedIn!.headers.getSetCookie().join(' ')).toContain('HttpOnly')
    expect(accounts.current(request('/', session))).toMatchObject({
      nickname: null,
      googleSub: 'opaque-google-id',
    })
    expect((await accounts.handle(request(callback, cookie)))?.status).toBe(400)
    const accepted = new URLSearchParams({
      nickname: 'Leitora',
      adult: 'on',
      rules: 'on',
    })
    expect(
      (
        await accounts.handle(
          request('/auth/nickname', session, accepted, 'https://evil.org'),
        )
      )?.status,
    ).toBe(403)
    expect(
      (
        await accounts.handle(
          request(
            '/auth/nickname',
            session,
            new URLSearchParams({ nickname: 'Leitora' }),
          ),
        )
      )?.status,
    ).toBe(400)
    expect(
      (await accounts.handle(request('/auth/nickname', session, accepted)))
        ?.status,
    ).toBe(303)
    expect(accounts.current(request('/', session))?.nickname).toBe('Leitora')
    accepted.set('nickname', 'Changed')
    expect(
      (await accounts.handle(request('/auth/nickname', session, accepted)))
        ?.status,
    ).toBe(409)
    expect(
      (
        await accounts.handle(
          request('/auth/logout', session, new URLSearchParams()),
        )
      )?.status,
    ).toBe(303)
    expect(accounts.current(request('/', session))).toBeNull()
    const again = await accounts.handle(request('/auth/google'))
    const nextState = new URL(again!.headers.get('location')!).searchParams.get(
      'state',
    )
    const returning = await accounts.handle(
      request(
        `/auth/callback?state=${nextState}&code=code`,
        again!.headers.get('set-cookie')!.split(';')[0]!,
      ),
    )
    const nextSession = returning!.headers
      .getSetCookie()
      .find((value) => value.startsWith('__Host-session='))!
      .split(';')[0]!
    expect(accounts.current(request('/', nextSession))?.nickname).toBe(
      'Leitora',
    )
    for (const file of readdirSync(folder)) {
      const persisted = readFileSync(join(folder, file)).toString()
      expect(persisted).not.toContain('discard@example.org')
      expect(persisted).not.toContain('Discard')
    }
    now += 31 * 24 * 60 * 60 * 1000
    expect(accounts.current(request('/', nextSession))).toBeNull()
    const expires = await accounts.handle(request('/auth/google'))
    const expiredState = new URL(
      expires!.headers.get('location')!,
    ).searchParams.get('state')
    now += 601_000
    expect(
      (
        await accounts.handle(
          request(
            `/auth/callback?state=${expiredState}&code=code`,
            expires!.headers.get('set-cookie')!.split(';')[0]!,
          ),
        )
      )?.status,
    ).toBe(400)
    expect(verifiers.map((value) => value?.length)).toEqual([43, 43])
    expect(secrets).toEqual(['secret', 'secret'])
    expect(authorizations).toEqual(['Bearer access', 'Bearer access'])
  } finally {
    google.close()
    rmSync(folder, { recursive: true, force: true })
  }
})

test('anonymous reads need neither OAuth configuration nor a database', async () => {
  const accounts = createAccounts({})
  expect(accounts.current(new Request('https://example.org/'))).toBeNull()
  expect(
    await accounts.handle(new Request('https://example.org/guide')),
  ).toBeNull()
})

test('login fails closed when Google is not configured', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'accounts-'))
  try {
    const accounts = createAccounts({
      databasePath: join(folder, 'app.sqlite'),
    })
    expect(
      (await accounts.handle(new Request('https://example.org/auth/google')))
        ?.status,
    ).toBe(503)
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})
