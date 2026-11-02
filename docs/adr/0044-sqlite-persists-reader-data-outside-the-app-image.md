# SQLite persists reader data outside the app image

Spec #556 adds Google login, public comments and synchronization between devices. GitHub issues remain the store for private comments (ADR 0043), but cannot provide the transactions and account ownership these features need.

## Decision

Use Node 24's built-in SQLite driver, with one database at `/data/app.sqlite` in the Docker volume `temestudo-data`. Both blue/green containers and rollback images mount that volume. The image initializes its migration ledger before starting the HTTP server; importing the database module opens nothing.

Server code opens a connection through `frontend/src/platform/database.ts`. The connection enables foreign keys, WAL and a ten-second busy timeout. Its ordered SQL migrations run under one immediate transaction and record SHA-256 checksums. Append migrations; never edit one already applied. A failed migration rolls back and prevents startup.

Rollback changes code, never schema or reader data. Migrations must remain compatible with the previous image while both can serve requests. Add tables and nullable/defaulted columns first; removing or changing existing columns needs a separate migration after the old image has retired. An older image accepts later migrations already in the ledger.

A host cron job takes a daily SQLite online snapshot, encrypts it with AES-256-GCM and uploads it through the AWS CLI to a private S3-compatible bucket. A random 32-byte key lives in a root-only host file, separate from the bucket. Keep an offline copy of the key. Backup credentials are never passed to the HTTP server or stored in GitHub secrets.

Restore authenticates the entire encrypted snapshot, runs SQLite's integrity check and publishes it only to a new path. It refuses an existing database or leftover WAL/SHM files. Recovery into the serving volume is a separate maintenance operation with both app containers stopped. See `docs/deploy.md` for commands and the local restore drill.

## Consequences

The VPS administrator can read synchronized data, including intimate notes. This is the risk accepted in #556; later tickets must disclose it before collecting data. SQLite supplies no encryption at rest on the VPS. Only the offsite copy is encrypted here.

The server remains a single VPS and a single writer at a time. A lost VPS can lose up to a day of data. A failed daily job needs operator attention; the operator checks cron logs and the bucket's newest object. The backup currently buffers a snapshot in memory, so database growth may require streaming encryption before the VPS runs out of memory.

The bucket account and its credentials are user-only setup. The implementation and local drill do not establish production backup coverage. Production must pass the same upload/download/restore procedure before the spec accepts reader data.
