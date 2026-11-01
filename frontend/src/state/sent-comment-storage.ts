import { COMMENT_KINDS, type CommentKind } from '#/content/comment-kinds'
import {
  decodeKeptQuote,
  decodeQuoteList,
  isQuoteRecord,
  type KeptQuote,
} from './highlight-record'
import { notifyRemoved } from './storage-events'
import { stored } from './stored'
import type { CommentStatus } from '#/content/comment-status'

/** A sent Comentário, as `localStorage` keeps it. */
export interface SentComment extends KeptQuote {
  /** The page's title when it was sent. */
  readonly pageTitle: string
  /** The path, the section anchor and the Text Fragment, without the
   * origin, as a Grifo's. */
  readonly link: string
  /** The quote as the page showed it, one line per block. */
  readonly text: string
  readonly kind: CommentKind
  /** What the reader wrote. */
  readonly comment: string
  /** The issue's number in the private sources repo; made-up when the
   * anti-spam dropped the comment (#346). */
  readonly issue: number
  /** The key the send replied with, which edits the issue while it is
   * open (#442). A comment sent before it existed has none and cannot be
   * edited. */
  readonly editKey?: string
  /** When it was sent (ms since 1970). */
  readonly at: number
  readonly status?: CommentStatus
  readonly seenStatus?: CommentStatus
}

/** What the form gives once the server took the comment. */
export type NewSentComment = Omit<
  SentComment,
  'id' | 'changed' | 'at' | 'status' | 'seenStatus'
>

const validStatus = (raw: unknown): raw is CommentStatus =>
  raw === 'received' || raw === 'corrected' || raw === 'not-planned'

const validKey = (raw: unknown): raw is string =>
  typeof raw === 'string' && /^[\w-]{43}$/.test(raw)

function validComment(raw: unknown): SentComment | null {
  if (!isQuoteRecord(raw)) return null
  const quote = decodeKeptQuote(raw)
  if (!quote) return null
  const { kind, issue, comment } = raw
  if (typeof comment !== 'string' || comment === '') return null
  if (!COMMENT_KINDS.includes(kind as CommentKind)) return null
  if (!Number.isSafeInteger(issue) || (issue as number) < 1) return null
  return {
    ...quote,
    kind: kind as CommentKind,
    comment,
    issue: issue as number,
    ...(validKey(raw.editKey) ? { editKey: raw.editKey } : {}),
    ...(validStatus(raw.status) ? { status: raw.status } : {}),
    ...(validStatus(raw.seenStatus) ? { seenStatus: raw.seenStatus } : {}),
  }
}

/** What the storage holds, validated: an entry that does not hold up is
 * dropped alone, and the others stay. */
export function validateSentComments(
  raw: unknown,
): ReadonlyArray<SentComment> | null {
  return decodeQuoteList(raw, validComment)
}

export const comments = stored('sent-comments', validateSentComments)

/** "Tirar da lista": forgets the entry on this device, and on the others if
 * this one syncs. */
export function removeSentComment(id: string) {
  const saved = comments.read() ?? []
  if (!saved.some((c) => c.id === id)) return
  notifyRemoved('comment', id)
  const next = saved.filter((c) => c.id !== id)
  comments.write(next.length > 0 ? next : null)
}
