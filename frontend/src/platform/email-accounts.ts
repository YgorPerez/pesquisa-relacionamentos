import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scrypt,
  timingSafeEqual,
} from 'node:crypto'
import { isIP } from 'node:net'
import type { DatabaseSync } from 'node:sqlite'
import { REMOVED_READER } from './public-comment-moderation'
import { transaction } from './transaction'

const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT, (error, key) => {
      if (error) reject(error)
      else resolve(key)
    })
  })
const DUMMY = `${'00'.repeat(16)}:${'00'.repeat(64)}`
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const key = await derive(password, salt)
  return `${salt}:${key.toString('hex')}`
}
export async function verifiesPassword(password: string, stored = DUMMY) {
  const [salt, digest] = stored.split(':')
  const key = await derive(password, salt!)
  return timingSafeEqual(key, Buffer.from(digest!, 'hex'))
}

/** What the database keeps of a session, a reset or a confirmation token. */
export const tokenHash = (token: string) =>
  createHash('sha256').update(token).digest('base64url')
export const normalizeEmail = (email: string | null) =>
  email?.trim().toLowerCase() ?? ''
export const isEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
export const validPassword = (password: string) =>
  password.length >= 8 && password.length <= 1024

/** The largest range `randomInt` takes, and still a safe integer in JSON. */
export const newAccountId = () => randomInt(1, 2 ** 48 - 1)
/** What makes two nicknames the same to a reader: case, in any alphabet (SQLite's
 * `lower` knows only ASCII), Unicode forms and repeated spaces (ADR 0045). */
const nicknameKey = (nickname: string) =>
  nickname.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim()
/** The nickname a form asks for, with its declarations, or `null`. */
export function nicknameFrom(form: URLSearchParams) {
  const nickname = form.get('nickname')?.trim() ?? ''
  if (
    nickname.length < 2 ||
    nickname.length > 40 ||
    /[\p{C}<>]/u.test(nickname) ||
    form.get('adult') !== 'on' ||
    form.get('rules') !== 'on'
  )
    return null
  const key = nicknameKey(nickname)
  return { nickname, key, free: key !== REMOVED_READER }
}

/** Nginx appends $remote_addr; the app ports bind only 127.0.0.1 in deploy-plan.ts.
 * Never trust the first XFF element, which the visitor can choose. Missing or
 * malformed addresses share one bucket, including direct local requests. */
function clientIp(request: Request) {
  const last = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
  return last && isIP(last) ? last : 'local'
}

/** Each form counts apart: a stranger's wrong logins, from any IP, must not spend
 * the reset of the address they typed (ADR 0045). */
type AttemptPurpose =
  | 'login'
  | 'register'
  | 'reset'
  | 'add-email'
  | 'change-password'
const ATTEMPTS = 10
/** Each reset that counts mails the address, so three reach a stranger at most, and
 * whoever spends them has left the owner a link in the inbox. */
const RESETS_PER_EMAIL = 3
const bucket = (value: string, secret: string) =>
  createHmac('sha256', secret).update(value).digest('hex')

export function allowEmailAttempt(
  db: DatabaseSync,
  request: Request,
  email: string,
  purpose: AttemptPurpose,
  secret: string,
  now: number,
) {
  const limits = [
    [
      bucket(`${purpose}:email:${email}`, secret),
      purpose === 'reset' ? RESETS_PER_EMAIL : ATTEMPTS,
    ],
    [bucket(`${purpose}:ip:${clientIp(request)}`, secret), ATTEMPTS],
  ] as const
  return transaction(db, () => {
    db.prepare('DELETE FROM email_rate_limits WHERE expires_at <= ?').run(now)
    const blocked = limits.some(
      ([key, limit]) =>
        Number(
          db
            .prepare(
              'SELECT attempts FROM email_rate_limits WHERE key_hash = ?',
            )
            .get(key)?.attempts ?? 0,
        ) >= limit,
    )
    if (!blocked)
      for (const [key] of limits)
        db.prepare(`INSERT INTO email_rate_limits VALUES (?, 1, ?)
      ON CONFLICT(key_hash) DO UPDATE SET attempts = attempts + 1`).run(
          key,
          now + 15 * 60_000,
        )
    return !blocked
  })
}

/** Whoever just proved the mailbox should not wait out a stranger's wrong logins. */
export const clearLoginAttempts = (
  db: DatabaseSync,
  email: string,
  secret: string,
) =>
  db
    .prepare('DELETE FROM email_rate_limits WHERE key_hash = ?')
    .run(bucket(`login:email:${email}`, secret))

/** Who the password opened, and the stored hash it was checked against. */
type EmailAccount =
  | { accountId: number; passwordHash: string }
  | { refusal: string }

export async function emailAccount(
  db: DatabaseSync,
  form: URLSearchParams,
  register: boolean,
  now: number,
): Promise<EmailAccount> {
  const email = normalizeEmail(form.get('email'))
  const password = form.get('password') ?? ''
  if (!isEmail(email) || password.length > 1024)
    return { refusal: 'Confira o e-mail e a senha.' }
  if (!register) return login(db, email, password)
  if (!validPassword(password))
    return { refusal: 'A senha precisa ter pelo menos 8 caracteres.' }
  const nickname = nicknameFrom(form)
  if (!nickname)
    return {
      refusal:
        'Escolha um apelido de 2 a 40 caracteres, declare ter 18 anos ou mais e aceite as regras.',
    }
  const passwordHash = await hashPassword(password)
  return registerAccount(db, email, passwordHash, nickname, now)
}

async function login(
  db: DatabaseSync,
  email: string,
  password: string,
): Promise<EmailAccount> {
  const existing = db
    .prepare(
      'SELECT account_id, password_hash FROM email_credentials WHERE email = ?',
    )
    .get(email)
  const stored =
    typeof existing?.password_hash === 'string'
      ? existing.password_hash
      : undefined
  const valid = await verifiesPassword(password, stored)
  return valid && existing && stored
    ? { accountId: Number(existing.account_id), passwordHash: stored }
    : { refusal: 'E-mail ou senha incorretos.' }
}

function registerAccount(
  db: DatabaseSync,
  email: string,
  passwordHash: string,
  { nickname, key, free }: NonNullable<ReturnType<typeof nicknameFrom>>,
  now: number,
): EmailAccount {
  return transaction(db, () => {
    if (
      db.prepare('SELECT 1 FROM email_credentials WHERE email = ?').get(email)
    )
      return {
        refusal:
          'Esse e-mail já tem conta. Use “Esqueci minha senha” para recuperar o acesso.',
      }
    if (
      !free ||
      db.prepare('SELECT 1 FROM accounts WHERE nickname_key = ?').get(key)
    )
      return { refusal: 'Esse apelido já está em uso. Escolha outro.' }
    const id = newAccountId()
    db.prepare(
      "INSERT INTO accounts (id, nickname, nickname_key, accepted_at, rules_version) VALUES (?, ?, ?, ?, '1')",
    ).run(id, nickname, key, now)
    // `confirmed` stays 0: nobody has proved this mailbox yet.
    db.prepare(
      'INSERT INTO email_credentials (account_id, email, password_hash) VALUES (?, ?, ?)',
    ).run(id, email, passwordHash)
    return { accountId: id, passwordHash }
  })
}
