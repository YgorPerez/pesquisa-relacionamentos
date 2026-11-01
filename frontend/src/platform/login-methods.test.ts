// Linking and managing login methods, through the requests `/conta` sends, with a
// fake Google and a fake Resend. A few tests read the database on purpose: "no row
// holds the token" has no other witness.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'
import { createPublicComments } from './public-comments'

const CURATOR = 'curator-subject'
const OLD = 'old password'
const NEW = 'new password'
const registration = {
  email: 'reader@example.org',
  password: OLD,
  nickname: 'Leitora',
  adult: 'on',
  rules: 'on',
}

type Mail = { to: string; text: string }
let folder: string
let path: string
let now: number
let google: Server
let resend: Server
let subject: string
let mailFails: boolean
let googleFails: boolean
let mails: Mail[]
let accounts: ReturnType<typeof createAccounts>

async function listen(server: Server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No port')
  return `http://127.0.0.1:${address.port}`
}

beforeEach(async () => {
  folder = mkdtempSync(join(tmpdir(), 'methods-'))
  path = join(folder, 'app.sqlite')
  now = Date.now()
  subject = 'google-subject'
  mailFails = false
  googleFails = false
  mails = []
  google = createServer((request, response) => {
    request.resume()
    if (googleFails) return response.writeHead(500).end()
    response.end(
      JSON.stringify(
        request.url === '/token' ? { access_token: 'a' } : { sub: subject },
      ),
    )
  })
  resend = createServer(async (request, response) => {
    // Tools on this machine probe any port that opens; only the app posts here.
    if (request.method !== 'POST') return response.end()
    let body = ''
    for await (const chunk of request) body += String(chunk)
    mails.push(JSON.parse(body) as Mail)
    response.writeHead(mailFails ? 500 : 200).end('{}')
  })
  const [provider, mail] = await Promise.all([listen(google), listen(resend)])
  accounts = createAccounts({
    databasePath: path,
    origin: 'https://example.org',
    clientId: 'client',
    clientSecret: 'secret',
    emailRateLimitKey: 'test-key',
    resendApiKey: 'fake',
    emailFrom: 'accounts@example.org',
    resendEndpoint: `${mail}/emails`,
    curatorSub: CURATOR,
    tokenEndpoint: `${provider}/token`,
    userinfoEndpoint: `${provider}/userinfo`,
    now: () => now,
  })
})
afterEach(() => {
  google.close()
  resend.close()
  rmSync(folder, { recursive: true, force: true })
})

const send = (
  action: string,
  form: Record<string, string>,
  cookie = '',
  origin = 'https://example.org',
) =>
  accounts.handle(
    new Request(`https://example.org/auth/${action}`, {
      method: 'POST',
      headers: { cookie, origin, 'x-forwarded-for': '198.51.100.1' },
      body: new URLSearchParams(form),
    }),
  ) as Promise<Response>
const open = (target: string, cookie = '') =>
  accounts.handle(
    new Request(`https://example.org${target}`, { headers: { cookie } }),
  ) as Promise<Response>
const cookieOf = (response: Response, name = '__Host-session') =>
  response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${name}=`))
    ?.split(';')[0]
const signedIn = (response: Response) => {
  const cookie = cookieOf(response)
  if (!cookie) throw new Error(`No session: ${response.status}`)
  return cookie
}
const who = (cookie: string) =>
  accounts.current(new Request('https://example.org/', { headers: { cookie } }))
const register = async (over: Record<string, string> = {}) =>
  signedIn(await send('register', { ...registration, ...over }))
const login = (email: string, password: string) =>
  send('login', { email, password })
const noticeOf = (response: Response) =>
  new URL(
    response.headers.get('location')!,
    'https://example.org',
  ).searchParams.get('metodo')

test('changing the password asks for the current one and ends only the other sessions', async () => {
  const here = await register()
  const other = signedIn(await login(registration.email, OLD))
  const wrong = await send(
    'change-password',
    { current: 'not the password', password: NEW },
    here,
  )
  expect(noticeOf(wrong)).toBe('senha-errada')
  expect(who(other)).not.toBeNull()

  const changed = await send(
    'change-password',
    { current: OLD, password: NEW },
    here,
  )
  expect(noticeOf(changed)).toBe('senha-trocada')
  expect(who(here)).not.toBeNull()
  expect(who(other)).toBeNull()
  expect((await login(registration.email, OLD)).status).toBe(400)
  expect((await login(registration.email, NEW)).status).toBe(303)
})

test('a new password keeps the rules of sign-up, and a pending reset link dies with the old one', async () => {
  const here = await register()
  await send('forgot', { email: registration.email })
  await expect.poll(() => mails.length).toBe(1)
  const token = new URL(
    mails[0]!.text.match(/https:\/\/\S+/)![0],
  ).searchParams.get('token')!
  const short = await send(
    'change-password',
    { current: OLD, password: 'short' },
    here,
  )
  expect(noticeOf(short)).toBe('senha-curta')
  await send('change-password', { current: OLD, password: NEW }, here)
  expect(
    (await send('reset', { token, password: 'third password' })).status,
  ).toBe(400)
})

/** A Google account of its own, through the real login. */
async function googleLogin(sub: string) {
  subject = sub
  const start = await open('/auth/google')
  const state = new URL(start.headers.get('location')!).searchParams.get(
    'state',
  )
  return signedIn(
    await open(
      `/auth/callback?code=code&state=${state}`,
      cookieOf(start, '__Host-oauth'),
    ),
  )
}
/** Sends the reader to the fake Google to link `sub`; the session cookie goes
 * back on the callback, as the browser's would. */
async function startLink(cookie: string) {
  const start = await send('link-google', {}, cookie)
  expect(start.status).toBe(303)
  const target = new URL(start.headers.get('location')!)
  expect(target.origin).toBe('https://accounts.google.com')
  return {
    oauth: cookieOf(start, '__Host-oauth')!,
    callback: `/auth/callback?code=code&state=${target.searchParams.get('state')}`,
  }
}

test('an email account links Google, which then opens the same account, and the other sessions end', async () => {
  const here = await register()
  const other = signedIn(await login(registration.email, OLD))
  const attempt = await startLink(here)
  subject = 'google-of-the-reader'
  const linked = await open(attempt.callback, `${here}; ${attempt.oauth}`)
  expect(noticeOf(linked)).toBe('google-ligado')
  expect(cookieOf(linked)).toBeUndefined()
  expect(who(here)?.googleSub).toBe('google-of-the-reader')
  expect(who(other)).toBeNull()
  expect(who(await googleLogin('google-of-the-reader'))?.id).toBe(who(here)?.id)
  expect(who(signedIn(await login(registration.email, OLD)))?.id).toBe(
    who(here)?.id,
  )
})

const databaseRows = (sql: string) => {
  const db = new DatabaseSync(path)
  try {
    return db.prepare(sql).all()
  } finally {
    db.close()
  }
}

test('a Google that already has its own account is refused: nothing merges and no session opens for it', async () => {
  const owner = await googleLogin('taken-subject')
  const here = await register()
  const attempt = await startLink(here)
  subject = 'taken-subject'
  const refused = await open(attempt.callback, `${here}; ${attempt.oauth}`)
  expect(noticeOf(refused)).toBe('google-em-uso')
  expect(cookieOf(refused)).toBeUndefined()
  expect(who(here)).toMatchObject({ googleSub: null, nickname: 'Leitora' })
  expect(who(owner)?.googleSub).toBe('taken-subject')
  expect(databaseRows('SELECT id FROM accounts')).toHaveLength(2)
})

test('the callback of a link belongs to the session that started it', async () => {
  const reader = await register()
  const stranger = await register({
    email: 'stranger@example.org',
    nickname: 'Outra',
  })
  const attempt = await startLink(reader)
  const swapped = await open(attempt.callback, `${stranger}; ${attempt.oauth}`)
  expect(noticeOf(swapped)).toBe('google-falhou')
  expect(cookieOf(swapped)).toBeUndefined()
  expect(who(reader)?.googleSub).toBeNull()
  expect(who(stranger)?.googleSub).toBeNull()
  // The attempt was consumed: the same callback does not work a second time.
  expect(
    (await open(attempt.callback, `${reader}; ${attempt.oauth}`)).status,
  ).toBe(400)
})

test('a reader who logged out on the way to Google gets neither a link nor a session', async () => {
  const reader = await register()
  const attempt = await startLink(reader)
  await send('logout', {}, reader)
  const refused = await open(attempt.callback, `${reader}; ${attempt.oauth}`)
  expect(noticeOf(refused)).toBe('google-falhou')
  expect(cookieOf(refused)).toBeUndefined()
  const withoutCookie = await startLink(
    signedIn(await login(registration.email, OLD)),
  )
  const anonymous = await open(withoutCookie.callback, withoutCookie.oauth)
  expect(noticeOf(anonymous)).toBe('google-falhou')
  expect(cookieOf(anonymous)).toBeUndefined()
  expect(
    databaseRows('SELECT 1 FROM accounts WHERE google_sub IS NOT NULL'),
  ).toEqual([])
})

test('another site cannot start a link, a link attempt dies in ten minutes, and it is no login', async () => {
  const here = await register()
  expect((await send('link-google', {}, here, 'https://evil.org')).status).toBe(
    403,
  )
  expect((await send('link-google', {})).status).toBe(401)
  const attempt = await startLink(here)
  const asLogin = await open(attempt.callback, attempt.oauth)
  expect(cookieOf(asLogin)).toBeUndefined()
  const late = await startLink(here)
  now += 600_000
  expect((await open(late.callback, `${here}; ${late.oauth}`)).status).toBe(400)
  expect(who(here)?.googleSub).toBeNull()
})

test('a reader who cancels at Google, or a Google that fails, comes back to the account page with the reason', async () => {
  const here = await register()
  const cancelled = await startLink(here)
  const back = await open(
    cancelled.callback.replace('code=code', 'error=access_denied'),
    `${here}; ${cancelled.oauth}`,
  )
  expect(noticeOf(back)).toBe('google-falhou')
  googleFails = true
  const failing = await startLink(here)
  const failed = await open(failing.callback, `${here}; ${failing.oauth}`)
  expect(noticeOf(failed)).toBe('google-falhou')
  expect(who(here)?.googleSub).toBeNull()
})

test('a second tab finishing the link does not call the reader\'s own Google someone else\'s', async () => {
  const here = await register()
  const first = await startLink(here)
  const second = await startLink(here)
  subject = 'google-of-the-reader'
  await open(first.callback, `${here}; ${first.oauth}`)
  const same = await open(second.callback, `${here}; ${second.oauth}`)
  expect(noticeOf(same)).toBe('google-ligado')
  const third = await register({
    email: 'third@example.org',
    nickname: 'Terceira',
  })
  const a = await startLink(third)
  const b = await startLink(third)
  subject = 'first-google'
  await open(a.callback, `${third}; ${a.oauth}`)
  subject = 'second-google'
  const other = await open(b.callback, `${third}; ${b.oauth}`)
  expect(noticeOf(other)).toBe('google-falhou')
  expect(who(third)?.googleSub).toBe('first-google')
})

const confirmationLink = (mail: Mail) =>
  new URL(mail.text.match(/https:\/\/\S+/)![0])
/** A Google-only account that asked to add `email`; the link from the mail. */
async function askEmail(email = 'added@example.org', sub = 'google-reader') {
  const here = await googleLogin(sub)
  const asked = await send('add-email', { email, password: NEW }, here)
  expect(noticeOf(asked)).toBe('email-enviado')
  const link = confirmationLink(mails.at(-1)!)
  return {
    here,
    token: link.searchParams.get('token')!,
    path: link.pathname + link.search,
  }
}

test('a Google account adds an email: nothing joins until the link is opened and confirmed by the same account', async () => {
  const other = await googleLogin('google-reader')
  const { here, path: page, token } = await askEmail(' ADDED@example.org ')
  expect(who(other)).not.toBeNull()
  expect(mails[0]!.to).toBe('added@example.org')
  expect((await login('added@example.org', NEW)).status).toBe(400)
  const stored = JSON.stringify(databaseRows('SELECT * FROM email_links'))
  expect(stored).not.toContain(token)
  expect(stored).not.toContain(NEW)

  const shown = await open(page, here)
  expect(shown.status).toBe(200)
  expect(await shown.text()).toContain('added@example.org')
  expect(shown.headers.get('content-security-policy')).toContain(
    "default-src 'none'",
  )
  expect(databaseRows('SELECT 1 FROM email_credentials')).toEqual([])

  const confirmed = await send('confirm-email', { token }, here)
  expect(noticeOf(confirmed)).toBe('email-ligado')
  expect(who(here)).not.toBeNull()
  expect(who(other)).toBeNull()
  expect(who(signedIn(await login('added@example.org', NEW)))?.id).toBe(
    who(here)?.id,
  )
  expect(databaseRows('SELECT 1 FROM email_links')).toEqual([])
})

test('the link does nothing for a mail scanner, a stranger, or another account, and stays good for its owner', async () => {
  const { here, path: page, token } = await askEmail()
  const stranger = await register()
  for (const cookie of ['', stranger]) {
    const shown = await open(page, cookie)
    expect(shown.status).toBe(403)
    expect(await shown.text()).not.toContain('added@example.org')
    expect((await send('confirm-email', { token }, cookie)).status).toBe(403)
  }
  expect(
    databaseRows(
      "SELECT 1 FROM email_credentials WHERE email = 'added@example.org'",
    ),
  ).toEqual([])
  expect(noticeOf(await send('confirm-email', { token }, here))).toBe(
    'email-ligado',
  )
})

test('the link is single use, dies in 30 minutes, a new request replaces it, and another site cannot confirm', async () => {
  const first = await askEmail()
  const second = await send(
    'add-email',
    { email: 'typo-fixed@example.org', password: NEW },
    first.here,
  )
  expect(noticeOf(second)).toBe('email-enviado')
  expect((await open(first.path, first.here)).status).toBe(400)
  const token = confirmationLink(mails.at(-1)!).searchParams.get('token')!
  expect(
    (await send('confirm-email', { token }, first.here, 'https://evil.org'))
      .status,
  ).toBe(403)
  now += 30 * 60_000
  expect((await send('confirm-email', { token }, first.here)).status).toBe(400)
  expect(databaseRows('SELECT 1 FROM email_credentials')).toEqual([])
  const fresh = await send(
    'add-email',
    { email: 'typo-fixed@example.org', password: NEW },
    first.here,
  )
  expect(noticeOf(fresh)).toBe('email-enviado')
  const live = confirmationLink(mails.at(-1)!).searchParams.get('token')!
  const results = await Promise.all([
    send('confirm-email', { token: live }, first.here),
    send('confirm-email', { token: live }, first.here),
  ])
  expect(results.map((result) => result.status).sort((a, b) => a - b)).toEqual([
    303, 400,
  ])
  expect(
    (await send('confirm-email', { token: live }, first.here)).status,
  ).toBe(400)
})

test('an email that already has its own account is refused, and nothing is sent to it', async () => {
  await register()
  const here = await googleLogin('google-reader')
  const refused = await send(
    'add-email',
    { email: registration.email, password: NEW },
    here,
  )
  expect(noticeOf(refused)).toBe('email-em-uso')
  expect(mails).toEqual([])
  expect(who(here)?.googleSub).toBe('google-reader')
})

test('an email taken between the request and the link: the unique address decides and the reader hears why', async () => {
  const { here, token } = await askEmail('contested@example.org')
  const rival = await register({ email: 'contested@example.org' })
  const late = await send('confirm-email', { token }, here)
  expect(noticeOf(late)).toBe('email-em-uso')
  expect(who(here)?.googleSub).toBe('google-reader')
  expect(who(signedIn(await login('contested@example.org', OLD)))?.id).toBe(
    who(rival)?.id,
  )
  expect((await send('confirm-email', { token }, here)).status).toBe(400)
})

test('adding an email takes a valid address and password, and tells when the mail did not go', async () => {
  const here = await googleLogin('google-reader')
  const add = (email: string, password = NEW) =>
    send('add-email', { email, password }, here)
  expect(noticeOf(await add('not-an-email'))).toBe('email-invalido')
  expect(noticeOf(await add('reader@example.org', 'short'))).toBe(
    'email-invalido',
  )
  mailFails = true
  expect(noticeOf(await add('reader@example.org'))).toBe('email-nao-enviado')
  expect(databaseRows('SELECT 1 FROM email_links')).toEqual([])
})

test('adding an email is limited by address, with the logins of that address', async () => {
  await register()
  const here = await googleLogin('google-reader')
  const add = () =>
    send('add-email', { email: registration.email, password: NEW }, here)
  // An address in use is refused before the hashing: this stays fast.
  for (let attempt = 0; attempt < 9; attempt++)
    expect(noticeOf(await add())).toBe('email-em-uso')
  expect(noticeOf(await add())).toBe('muitas-tentativas')
})

test('an address the reader corrected, or one whose mail failed, does not stay in the database file', async () => {
  const { here } = await askEmail('first-typo@example.org')
  await send(
    'add-email',
    { email: 'right@example.org', password: NEW },
    here,
  )
  mailFails = true
  await send(
    'add-email',
    { email: 'mail-failed@example.org', password: NEW },
    here,
  )
  const db = new DatabaseSync(path)
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)')
  db.close()
  const file = readFileSync(path).toString()
  expect(file).not.toContain('first-typo@example.org')
  expect(file).not.toContain('mail-failed@example.org')
})

/** One account with both methods, signed in twice. */
async function bothMethods(over: Record<string, string> = {}) {
  const here = await register(over)
  const attempt = await startLink(here)
  subject = 'google-of-the-reader'
  await open(attempt.callback, `${here}; ${attempt.oauth}`)
  const email = over['email'] ?? registration.email
  return { here, other: signedIn(await login(email, OLD)) }
}

test('removing Google keeps the email, ends the other sessions, and frees nothing else', async () => {
  const { here, other } = await bothMethods()
  const removed = await send('remove-method', { method: 'google' }, here)
  expect(noticeOf(removed)).toBe('metodo-removido')
  expect(who(here)).toMatchObject({ googleSub: null, nickname: 'Leitora' })
  expect(who(other)).toBeNull()
  expect((await login(registration.email, OLD)).status).toBe(303)
})

test('removing the email keeps Google, and its address and pending reset go with it', async () => {
  const { here, other } = await bothMethods()
  await send('forgot', { email: registration.email })
  await expect.poll(() => mails.length).toBe(1)
  const removed = await send('remove-method', { method: 'email' }, here)
  expect(noticeOf(removed)).toBe('metodo-removido')
  expect(who(other)).toBeNull()
  expect(who(here)?.googleSub).toBe('google-of-the-reader')
  expect((await login(registration.email, OLD)).status).toBe(400)
  expect(databaseRows('SELECT 1 FROM email_credentials')).toEqual([])
  expect(databaseRows('SELECT 1 FROM password_resets')).toEqual([])
  const reused = await send('register', { ...registration, nickname: 'Outra' })
  expect(reused.status).toBe(303)
})

test('the last method never goes, also when two sessions remove the two methods at once', async () => {
  const email = await register()
  const refused = await send('remove-method', { method: 'email' }, email)
  expect(noticeOf(refused)).toBe('ultimo-metodo')
  expect((await login(registration.email, OLD)).status).toBe(303)
  expect(
    noticeOf(await send('remove-method', { method: 'google' }, email)),
  ).toBe('ultimo-metodo')
  const google = await googleLogin('only-google')
  expect(
    noticeOf(await send('remove-method', { method: 'google' }, google)),
  ).toBe('ultimo-metodo')
  expect(who(google)?.googleSub).toBe('only-google')

  const { here, other } = await bothMethods({
    email: 'both@example.org',
    nickname: 'Ambas',
  })
  const results = await Promise.all([
    send('remove-method', { method: 'google' }, here),
    send('remove-method', { method: 'email' }, other),
  ])
  expect(results.map(noticeOf)).toEqual(
    expect.arrayContaining(['metodo-removido', 'ultimo-metodo']),
  )
  const left = databaseRows(
    `SELECT id FROM accounts a WHERE a.nickname = 'Ambas' AND (a.google_sub IS NOT NULL OR EXISTS (SELECT 1 FROM email_credentials c WHERE c.account_id = a.id))`,
  )
  expect(left).toHaveLength(1)
})

test('a method name outside the two is refused', async () => {
  const here = await register()
  expect(
    (await send('remove-method', { method: 'password' }, here)).status,
  ).toBe(400)
})

const desk = (cookie: string) =>
  createPublicComments({
    databasePath: path,
    current: (request) => accounts.current(request),
    curator: () => CURATOR,
  }).curatorDesk(
    new Request('https://example.org/curadoria', { headers: { cookie } }),
  )

test('the curator desk opens from any method of the curator account, and leaves with its Google subject', async () => {
  const { here: google } = await askEmail('curator@example.org', CURATOR)
  const token = confirmationLink(mails.at(-1)!).searchParams.get('token')!
  await send('confirm-email', { token }, google)
  const password = signedIn(await login('curator@example.org', NEW))
  expect(desk(google)).not.toBeNull()
  expect(desk(password)).not.toBeNull()

  const unchecked = await send('remove-method', { method: 'google' }, password)
  expect(noticeOf(unchecked)).toBe('perde-curadoria')
  expect(desk(password)).not.toBeNull()

  const removed = await send(
    'remove-method',
    { method: 'google', 'lose-curator': 'on' },
    password,
  )
  expect(noticeOf(removed)).toBe('metodo-removido')
  expect(who(password)).toMatchObject({ googleSub: null })
  expect(desk(password)).toBeNull()
})

test('the page learns the methods, never the subject, and only what this server can do', async () => {
  const { here, token } = await askEmail('pending@example.org', CURATOR)
  const account = who(here)!
  expect(accounts.methods(account)).toEqual({
    google: true,
    email: null,
    pendingEmail: 'pending@example.org',
    canLinkGoogle: false,
    canChangePassword: false,
    canAddEmail: true,
    curator: true,
  })
  now += 30 * 60_000
  expect(accounts.methods(account).pendingEmail).toBeNull()
  await send('confirm-email', { token }, here)
  const reader = who(await register())!
  expect(accounts.methods(reader)).toEqual({
    google: false,
    email: registration.email,
    pendingEmail: null,
    canLinkGoogle: true,
    canChangePassword: true,
    canAddEmail: false,
    curator: false,
  })
  const emailOnly = createAccounts({
    databasePath: path,
    origin: 'https://example.org',
    emailRateLimitKey: 'test-key',
  })
  expect(emailOnly.methods(reader)).toMatchObject({
    canLinkGoogle: false,
    canAddEmail: false,
    canChangePassword: true,
  })
})
