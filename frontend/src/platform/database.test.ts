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
