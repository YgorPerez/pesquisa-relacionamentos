// The sent Comentários marked on their page (#441, spec #439). The Grifo
// layer (`highlight-layer.tsx`) calls `paintComments` each time it paints:
// it looks for the quote of each Comentário sent from the page, marks the
// missing ones changed in the store, so "Seus trechos" can say "Este trecho
// mudou" (#347), and paints the found ones with `::highlight(comentario)`
// (`drawings.css`), the dotted underline. Looking needs only the page's
// text; the paint needs the CSS Custom Highlight API, and without it nothing
// is drawn and nothing opens on a tap.
import { useSyncExternalStore } from 'react'
import {
  markCommentsFound,
  readSentComments,
  type SentComment,
} from '#/state/sent-comments'
import { canPaint, partsAt } from './highlight-paint'
import { findQuote, pageText, type FoundQuote } from './highlight-text'

/** The name `drawings.css` paints. */
const NAME = 'comentario'

/** A sent Comentário found on the page, and where. */
export interface PaintedComment extends FoundQuote {
  readonly comment: SentComment
}

const NONE: ReadonlyArray<PaintedComment> = []
let painted = NONE
const followers = new Set<() => void>()

function setPainted(next: ReadonlyArray<PaintedComment>) {
  painted = next
  followers.forEach((follower) => follower())
}

/** Looks for the quotes of the Comentários sent from the page at `path`,
 * marks the missing ones changed in the store and paints the others. */
export function paintComments(path: string) {
  const here = readSentComments().filter((comment) => comment.path === path)
  // Most pages have none: no need to read the page's text.
  if (here.length === 0) return unpaintComments()
  const page = pageText()
  const found = here.flatMap((comment) => {
    const where = findQuote(page, comment)
    return where ? [{ comment, ...where }] : []
  })
  markCommentsFound(path, new Set(found.map((p) => p.comment.id)))
  if (!canPaint()) return
  CSS.highlights.set(
    NAME,
    new globalThis.Highlight(...found.flatMap((p) => p.parts)),
  )
  setPainted(found)
}

/** Takes the paint off the page. */
export function unpaintComments() {
  if (canPaint()) CSS.highlights.delete(NAME)
  if (painted !== NONE) setPainted(NONE)
}

/** The Comentários painted now. */
export function usePaintedComments(): ReadonlyArray<PaintedComment> {
  return useSyncExternalStore(
    (follower) => {
      followers.add(follower)
      return () => followers.delete(follower)
    },
    () => painted,
    () => NONE,
  )
}

/** The Comentário drawn under the point, the most recent one if they
 * overlap. */
export const paintedCommentAt = (x: number, y: number) => partsAt(painted, x, y)

/** Whether two ranges share some text. */
const overlap = (a: Range, b: Range) =>
  a.compareBoundaryPoints(Range.START_TO_END, b) > 0 &&
  a.compareBoundaryPoints(Range.END_TO_START, b) < 0

/** The painted Comentário that shares text with `range`, the most recent
 * one if several do: a Grifo's popover tells of it. */
export const commentOver = (
  all: ReadonlyArray<PaintedComment>,
  range: Range,
): PaintedComment | null =>
  [...all]
    .reverse()
    .find((p) => p.parts.some((part) => overlap(part, range))) ?? null
