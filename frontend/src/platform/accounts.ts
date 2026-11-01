import { createHash, randomBytes, randomInt } from 'node:crypto'
import { existsSync } from 'node:fs'
import { NICKNAME_INVALID, NICKNAME_TAKEN } from '#/content/nickname-refusal'
import { confirmsDeletion, deleteAccount } from './account-deletion'
import { openDatabase } from './database'
import { REMOVED_READER } from './public-comment-moderation'
import { serverEnv } from './server-env'
import { allowEmailAttempt, emailAccount } from './email-accounts'
import { deliverPasswordReset, resetPassword, validReset } from './password-reset'
import { recoveryPage } from './recovery-page'
import { RECOVERY } from '#/ui/password-recovery.copy'

type Options = {
  databasePath?: string
  origin?: string
  clientId?: string
  clientSecret?: string
  emailRateLimitKey?: string
  resendApiKey?: string
  emailFrom?: string
  resendEndpoint?: string
  /** Explicit injection for local provider tests; never environment overrides. */
  tokenEndpoint?: string
  userinfoEndpoint?: string
  now?: () => number
}
export type Account = {
  id: number
  googleSub: string | null
  nickname: string | null
}
const hash = (value: string) =>
  createHash('sha256').update(value).digest('base64url')
const random = () => randomBytes(32).toString('base64url')
/** What makes two nicknames the same to a reader: case, in any alphabet (SQLite's
 * `lower` knows only ASCII), Unicode forms and repeated spaces (ADR 0045). */
const nicknameKey = (nickname: string) =>
  nickname.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim()
const SESSION_SECONDS = 30 * 24 * 60 * 60
/** Long enough for the redirect to `/conta` to read it. */
const DELETION_NOTICE_SECONDS = 60
/** The largest range `randomInt` takes, and still a safe integer in JSON. */
const ACCOUNT_ID_RANGE = 2 ** 48 - 1
const response = (status: number, message: string) =>
  new Response(message, {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/plain; charset=utf-8',
    },
  })
function redirect(cookies: string[] = [], location = '/conta') {
  const headers = new Headers({
    location,
    'cache-control': 'no-store',
  })
  for (const value of cookies) headers.append('set-cookie', value)
  return new Response(null, { status: 303, headers })
}

async function readForm(request: Request) {
  if (Number(request.headers.get('content-length')) > 4096)
    return response(413, 'Formulário muito grande.')
  const text = await request.text()
  if (text.length > 4096) return response(413, 'Formulário muito grande.')
  return new URLSearchParams(text)
}

/** Server-only. Never send googleSub through a loader or JSON response. */
class AccountService {
  private options: Options
  private now: () => number
  private secure: boolean
  private sessionName: string
  private stateName: string
  private deletedName: string
  constructor(options: Options) {
    this.options = options
    this.now = options.now ?? Date.now
    this.secure = options.origin?.startsWith('https://') ?? true
    this.sessionName = this.secure ? '__Host-session' : 'local-session'
    this.stateName = this.secure ? '__Host-oauth' : 'local-oauth'
    this.deletedName = this.secure ? '__Host-deleted' : 'local-deleted'
  }
  private cookie(name: string, value: string, seconds: number) {
    return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${this.secure ? '; Secure' : ''}`
  }
  private readCookie(request: Request, name: string) {
    return request.headers
      .get('cookie')
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1)
  }
  private database() {
    return openDatabase(this.options.databasePath ?? serverEnv().DATABASE_PATH)
  }
  private configured() {
    const { origin, clientId, clientSecret } = this.options
    return Boolean(
      origin &&
      clientId &&
      clientSecret &&
      (this.secure ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)),
    )
  }
  current(request: Request): Account | null {
    const token = this.readCookie(request, this.sessionName)
    if (!token || !(this.configured() || this.emailConfigured())) return null
    const db = this.database()
    try {
      const row = db
        .prepare(
          `SELECT a.id, a.google_sub, a.nickname FROM accounts a JOIN account_sessions s ON a.id = s.account_id WHERE s.token_hash = ? AND s.expires_at > ?`,
        )
        .get(hash(token), this.now())
      return row
        ? {
            id: Number(row.id),
            googleSub:
              typeof row.google_sub === 'string' ? row.google_sub : null,
            nickname: typeof row.nickname === 'string' ? row.nickname : null,
          }
        : null
    } finally {
      db.close()
    }
  }
  private start() {
    const state = random(),
      browser = random(),
      verifier = random()
    const db = this.database()
    try {
      db.prepare('DELETE FROM oauth_attempts WHERE expires_at <= ?').run(
        this.now(),
      )
      db.prepare('DELETE FROM account_sessions WHERE expires_at <= ?').run(
        this.now(),
      )
      db.prepare('INSERT INTO oauth_attempts VALUES (?, ?, ?, ?)').run(
        hash(state),
        hash(browser),
        verifier,
        this.now() + 600_000,
      )
    } finally {
      db.close()
    }
    const target = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    target.search = new URLSearchParams({
      client_id: this.options.clientId!,
      redirect_uri: `${this.options.origin}/auth/callback`,
      response_type: 'code',
      scope: 'openid',
      state,
      code_challenge: hash(verifier),
      code_challenge_method: 'S256',
    }).toString()
    return new Response(null, {
      status: 303,
      headers: {
        location: target.href,
        'set-cookie': this.cookie(this.stateName, browser, 600),
        'cache-control': 'no-store',
      },
    })
  }
  private async accessToken(
    code: string,
    verifier: string,
  ): Promise<string | null> {
    const tokenResponse = await fetch(
      this.options.tokenEndpoint ?? 'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          code,
          client_id: this.options.clientId!,
          client_secret: this.options.clientSecret!,
          redirect_uri: `${this.options.origin}/auth/callback`,
          grant_type: 'authorization_code',
          code_verifier: verifier,
        }),
      },
    )
    if (!tokenResponse.ok) return null
    const token: unknown = await tokenResponse.json()
    if (
      !token ||
      typeof token !== 'object' ||
      !('access_token' in token) ||
      typeof token.access_token !== 'string'
    )
      return null
    return token.access_token
  }
  private async googleSub(
    code: string,
    verifier: string,
  ): Promise<string | null> {
    const token = await this.accessToken(code, verifier)
    if (!token) return null
    // Request openid only. Discard tokens and every identity field except sub.
    const identityResponse = await fetch(
      this.options.userinfoEndpoint ??
        'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { authorization: `Bearer ${token}` },
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      },
    )
    if (!identityResponse.ok) return null
    const identity: unknown = await identityResponse.json()
    return identity &&
      typeof identity === 'object' &&
      'sub' in identity &&
      typeof identity.sub === 'string' &&
      identity.sub.length > 0 &&
      identity.sub.length <= 255
      ? identity.sub
      : null
  }
  private session(request: Request, sub: string) {
    const db = this.database()
    try {
      // A random id, never reused: a device joined to a deleted account holds
      // its id, and must not find it again on a later account (ADR 0048).
      db.prepare(
        'INSERT INTO accounts (id, google_sub) VALUES (?, ?) ON CONFLICT DO NOTHING',
      ).run(randomInt(1, ACCOUNT_ID_RANGE), sub)
      const account = db
        .prepare('SELECT id FROM accounts WHERE google_sub = ?')
        .get(sub)!
      return this.createSession(request, Number(account.id))
    } finally {
      db.close()
    }
  }
  private createSession(request: Request, accountId: number) {
    const db = this.database()
    try {
      const token = random()
      db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
        hash(token),
        accountId,
        this.now() + SESSION_SECONDS * 1000,
      )
      const previous = this.readCookie(request, this.sessionName)
      if (previous)
        db.prepare('DELETE FROM account_sessions WHERE token_hash = ?').run(
          hash(previous),
        )
      return redirect([
        this.cookie(this.sessionName, token, SESSION_SECONDS),
        this.cookie(this.stateName, '', 0),
      ])
    } finally {
      db.close()
    }
  }
  private async callback(request: Request, url: URL) {
    const state = url.searchParams.get('state'),
      code = url.searchParams.get('code'),
      browser = this.readCookie(request, this.stateName)
    if (!state || !code || !browser)
      return response(
        400,
        'O login não foi concluído. Volte à conta e tente de novo.',
      )
    const db = this.database()
    let verifier: string
    try {
      // DELETE RETURNING consumes state atomically before contacting the provider.
      const attempt = db
        .prepare(
          'DELETE FROM oauth_attempts WHERE state_hash = ? AND browser_hash = ? AND expires_at > ? RETURNING verifier',
        )
        .get(hash(state), hash(browser), this.now())
      if (!attempt)
        return response(400, 'O login expirou. Volte à conta e tente de novo.')
      verifier = String(attempt.verifier)
    } finally {
      db.close()
    }
    try {
      const sub = await this.googleSub(code, verifier)
      return sub
        ? this.session(request, sub)
        : response(
            400,
            'Não foi possível entrar. Volte à conta e tente de novo.',
          )
    } catch {
      // Provider responses, codes, tokens and identity must never reach logs.
      return response(
        502,
        'O Google não respondeu. Volte à conta e tente de novo.',
      )
    }
  }
  private logout(request: Request) {
    const db = this.database()
    try {
      db.prepare('DELETE FROM account_sessions WHERE token_hash = ?').run(
        hash(this.readCookie(request, this.sessionName)!),
      )
    } finally {
      db.close()
    }
    return redirect([this.cookie(this.sessionName, '', 0)])
  }
  private async remove(request: Request, account: Account) {
    const form = await readForm(request)
    if (form instanceof Response) return form
    if (!confirmsDeletion(form.get('confirm')))
      return response(400, 'Para excluir a conta, escreva EXCLUIR no campo.')
    const db = this.database()
    try {
      deleteAccount(db, account.id, form.get('keep-comments') === 'on')
    } finally {
      db.close()
    }
    return redirect([
      this.cookie(this.sessionName, '', 0),
      this.cookie(this.deletedName, '1', DELETION_NOTICE_SECONDS),
    ])
  }
  /** The cookie that clears the notice, when the request carries one: only the
   * deletion sets it, so a link cannot make a device forget its sync. */
  deletionNoticeCookie(request: Request): string | null {
    return this.readCookie(request, this.deletedName)
      ? this.cookie(this.deletedName, '', 0)
      : null
  }
  private async nickname(request: Request, account: Account) {
    const form = await readForm(request)
    if (form instanceof Response) return form
    const nickname = form.get('nickname')?.trim() ?? ''
    if (
      nickname.length < 2 ||
      nickname.length > 40 ||
      /[\p{C}<>]/u.test(nickname) ||
      form.get('adult') !== 'on' ||
      form.get('rules') !== 'on'
    )
      return redirect([], `/conta?recusa=${NICKNAME_INVALID}`)
    const key = nicknameKey(nickname)
    if (key === REMOVED_READER)
      return redirect([], `/conta?recusa=${NICKNAME_TAKEN}`)
    const db = this.database()
    try {
      // IGNORE: the unique index is what decides between two readers at once.
      const changed = db
        .prepare(
          "UPDATE OR IGNORE accounts SET nickname = ?, nickname_key = ?, accepted_at = ?, rules_version = '1' WHERE id = ? AND nickname IS NULL",
        )
        .run(nickname, key, this.now(), account.id)
      if (changed.changes) return redirect()
      return account.nickname === null
        ? redirect([], `/conta?recusa=${NICKNAME_TAKEN}`)
        : response(409, 'Esta conta já tem apelido.')
    } finally {
      db.close()
    }
  }
  async handle(request: Request): Promise<Response | null> {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/auth/')) return null
    if (['/auth/forgot', '/auth/reset'].includes(url.pathname))
      return this.recovery(request, url)
    if (!(this.configured() || this.emailConfigured()))
      return response(
        503,
        'O login está indisponível. Você pode continuar lendo sem entrar.',
      )
    if (request.method !== 'GET' && request.method !== 'POST')
      return response(405, 'Método não permitido.')
    if (
      request.method === 'POST' &&
      request.headers.get('origin') !== this.options.origin
    )
      return response(403, 'Abra o formulário neste site e tente de novo.')
    if (url.pathname === '/auth/google' && request.method === 'GET')
      return this.configured()
        ? this.start()
        : response(503, 'O login com Google está indisponível.')
    if (url.pathname === '/auth/callback' && request.method === 'GET')
      return this.configured()
        ? this.callback(request, url)
        : response(503, 'O login com Google está indisponível.')
    if (
      request.method === 'POST' &&
      ['/auth/register', '/auth/login'].includes(url.pathname)
    )
      return this.email(request, url.pathname === '/auth/register')
    const account = this.current(request)
    if (!account) return response(401, 'Entre para continuar.')
    if (url.pathname === '/auth/logout' && request.method === 'POST')
      return this.logout(request)
    if (url.pathname === '/auth/delete' && request.method === 'POST')
      return this.remove(request, account)
    if (url.pathname === '/auth/nickname' && request.method === 'POST')
      return this.nickname(request, account)
    return response(404, 'Página não encontrada.')
  }
  private emailConfigured() {
    const origin = this.options.origin
    return Boolean(
      this.options.emailRateLimitKey &&
      origin &&
      (this.secure ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)),
    )
  }
  private async recovery(request: Request, url: URL) {
    if (!['GET', 'POST'].includes(request.method)) return response(405, 'Método não permitido.')
    if (request.method === 'POST' && request.headers.get('origin') !== this.options.origin)
      return response(403, 'Abra o formulário neste site e tente de novo.')
    if (!this.emailConfigured() || !this.options.resendApiKey || !this.options.emailFrom)
      return recoveryPage({ disabled: true, message: RECOVERY.unavailable }, 503)
    if (url.pathname === '/auth/forgot') {
      if (request.method === 'GET') return recoveryPage({})
      const form = await readForm(request)
      if (form instanceof Response) return form
      const email = form.get('email')?.trim().toLowerCase() ?? ''
      // Defer all lookup, rate limiting and provider I/O until the identical
      // answer is returned. Provider latency and failure cannot affect it.
      setImmediate(() => {
        void this.deliverRecovery(request, email)
      })
      return recoveryPage({ message: RECOVERY.sent, disabled: true })
    }
    const form = request.method === 'POST' ? await readForm(request) : url.searchParams
    if (form instanceof Response) return form
    const token = form.get('token') ?? ''
    const db = this.database()
    try {
      if (!validReset(db, token, this.now()))
        return recoveryPage({ message: RECOVERY.invalid }, 400)
      if (request.method === 'GET') return recoveryPage({ token })
      const password = form.get('password') ?? ''
      if (password.length < 8 || password.length > 1024)
        return recoveryPage({ token, message: RECOVERY.short }, 400)
      return await resetPassword(db, token, password, this.now)
        ? recoveryPage({ message: RECOVERY.done, disabled: true })
        : recoveryPage({ message: RECOVERY.invalid }, 400)
    } finally { db.close() }
  }
  private async deliverRecovery(request: Request, email: string) {
    // Never expose database/provider exceptions containing a recipient/token.
    try {
      const db = this.database()
      try {
        await deliverPasswordReset(db, request, email, {
          origin: this.options.origin!, rateKey: this.options.emailRateLimitKey!,
          apiKey: this.options.resendApiKey!, from: this.options.emailFrom!,
          endpoint: this.options.resendEndpoint,
        }, this.now())
      } finally { db.close() }
    } catch { /* Recovery is best effort after the response. */ }
  }
  private async email(request: Request, register: boolean) {
    if (!this.emailConfigured())
      return response(503, 'O login com e-mail está indisponível.')
    const form = await readForm(request)
    if (form instanceof Response) return form
    const db = this.database()
    try {
      const email = form.get('email')?.trim().toLowerCase() ?? ''
      if (
        !allowEmailAttempt(
          db,
          request,
          email,
          this.options.emailRateLimitKey!,
          this.now(),
        )
      )
        return response(
          429,
          'Muitas tentativas. Espere 15 minutos e tente de novo.',
        )
      const result = await emailAccount(db, form, register, this.now())
      return typeof result === 'number'
        ? this.createSession(request, result)
        : response(400, result)
    } finally {
      db.close()
    }
  }
}

export function createAccounts(options: Options) {
  return new AccountService(options)
}
function accountsFromEnvironment() {
  const env = serverEnv()
  return createAccounts({
    origin: env.APP_ORIGIN,
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    emailRateLimitKey: env.EMAIL_RATE_LIMIT_KEY,
    resendApiKey: env.RESEND_API_KEY,
    emailFrom: env.EMAIL_FROM,
  })
}
/** A POST from this site's own pages. */
export const fromThisSite = (request: Request) =>
  request.method === 'POST' &&
  request.headers.get('origin') ===
    (serverEnv().APP_ORIGIN ?? new URL(request.url).origin)
/** Server seam for later tickets. A null nickname means onboarding is incomplete. */
export function getCurrentAccount(request: Request): Account | null {
  return accountsFromEnvironment().current(request)
}
/** See `AccountService.deletionNoticeCookie`. */
export function deletionNoticeCookie(request: Request) {
  return accountsFromEnvironment().deletionNoticeCookie(request)
}
export function handleAccountRequest(request: Request) {
  return accountsFromEnvironment().handle(request)
}
/** Hourly erasure also covers an idle site; expiry is 15 minutes, retention <24h. */
export function pruneEmailRateLimits() {
  const env = serverEnv()
  if (!existsSync(env.DATABASE_PATH)) return
  const db = openDatabase(env.DATABASE_PATH)
  try {
    db.prepare('DELETE FROM email_rate_limits WHERE expires_at <= ?').run(
      Date.now(),
    )
  } finally {
    db.close()
  }
}
