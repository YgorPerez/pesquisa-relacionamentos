// Reports and the curator's decisions on a Comentário público (ADR 0047). Each
// function works on a connection `public-comments.ts` opened, after that module
// checked who is asking. No query here reads `google_sub`, and what the curator
// sees never says who reported.
import type { DatabaseSync, SQLOutputValue } from 'node:sqlite'
import type {
  CuratorComment,
  CuratorDesk,
} from '#/content/public-comment-record'

const REPORTS_TO_HIDE = 3
const REPORTS_PER_HOUR = 20
const PAGE_SIZE = 50

export const HOUR = 3_600_000

/** The name of a comment whose account is gone (ADR 0048). */
export const REMOVED_READER = 'leitor removido'

/** `CURATOR_GOOGLE_SUB` names the curator; unset, nobody is. */
export const isCuratorSubject = (subject: unknown, curator?: string) =>
  Boolean(curator) && subject === curator

/** A comment `c` that readers see: not hidden, nor a reply to a hidden one. */
export const SHOWN_COMMENT = `c.hidden = 0 AND (c.parent_id IS NULL OR EXISTS
  (SELECT 1 FROM public_comments p WHERE p.id = c.parent_id AND p.hidden = 0))`

/** A refusal the reader can be told about. Its message is PT-BR. */
export class PublicCommentRefusal extends Error {}

/** What the curator's notice names. */
export type ReportedComment = { id: number; path: string }

const unavailable = () =>
  new PublicCommentRefusal('Este comentário não está disponível.')

/** Records one account's report, hiding the comment at the third that is still
 * open. Returns the comment when this report must tell the curator: the claim
 * is written with the report and never given back, so a failed or lost notice
 * cannot be sent twice (the curator's page says it did not go out). Reporting
 * again is a no-op, also after a restore: one account counts once per comment. */
export function recordReport(
  db: DatabaseSync,
  commentId: number,
  accountId: number,
  at: number,
): ReportedComment | null {
  const comment = db
    .prepare(
      `SELECT c.path, c.account_id FROM public_comments c
      WHERE c.id = ? AND ${SHOWN_COMMENT}`,
    )
    .get(commentId)
  if (!comment) throw unavailable()
  if (comment.account_id === accountId)
    throw new PublicCommentRefusal(
      'Você não pode denunciar o próprio comentário.',
    )
  if (
    db
      .prepare(
        'SELECT 1 FROM public_comment_reports WHERE comment_id = ? AND account_id = ?',
      )
      .get(commentId, accountId)
  )
    return null
  const spent = db
    .prepare(
      'SELECT count(*) AS n FROM public_comment_reports WHERE account_id = ? AND reported_at > ?',
    )
    .get(accountId, at - HOUR)!
  if (Number(spent.n) >= REPORTS_PER_HOUR)
    throw new PublicCommentRefusal(
      `Você chegou ao limite de ${REPORTS_PER_HOUR} denúncias por hora. Tente mais tarde.`,
    )
  db.prepare(
    'INSERT INTO public_comment_reports (comment_id, account_id, reported_at) VALUES (?, ?, ?)',
  ).run(commentId, accountId, at)
  db.prepare(
    `UPDATE public_comments SET hidden = 1 WHERE id = ? AND
      (SELECT count(*) FROM public_comment_reports WHERE comment_id = ? AND cleared_at IS NULL) >= ?`,
  ).run(commentId, commentId, REPORTS_TO_HIDE)
  const claimed = db
    .prepare(
      'UPDATE public_comments SET report_issue_claimed_at = ? WHERE id = ? AND report_issue_claimed_at IS NULL',
    )
    .run(at, commentId)
  return claimed.changes ? { id: commentId, path: String(comment.path) } : null
}

/** Keeps the number of the issue the notice opened, unless the curator closed
 * that round in the meantime. */
export function recordReportIssue(
  db: DatabaseSync,
  commentId: number,
  claimedAt: number,
  issue: number,
) {
  db.prepare(
    'UPDATE public_comments SET report_issue = ? WHERE id = ? AND report_issue_claimed_at = ?',
  ).run(issue, commentId, claimedAt)
}

/** The curator's "keep it up": the comment shows again and its reports stop
 * counting, so it takes three accounts that never reported it to hide it again
 * and the next report is a new round, with its own notice. */
export function restoreComment(db: DatabaseSync, id: number, at: number) {
  const restored = db
    .prepare(
      'UPDATE public_comments SET hidden = 0, report_issue_claimed_at = NULL, report_issue = NULL WHERE id = ?',
    )
    .run(id)
  if (!restored.changes) throw unavailable()
  db.prepare(
    'UPDATE public_comment_reports SET cleared_at = ? WHERE comment_id = ? AND cleared_at IS NULL',
  ).run(at, id)
}

/** Deletes the comment; its replies, reports and history go with it. */
export function removeComment(db: DatabaseSync, id: number) {
  if (!db.prepare('DELETE FROM public_comments WHERE id = ?').run(id).changes)
    throw unavailable()
}

const OPEN_REPORTS = `(SELECT count(*) FROM public_comment_reports r
  WHERE r.comment_id = c.id AND r.cleared_at IS NULL)`

const COMMENT_FIELDS = `c.id, c.parent_id, c.path, c.quote, c.body, c.created_at, c.edited_at,
  c.hidden, c.report_issue, c.report_issue_claimed_at, a.nickname, ${OPEN_REPORTS} AS reports
  FROM public_comments c LEFT JOIN accounts a ON a.id = c.account_id`

function curatorComment(
  db: DatabaseSync,
  row: Record<string, SQLOutputValue>,
): CuratorComment {
  return {
    id: Number(row.id),
    parentId: row.parent_id === null ? null : Number(row.parent_id),
    path: String(row.path),
    quote: String(row.quote),
    body: String(row.body),
    nickname: row.nickname === null ? REMOVED_READER : String(row.nickname),
    createdAt: Number(row.created_at),
    editedAt: row.edited_at === null ? null : Number(row.edited_at),
    hidden: row.hidden === 1,
    reports: Number(row.reports),
    issue: row.report_issue === null ? null : Number(row.report_issue),
    notifyFailed:
      row.report_issue_claimed_at !== null && row.report_issue === null,
    history: db
      .prepare(
        'SELECT body, replaced_at FROM public_comment_history WHERE comment_id = ? ORDER BY replaced_at DESC, id DESC',
      )
      .all(Number(row.id))
      .map((version) => ({
        body: String(version.body),
        replacedAt: Number(version.replaced_at),
      })),
  }
}

/** What waits for a decision (hidden, or with a report still open), whatever
 * its age, and one page of everything else, newest first. */
export function readDesk(db: DatabaseSync, before?: number): CuratorDesk {
  const pending = db
    .prepare(
      `SELECT ${COMMENT_FIELDS} WHERE c.hidden = 1 OR ${OPEN_REPORTS} > 0 ORDER BY c.id DESC`,
    )
    .all()
  const recent = db
    .prepare(
      `SELECT ${COMMENT_FIELDS} WHERE c.hidden = 0 AND ${OPEN_REPORTS} = 0 AND c.id < ?
      ORDER BY c.id DESC LIMIT ?`,
    )
    .all(before ?? Number.MAX_SAFE_INTEGER, PAGE_SIZE + 1)
  const page = recent.slice(0, PAGE_SIZE)
  return {
    pending: pending.map((row) => curatorComment(db, row)),
    recent: page.map((row) => curatorComment(db, row)),
    before: recent.length > PAGE_SIZE ? Number(page.at(-1)!.id) : null,
  }
}
