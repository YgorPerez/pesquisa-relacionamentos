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
import { markedFound } from './highlight-record'
import type { IssueStatus } from '#/content/comment-status'
import type { EditInput, EditReply } from '#/content/comment-issue'

import {
  comments,
  type SentComment,
  type NewSentComment,
} from './sent-comment-storage'
export {
  validateSentComments,
  type SentComment,
  type NewSentComment,
} from './sent-comment-storage'

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
