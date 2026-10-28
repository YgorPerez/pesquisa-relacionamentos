// What a Comentário's forms do with the server and the device: the send of
// "Comentar" (`selection-comment.tsx`, #337) and the edit of "Editar
// comentário" (`comment-edit.tsx`, #443). The server functions are
// `content/comment.ts`'s (ADR 0043); the record on this device,
// `state/sent-comments.ts`'s (#347).
import { editComment, sendComment } from '#/content/comment'
import { COMMENT_LIMITS, type CommentKind } from '#/content/comment-kinds'
import { addSentComment, editSentComment } from '#/state/sent-comments'
import { pageText, quoteInPage } from './highlight-text'
import { COMMENT } from './selection-comment.copy'
import type { Quote } from './selection-action'
import { pageTitle } from './quote-text'

/** What is missing before the form can go, or `null`. */
export function missing(kind: CommentKind | null, text: string) {
  if (!kind) return COMMENT.missingKind
  if (!text.trim()) return COMMENT.missingText
  return null
}

/** Sends the comment; the issue's number and edit key only when the
 * server says it went. */
export async function send(
  quote: Quote,
  kind: CommentKind,
  text: string,
  website: string,
) {
  try {
    const reply = await sendComment({
      data: {
        kind,
        text,
        quote: quote.text.slice(0, COMMENT_LIMITS.quote),
        link: quote.link,
        page: pageTitle().slice(0, COMMENT_LIMITS.page),
        website,
      },
    })
    return reply.sent ? reply : null
  } catch {
    return null
  }
}

/** What this browser keeps of the comment about to go (#347): the quote as
 * a Grifo keeps it, read before the send, while the page is as the reader
 * saw it. */
export function toKeep(quote: Quote, kind: CommentKind, text: string) {
  const where = quoteInPage(pageText(), quote.range)
  return ({ issue, editKey }: { issue: number; editKey: string }) =>
    addSentComment({
      exact: where?.exact ?? quote.text.replace(/\s+/g, ' ').trim(),
      prefix: where?.prefix ?? '',
      suffix: where?.suffix ?? '',
      path: quote.path,
      pageTitle: pageTitle() || quote.path,
      link: quote.link.slice(new URL(quote.link).origin.length),
      text: quote.text,
      kind,
      comment: text.trim(),
      issue,
      editKey,
    })
}

/** Rewrites a sent Comentário's issue and, once the server did, its record
 * on this device (#443). */
export const saveCommentEdit = (id: string, kind: CommentKind, text: string) =>
  editSentComment(id, { kind, comment: text }, (data) => editComment({ data }))
