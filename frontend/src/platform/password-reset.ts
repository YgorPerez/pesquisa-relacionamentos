import { randomBytes } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { sendAccountEmail, type AccountMail } from './account-email'
import {
  allowEmailAttempt,
  clearLoginAttempts,
  hashPassword,
  isEmail,
  tokenHash,
} from './email-accounts'
import { isCuratorSubject } from './public-comment-moderation'
import { transaction } from './transaction'

export async function deliverPasswordReset(
  db: DatabaseSync,
  request: Request,
  email: string,
  config: AccountMail,
  now: number,
) {
  if (!allowEmailAttempt(db, request, email, 'reset', config.rateKey, now))
    return
  if (!isEmail(email)) return
  db.prepare('DELETE FROM password_resets WHERE expires_at <= ?').run(now)
  const account = db
    .prepare('SELECT account_id FROM email_credentials WHERE email = ?')
    .get(email)
  let text =
    'Você pediu para recuperar a senha no Tem estudo?, mas não há conta com este e-mail. Se não foi você, pode ignorar esta mensagem.'
  if (account) {
    const token = randomBytes(32).toString('base64url')
    db.prepare(`INSERT INTO password_resets VALUES (?, ?, ?)
      ON CONFLICT(account_id) DO UPDATE SET token_hash = excluded.token_hash, expires_at = excluded.expires_at`).run(
      account.account_id!,
      tokenHash(token),
      now + 30 * 60_000,
    )
    const link = new URL('/auth/reset', config.origin)
    link.searchParams.set('token', token)
    text = `No Tem estudo?, você pediu para trocar a senha. Abra este link em até 30 minutos. Ele só pode ser usado uma vez.\n\n${link.href}\n\nA troca encerra o acesso em todos os aparelhos e mantém os dados da conta. Se não foi você, ignore esta mensagem. Sua senha continua a mesma.`
  }
  await sendAccountEmail(config, {
    to: email,
    subject: 'Recuperação de senha · Tem estudo?',
    text,
  })
}

export function validReset(db: DatabaseSync, token: string, now: number) {
  return (
    /^[A-Za-z0-9_-]{43}$/.test(token) &&
    Boolean(
      db
        .prepare(
          'SELECT 1 FROM password_resets WHERE token_hash = ? AND expires_at > ?',
        )
        .get(tokenHash(token), now),
    )
  )
}

type ResetResult = 'invalid' | 'done' | 'google-removed' | 'curator-unproven'

/** A reset proves the mailbox, and an email nobody had proved may have been typed
 * by a stranger, who then linked their own Google to come back through it. So that
 * Google goes (ADR 0045). The curator's account is the exception: without its Google
 * it would leave the desk, and with it a reset would hand the desk to whoever holds
 * this unproven address. Nothing changes there, and the link is spent. */
export async function resetPassword(
  db: DatabaseSync,
  token: string,
  password: string,
  now: () => number,
  { rateKey, curatorSub }: { rateKey: string; curatorSub?: string },
): Promise<ResetResult> {
  if (!validReset(db, token, now())) return 'invalid'
  const passwordHash = await hashPassword(password)
  return transaction(db, () => {
    const reset = db
      .prepare(
        'DELETE FROM password_resets WHERE token_hash = ? AND expires_at > ? RETURNING account_id',
      )
      .get(tokenHash(token), now())
    if (!reset) return 'invalid'
    const accountId = reset.account_id!
    const owner = db
      .prepare(
        `SELECT c.email, c.confirmed, a.google_sub FROM email_credentials c
        JOIN accounts a ON a.id = c.account_id WHERE c.account_id = ?`,
      )
      .get(accountId)
    if (!owner) return 'invalid'
    const unproven = owner.confirmed === 0
    if (unproven && isCuratorSubject(owner.google_sub, curatorSub))
      return 'curator-unproven'
    db.prepare(
      'UPDATE email_credentials SET password_hash = ?, confirmed = 1 WHERE account_id = ?',
    ).run(passwordHash, accountId)
    const removesGoogle = unproven && owner.google_sub !== null
    if (removesGoogle)
      db.prepare('UPDATE accounts SET google_sub = NULL WHERE id = ?').run(
        accountId,
      )
    db.prepare('DELETE FROM account_sessions WHERE account_id = ?').run(
      accountId,
    )
    clearLoginAttempts(db, String(owner.email), rateKey)
    return removesGoogle ? 'google-removed' : 'done'
  })
}
