// What the reader selected, read from the page (#333): the text, the link
// that lands on it and where it sits. Only the text the site search reads
// counts (#275): the pages mark it with `quotable()`, each element with the
// anchor of its section, and a selection outside it is no quote.
//
// The link is built like the search's hits (`content/text-fragment.ts`): the
// selection becomes a `Line`, in which the reference ring is `ref` and the
// "no Brasil" mark and the edge between two blocks are `box`, so a selection
// that crosses one keeps its plain-text part.
import type { ReactNode } from 'react'
import {
  BOX_CLASSES,
  fragmentTarget,
  REF_CLASS,
  type CharKind,
  type Line,
} from '#/content/text-fragment'

const QUOTE = 'data-quote'
const HEADING = 'data-quote-heading'

/** The attributes that mark an element's text as quotable: `anchor` is the
 * `id` of its section (`null` at the top of the page), and a `heading`'s
 * link goes to the anchor alone, like the search's. */
export function quotable(anchor: string | null, heading = false) {
  return {
    [QUOTE]: anchor ?? '',
    ...(heading ? { [HEADING]: '' } : {}),
  }
}

/** The selection, as the popover's actions use it. */
export interface Quote {
  /** The text as the page shows it: without the reference numbers nor what
   * only a screen reader hears, one line per block. */
  readonly text: string
  /** The page's address with the section's anchor and the Text Fragment. */
  readonly link: string
  /** The page's path. */
  readonly path: string
  /** The `id` of the section it starts in; `null` at the top of the page. */
  readonly anchor: string | null
  /** The selected stretch, snapped to whole words. */
  readonly range: Range
}

/** What each action of the popover receives (`selection-popover.tsx`). */
export interface SelectionActionProps {
  readonly quote: Quote
  /** Puts `panel` under the actions, in place of what was there: how the
   * copy went, a form. `null` clears it. */
  readonly show: (panel: ReactNode) => void
  /** Closes the popover. */
  readonly close: () => void
}

export const quoteRoot = (node: Node | null): Element | null =>
  (node instanceof Element ? node : (node?.parentElement ?? null))?.closest(
    `[${QUOTE}]`,
  ) ?? null

/** What the page does not show as text: a drawing, what is hidden (but not
 * `hidden="until-found"`), a drawing's decoration, what only a screen reader
 * hears. */
export const UNSEEN =
  'svg, script, style, [hidden]:not([hidden="until-found"]), [aria-hidden="true"], .sr-only'
export const REF = `.${REF_CLASS}`
const BOX = BOX_CLASSES.map((c) => `.${c}`).join(', ')

/** The elements that start a new line of text (`site-search-view.ts`). */
const BLOCK =
  'p, li, h1, h2, h3, h4, h5, h6, td, th, tr, dt, dd, div, section, figure, figcaption, caption, blockquote, pre, ul, ol, table'

/** The block a text node sits in; inside a Visual, each node is a block of
 * its own (its labels and values are boxes apart). */
export const blockOf = (element: Element): Element | null =>
  element.closest('figure') ? element : element.closest(BLOCK)

const isWordChar = (char: string | undefined) =>
  char !== undefined && /[\p{L}\p{N}]/u.test(char)

/** The range grown to whole words, at both ends. */
export function snapToWords(range: Range): Range {
  const snapped = range.cloneRange()
  const { startContainer: start, endContainer: end } = snapped
  if (start instanceof Text) {
    let at = snapped.startOffset
    while (at > 0 && isWordChar(start.data[at - 1])) at--
    snapped.setStart(start, at)
  }
  if (end instanceof Text) {
    let at = snapped.endOffset
    while (at < end.data.length && isWordChar(end.data[at])) at++
    snapped.setEnd(end, at)
  }
  return snapped
}

/** The quotable text nodes the range covers, each cut to the range. */
function* selectedTexts(range: Range) {
  const root = range.commonAncestorContainer
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (
    let node = root instanceof Text ? root : walker.nextNode();
    node;
    node = walker.nextNode()
  ) {
    if (!(node instanceof Text) || !range.intersectsNode(node)) continue
    const element = node.parentElement
    if (!element || !quoteRoot(element) || element.closest(UNSEEN)) continue
    const from = node === range.startContainer ? range.startOffset : 0
    const to = node === range.endContainer ? range.endOffset : node.data.length
    yield { element, text: node.data.slice(from, to) }
  }
}

/** The selected text as a `Line` and as the reader sees it. */
function read(range: Range): { line: Line; text: string } {
  const line: Line = { text: '', kinds: [] }
  const blocks: string[] = []
  let block: Element | null | undefined
  const append = (text: string, kind: CharKind) => {
    line.text += text
    for (let i = 0; i < text.length; i++) line.kinds.push(kind)
  }
  for (const { element, text } of selectedTexts(range)) {
    const here = blockOf(element)
    if (block !== undefined && here !== block) {
      append(' ', 'box')
      blocks.push('')
    }
    if (block === undefined) blocks.push('')
    block = here
    const kind: CharKind = element.closest(REF)
      ? 'ref'
      : element.closest(BOX)
        ? 'box'
        : 'text'
    append(text, kind)
    if (kind !== 'ref') blocks[blocks.length - 1] += text
  }
  const shown = blocks
    .map((b) => b.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
  return { line, text: shown }
}

/** The page the selection is on. */
export interface QuotedPage {
  readonly origin: string
  readonly pathname: string
}

/** The quote of a selected range, or `null` when it starts or ends outside
 * the quotable text, or has no text in it. */
export function quoteOf(selected: Range, location: QuotedPage): Quote | null {
  const start = quoteRoot(selected.startContainer)
  const end = quoteRoot(selected.endContainer)
  if (!start || !end) return null
  const range = snapToWords(selected)
  const { line, text } = read(range)
  if (!text) return null
  const anchor = start.getAttribute(QUOTE) || null
  const heading = start === end && start.hasAttribute(HEADING)
  const { origin, pathname } = location
  return {
    text,
    link: `${origin}${pathname}${fragmentTarget({ anchor, heading }, line)}`,
    path: pathname,
    anchor,
    range,
  }
}
