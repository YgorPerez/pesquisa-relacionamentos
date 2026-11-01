// How the page's text reads with its reference rings: which Fact sheet a ring
// leads to, and which ring each character of a block sits in. The `[@slug]`
// of the source is a ring the server glues to the sentence's last word
// (`content/guide-view.ts`).
import { RING, UNSEEN } from './quote-text'

/** A ring that leads to a Fact sheet of the page. */
export const CITING_RING = `a${RING}[href^="#ficha-"]`
/** The elements a ring's cited text does not cross (`cited-text.ts`). */
export const BLOCK =
  'p, li, h1, h2, h3, h4, h5, h6, td, th, dt, dd, figcaption, caption, blockquote'

/** The slug of the Fact sheet a citing ring leads to. */
export const slugOf = (ref: Element) =>
  (ref.getAttribute('href') ?? '').slice('#ficha-'.length)

/** The block's text, each text node with where it starts and its ring, and
 * the ring each character sits in. */
export function blockText(block: Element) {
  const pieces: Array<{ node: Text; at: number; ref: Element | null }> = []
  const ref: Array<Element | null> = []
  let text = ''
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!(node instanceof Text) || node.parentElement?.closest(UNSEEN)) continue
    const ring = node.parentElement?.closest(CITING_RING) ?? null
    pieces.push({ node, at: text.length, ref: ring })
    text += node.data
    for (let i = 0; i < node.data.length; i++) ref.push(ring)
  }
  return { pieces, ref, text }
}
