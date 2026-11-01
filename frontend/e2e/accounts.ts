// Accounts for the specs that need one, written straight to the spec's database:
// Google is `platform/accounts.test.ts`'s.
import { createHash, randomBytes } from 'node:crypto'
import type { BrowserContext } from '@playwright/test'
import { openDatabase } from '../src/platform/database.ts'

export const unique = () => randomBytes(6).toString('hex')

/** A database connection for the test to seed with. */
export function seed<T>(write: (db: ReturnType<typeof openDatabase>) => T): T {
  const db = openDatabase(process.env.E2E_DATABASE_PATH)
  try {
    return write(db)
  } finally {
    db.close()
  }
}

/** A finished account with a live session in `context`. */
export async function signIn(context: BrowserContext, googleSub = unique()) {
  const token = randomBytes(32).toString('base64url')
  const nickname = `Leitora ${unique()}`
  seed((db) => {
    const account = db
      .prepare(
        `INSERT INTO accounts (google_sub, nickname) VALUES (?, ?)
        ON CONFLICT (google_sub) DO UPDATE SET nickname = excluded.nickname
        RETURNING id`,
      )
      .get(googleSub, nickname)!
    db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
      createHash('sha256').update(token).digest('base64url'),
      account.id!,
      Date.now() + 3_600_000,
    )
  })
  await context.addCookies([
    {
      name: 'local-session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
  return nickname
}
