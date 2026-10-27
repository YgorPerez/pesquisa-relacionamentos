// Where a Grifo sits in the page's text (#334). The page's quotable text
// (the text the popover quotes, `selection-quote.ts`) is read once into a
// string with a DOM point behind each character: spaces collapsed, one space
// between blocks, the reference numbers and what is not shown left out.
// Making a Grifo cuts its quote and a little context out of that string;
// finding it again looks for the exact quote and uses the context only to
// pick among repeats. A quote that is not there is not found: no fuzzy
// matching (#332).
import { PROFILE_MARK_CLASS } from '#/content/text-fragment'
import type { TextQuote } from '#/state/highlight-record'
import { CONTEXT_LENGTH } from '#/state/highlights'
import { blockOf, quoteRoot, RING, UNSEEN } from './quote-text'

interface Point {
  readonly node: Text
  readonly offset: number
}

/** The page's quotable text and, for each character, where it is in the
 * DOM; `null` for the space put between two blocks. */
export interface PageText {
  readonly text: string
  readonly points: ReadonlyArray<Point | null>
}

/** A quote found on the page: the whole stretch, and one range per text
 * node, without the reference numbers in between, for the paint. */
export interface FoundQuote {
  readonly whole: Range
  readonly parts: ReadonlyArray<Range>
}

/** The "vale para você" mark comes and goes with the Profile: a Grifo is
 * found with or without it. */
const PROFILE_MARK = `.${PROFILE_MARK_CLASS}`

const counts = (element: Element) =>
  quoteRoot(element) !== null &&
  element.closest(UNSEEN) === null &&
  element.closest(RING) === null &&
  element.closest(PROFILE_MARK) === null

/** Reads the quotable text under `root`. */
export function pageText(root: Node = document.body): PageText {
  const chars: string[] = []
  const points: Array<Point | null> = []
  const push = (char: string, point: Point | null) => {
    chars.push(char)
    points.push(point)
  }
  const spaced = () => chars.length === 0 || chars[chars.length - 1] === ' '
  let block: Element | null | undefined
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement
    if (!(node instanceof Text) || !element || !counts(element)) continue
    const here = blockOf(element)
    if (block !== undefined && here !== block && !spaced()) push(' ', null)
    block = here
    for (let offset = 0; offset < node.data.length; offset++) {
      const char = node.data[offset]!
      if (!/\s/.test(char)) push(char, { node, offset })
      else if (!spaced()) push(' ', { node, offset })
    }
  }
  return { text: chars.join(''), points }
}

/** The quote `range` covers in `page`, with its context; `null` when it
 * covers no quotable text. */
export function quoteInPage(page: PageText, range: Range): TextQuote | null {
  const touched = new Map<Text, boolean>()
  const inside = ({ node, offset }: Point) => {
    let touches = touched.get(node)
    if (touches === undefined) {
      touches = range.intersectsNode(node)
      touched.set(node, touches)
    }
    return (
      touches &&
      range.comparePoint(node, offset) === 0 &&
      range.comparePoint(node, offset + 1) === 0
    )
  }
  let from = -1
  let to = -1
  page.points.forEach((point, at) => {
    if (!point || !inside(point)) return
    if (from < 0) from = at
    to = at + 1
  })
  const { text } = page
  while (from >= 0 && from < to && text[from] === ' ') from++
  while (to > from && text[to - 1] === ' ') to--
  if (from < 0 || from >= to) return null
  return {
    exact: text.slice(from, to),
    prefix: text.slice(Math.max(0, from - CONTEXT_LENGTH), from),
    suffix: text.slice(to, to + CONTEXT_LENGTH),
  }
}

/** The ranges from `from` to `to` in `page`: one per text node. */
function rangesOf(page: PageText, from: number, to: number): FoundQuote {
  const parts: Range[] = []
  let current: Range | null = null
  let first: Point | null = null
  let last: Point | null = null
  for (let at = from; at < to; at++) {
    const point = page.points[at]
    if (!point) continue
    first ??= point
    last = point
    if (current?.startContainer !== point.node) {
      current = document.createRange()
      current.setStart(point.node, point.offset)
      parts.push(current)
    }
    current.setEnd(point.node, point.offset + 1)
  }
  const whole = document.createRange()
  whole.setStart(first!.node, first!.offset)
  whole.setEnd(last!.node, last!.offset + 1)
  return { whole, parts }
}

/** Finds the quote in `page`: among the places with the exact text, the one
 * whose context matches on more sides, the first among equals. `null` when
 * the text is not on the page. */
export function findQuote(page: PageText, quote: TextQuote): FoundQuote | null {
  const { text } = page
  const { exact, prefix, suffix } = quote
  if (!exact) return null
  let best = -1
  let bestScore = -1
  for (
    let at = text.indexOf(exact);
    at >= 0;
    at = text.indexOf(exact, at + 1)
  ) {
    const end = at + exact.length
    const score =
      Number(text.slice(Math.max(0, at - prefix.length), at) === prefix) +
      Number(text.slice(end, end + suffix.length) === suffix)
    if (score > bestScore) {
      best = at
      bestScore = score
    }
  }
  return best < 0 ? null : rangesOf(page, best, best + exact.length)
}
