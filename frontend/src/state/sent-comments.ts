// The Comentários sent from this browser (#347, spec #346): each one the
// server took, with the number of the issue it opened in the private sources
// repo (ADR 0043). They live only in this browser, like the Grifos: the
// reader finds them again in "Seus trechos" (`/trechos`), and nobody else
// sees them. A comment sent before this store existed is not here.
//
// The quote is kept as a Grifo keeps it (`highlight-record.ts`), so its page
// looks for it the same way and marks it `changed` when it is gone. "Tirar
// da lista" forgets the record here; the issue stays. The edit key the send
// replied with stays here too, and only here (#442).
import { useSyncExternalStore } from 'react'
import { COMMENT_KINDS, type CommentKind } from '#/content/comment-kinds'
import {
  decodeKeptQuote,
  decodeQuoteList,
  isQuoteRecord,
  markedFound,
  type KeptQuote,
} from './highlight-record'
import { stored } from './stored'
import type { CommentStatus, IssueStatus } from '#/content/comment-status'
import type { EditInput, EditReply } from '#/content/comment-issue'

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

const comments = stored('sent-comments', validateSentComments)

/** None: one array, so React sees the same snapshot each time. */
const NONE: ReadonlyArray<SentComment> = []

/** Every sent Comentário, outside React. */
export const readSentComments = (): ReadonlyArray<SentComment> =>
  comments.read() ?? NONE

/** Every sent Comentário, in React; `null` on the server and during
 * hydration. */
export const useSentComments = (): ReadonlyArray<SentComment> | null =>
  useSyncExternalStore(comments.subscribe, readSentComments, () => null)

const save = (next: ReadonlyArray<SentComment>) =>
  comments.write(next.length > 0 ? [...next] : null)

const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/** Keeps a Comentário the server took and returns it. Each send is its own
 * issue, so the same quote twice is two entries. */
export function addSentComment(made: NewSentComment): SentComment {
  const comment: SentComment = {
    ...made,
    id: newId(),
    changed: false,
    at: Date.now(),
  }
  save([...readSentComments(), comment])
  return comment
}

/** Edits the Comentário's issue through `edit` (`editComment`, ADR 0043)
 * and, once the server says it did, gives the entry the new type and text.
 * An entry without an edit key never asks. */
export async function editSentComment(
  id: string,
  { kind, comment }: Pick<SentComment, 'kind' | 'comment'>,
  edit: (input: EditInput) => Promise<EditReply>,
): Promise<EditReply['edit']> {
  const sent = readSentComments().find((c) => c.id === id)
  if (!sent?.editKey) return 'failed'
  let reply: EditReply
  try {
    reply = await edit({
      issue: sent.issue,
      key: sent.editKey,
      kind,
      text: comment,
    })
  } catch {
    return 'failed'
  }
  if (reply.edit === 'edited')
    save(
      readSentComments().map((c) =>
        c.id === id ? { ...c, kind, comment: comment.trim() } : c,
      ),
    )
  return reply.edit
}

/** "Tirar da lista": forgets the entry on this device. */
export function removeSentComment(id: string) {
  const saved = readSentComments()
  if (saved.some((c) => c.id === id)) save(saved.filter((c) => c.id !== id))
}

/** After the page at `path` looked for its comments' quotes: the ones in
 * `found` were there, the others are marked changed. */
export function markCommentsFound(path: string, found: ReadonlySet<string>) {
  const next = markedFound(readSentComments(), path, found)
  if (next) save(next)
}

/** Missing fields are records from before status checking: received and seen. */
export function updateCommentStatuses(answers: readonly IssueStatus[]) {
  const statuses = new Map(
    answers.map((answer) => [answer.issue, answer.status]),
  )
  save(
    readSentComments().map((comment) => {
      const status = statuses.get(comment.issue)
      return status && status !== (comment.status ?? 'received')
        ? { ...comment, status, seenStatus: comment.seenStatus ?? 'received' }
        : comment
    }),
  )
}

/** Acknowledge only the entries the list actually displayed. */
export function markCommentStatusesSeen(ids: readonly string[]) {
  const shown = new Set(ids)
  const saved = readSentComments()
  if (!saved.some((c) => shown.has(c.id) && c.status !== c.seenStatus)) return
  save(
    saved.map((c) =>
      shown.has(c.id) ? { ...c, seenStatus: c.status ?? 'received' } : c,
    ),
  )
}
