import {
  createHmac,
  randomBytes,
  randomInt,
  scrypt,
  timingSafeEqual,
} from 'node:crypto'
import { isIP } from 'node:net'
import type { DatabaseSync } from 'node:sqlite'
import { promisify } from 'node:util'

const derive = promisify(scrypt)
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
const DUMMY = `${'00'.repeat(16)}:${'00'.repeat(64)}`
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const key = (await derive(password, salt, 64, SCRYPT)) as Buffer
  return `${salt}:${key.toString('hex')}`
}
export async function verifiesPassword(password: string, stored = DUMMY) {
  const [salt, digest] = stored.split(':')
  const key = (await derive(password, salt!, 64, SCRYPT)) as Buffer
  return timingSafeEqual(key, Buffer.from(digest!, 'hex'))
}

/** Nginx appends $remote_addr; the app ports bind only 127.0.0.1 in deploy-plan.ts.
 * Never trust the first XFF element, which the visitor can choose. Missing or
 * malformed addresses share one bucket, including direct local requests. */
function clientIp(request: Request) {
  const last = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
  return last && isIP(last) ? last : 'local'
}

export function allowEmailAttempt(
  db: DatabaseSync,
  request: Request,
  email: string,
  secret: string,
  now: number,
) {
  const keys = [`email:${email}`, `ip:${clientIp(request)}`].map((value) =>
    createHmac('sha256', secret).update(value).digest('hex'),
  )
  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare('DELETE FROM email_rate_limits WHERE expires_at <= ?').run(now)
    const blocked = keys.some(
      (key) =>
        Number(
          db
            .prepare(
              'SELECT attempts FROM email_rate_limits WHERE key_hash = ?',
            )
            .get(key)?.attempts ?? 0,
        ) >= 10,
    )
    if (!blocked)
      for (const key of keys)
        db.prepare(`INSERT INTO email_rate_limits VALUES (?, 1, ?)
      ON CONFLICT(key_hash) DO UPDATE SET attempts = attempts + 1`).run(
          key,
          now + 15 * 60_000,
        )
    db.exec('COMMIT')
    return !blocked
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export async function emailAccount(
  db: DatabaseSync,
  form: URLSearchParams,
  register: boolean,
  now: number,
): Promise<number | string> {
  const email = form.get('email')?.trim().toLowerCase() ?? ''
  const password = form.get('password') ?? ''
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    password.length > 1024
  )
    return 'Confira o e-mail e a senha.'
  const existing = db
    .prepare(
      'SELECT account_id, password_hash FROM email_credentials WHERE email = ?',
    )
    .get(email)
  if (!register) {
    const valid = await verifiesPassword(
      password,
      typeof existing?.password_hash === 'string'
        ? existing.password_hash
        : undefined,
    )
    return valid && existing
      ? Number(existing.account_id)
      : 'E-mail ou senha incorretos.'
  }
  if (password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
  const nickname = form.get('nickname')?.trim() ?? ''
  const key = nickname
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
  if (
    nickname.length < 2 ||
    nickname.length > 40 ||
    /[\p{C}<>]/u.test(nickname) ||
    form.get('adult') !== 'on' ||
    form.get('rules') !== 'on'
  )
    return 'Escolha um apelido de 2 a 40 caracteres, declare ter 18 anos ou mais e aceite as regras.'
  const passwordHash = await hashPassword(password)
  return registerAccount(db, email, passwordHash, nickname, key, now)
}

function registerAccount(
  db: DatabaseSync,
  email: string,
  passwordHash: string,
  nickname: string,
  key: string,
  now: number,
): number | string {
  db.exec('BEGIN IMMEDIATE')
  try {
    if (
      db.prepare('SELECT 1 FROM email_credentials WHERE email = ?').get(email)
    ) {
      db.exec('ROLLBACK')
      return 'Esse e-mail já tem conta. Use “Esqueci minha senha” para recuperar o acesso.'
    }
    if (
      key === 'leitor removido' ||
      db.prepare('SELECT 1 FROM accounts WHERE nickname_key = ?').get(key)
    ) {
      db.exec('ROLLBACK')
      return 'Esse apelido já está em uso. Escolha outro.'
    }
    const id = randomInt(1, 2 ** 48 - 1)
    db.prepare(
      "INSERT INTO accounts (id, nickname, nickname_key, accepted_at, rules_version) VALUES (?, ?, ?, ?, '1')",
    ).run(id, nickname, key, now)
    db.prepare('INSERT INTO email_credentials VALUES (?, ?, ?)').run(
      id,
      email,
      passwordHash,
    )
    db.exec('COMMIT')
    return id
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
