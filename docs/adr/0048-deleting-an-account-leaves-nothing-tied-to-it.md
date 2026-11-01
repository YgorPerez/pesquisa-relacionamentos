# 0048: Deleting an account leaves nothing tied to it

## Context

Spec #556 decided that deleting an account removes everything by default, with the option of keeping public comments as "leitor removido". Several consequences are easy to get wrong later.

## Decision

- **Everything hangs off the `accounts` row.** Every table that points at an account cascades, except `public_comments`, whose `SET NULL` is "leitor removido". So the default deletes the reader's comments first, then the row. `account-deletion.test.ts` lists every table and fails on a new one until someone decides what deletion does to it.
- **Other readers' replies follow the parent.** Deleting by default removes replies under the reader's comments, the same rule as an author deleting a comment. Keeping a thread alive under a vanished parent would need a second kind of comment, and the reader who asks for erasure wins. Keeping the comments keeps the replies.
- **Reports the reader sent go, and hiding stays.** `hidden` changes only by the curator's decision, never by counting again, so a comment hidden by three reports stays hidden with two. A comment still up loses that report; if it was the only one, it leaves the curator's queue. The issue that report opened stays, since it holds only links.
- **Account ids are random and never reused.** SQLite reuses the highest rowid after a delete, and a device holds its account's id as its sync binding. With a reused id, a device still joined to a deleted account could upload the deleted data to a later account without asking. A random 48-bit id needs no record of the deleted account, which a high-water mark or a tombstone would keep. Coming back with the same Google subject is a new account.
- **Device data stays on the device.** It was the reader's before any account, and the site cannot reach the other devices anyway. The deleting browser drops its binding and sync journal. Another joined device keeps both until it joins a new account, which asks first. The one-minute `deleted` cookie tells `/conta` to do this. A query parameter would let a link make a device forget its sync.
- **The form works without JavaScript**: a typed word, checked by the browser and again by the server. Without JavaScript the "keep" checkbox does not toggle, which leaves the default.
- **`secure_delete` on the deleting connection**, so the text does not sit in free pages that the daily snapshot copies.

## Consequences

A deleted account survives in backups taken before it, and `docs/deploy.md` sets no retention, so `/privacidade` says that no period is defined. Restoring an old backup can bring a deleted account back, and nothing replays deletions after a restore. Private Comentários already sent stay with the curator because they never had an account to delete. After deletion, nobody can edit or delete a comment kept as "leitor removido" except the curator.
