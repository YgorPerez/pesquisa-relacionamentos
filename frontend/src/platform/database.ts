import { createHash } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'

// Append migrations here. During blue/green both versions use the same file;
// only additive changes may ship while the previous image can still run.
const migrations: readonly string[] = [
  `CREATE TABLE accounts (id INTEGER PRIMARY KEY, google_sub TEXT NOT NULL UNIQUE,
    nickname TEXT, accepted_at INTEGER, rules_version TEXT) STRICT;
  CREATE TABLE account_sessions (token_hash TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL) STRICT;
  CREATE TABLE oauth_attempts (state_hash TEXT PRIMARY KEY, browser_hash TEXT NOT NULL,
    verifier TEXT NOT NULL, expires_at INTEGER NOT NULL) STRICT;`,
  `CREATE TABLE public_comments (
    id INTEGER PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    path TEXT NOT NULL, quote TEXT NOT NULL, body TEXT NOT NULL,
    parent_id INTEGER REFERENCES public_comments(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL, edited_at INTEGER,
    hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1))
  ) STRICT;
  CREATE INDEX public_comments_page ON public_comments(path, created_at);
  CREATE TABLE public_comment_history (
    id INTEGER PRIMARY KEY, comment_id INTEGER NOT NULL REFERENCES public_comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL, replaced_at INTEGER NOT NULL
  ) STRICT;
  CREATE TABLE public_comment_sends (
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    sent_at INTEGER NOT NULL
  ) STRICT;
  CREATE INDEX public_comment_rate ON public_comment_sends(account_id, sent_at);`,
]

/** Server-only callers own and close the connection. No database opens at import. */
export function openDatabase(
  path = process.env.DATABASE_PATH ?? '/data/app.sqlite',
  changes: readonly string[] = migrations,
) {
  const db = new DatabaseSync(path)
  try {
    db.exec(
      'PRAGMA busy_timeout = 10000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;',
    )
    db.exec('BEGIN IMMEDIATE')
    try {
      db.exec(
        'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, checksum TEXT NOT NULL) STRICT',
      )
      for (const [index, sql] of changes.entries()) {
        const version = index + 1
        const checksum = createHash('sha256').update(sql).digest('hex')
        const applied = db
          .prepare('SELECT checksum FROM schema_migrations WHERE version = ?')
          .get(version)
        if (applied && applied.checksum !== checksum)
          throw new Error(`Migration ${version} changed after being applied.`)
        if (!applied) {
          db.exec(sql)
          db.prepare('INSERT INTO schema_migrations VALUES (?, ?)').run(
            version,
            checksum,
          )
        }
      }
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    return db
  } catch (error) {
    db.close()
    throw error
  }
}
