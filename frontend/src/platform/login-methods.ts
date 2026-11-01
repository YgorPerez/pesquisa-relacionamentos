// Linking and managing the ways into an account (#572). Works on a connection
// `accounts.ts` opened, after it checked who is asking.
import { createHash, randomBytes } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import type { MethodNotice } from '#/content/method-notice'
import { sendAccountEmail } from './account-email'
import {
  allowEmailAttempt,
  hashPassword,
  isEmail,
  verifiesPassword,
} from './email-accounts'
import { transaction } from './transaction'

type Mail = {
  origin: string
  rateKey: string
  apiKey: string
  from: string
  endpoint?: string
}
/** Long enough to reach the inbox; the password reset's window (ADR 0045). */
const EMAIL_LINK_MS = 30 * 60_000
const tokenHash = (token: string) =>
  createHash('sha256').update(token).digest('base64url')
const validPassword = (password: string) =>
  password.length >= 8 && password.length <= 1024

/** The device that asked stays signed in. */
const endOtherSessions = (
  db: DatabaseSync,
  accountId: number,
  sessionHash: string,
) =>
  db
    .prepare(
      'DELETE FROM account_sessions WHERE account_id = ? AND token_hash <> ?',
    )
    .run(accountId, sessionHash)

/** A link attempt, gone once read, or `null` when `state` is not one. */
export function consumeGoogleLink(
  db: DatabaseSync,
  stateHash: string,
  browserHash: string,
  now: number,
) {
  const attempt = db
    .prepare(
      'DELETE FROM google_link_attempts WHERE state_hash = ? AND browser_hash = ? AND expires_at > ? RETURNING verifier, account_id, session_hash',
    )
    .get(stateHash, browserHash, now)
  return attempt
    ? {
        verifier: String(attempt.verifier),
        accountId: Number(attempt.account_id),
        sessionHash: String(attempt.session_hash),
      }
    : null
}

/** The unique subject decides between two accounts: this never merges them, and
 * a session that ended on the way to Google links nothing. */
export function linkGoogle(
  db: DatabaseSync,
  accountId: number,
  sessionHash: string,
  sub: string,
  now: number,
): MethodNotice {
  return transaction(db, () => {
    const session = db
      .prepare(
        'SELECT 1 FROM account_sessions WHERE token_hash = ? AND account_id = ? AND expires_at > ?',
      )
      .get(sessionHash, accountId, now)
    if (!session) return 'google-falhou'
    // Another tab finished first: this is not a Google with an account of its own.
    const holding = db
      .prepare('SELECT google_sub FROM accounts WHERE id = ?')
      .get(accountId)?.google_sub
    if (typeof holding === 'string')
      return holding === sub ? 'google-ligado' : 'google-falhou'
    const linked = db
      .prepare(
        'UPDATE OR IGNORE accounts SET google_sub = ? WHERE id = ? AND google_sub IS NULL',
      )
      .run(sub, accountId)
    if (!linked.changes) return 'google-em-uso'
    endOtherSessions(db, accountId, sessionHash)
    return 'google-ligado'
  })
}

/** Adding an email proves the address first: a typo would hand the account to a
 * stranger through a reset. One live link per account; a new one replaces it. The
 * password waits with it, hashed, and both go if the mail does not leave. */
export async function requestEmailLink(
  db: DatabaseSync,
  request: Request,
  accountId: number,
  form: URLSearchParams,
  mail: Mail,
  now: number,
): Promise<MethodNotice> {
  const email = form.get('email')?.trim().toLowerCase() ?? ''
  const password = form.get('password') ?? ''
  if (!isEmail(email) || !validPassword(password)) return 'email-invalido'
  if (!allowEmailAttempt(db, request, email, mail.rateKey, now))
    return 'muitas-tentativas'
  const taken = db
    .prepare(
      'SELECT 1 FROM email_credentials WHERE email = ? OR account_id = ?',
    )
    .get(email, accountId)
  if (taken) return 'email-em-uso'
  const passwordHash = await hashPassword(password)
  const token = randomBytes(32).toString('base64url')
  db.prepare(`INSERT INTO email_links VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(account_id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash,
    token_hash = excluded.token_hash, expires_at = excluded.expires_at`).run(
    accountId,
    email,
    passwordHash,
    tokenHash(token),
    now + EMAIL_LINK_MS,
  )
  const link = new URL('/auth/confirm-email', mail.origin)
  link.searchParams.set('token', token)
  const sent = await sendAccountEmail(mail, {
    to: email,
    subject: 'Confirme seu e-mail · Tem estudo?',
    text: `No Tem estudo?, você pediu para ligar este e-mail à sua conta. Abra este link em até 30 minutos, com a conta aberta no navegador. Ele só pode ser usado uma vez.\n\n${link.href}\n\nSe não foi você, ignore esta mensagem. Nada muda.`,
  })
  if (sent) return 'email-enviado'
  db.prepare('DELETE FROM email_links WHERE token_hash = ?').run(
    tokenHash(token),
  )
  return 'email-nao-enviado'
}

/** The link's account and address, while it is alive. */
export function emailLink(db: DatabaseSync, token: string, now: number) {
  const link = db
    .prepare(
      'SELECT account_id, email FROM email_links WHERE token_hash = ? AND expires_at > ?',
    )
    .get(tokenHash(token), now)
  return link
    ? { accountId: Number(link.account_id), email: String(link.email) }
    : null
}

/** The unique address decides against whoever took it since the request: the
 * link is spent and the reader hears why. `null` when the link is not alive. */
export function confirmEmailLink(
  db: DatabaseSync,
  token: string,
  accountId: number,
  sessionHash: string,
  now: number,
): MethodNotice | null {
  return transaction(db, () => {
    const link = db
      .prepare(
        'DELETE FROM email_links WHERE token_hash = ? AND account_id = ? AND expires_at > ? RETURNING email, password_hash',
      )
      .get(tokenHash(token), accountId, now)
    if (!link) return null
    const added = db
      .prepare('INSERT OR IGNORE INTO email_credentials VALUES (?, ?, ?)')
      .run(accountId, link.email!, link.password_hash!)
    if (!added.changes) return 'email-em-uso'
    endOtherSessions(db, accountId, sessionHash)
    return 'email-ligado'
  })
}

/** The check and the removal are one statement: two removals at once cannot each
 * count on the method the other is taking. */
export function removeMethod(
  db: DatabaseSync,
  accountId: number,
  sessionHash: string,
  method: 'google' | 'email',
): MethodNotice {
  return transaction(db, () => {
    const removed =
      method === 'google'
        ? db
            .prepare(
              `UPDATE accounts SET google_sub = NULL WHERE id = ? AND google_sub IS NOT NULL
              AND EXISTS (SELECT 1 FROM email_credentials WHERE account_id = accounts.id)`,
            )
            .run(accountId)
        : db
            .prepare(
              `DELETE FROM email_credentials WHERE account_id = ?
              AND EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND google_sub IS NOT NULL)`,
            )
            .run(accountId)
    if (!removed.changes) return 'ultimo-metodo'
    endOtherSessions(db, accountId, sessionHash)
    if (method === 'email')
      db.prepare('DELETE FROM password_resets WHERE account_id = ?').run(
        accountId,
      )
    return 'metodo-removido'
  })
}

/** What `/conta` shows about this account's methods. */
export function storedMethods(
  db: DatabaseSync,
  accountId: number,
  now: number,
) {
  const email = db
    .prepare('SELECT email FROM email_credentials WHERE account_id = ?')
    .get(accountId)?.email
  const pending = db
    .prepare(
      'SELECT email FROM email_links WHERE account_id = ? AND expires_at > ?',
    )
    .get(accountId, now)?.email
  return {
    email: typeof email === 'string' ? email : null,
    pendingEmail: typeof pending === 'string' ? pending : null,
  }
}

export async function changePassword(
  db: DatabaseSync,
  request: Request,
  accountId: number,
  sessionHash: string,
  form: URLSearchParams,
  rateKey: string,
  now: number,
): Promise<MethodNotice> {
  const credential = db
    .prepare(
      'SELECT email, password_hash FROM email_credentials WHERE account_id = ?',
    )
    .get(accountId)
  if (!credential) return 'indisponivel'
  const password = form.get('password') ?? ''
  if (!validPassword(password)) return 'senha-curta'
  const email = String(credential.email)
  if (!allowEmailAttempt(db, request, email, rateKey, now))
    return 'muitas-tentativas'
  const stored = String(credential.password_hash)
  if (!(await verifiesPassword(form.get('current') ?? '', stored)))
    return 'senha-errada'
  const passwordHash = await hashPassword(password)
  return transaction(db, () => {
    // Against what was checked: two changes at once have one winner.
    const changed = db
      .prepare(
        'UPDATE email_credentials SET password_hash = ? WHERE account_id = ? AND password_hash = ?',
      )
      .run(passwordHash, accountId, stored)
    if (!changed.changes) return 'senha-errada'
    endOtherSessions(db, accountId, sessionHash)
    db.prepare('DELETE FROM password_resets WHERE account_id = ?').run(
      accountId,
    )
    return 'senha-trocada'
  })
}
