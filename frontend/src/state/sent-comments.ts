// The Comentários sent from this browser (#347, spec #346): each one the
// server took, with the number of the issue it opened in the private sources
// repo (ADR 0043). They live only in this browser, like the Grifos: the
// reader finds them again in "Seus trechos" (`/trechos`), and nobody else
// sees them. A comment sent before this store existed is not here.
//
// The quote is kept as a Grifo keeps it (`highlight-record.ts`), so its page
// looks for it the same way and marks it `changed` when it is gone. "Tirar
// da lista" forgets the record here; the issue stays.
import { useSyncExternalStore } from 'react'
import { COMMENT_KINDS, type CommentKind } from '#/content/comment-kinds'
import { markedFound, type KeptQuote } from './highlight-record'
import { CONTEXT_LENGTH } from './highlights'
import { stored } from './stored'

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
  /** When it was sent (ms since 1970). */
  readonly at: number
}

/** What the form gives once the server took the comment. */
export type NewSentComment = Omit<SentComment, 'id' | 'changed' | 'at'>

const isRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw)

const STRINGS = [
  'id',
  'path',
  'pageTitle',
  'link',
  'text',
  'exact',
  'comment',
] as const

function validComment(raw: unknown): SentComment | null {
  if (!isRecord(raw)) return null
  for (const key of STRINGS)
    if (typeof raw[key] !== 'string' || raw[key] === '') return null
  const { prefix, suffix, kind, issue, changed, at } = raw
  if (typeof prefix !== 'string' || typeof suffix !== 'string') return null
  if (!COMMENT_KINDS.includes(kind as CommentKind)) return null
  if (!Number.isSafeInteger(issue) || (issue as number) < 1) return null
  if (typeof at !== 'number' || !Number.isFinite(at)) return null
  const text = (key: (typeof STRINGS)[number]) => raw[key] as string
  return {
    id: text('id'),
    path: text('path'),
    pageTitle: text('pageTitle'),
    link: text('link'),
    text: text('text'),
    exact: text('exact'),
    prefix: prefix.slice(-CONTEXT_LENGTH),
    suffix: suffix.slice(0, CONTEXT_LENGTH),
    kind: kind as CommentKind,
    comment: text('comment'),
    issue: issue as number,
    changed: changed === true,
    at,
  }
}

/** What the storage holds, validated: an entry that does not hold up is
 * dropped alone, and the others stay. */
export function validateSentComments(
  raw: unknown,
): ReadonlyArray<SentComment> | null {
  if (!Array.isArray(raw)) return null
  const seen = new Set<string>()
  return raw.flatMap((item) => {
    const valid = validComment(item)
    if (!valid || seen.has(valid.id)) return []
    seen.add(valid.id)
    return [valid]
  })
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
