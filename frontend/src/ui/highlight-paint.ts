// The Grifos painted on the page (#334). The paint is the CSS Custom
// Highlight API (`::highlight(grifo)` in `drawings.css`): it marks ranges
// without touching the DOM, so the text React and the library's HTML put on
// the page is never split into `<mark>`s and a re-render cannot break. A
// browser without it does not offer "Grifar" (`canPaint`).
//
// What is painted lives here, outside React, because the "Grifar" action and
// the Grifo layer both read it: `usePainted` follows it. The layer asks for a
// Grifo's popover through `requestOpen`, which "Grifar" calls on the Grifo it
// has just made.
import { useSyncExternalStore } from 'react'
import { markFound, type Highlight } from '#/state/highlights'
import { findQuote, pageText, type FoundQuote } from './highlight-text'
import type { Quote } from './selection-action'
import { quoteOf } from './selection-quote'

/** The name `drawings.css` paints. */
const NAME = 'grifo'

/** A Grifo found on the page, and where. */
export interface Painted extends FoundQuote {
  readonly highlight: Highlight
  /** The Grifo's text as a quote, for "Copiar" and "Copiar link". */
  readonly quote: Quote | null
}

export const canPaint = (): boolean =>
  typeof CSS !== 'undefined' &&
  'highlights' in CSS &&
  typeof globalThis.Highlight === 'function'

const NONE: ReadonlyArray<Painted> = []
let painted = NONE
const followers = new Set<() => void>()

function setPainted(next: ReadonlyArray<Painted>) {
  painted = next
  followers.forEach((follower) => follower())
}

/** Looks for the Grifos of the page at `path` in the page, paints the ones
 * it finds and marks the others changed in the store. */
export function paintPage(path: string, saved: ReadonlyArray<Highlight>) {
  if (!canPaint()) return
  const here = saved.filter((highlight) => highlight.path === path)
  // Most pages have none: no need to read the page's text.
  if (here.length === 0) return unpaint()
  const page = pageText()
  const { origin } = window.location
  const found = here.flatMap((highlight) => {
    const where = findQuote(page, highlight)
    if (!where) return []
    const quote = quoteOf(where.whole, { origin, pathname: path })
    return [{ highlight, quote, ...where }]
  })
  CSS.highlights.set(
    NAME,
    new globalThis.Highlight(...found.flatMap((p) => p.parts)),
  )
  setPainted(found)
  markFound(path, new Set(found.map((p) => p.highlight.id)))
}

/** Takes the paint off the page. */
export function unpaint() {
  if (canPaint()) CSS.highlights.delete(NAME)
  if (painted !== NONE) setPainted(NONE)
}

/** The Grifos painted now. */
export function usePainted(): ReadonlyArray<Painted> {
  return useSyncExternalStore(
    (follower) => {
      followers.add(follower)
      return () => followers.delete(follower)
    },
    () => painted,
    () => NONE,
  )
}

const contains = (rect: DOMRect, x: number, y: number) =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom

/** The Grifo drawn under the point, the most recent one if they overlap. */
export function paintedAt(x: number, y: number): Painted | null {
  for (const p of [...painted].reverse())
    for (const part of p.parts)
      for (const rect of part.getClientRects())
        if (contains(rect, x, y)) return p
  return null
}

/** Whether `range` lies inside `outer`. */
export const within = (outer: Range, range: Range): boolean =>
  outer.comparePoint(range.startContainer, range.startOffset) === 0 &&
  outer.comparePoint(range.endContainer, range.endOffset) === 0

const openers = new Set<(id: string) => void>()

/** Opens the popover of the Grifo `id` once it is painted. */
export const requestOpen = (id: string) => openers.forEach((open) => open(id))

/** Follows the requests to open a Grifo's popover. */
export function onOpenRequest(open: (id: string) => void): () => void {
  openers.add(open)
  return () => openers.delete(open)
}
