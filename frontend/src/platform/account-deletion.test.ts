// Deleting an account, through the request a reader's form sends. These tests
// read the database on purpose: "no row is left" has no other witness.
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { createAccounts } from './accounts'
import { createPublicComments } from './public-comments'

const SUB = 'sub-of-the-leaving-reader'
const NICKNAME = 'Apelido-De-Quem-Sai'
const PENDING_EMAIL = 'waiting-for-its-link@example.org'
const LEAVING = 7001
const OTHER = 7002

/** Every table and what deleting an account does to it. A new table fails the
 * test below until someone decides this for it, and seeds it here. */
const TABLES: Readonly<Record<string, string>> = {
  accounts: 'the row goes',
  account_sessions: 'cascades: every device is signed out',
  account_sync: 'cascades',
  public_comments: 'deleted, or kept with account_id null',
  public_comment_history: 'follows its comment',
  public_comment_sends: 'cascades',
  public_comment_reports: 'cascades, and follows its comment',
  oauth_attempts: 'has no account',
  email_credentials: 'cascades: email and password hash go',
  password_resets: 'cascades: reset token hash goes',
  email_links: 'cascades: the address waiting for its link goes',
  google_link_attempts: 'cascades: a link under way dies with the account',
  email_rate_limits:
    'has no account; keyed hashes expire and are erased hourly',
  schema_migrations: 'has no account',
}

let folder: string
let path: string
/** A plain connection: the app has already migrated the file (`beforeEach`). */
function database() {
  const db = new DatabaseSync(path)
  db.exec('PRAGMA foreign_keys = ON')
  return db
}
const accounts = () =>
  createAccounts({
    databasePath: path,
    origin: 'https://example.org',
    clientId: 'client',
    clientSecret: 'secret',
  })
const tokenHash = (token: string) =>
  createHash('sha256').update(token).digest('base64url')

function addAccount(db: DatabaseSync, id: number, sub: string, nick: string) {
  db.prepare(
    'INSERT INTO accounts (id, google_sub, nickname, accepted_at, rules_version) VALUES (?, ?, ?, 1, ?)',
  ).run(id, sub, nick, '1')
}
function addComment(
  db: DatabaseSync,
  id: number,
  accountId: number,
  parentId: number | null = null,
  hidden = 0,
) {
  db.prepare(
    `INSERT INTO public_comments (id, account_id, path, quote, body, parent_id, created_at, hidden)
    VALUES (?, ?, '/guia', 'o trecho', ?, ?, 1, ?)`,
  ).run(id, accountId, `texto ${id}`, parentId, hidden)
}
function addReport(db: DatabaseSync, commentId: number, accountId: number) {
  db.prepare(
    'INSERT INTO public_comment_reports (comment_id, account_id, reported_at) VALUES (?, ?, 1)',
  ).run(commentId, accountId)
}

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'deletion-'))
  path = join(folder, 'app.sqlite')
  // Any lookup with a session cookie opens, and so migrates, the database.
  accounts().current(
    new Request('https://example.org/', {
      headers: { cookie: '__Host-session=nobody' },
    }),
  )
  const db = database()
  addAccount(db, LEAVING, SUB, NICKNAME)
  addAccount(db, OTHER, 'sub-other', 'Outra')
  db.prepare('INSERT INTO password_resets VALUES (?, ?, ?)').run(
    LEAVING,
    tokenHash('reset-token'),
    Date.now() + 60_000,
  )
  db.prepare('INSERT INTO email_links VALUES (?, ?, ?, ?, ?)').run(
    LEAVING,
    PENDING_EMAIL,
    'hash',
    tokenHash('link-token'),
    Date.now() + 60_000,
  )
  db.prepare('INSERT INTO google_link_attempts VALUES (?, ?, ?, ?, ?, ?)').run(
    tokenHash('state'),
    tokenHash('browser'),
    'verifier',
    LEAVING,
    tokenHash('phone'),
    Date.now() + 60_000,
  )
  addAccount(db, 7003, 'sub-third', 'Terceira')
  addAccount(db, 7004, 'sub-fourth', 'Quarta')
  for (const device of ['phone', 'laptop'])
    db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
      tokenHash(device),
      LEAVING,
      Date.now() + 60_000,
    )
  db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
    tokenHash('other-device'),
    OTHER,
    Date.now() + 60_000,
  )
  db.prepare(
    `INSERT INTO account_sync (account_id, consent, data) VALUES (?, 1, '{"note:1":{"at":1,"value":{"text":"nota íntima"}}}')`,
  ).run(LEAVING)
  db.prepare(
    'INSERT INTO account_sync (account_id, consent) VALUES (?, 1)',
  ).run(OTHER)
  db.prepare('INSERT INTO public_comment_sends VALUES (?, 1)').run(LEAVING)
  db.prepare('INSERT INTO public_comment_sends VALUES (?, 1)').run(OTHER)
  // The leaving reader's comment, edited once, with another reader's reply and
  // report; and the leaving reader's reply and report on someone else's.
  addComment(db, 10, LEAVING)
  addComment(db, 11, OTHER, 10)
  db.prepare(
    `INSERT INTO public_comment_history (comment_id, body, replaced_at) VALUES (10, 'versão antiga', 1)`,
  ).run()
  addReport(db, 10, OTHER)
  addComment(db, 20, OTHER)
  addComment(db, 21, LEAVING, 20)
  addReport(db, 20, LEAVING)
  db.close()
})
afterEach(() => {
  rmSync(folder, { recursive: true, force: true })
})

const submit = (
  form: Record<string, string>,
  { cookie = '__Host-session=phone', origin = 'https://example.org' } = {},
) =>
  accounts().handle(
    new Request('https://example.org/auth/delete', {
      method: 'POST',
      headers: { cookie, origin },
      body: new URLSearchParams(form),
    }),
  )
const eraseEverything = () => submit({ confirm: 'EXCLUIR' })
const keepComments = () => submit({ confirm: 'EXCLUIR', 'keep-comments': 'on' })

const rowsOf = (table: string) => {
  const db = database()
  try {
    return db.prepare(`SELECT * FROM ${table}`).all()
  } finally {
    db.close()
  }
}
const commentIds = () => rowsOf('public_comments').map((row) => row.id)

function expectNothingTiesTheDatabaseToTheReader() {
  const leftovers: string[] = []
  const db = database()
  try {
    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
      .all()
      .map((row) => String(row.name))
    for (const table of tables) {
      const text = JSON.stringify(db.prepare(`SELECT * FROM ${table}`).all())
      if ([SUB, NICKNAME, PENDING_EMAIL].some((value) => text.includes(value)))
        leftovers.push(table)
      const columns = db
        .prepare(`PRAGMA foreign_key_list(${table})`)
        .all()
        .filter((key) => key.table === 'accounts')
        .map((key) => String(key.from))
      for (const column of columns)
        if (
          db.prepare(`SELECT 1 FROM ${table} WHERE ${column} = ?`).get(LEAVING)
        )
          leftovers.push(`${table}.${column}`)
    }
    expect(leftovers).toEqual([])
  } finally {
    db.close()
  }
}

test('every table in the database has been thought about', () => {
  const db = database()
  const names = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
    .all()
    .map((row) => String(row.name))
  db.close()
  expect(names.sort()).toEqual(Object.keys(TABLES).sort())
})

test('a table can only point at an account in a way deletion reaches', () => {
  const db = database()
  const pointers = Object.keys(TABLES).flatMap((table) =>
    db
      .prepare(`PRAGMA foreign_key_list(${table})`)
      .all()
      .filter((key) => key.table === 'accounts')
      .map((key) => `${table}:${String(key.on_delete)}`),
  )
  db.close()
  expect(pointers.sort()).toEqual([
    'account_sessions:CASCADE',
    'account_sync:CASCADE',
    'email_credentials:CASCADE',
    'email_links:CASCADE',
    'google_link_attempts:CASCADE',
    'password_resets:CASCADE',
    'public_comment_reports:CASCADE',
    'public_comment_sends:CASCADE',
    'public_comments:SET NULL',
  ])
})

test('by default everything goes, and other readers keep what is theirs', async () => {
  const response = (await eraseEverything())!
  expect(response.status).toBe(303)
  expectNothingTiesTheDatabaseToTheReader()
  expect(rowsOf('accounts').map((row) => row.id)).not.toContain(LEAVING)
  // Their comment goes with its reply from another reader, as when an author
  // deletes it; their reply on someone else's comment goes too.
  expect(commentIds()).toEqual([20])
  expect(rowsOf('public_comment_history')).toEqual([])
  expect(rowsOf('public_comment_reports')).toEqual([])
  expect(rowsOf('public_comment_sends').map((row) => row.account_id)).toEqual([
    OTHER,
  ])
  expect(rowsOf('account_sync').map((row) => row.account_id)).toEqual([OTHER])
  expect(JSON.stringify(rowsOf('account_sync'))).not.toContain('nota íntima')
})

test('keeping the comments leaves them as "leitor removido", with history and quotes, tied to nobody', async () => {
  expect((await keepComments())!.status).toBe(303)
  expectNothingTiesTheDatabaseToTheReader()
  expect(commentIds()).toEqual([10, 11, 20, 21])
  expect(rowsOf('public_comment_history')).toHaveLength(1)
  const kept = rowsOf('public_comments').filter((row) => row.id === 10)[0]!
  expect(kept).toMatchObject({ account_id: null, quote: 'o trecho' })
  // Their own report goes; the one someone else made on their comment stays.
  expect(rowsOf('public_comment_reports').map((row) => row.comment_id)).toEqual(
    [10],
  )
  const shown = createPublicComments({ databasePath: path }).list('/guia')
  expect(shown.find((comment) => comment.id === 10)?.nickname).toBe(
    'leitor removido',
  )
  expect(JSON.stringify(rowsOf('account_sync'))).not.toContain('nota íntima')
})

test('the deleted text does not linger in the free space of the database file', async () => {
  await eraseEverything()
  const db = database()
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)')
  db.close()
  const file = readFileSync(path).toString()
  expect(file).not.toContain(SUB)
  expect(file).not.toContain(PENDING_EMAIL)
  expect(file).not.toContain('nota íntima')
})

test('a comment hidden by three reports stays hidden when one of the reporters leaves', async () => {
  const db = database()
  addComment(db, 30, OTHER, null, 1)
  addReport(db, 30, LEAVING)
  addReport(db, 30, 7003)
  addReport(db, 30, 7004)
  db.close()
  await eraseEverything()
  const store = createPublicComments({
    databasePath: path,
    current: () => ({ id: OTHER, googleSub: 'curator', nickname: 'Outra' }),
    curator: () => 'curator',
  })
  expect(store.list('/guia').map((comment) => comment.id)).not.toContain(30)
  const desk = store.curatorDesk(new Request('https://example.org/curadoria'))!
  expect(desk.pending.find((comment) => comment.id === 30)).toMatchObject({
    hidden: true,
    reports: 2,
  })
})

test('every device is signed out and this browser loses its cookie', async () => {
  const response = (await eraseEverything())!
  expect(response.headers.getSetCookie().join('\n')).toMatch(
    /__Host-session=; .*Max-Age=0/,
  )
  for (const device of ['phone', 'laptop'])
    expect(
      accounts().current(
        new Request('https://example.org/', {
          headers: { cookie: `__Host-session=${device}` },
        }),
      ),
    ).toBeNull()
  expect(
    accounts().current(
      new Request('https://example.org/', {
        headers: { cookie: '__Host-session=other-device' },
      }),
    )?.id,
  ).toBe(OTHER)
})

test('a request without the typed confirmation deletes nothing', async () => {
  const forms: Record<string, string>[] = [
    {},
    { confirm: 'sim' },
    { confirm: '' },
  ]
  for (const form of forms) expect((await submit(form))!.status).toBe(400)
  expect(rowsOf('accounts').map((row) => row.id)).toContain(LEAVING)
})

test('the confirmation tolerates how a phone keyboard types the word', async () => {
  expect((await submit({ confirm: ' excluir ' }))!.status).toBe(303)
})

test('another site cannot ask for it, nor anyone without a session', async () => {
  expect(
    (await submit({ confirm: 'EXCLUIR' }, { origin: 'https://evil.org' }))!
      .status,
  ).toBe(403)
  expect((await submit({ confirm: 'EXCLUIR' }, { cookie: '' }))!.status).toBe(
    401,
  )
  expect(rowsOf('accounts').map((row) => row.id)).toContain(LEAVING)
})

test('an account that never finished its nickname can be deleted too', async () => {
  const db = database()
  db.prepare('UPDATE accounts SET nickname = NULL WHERE id = ?').run(LEAVING)
  db.close()
  expect((await eraseEverything())!.status).toBe(303)
  expect(rowsOf('accounts').map((row) => row.id)).not.toContain(LEAVING)
})

test('the page learns once that the account was deleted, from the server and not from a link', async () => {
  const response = (await eraseEverything())!
  const notice = response.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith('__Host-deleted='))!
  const after = new Request('https://example.org/conta', {
    headers: { cookie: notice.split(';')[0]! },
  })
  expect(accounts().deletionNoticeCookie(after)).toMatch(
    /__Host-deleted=; .*Max-Age=0/,
  )
  expect(
    accounts().deletionNoticeCookie(new Request('https://example.org/conta')),
  ).toBeNull()
})
