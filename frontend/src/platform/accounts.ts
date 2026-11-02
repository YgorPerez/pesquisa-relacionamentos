import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import type { AccountMethods, MethodNotice } from '#/content/method-notice'
import { NICKNAME_INVALID, NICKNAME_TAKEN } from '#/content/nickname-refusal'
import { confirmsDeletion, deleteAccount } from './account-deletion'
import { openDatabase } from './database'
import { isCuratorSubject } from './public-comment-moderation'
import { serverEnv } from './server-env'
import {
  allowEmailAttempt,
  emailAccount,
  newAccountId,
  nicknameFrom,
  normalizeEmail,
  tokenHash as hash,
  validPassword,
} from './email-accounts'
import { transaction } from './transaction'
import {
  changePassword,
  confirmEmailLink,
  consumeGoogleLink,
  emailLink,
  linkGoogle,
  removeMethod,
  requestEmailLink,
  storedMethods,
} from './login-methods'
import {
  deliverPasswordReset,
  resetPassword,
  validReset,
} from './password-reset'
import { emailConfirmationPage, recoveryPage } from './recovery-page'
import { EMAIL_CONFIRMATION } from '#/ui/email-confirmation.copy'
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
  curatorSub?: string
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
const random = () => randomBytes(32).toString('base64url')
const SESSION_SECONDS = 30 * 24 * 60 * 60
/** Long enough for the redirect to `/conta` to read it. */
const DELETION_NOTICE_SECONDS = 60
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
const noticeRedirect = (notice: MethodNotice, cookies: string[] = []) =>
  redirect(cookies, `/conta?metodo=${notice}`)

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
  /** With `link`, the attempt belongs to that signed-in session: its callback
   * never starts a session, and lives in a table logins do not read. */
  private start(link?: { accountId: number; sessionHash: string }) {
    const state = random(),
      browser = random(),
      verifier = random()
    const db = this.database()
    try {
      db.prepare('DELETE FROM oauth_attempts WHERE expires_at <= ?').run(
        this.now(),
      )
      db.prepare('DELETE FROM google_link_attempts WHERE expires_at <= ?').run(
        this.now(),
      )
      db.prepare('DELETE FROM account_sessions WHERE expires_at <= ?').run(
        this.now(),
      )
      const attempt = [
        hash(state),
        hash(browser),
        verifier,
        this.now() + 600_000,
      ] as const
      if (link)
        db.prepare(
          `INSERT INTO google_link_attempts (state_hash, browser_hash, verifier, expires_at, account_id, session_hash)
          VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(...attempt, link.accountId, link.sessionHash)
      else
        db.prepare('INSERT INTO oauth_attempts VALUES (?, ?, ?, ?)').run(
          ...attempt,
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
      // One transaction: a reset that unlinks this Google cannot land between
      // finding the account and giving it a session.
      return transaction(db, () => {
        // A random id, never reused: a device joined to a deleted account holds
        // its id, and must not find it again on a later account (ADR 0048).
        db.prepare(
          'INSERT INTO accounts (id, google_sub) VALUES (?, ?) ON CONFLICT DO NOTHING',
        ).run(newAccountId(), sub)
        const account = db
          .prepare('SELECT id FROM accounts WHERE google_sub = ?')
          .get(sub)!
        return this.createSession(db, request, Number(account.id))
      })
    } finally {
      db.close()
    }
  }
  /** Inside the caller's transaction. */
  private createSession(db: DatabaseSync, request: Request, accountId: number) {
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
  }
  private async callback(request: Request, url: URL) {
    const state = url.searchParams.get('state'),
      code = url.searchParams.get('code'),
      browser = this.readCookie(request, this.stateName)
    if (!state || !browser)
      return response(
        400,
        'O login não foi concluído. Volte à conta e tente de novo.',
      )
    const db = this.database()
    let verifier: string
    let link: ReturnType<typeof consumeGoogleLink>
    try {
      link = consumeGoogleLink(db, hash(state), hash(browser), this.now())
      // DELETE RETURNING consumes state atomically before contacting the provider.
      const attempt =
        link ??
        db
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
    // A reader linking Google has a page to go back to, and a reason to read there.
    const linkFailed = () =>
      noticeRedirect('google-falhou', [this.cookie(this.stateName, '', 0)])
    if (!code)
      return link
        ? linkFailed()
        : response(
            400,
            'O login não foi concluído. Volte à conta e tente de novo.',
          )
    try {
      const sub = await this.googleSub(code, verifier)
      if (!sub)
        return link
          ? linkFailed()
          : response(
              400,
              'Não foi possível entrar. Volte à conta e tente de novo.',
            )
      return link
        ? this.finishLink(request, link, sub)
        : this.session(request, sub)
    } catch {
      // Provider responses, codes, tokens and identity must never reach logs.
      return link
        ? linkFailed()
        : response(
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
    const chosen = nicknameFrom(form)
    if (!chosen) return redirect([], `/conta?recusa=${NICKNAME_INVALID}`)
    if (!chosen.free) return redirect([], `/conta?recusa=${NICKNAME_TAKEN}`)
    const { nickname, key } = chosen
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
    if (url.pathname === '/auth/confirm-email')
      return this.confirmEmail(request, url)
    const account = this.current(request)
    if (!account) return response(401, 'Entre para continuar.')
    if (url.pathname === '/auth/logout' && request.method === 'POST')
      return this.logout(request)
    if (url.pathname === '/auth/delete' && request.method === 'POST')
      return this.remove(request, account)
    if (url.pathname === '/auth/nickname' && request.method === 'POST')
      return this.nickname(request, account)
    if (url.pathname === '/auth/change-password' && request.method === 'POST')
      return this.changePassword(request, account)
    // POST, so another site cannot send a signed-in reader through the link.
    if (url.pathname === '/auth/link-google' && request.method === 'POST')
      return this.linkGoogle(request, account)
    if (url.pathname === '/auth/add-email' && request.method === 'POST')
      return this.addEmail(request, account)
    if (url.pathname === '/auth/remove-method' && request.method === 'POST')
      return this.removeMethod(request, account)
    return response(404, 'Página não encontrada.')
  }
  private sessionHash(request: Request) {
    return hash(this.readCookie(request, this.sessionName) ?? '')
  }
  private isCurator(account: Account) {
    return isCuratorSubject(account.googleSub, this.options.curatorSub)
  }
  /** What the account page may know: the reader's own address, no subject. */
  methods(account: Account): AccountMethods {
    const db = this.database()
    try {
      const { email, pendingEmail } = storedMethods(db, account.id, this.now())
      return {
        google: account.googleSub !== null,
        email,
        pendingEmail,
        canLinkGoogle: account.googleSub === null && this.configured(),
        canChangePassword: email !== null && this.emailConfigured(),
        canAddEmail: email === null && this.mailConfigured(),
        curator: this.isCurator(account),
      }
    } finally {
      db.close()
    }
  }
  /** `CURATOR_GOOGLE_SUB` names the curator: without that Google this account is
   * denied, and a later login with it opens a new account, which is the curator's.
   * So it stays here, whatever a form says. */
  private async removeMethod(request: Request, account: Account) {
    const form = await readForm(request)
    if (form instanceof Response) return form
    const method = form.get('method')
    if (method !== 'google' && method !== 'email')
      return response(400, 'Método desconhecido.')
    if (method === 'google' && this.isCurator(account))
      return noticeRedirect('google-do-curador')
    const db = this.database()
    try {
      return noticeRedirect(
        removeMethod(db, account.id, this.sessionHash(request), method),
      )
    } finally {
      db.close()
    }
  }
  private async addEmail(request: Request, account: Account) {
    const form = await readForm(request)
    if (form instanceof Response) return form
    if (!this.mailConfigured()) return noticeRedirect('indisponivel')
    const db = this.database()
    try {
      return noticeRedirect(
        await requestEmailLink(
          db,
          request,
          account.id,
          form,
          this.mail(),
          this.now(),
        ),
      )
    } finally {
      db.close()
    }
  }
  /** Opening the link only shows it, as a mail scanner opens links too: the form
   * consumes it, and only for the account that asked, still signed in. */
  private async confirmEmail(request: Request, url: URL) {
    const form =
      request.method === 'POST' ? await readForm(request) : url.searchParams
    if (form instanceof Response) return form
    const token = form.get('token') ?? ''
    const account = this.current(request)
    const db = this.database()
    try {
      const link = emailLink(db, token, this.now())
      if (!link)
        return emailConfirmationPage(
          { message: EMAIL_CONFIRMATION.invalid },
          400,
        )
      if (link.accountId !== account?.id)
        return emailConfirmationPage(
          { message: EMAIL_CONFIRMATION.otherAccount },
          403,
        )
      if (request.method === 'GET')
        return emailConfirmationPage({ token, email: link.email })
      const notice = confirmEmailLink(
        db,
        token,
        account.id,
        this.sessionHash(request),
        this.now(),
      )
      return notice
        ? noticeRedirect(notice)
        : emailConfirmationPage({ message: EMAIL_CONFIRMATION.invalid }, 400)
    } finally {
      db.close()
    }
  }
  private linkGoogle(request: Request, account: Account) {
    if (!this.configured()) return noticeRedirect('indisponivel')
    if (account.googleSub !== null) return redirect()
    return this.start({
      accountId: account.id,
      sessionHash: this.sessionHash(request),
    })
  }
  /** Only the session that started the link finishes it: another account in the
   * same browser, or none, gets the refusal and no change. */
  private finishLink(
    request: Request,
    link: { accountId: number; sessionHash: string },
    sub: string,
  ) {
    const db = this.database()
    try {
      const notice =
        this.sessionHash(request) === link.sessionHash
          ? linkGoogle(db, link.accountId, link.sessionHash, sub, this.now())
          : 'google-falhou'
      return noticeRedirect(notice, [this.cookie(this.stateName, '', 0)])
    } finally {
      db.close()
    }
  }
  private async changePassword(request: Request, account: Account) {
    const form = await readForm(request)
    if (form instanceof Response) return form
    if (!this.emailConfigured()) return noticeRedirect('indisponivel')
    const db = this.database()
    try {
      return noticeRedirect(
        await changePassword(
          db,
          request,
          account.id,
          this.sessionHash(request),
          form,
          this.options.emailRateLimitKey!,
          this.now(),
        ),
      )
    } finally {
      db.close()
    }
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
  private mailConfigured() {
    return Boolean(
      this.emailConfigured() &&
      this.options.resendApiKey &&
      this.options.emailFrom,
    )
  }
  private mail() {
    return {
      origin: this.options.origin!,
      rateKey: this.options.emailRateLimitKey!,
      apiKey: this.options.resendApiKey!,
      from: this.options.emailFrom!,
      endpoint: this.options.resendEndpoint,
    }
  }
  private async recovery(request: Request, url: URL) {
    if (!['GET', 'POST'].includes(request.method))
      return response(405, 'Método não permitido.')
    if (
      request.method === 'POST' &&
      request.headers.get('origin') !== this.options.origin
    )
      return response(403, 'Abra o formulário neste site e tente de novo.')
    if (!this.mailConfigured())
      return recoveryPage(
        { disabled: true, message: RECOVERY.unavailable },
        503,
      )
    if (url.pathname === '/auth/forgot') {
      if (request.method === 'GET') return recoveryPage({})
      const form = await readForm(request)
      if (form instanceof Response) return form
      const email = normalizeEmail(form.get('email'))
      // Defer all lookup, rate limiting and provider I/O until the identical
      // answer is returned. Provider latency and failure cannot affect it.
      setImmediate(() => {
        void this.deliverRecovery(request, email)
      })
      return recoveryPage({ message: RECOVERY.sent, disabled: true })
    }
    const form =
      request.method === 'POST' ? await readForm(request) : url.searchParams
    if (form instanceof Response) return form
    const token = form.get('token') ?? ''
    const db = this.database()
    try {
      if (!validReset(db, token, this.now()))
        return recoveryPage({ message: RECOVERY.invalid }, 400)
      if (request.method === 'GET') return recoveryPage({ token })
      const password = form.get('password') ?? ''
      if (!validPassword(password))
        return recoveryPage({ token, message: RECOVERY.short }, 400)
      return await this.finishReset(db, token, password)
    } finally {
      db.close()
    }
  }
  private async finishReset(db: DatabaseSync, token: string, password: string) {
    const result = await resetPassword(db, token, password, this.now, {
      rateKey: this.options.emailRateLimitKey!,
      curatorSub: this.options.curatorSub,
    })
    if (result === 'invalid')
      return recoveryPage({ message: RECOVERY.invalid }, 400)
    if (result === 'curator-unproven')
      return recoveryPage(
        { message: RECOVERY.keptUnproven, disabled: true },
        409,
      )
    const message =
      result === 'google-removed' ? RECOVERY.doneGoogleRemoved : RECOVERY.done
    return recoveryPage({ message, disabled: true })
  }
  private async deliverRecovery(request: Request, email: string) {
    // Never expose database/provider exceptions containing a recipient/token.
    try {
      const db = this.database()
      try {
        await deliverPasswordReset(db, request, email, this.mail(), this.now())
      } finally {
        db.close()
      }
    } catch {
      /* Recovery is best effort after the response. */
    }
  }
  /** Covers an idle site. With the server up, the hourly pass is what bounds a row:
   * a rate limit expires in 15 minutes, so it lives at most 75; a pending address or
   * reset link expires in 30, so it lives at most 90. `/privacidade` states these. */
  eraseExpired() {
    const path = this.options.databasePath ?? serverEnv().DATABASE_PATH
    if (!this.emailConfigured() || !existsSync(path)) return
    const db = this.database()
    try {
      for (const table of [
        'email_rate_limits',
        'password_resets',
        'email_links',
        'google_link_attempts',
      ])
        db.prepare(`DELETE FROM ${table} WHERE expires_at <= ?`).run(this.now())
    } finally {
      db.close()
    }
  }
  private async email(request: Request, register: boolean) {
    if (!this.emailConfigured())
      return response(503, 'O login com e-mail está indisponível.')
    const form = await readForm(request)
    if (form instanceof Response) return form
    const db = this.database()
    try {
      if (
        !allowEmailAttempt(
          db,
          request,
          normalizeEmail(form.get('email')),
          register ? 'register' : 'login',
          this.options.emailRateLimitKey!,
          this.now(),
        )
      )
        return response(
          429,
          'Muitas tentativas. Espere 15 minutos e tente de novo.',
        )
      const result = await emailAccount(db, form, register, this.now())
      if ('refusal' in result) return response(400, result.refusal)
      // scrypt ran off the lock: the password may have changed since, and that
      // ended every session this one must not outlive.
      const session = transaction(db, () =>
        db
          .prepare(
            'SELECT 1 FROM email_credentials WHERE account_id = ? AND password_hash = ?',
          )
          .get(result.accountId, result.passwordHash)
          ? this.createSession(db, request, result.accountId)
          : null,
      )
      return session ?? response(400, 'E-mail ou senha incorretos.')
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
    curatorSub: env.CURATOR_GOOGLE_SUB,
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
/** See `AccountService.methods`. */
export function getAccountMethods(account: Account) {
  return accountsFromEnvironment().methods(account)
}
export function handleAccountRequest(request: Request) {
  return accountsFromEnvironment().handle(request)
}
/** Never throws: this runs on a timer, and a page must not fall with it. */
export function eraseExpiredEmailData(service = accountsFromEnvironment) {
  try {
    service().eraseExpired()
  } catch {
    console.error('Could not erase expired email data.')
  }
}
const FIRST_ERASURE_MS = 60_000
const ERASURE_MS = 60 * 60_000
/** Opens nothing now: the first pass waits for a running server, since reading
 * needs no database (ADR 0045). Both timers let the process exit. */
export function scheduleEmailErasure(service = accountsFromEnvironment) {
  setTimeout(() => eraseExpiredEmailData(service), FIRST_ERASURE_MS).unref()
  setInterval(() => eraseExpiredEmailData(service), ERASURE_MS).unref()
}
