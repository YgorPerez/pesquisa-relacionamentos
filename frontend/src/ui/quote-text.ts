// Which of the page's text counts as quotable, and how it splits into
// blocks: what the popover on selected text quotes (`selection-quote.ts`),
// what a Grifo is found in (`highlight-text.ts`) and which sentences "De
// onde vem isso?" reads (`selection-sentences.ts`) read the page the same
// way. Its own module so that each of them imports only this.
import { REF_CLASS } from '#/content/text-fragment'

/** The attribute `quotable()` puts on an element whose text is quotable. */
export const QUOTE_ATTRIBUTE = 'data-quote'

/** The elements whose text is quotable. */
export const QUOTABLE = `[${QUOTE_ATTRIBUTE}]`

/** The quotable element `node` sits in, or `null`. */
export const quoteRoot = (node: Node | null): Element | null =>
  (node instanceof Element ? node : (node?.parentElement ?? null))?.closest(
    QUOTABLE,
  ) ?? null

/** What the page does not show as text: a drawing, what is hidden (but not
 * `hidden="until-found"`), a drawing's decoration, what only a screen reader
 * hears. */
export const UNSEEN =
  'svg, script, style, [hidden]:not([hidden="until-found"]), [aria-hidden="true"], .sr-only'

/** The reference ring. */
export const RING = `.${REF_CLASS}`

/** A finding quoted inside a line of its own ("Para o seu Perfil: …",
 * `profile.tsx`): the text its ring cites starts where it does
 * (`cited-text.ts`). Here, a leaf, since `profile.tsx` sits in a cycle with
 * `selection-sentences.ts`. */
export const FINDING_SLOT = 'achado'

/** The elements that start a new line of text (`site-search-view.ts`). */
const BLOCK =
  'p, li, h1, h2, h3, h4, h5, h6, td, th, tr, dt, dd, div, section, figure, figcaption, caption, blockquote, pre, ul, ol, table'

/** The block a text node sits in; inside a Visual, each node is a block of
 * its own (its labels and values are boxes apart). */
export const blockOf = (element: Element): Element | null =>
  element.closest('figure') ? element : element.closest(BLOCK)

/** The quotable text nodes the range touches, in page order, each with the
 * element it sits in and that element's quotable root; what the page does
 * not show is left out. */
export function* quotableTexts(range: Range) {
  const top = range.commonAncestorContainer
  const walker = document.createTreeWalker(top, NodeFilter.SHOW_TEXT)
  for (
    let node = top instanceof Text ? top : walker.nextNode();
    node;
    node = walker.nextNode()
  ) {
    if (!(node instanceof Text) || !range.intersectsNode(node)) continue
    const element = node.parentElement
    const root = quoteRoot(element)
    if (!element || !root || element.closest(UNSEEN)) continue
    yield { node, element, root }
  }
}

/** The page's own name: the tab's title without the site's name after it,
 * or else its `<h1>`. */
export const pageTitle = (): string =>
  document.title.split(' · ')[0]!.trim() ||
  document.querySelector('h1')?.textContent?.trim() ||
  ''
