/** The window event a page's list listens to, to read itself again. */
export const PUBLIC_COMMENTS_CHANGED = 'public-comments-changed'

export interface PublicComment {
  id: number
  parentId: number | null
  quote: string
  body: string
  nickname: string
  edited: boolean
  createdAt: number
  own: boolean
  canReply?: boolean
  /** Whether the reader asking already reported it. */
  reported?: boolean
  changed?: boolean
}
/** A comment as the curator sees it: never the author's Google subject, and
 * only how many reported it. */
export interface CuratorComment {
  id: number
  parentId: number | null
  path: string
  quote: string
  body: string
  nickname: string
  createdAt: number
  editedAt: number | null
  hidden: boolean
  /** Reports that still count: a restore clears them. */
  reports: number
  /** The private repo's issue that told the curator. */
  issue: number | null
  /** The first report's notice did not go out, and it is never retried. */
  notifyFailed: boolean
  /** The earlier versions, newest first. */
  history: { body: string; replacedAt: number }[]
}
export interface CuratorDesk {
  pending: CuratorComment[]
  recent: CuratorComment[]
  /** Where the next page of `recent` starts; `null` on the last. */
  before: number | null
}
export type CuratorDecision = {
  action: 'restore' | 'remove'
  id: number
}
/** A refusal carries what the form tells the reader. */
export type PublicCommentResult =
  | { ok: true; id: number }
  | { ok: false; problem: string }
export type CommentActionResult = { ok: true } | { ok: false; problem: string }
export type PublicCommentWrite =
  | {
      action: 'publish'
      path: string
      quote: string
      body: string
      parentId?: number
    }
  | { action: 'edit'; id: number; body: string }
  | { action: 'delete'; id: number }
