import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vite-plus/test'
import { openDatabase } from './database.ts'

it('migrates once and shares committed data across connections and reopen', () => {
  const folder = mkdtempSync(join(tmpdir(), 'database-'))
  const path = join(folder, 'app.sqlite')
  const migrations = ['CREATE TABLE example (value TEXT NOT NULL)']
  try {
    const first = openDatabase(path, migrations)
    first.prepare('INSERT INTO example VALUES (?)').run('kept')
    const second = openDatabase(path, migrations)
    expect(second.prepare('SELECT value FROM example').get()).toEqual({
      value: 'kept',
    })
    first.close()
    second.close()
    const reopened = openDatabase(path, migrations)
    expect(reopened.prepare('SELECT value FROM example').get()).toEqual({
      value: 'kept',
    })
    reopened.close()
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})

it('a database that already holds equal nicknames still opens, and the oldest keeps the name', () => {
  const folder = mkdtempSync(join(tmpdir(), 'nicknames-'))
  const path = join(folder, 'app.sqlite')
  try {
    const before = openDatabase(path)
    before.exec(`DROP INDEX accounts_nickname_key;
      ALTER TABLE accounts DROP COLUMN nickname_key;
      INSERT INTO accounts (id, google_sub, nickname) VALUES (1, 'a', 'Ana'), (2, 'b', 'ANA'), (3, 'c', 'Bia');
      DELETE FROM schema_migrations WHERE version = 5;`)
    before.close()
    const after = openDatabase(path)
    expect(
      after
        .prepare('SELECT id, nickname_key FROM accounts ORDER BY id')
        .all()
        .map((row) => ({ ...row })),
    ).toEqual([
      { id: 1, nickname_key: 'ana' },
      { id: 2, nickname_key: null },
      { id: 3, nickname_key: 'bia' },
    ])
    after.close()
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})

it('rolls back a failed migration and refuses an edited migration', () => {
  const db = openDatabase(':memory:')
  expect(db.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 })
  db.close()
  const folder = mkdtempSync(join(tmpdir(), 'migrations-'))
  const path = join(folder, 'app.sqlite')
  try {
    expect(() =>
      openDatabase(path, ['CREATE TABLE example (id INTEGER)', 'INVALID SQL']),
    ).toThrow('syntax error')
    const recovered = openDatabase(path, ['CREATE TABLE example (id INTEGER)'])
    recovered.close()
    expect(() =>
      openDatabase(path, ['CREATE TABLE changed (id INTEGER)']),
    ).toThrow('changed after being applied')
    // An old image may reopen a database after a newer additive migration.
    openDatabase(path, []).close()
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})

it('adding email accounts preserves existing Google sessions and account data', () => {
  const folder = mkdtempSync(join(tmpdir(), 'email-migration-'))
  const path = join(folder, 'app.sqlite')
  try {
    const before = openDatabase(path)
    before.exec(`INSERT INTO accounts (id, google_sub, nickname) VALUES (123, 'kept-sub', 'Leitora');
      INSERT INTO account_sessions VALUES ('kept-session', 123, 9999999999999);
      INSERT INTO account_sync VALUES (123, 1, '{}');
      PRAGMA foreign_keys = OFF;
      CREATE TABLE old_accounts (id INTEGER PRIMARY KEY, google_sub TEXT NOT NULL UNIQUE,
        nickname TEXT, accepted_at INTEGER, rules_version TEXT, nickname_key TEXT) STRICT;
      INSERT INTO old_accounts SELECT * FROM accounts;
      DROP TABLE accounts;
      ALTER TABLE old_accounts RENAME TO accounts;
      CREATE UNIQUE INDEX accounts_nickname_key ON accounts(nickname_key);
      DROP TABLE email_credentials;
      DROP TABLE email_rate_limits;
      DELETE FROM schema_migrations WHERE version = 6;`)
    before.close()
    const after = openDatabase(path)
    expect(
      after.prepare('SELECT google_sub FROM accounts WHERE id = 123').get()
        ?.google_sub,
    ).toBe('kept-sub')
    expect(
      after
        .prepare(
          'SELECT token_hash FROM account_sessions WHERE account_id = 123',
        )
        .get()?.token_hash,
    ).toBe('kept-session')
    expect(
      after
        .prepare('SELECT consent FROM account_sync WHERE account_id = 123')
        .get()?.consent,
    ).toBe(1)
    expect(after.prepare('PRAGMA foreign_key_check').all()).toEqual([])
    after.close()
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})
