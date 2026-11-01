import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vite-plus/test'
import { openDatabase } from '../src/platform/database.ts'

it('restores an encrypted online snapshot including committed WAL data, and rejects tampering and overwrite', () => {
  const folder = mkdtempSync(join(tmpdir(), 'restore-'))
  const source = join(folder, 'source.sqlite')
  const target = join(folder, 'restored.sqlite')
  const db = openDatabase(source, ['CREATE TABLE example (value TEXT)'])
  db.prepare('INSERT INTO example VALUES (?)').run('local restore evidence')
  const run = (mode: string, path: string, input?: Buffer) =>
    spawnSync(
      process.execPath,
      [join(import.meta.dirname, 'database-maintenance.ts'), mode, path],
      { input, env: { ...process.env, DATABASE_BACKUP_KEY: 'ab'.repeat(32) } },
    )
  try {
    const copy = run('backup', source)
    expect(copy.status).toBe(0)
    expect(copy.stdout.includes(Buffer.from('local restore evidence'))).toBe(
      false,
    )
    expect(run('restore', target, copy.stdout).status).toBe(0)
    const restored = openDatabase(target)
    expect(restored.prepare('SELECT value FROM example').get()).toEqual({
      value: 'local restore evidence',
    })
    restored.close()
    const before = readFileSync(target)
    expect(run('restore', target, copy.stdout).status).not.toBe(0)
    expect(readFileSync(target)).toEqual(before)
    const corrupt = Buffer.from(copy.stdout)
    corrupt[corrupt.length - 1] ^= 1
    expect(
      run('restore', join(folder, 'corrupt.sqlite'), corrupt).status,
    ).not.toBe(0)
  } finally {
    db.close()
    rmSync(folder, { recursive: true, force: true })
  }
})
