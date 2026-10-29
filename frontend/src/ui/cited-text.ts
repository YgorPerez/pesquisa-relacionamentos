// What a reference ring cites (#467): in a paragraph, the text from the
// previous ring (or the paragraph's start) up to the ring, the way the
// selection's sentences read their rings (`selection-sentences.ts`); rings
// side by side (`[1][2]`) cite the same text. In a Visual, the whole figure:
// its rings are where each label and value came from.
import { RING, UNSEEN } from './quote-text'
import { BLOCK } from './selection-sentences'

/** What follows a ring and still belongs to its sentence. */
const CLOSE = /[\s.,;:!?…"”’»)\]]/

/** The text the ring cites, the figure of its Visual, or `null` when the
 * ring has no text before it. */
export function citedBy(ring: Element): Range | HTMLElement | null {
  const figure = ring.closest('figure')
  if (figure instanceof HTMLElement) return figure
  const block = ring.closest(BLOCK) ?? ring.parentElement
  if (!block) return null

  const pieces: Array<{ node: Text; at: number }> = []
  // The ring each character is in, or `null`.
  const rings: Array<Element | null> = []
  let text = ''
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!(node instanceof Text) || node.parentElement?.closest(UNSEEN)) continue
    const inRing = node.parentElement?.closest(RING) ?? null
    pieces.push({ node, at: text.length })
    text += node.data
    for (let i = 0; i < node.data.length; i++) rings.push(inRing)
  }

  // Back past the rings glued to this one, to the text they cite.
  let end = rings.indexOf(ring)
  if (end < 0) return null
  while (end > 0 && (rings[end - 1] || /\s/.test(text[end - 1] ?? ''))) end--
  // Back to the ring before them, then past its punctuation.
  let start = end
  while (start > 0 && !rings[start - 1]) start--
  while (start < end && CLOSE.test(text[start] ?? '')) start++
  if (start >= end) return null

  const range = document.createRange()
  for (const { node, at } of pieces) {
    const length = node.data.length
    if (at <= start && start < at + length) range.setStart(node, start - at)
    if (at < end && end <= at + length) range.setEnd(node, end - at)
  }
  return range
}
