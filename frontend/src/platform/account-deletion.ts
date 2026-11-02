// What deleting an account does to the database (ADR 0048). Works on a
// connection `accounts.ts` opened, after it checked who is asking.
import type { DatabaseSync } from 'node:sqlite'
import { transaction } from './transaction'

/** The word the form asks to be typed, whatever a phone keyboard did to it. */
export const confirmsDeletion = (typed: string | null) =>
  typed?.trim().toUpperCase() === 'EXCLUIR'

/** Each table that points at an account cascades, and `public_comments` goes
 * to "leitor removido" by its `SET NULL`; deleting by default therefore removes
 * the comments first. Their replies, history and reports follow them, also a
 * reply another reader wrote, as when an author deletes a comment. Reports this
 * account sent go with it, and a comment they hid stays hidden: `hidden` only
 * changes by the curator's decision. */
export function deleteAccount(
  db: DatabaseSync,
  accountId: number,
  keepComments: boolean,
) {
  transaction(db, () => {
    if (!keepComments)
      db.prepare('DELETE FROM public_comments WHERE account_id = ?').run(
        accountId,
      )
    db.prepare('DELETE FROM accounts WHERE id = ?').run(accountId)
  })
}
