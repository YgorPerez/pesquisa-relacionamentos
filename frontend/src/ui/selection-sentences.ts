// Which Fact sheets the selected sentences cite (#336), read from the page:
// a sentence cites the Fact sheets of the reference rings inside it (the
// `[@slug]` of the source, which the server glues to the sentence's last
// word, `content/guide-view.ts`). The selection grows to its whole
// sentences, and a sentence with no ring cites nothing: it never takes the
// ring of the sentence next to it. For those, the Chapter it sits in says
// which Fact sheets are near; outside a Chapter, the page does.
//
// Inside a Visual, the whole figure is one sentence: its rings, in the
// source line, are where each label and value came from.
import { CHAPTER_SLOT } from './guide-sections'
import { quotableTexts, RING, UNSEEN } from './quote-text'

/** A ring that leads to a Fact sheet of the page. */
const CITING_RING = `a${RING}[href^="#ficha-"]`
const CHAPTER = `[data-slot="${CHAPTER_SLOT}"]`
/** The elements a sentence does not cross: fewer than `quote-text.ts`'s
 * blocks, since a sentence may run through a `div` or a `span`. */
const BLOCK =
  'p, li, h1, h2, h3, h4, h5, h6, td, th, dt, dd, figcaption, caption, blockquote'

const slugOf = (ref: Element) =>
  (ref.getAttribute('href') ?? '').slice('#ficha-'.length)

const slugsIn = (element: Element) => [
  ...new Set([...element.querySelectorAll(CITING_RING)].map(slugOf)),
]

/** Where a sentence with no ring sends the reader: its Chapter, with the
 * Fact sheets the Chapter's rings lead to, or `null` for the page. */
export type Nearby = {
  readonly chapter: string
  readonly slugs: ReadonlyArray<string>
} | null

/** What the selection rests on. */
export interface SelectionSources {
  /** How many sentences the selection touches. */
  readonly sentences: number
  /** The Fact sheets they cite, once each, in the order they come. */
  readonly cited: ReadonlyArray<string>
  /** Where each sentence with no ring sits, once each. */
  readonly uncited: ReadonlyArray<Nearby>
}

interface Sentence {
  readonly slugs: ReadonlyArray<string>
  readonly block: Element
}

/** The blocks the selection touches, in page order. */
function selectedBlocks(range: Range): Element[] {
  // A set keeps the order it was filled in.
  const blocks = new Set<Element>()
  for (const { element, root } of quotableTexts(range))
    blocks.add(element.closest('figure') ?? element.closest(BLOCK) ?? root)
  return [...blocks]
}

const STOP = /[.!?…]/
const CLOSE = /[.!?…"”’»)\]]/

/** The `[start, end)` of each sentence of `text`. A sentence ends at a stop
 * followed by a space, past the rings and closing quotes glued to it; not
 * when the next word starts in lowercase ("vs. presencial", "et al. e"). */
function sentenceSpans(text: string, ref: ReadonlyArray<boolean>) {
  const spans: Array<[number, number]> = []
  let start = 0
  for (let i = 0; i < text.length; i++) {
    if (!STOP.test(text[i] ?? '')) continue
    let end = i + 1
    while (end < text.length && (ref[end] || CLOSE.test(text[end] ?? ''))) end++
    if (end < text.length && !/\s/.test(text[end] ?? '')) continue
    const next = /\S/.exec(text.slice(end))?.[0]
    if (next !== undefined && /\p{Ll}/u.test(next)) continue
    spans.push([start, end])
    start = end
    i = end - 1
  }
  if (start < text.length) spans.push([start, text.length])
  return spans
}

/** The block's text, each text node with where it starts and its ring. */
function blockText(block: Element) {
  const pieces: Array<{ node: Text; at: number; ref: Element | null }> = []
  const ref: boolean[] = []
  let text = ''
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!(node instanceof Text) || node.parentElement?.closest(UNSEEN)) continue
    const ring = node.parentElement?.closest(CITING_RING) ?? null
    pieces.push({ node, at: text.length, ref: ring })
    text += node.data
    for (let i = 0; i < node.data.length; i++) ref.push(ring !== null)
  }
  return { pieces, ref, text }
}

/** The sentences of `block` the range touches. */
function selectedSentences(block: Element, range: Range): Sentence[] {
  if (block.matches('figure')) return [{ slugs: slugsIn(block), block }]
  const { pieces, ref, text } = blockText(block)
  let from = Infinity
  let to = -Infinity
  for (const { node, at } of pieces) {
    if (!range.intersectsNode(node)) continue
    const start = node === range.startContainer ? range.startOffset : 0
    const end = node === range.endContainer ? range.endOffset : node.data.length
    if (end <= start) continue
    from = Math.min(from, at + start)
    to = Math.max(to, at + end)
  }
  return sentenceSpans(text, ref).flatMap(([start, end]) => {
    if (!text.slice(Math.max(start, from), Math.min(end, to)).trim()) return []
    const rings = pieces.filter((p) => p.ref && p.at >= start && p.at < end)
    return [{ slugs: [...new Set(rings.map((p) => slugOf(p.ref!)))], block }]
  })
}

/** The Chapter around a sentence with no ring, or `null` for the page. */
function nearby(block: Element): Nearby {
  const chapter = block.closest(CHAPTER)
  return chapter ? { chapter: chapter.id, slugs: slugsIn(chapter) } : null
}

/** The Fact sheets the selected sentences cite, and where the ones that
 * cite none sit. */
export function sourcesOf(range: Range): SelectionSources {
  const sentences = selectedBlocks(range).flatMap((block) =>
    selectedSentences(block, range),
  )
  const cited = [...new Set(sentences.flatMap((s) => s.slugs))]
  const uncited: Nearby[] = []
  for (const { slugs, block } of sentences) {
    if (slugs.length > 0) continue
    const place = nearby(block)
    if (!uncited.some((u) => u?.chapter === place?.chapter)) uncited.push(place)
  }
  return { sentences: sentences.length, cited, uncited }
}
