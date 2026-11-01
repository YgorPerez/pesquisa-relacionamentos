import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import {
  existsSync,
  linkSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { backup, DatabaseSync } from 'node:sqlite'
import { openDatabase } from '../src/platform/database.ts'

// Format v1: magic, 12-byte nonce, 16-byte authentication tag, ciphertext.
const MAGIC = Buffer.from('TEMESTUDO-BACKUP-1\n')

async function main() {
  const [mode, path] = process.argv.slice(2)
  if (!path)
    throw new Error(
      'Usage: database-maintenance.ts init|backup|restore <database>',
    )
  if (mode === 'init') {
    openDatabase(path).close()
    return
  }
  const secret = process.env.DATABASE_BACKUP_KEY ?? ''
  if (!/^[a-f0-9]{64}$/i.test(secret))
    throw new Error('DATABASE_BACKUP_KEY must be 32 random bytes in hex.')
  const key = Buffer.from(secret, 'hex')
  const work = mkdtempSync(
    join(mode === 'restore' ? dirname(path) : tmpdir(), '.database-'),
  )
  const snapshot = join(work, 'snapshot.sqlite')
  try {
    if (mode === 'backup') {
      if (!existsSync(path))
        throw new Error('The source database does not exist.')
      const db = new DatabaseSync(path, { readOnly: true })
      try {
        await backup(db, snapshot)
      } finally {
        db.close()
      }
      const nonce = randomBytes(12)
      const cipher = createCipheriv('aes-256-gcm', key, nonce)
      cipher.setAAD(MAGIC)
      const encrypted = Buffer.concat([
        cipher.update(readFileSync(snapshot)),
        cipher.final(),
      ])
      process.stdout.write(
        Buffer.concat([MAGIC, nonce, cipher.getAuthTag(), encrypted]),
      )
    } else if (mode === 'restore') {
      if (
        existsSync(path) ||
        existsSync(`${path}-wal`) ||
        existsSync(`${path}-shm`)
      )
        throw new Error(
          'Restore needs a new database path, without WAL or SHM files.',
        )
      const bytes = readFileSync(0)
      const start = MAGIC.length
      if (!bytes.subarray(0, start).equals(MAGIC))
        throw new Error('Unknown backup format.')
      const decipher = createDecipheriv(
        'aes-256-gcm',
        key,
        bytes.subarray(start, start + 12),
      )
      decipher.setAAD(MAGIC)
      decipher.setAuthTag(bytes.subarray(start + 12, start + 28))
      writeFileSync(
        snapshot,
        Buffer.concat([
          decipher.update(bytes.subarray(start + 28)),
          decipher.final(),
        ]),
        { mode: 0o600 },
      )
      const restored = new DatabaseSync(snapshot, { readOnly: true })
      try {
        const results = restored.prepare('PRAGMA integrity_check').all()
        if (results.length !== 1 || results[0].integrity_check !== 'ok')
          throw new Error('Restored database failed integrity_check.')
      } finally {
        restored.close()
      }
      // Atomic publication that refuses to replace an existing file.
      linkSync(snapshot, path)
    } else throw new Error('Unknown maintenance command.')
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

if (import.meta.main) await main()
