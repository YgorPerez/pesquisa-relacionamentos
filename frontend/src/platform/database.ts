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
  `CREATE TABLE account_sync (account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    consent INTEGER NOT NULL CHECK (consent IN (0, 1)), data TEXT NOT NULL DEFAULT '{}') STRICT;`,
  `ALTER TABLE public_comments ADD COLUMN report_issue_claimed_at INTEGER;
  ALTER TABLE public_comments ADD COLUMN report_issue INTEGER;
  CREATE TABLE public_comment_reports (
    comment_id INTEGER NOT NULL REFERENCES public_comments(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    reported_at INTEGER NOT NULL, cleared_at INTEGER,
    PRIMARY KEY (comment_id, account_id)
  ) STRICT;
  CREATE INDEX public_comment_report_rate ON public_comment_reports(account_id, reported_at);`,
  // The app writes the key (`nicknameKey`, `accounts.ts`). Of nicknames already
  // equal, the oldest keeps it and the others stay as they are, keyless: opening
  // the database must not depend on what it holds.
  `ALTER TABLE accounts ADD COLUMN nickname_key TEXT;
  UPDATE accounts SET nickname_key = lower(nickname) WHERE nickname IS NOT NULL AND id =
    (SELECT min(other.id) FROM accounts other WHERE lower(other.nickname) = lower(accounts.nickname));
  CREATE UNIQUE INDEX accounts_nickname_key ON accounts(nickname_key);`,
  // Rebuild to allow accounts without a Google identity. Existing columns and
  // inserts remain compatible with the previous image during blue/green.
  `CREATE TABLE accounts_email_migration (id INTEGER PRIMARY KEY, google_sub TEXT UNIQUE,
    nickname TEXT, accepted_at INTEGER, rules_version TEXT, nickname_key TEXT) STRICT;
  INSERT INTO accounts_email_migration SELECT * FROM accounts;
  DROP TABLE accounts;
  ALTER TABLE accounts_email_migration RENAME TO accounts;
  CREATE UNIQUE INDEX accounts_nickname_key ON accounts(nickname_key);
  CREATE TABLE email_credentials (account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL) STRICT;
  CREATE TABLE email_rate_limits (key_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL,
    expires_at INTEGER NOT NULL) STRICT;`,
  `CREATE TABLE password_resets (
    account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL
  ) STRICT;`,
]

/** Server-only callers own and close the connection. No database opens at import.
 * The app's path comes from `serverEnv()`: this file imports nothing of the app,
 * because the image runs it alone (`scripts/database-maintenance.ts`). */
export function openDatabase(
  path: string,
  changes: readonly string[] = migrations,
) {
  const db = new DatabaseSync(path)
  try {
    db.exec(
      'PRAGMA busy_timeout = 10000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = OFF;',
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
      if (db.prepare('PRAGMA foreign_key_check').all().length)
        throw new Error('Migration left invalid account references.')
      db.exec('COMMIT; PRAGMA foreign_keys = ON')
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
