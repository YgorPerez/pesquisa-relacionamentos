import { createHash, randomBytes } from 'node:crypto'
import { openDatabase } from './database'

type Options = {
  databasePath?: string
  origin?: string
  clientId?: string
  clientSecret?: string
  /** Explicit injection for local provider tests; never environment overrides. */
  tokenEndpoint?: string
  userinfoEndpoint?: string
  now?: () => number
}
export type Account = { id: number; googleSub: string; nickname: string | null }
const hash = (value: string) =>
  createHash('sha256').update(value).digest('base64url')
const random = () => randomBytes(32).toString('base64url')
const SESSION_SECONDS = 30 * 24 * 60 * 60
const response = (status: number, message: string) =>
  new Response(message, {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/plain; charset=utf-8',
    },
  })
function redirect(cookies: string[] = []) {
  const headers = new Headers({
    location: '/conta',
    'cache-control': 'no-store',
  })
  for (const value of cookies) headers.append('set-cookie', value)
  return new Response(null, { status: 303, headers })
}

/** Server-only. Never send googleSub through a loader or JSON response. */
class AccountService {
  private options: Options
  private now: () => number
  private secure: boolean
  private sessionName: string
  private stateName: string
  constructor(options: Options) {
    this.options = options
    this.now = options.now ?? Date.now
    this.secure = options.origin?.startsWith('https://') ?? true
    this.sessionName = this.secure ? '__Host-session' : 'local-session'
    this.stateName = this.secure ? '__Host-oauth' : 'local-oauth'
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
    return openDatabase(this.options.databasePath)
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
    if (!token || !this.configured()) return null
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
            googleSub: String(row.google_sub),
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
  private async googleSub(
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
    // Request openid only. Discard tokens and every identity field except sub.
    const identityResponse = await fetch(
      this.options.userinfoEndpoint ??
        'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { authorization: `Bearer ${token.access_token}` },
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
      db.prepare(
        'INSERT INTO accounts (google_sub) VALUES (?) ON CONFLICT DO NOTHING',
      ).run(sub)
      const account = db
        .prepare('SELECT id FROM accounts WHERE google_sub = ?')
        .get(sub)!
      const token = random()
      db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
        hash(token),
        account.id!,
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
  private async nickname(request: Request, account: Account) {
    if (Number(request.headers.get('content-length')) > 4096)
      return response(413, 'Formulário muito grande.')
    const text = await request.text()
    if (text.length > 4096) return response(413, 'Formulário muito grande.')
    const form = new URLSearchParams(text)
    const nickname = form.get('nickname')?.trim() ?? ''
    if (
      nickname.length < 2 ||
      nickname.length > 40 ||
      /[\p{C}<>]/u.test(nickname) ||
      form.get('adult') !== 'on' ||
      form.get('rules') !== 'on'
    )
      return response(
        400,
        'Escolha um apelido de 2 a 40 caracteres, declare ter 18 anos ou mais e aceite as regras.',
      )
    const db = this.database()
    try {
      const changed = db
        .prepare(
          "UPDATE accounts SET nickname = ?, accepted_at = ?, rules_version = '1' WHERE id = ? AND nickname IS NULL",
        )
        .run(nickname, this.now(), account.id)
      return changed.changes
        ? redirect()
        : response(409, 'Esta conta já tem apelido.')
    } finally {
      db.close()
    }
  }
  async handle(request: Request): Promise<Response | null> {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/auth/')) return null
    if (!this.configured())
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
      return this.start()
    if (url.pathname === '/auth/callback' && request.method === 'GET')
      return this.callback(request, url)
    const account = this.current(request)
    if (!account) return response(401, 'Entre para continuar.')
    if (url.pathname === '/auth/logout' && request.method === 'POST')
      return this.logout(request)
    if (url.pathname === '/auth/nickname' && request.method === 'POST')
      return this.nickname(request, account)
    return response(404, 'Página não encontrada.')
  }
}

export function createAccounts(options: Options) {
  return new AccountService(options)
}
function accountsFromEnvironment() {
  return createAccounts({
    origin: process.env.APP_ORIGIN,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })
}
/** Server seam for later tickets. A null nickname means onboarding is incomplete. */
export function getCurrentAccount(request: Request): Account | null {
  return accountsFromEnvironment().current(request)
}
export function handleAccountRequest(request: Request) {
  return accountsFromEnvironment().handle(request)
}
