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
  changed?: boolean
}
/** A refusal carries what the form tells the reader. */
export type PublicCommentResult =
  | { ok: true; id: number }
  | { ok: false; problem: string }
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
