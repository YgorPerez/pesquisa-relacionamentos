// What a reference ring cites (#467): in a paragraph, the text from the
// previous ring (or the paragraph's start) up to the ring, read the way the
// selection's sentences read their rings (`selection-sentences.ts`); rings
// side by side (`[1][2]`) cite the same text. In a Visual, the whole figure:
// its rings are where each label and value came from.
import { FINDING_SLOT } from './quote-text'
import { BLOCK, blockText } from './selection-sentences'

/** What follows a ring and still belongs to its sentence. */
const CLOSE = /[\s.,;:!?…"”’»)\]]/

/** The text the ring cites, the figure of its Visual, or `null` when the
 * ring has no text before it. */
export function citedBy(ring: Element): Range | HTMLElement | null {
  const figure = ring.closest('figure')
  if (figure instanceof HTMLElement) return figure
  const block =
    ring.closest(`[data-slot="${FINDING_SLOT}"], ${BLOCK}`) ??
    ring.parentElement
  if (!block) return null
  const { pieces, ref, text } = blockText(block)

  // Back past the rings glued to this one, to the text they cite.
  let end = ref.indexOf(ring)
  if (end < 0) return null
  while (end > 0 && (ref[end - 1] || /\s/.test(text[end - 1] ?? ''))) end--
  // Back to the ring before them, then past its punctuation.
  let start = end
  while (start > 0 && !ref[start - 1]) start--
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
