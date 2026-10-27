// Which of the page's text counts as quotable, and how it splits into
// blocks: what the popover on selected text quotes (`selection-quote.ts`)
// and what a Grifo is found in (`highlight-text.ts`) read the page the same
// way. Its own module so that each of them imports only this.
import { REF_CLASS } from '#/content/text-fragment'

/** The attribute `quotable()` puts on an element whose text is quotable. */
export const QUOTE = 'data-quote'

/** The quotable element `node` sits in, or `null`. */
export const quoteRoot = (node: Node | null): Element | null =>
  (node instanceof Element ? node : (node?.parentElement ?? null))?.closest(
    `[${QUOTE}]`,
  ) ?? null

/** What the page does not show as text: a drawing, what is hidden (but not
 * `hidden="until-found"`), a drawing's decoration, what only a screen reader
 * hears. */
export const UNSEEN =
  'svg, script, style, [hidden]:not([hidden="until-found"]), [aria-hidden="true"], .sr-only'

/** The reference ring. */
export const REF = `.${REF_CLASS}`

/** The elements that start a new line of text (`site-search-view.ts`). */
const BLOCK =
  'p, li, h1, h2, h3, h4, h5, h6, td, th, tr, dt, dd, div, section, figure, figcaption, caption, blockquote, pre, ul, ol, table'

/** The block a text node sits in; inside a Visual, each node is a block of
 * its own (its labels and values are boxes apart). */
export const blockOf = (element: Element): Element | null =>
  element.closest('figure') ? element : element.closest(BLOCK)
