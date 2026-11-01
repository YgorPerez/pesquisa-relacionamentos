import { createHash, randomBytes } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { allowEmailAttempt, hashPassword } from './email-accounts'
import { sendAccountEmail } from './account-email'

const hash = (token: string) =>
  createHash('sha256').update(token).digest('base64url')
export async function deliverPasswordReset(
  db: DatabaseSync,
  request: Request,
  email: string,
  config: {
    origin: string
    rateKey: string
    apiKey: string
    from: string
    endpoint?: string
  },
  now: number,
) {
  if (!allowEmailAttempt(db, request, email, config.rateKey, now)) return
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return
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
      hash(token),
      now + 30 * 60_000,
    )
    const link = new URL('/auth/reset', config.origin)
    link.searchParams.set('token', token)
    text = `Você pediu para trocar a senha no Tem estudo?. Abra este link em até 30 minutos. Ele só pode ser usado uma vez.\n\n${link.href}\n\nA troca encerra o acesso em todos os aparelhos e mantém os dados da conta. Se não foi você, ignore esta mensagem. Sua senha continua a mesma.`
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
        .get(hash(token), now),
    )
  )
}

export async function resetPassword(
  db: DatabaseSync,
  token: string,
  password: string,
  now: () => number,
) {
  if (!validReset(db, token, now())) return false
  const passwordHash = await hashPassword(password)
  db.exec('BEGIN IMMEDIATE')
  try {
    const reset = db
      .prepare(
        'DELETE FROM password_resets WHERE token_hash = ? AND expires_at > ? RETURNING account_id',
      )
      .get(hash(token), now())
    if (!reset) {
      db.exec('ROLLBACK')
      return false
    }
    db.prepare(
      'UPDATE email_credentials SET password_hash = ? WHERE account_id = ?',
    ).run(passwordHash, reset.account_id!)
    db.prepare('DELETE FROM account_sessions WHERE account_id = ?').run(
      reset.account_id!,
    )
    db.exec('COMMIT')
    return true
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
