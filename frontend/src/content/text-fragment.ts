// The link that lands on a stretch of a page's text: the section's anchor and
// a Text Fragment (`#<anchor>:~:text=…`), which the browser scrolls to and
// paints without JS; a browser without it stops at the section. The site
// search builds its hits with it (`site-search-view.ts`, #275), from the
// server's HTML, and "Copiar link" of the selection popover
// (`ui/selection-quote.ts`, #333), from the page's DOM. Both describe the
// text the same way, as a `Line`, so a sentence gets the same link from
// either.

/** What a character of a line is: plain text; inside a box of its own (the
 * "no Brasil" mark, drawn `inline-block`, or the edge between two blocks),
 * which a quote shows but a Text Fragment cannot cross; or a reference
 * number, in its ring (`inline-grid`), which neither shows. */
export type CharKind = 'text' | 'box' | 'ref'

/** A stretch of text and the kind of each of its UTF-16 units. */
export interface Line {
  text: string
  kinds: CharKind[]
}

/** The class of the reference number's ring, in the server's HTML
 * (`guide-view.ts`). */
export const REF_CLASS = 'ref'

/** The classes of the inline boxes inside a sentence (`ui/drawings.css`). */
export const BOX_CLASSES: ReadonlyArray<string> = [
  'marca-brasil',
  'selo-voce-texto',
]

const squeeze = (text: string) => text.replace(/\s+/g, ' ').trim()

/** The stretches of plain text between the boxes, those with a letter or a
 * digit (not the `.` after a reference), the last without its final
 * punctuation: the same sentence with or without a reference before its
 * `.` gives the same Text Fragment. */
function runsOf(line: Line): string[] {
  const runs: string[] = ['']
  for (let i = 0; i < line.text.length; i++) {
    if (line.kinds[i] === 'text') runs[runs.length - 1] += line.text[i]
    else if (runs.at(-1) !== '') runs.push('')
  }
  const kept = runs.map(squeeze).filter((run) => /[\p{L}\p{N}]/u.test(run))
  const last = kept.pop()
  return last === undefined ? kept : [...kept, last.replace(/[.!?…;:,]+$/u, '')]
}

/** A stretch of one run this long or shorter goes whole in the Text
 * Fragment; any other goes by the first words of its first run and the last
 * words of its last one. */
const WHOLE_WORDS = 8
const EDGE_WORDS = 4

/** The Text Fragment's text, encoded: `-`, `,` and `&` mean something in
 * it. */
const fragmentText = (words: ReadonlyArray<string>) =>
  encodeURIComponent(words.join(' ')).replace(/-/g, '%2D')

/** Where a stretch of text sits on its page. */
export interface FragmentPlace {
  /** The `id` the link goes to; `null` for the top of the page. */
  readonly anchor: string | null
  /** A heading: the link goes to the anchor alone, since the same words
   * repeat earlier on the page (the Chapter list, "Em resumo"). */
  readonly heading?: boolean
}

/** The hash that lands on `line`: its section's anchor and, but for a
 * heading, the Text Fragment of its plain-text runs. A line with no plain
 * text gets the anchor alone. */
export function fragmentTarget(place: FragmentPlace, line: Line): string {
  const runs = runsOf(line)
  const hash = place.anchor ? `#${place.anchor}` : ''
  const first = runs[0]?.split(' ')
  const last = runs.at(-1)?.split(' ')
  if (place.heading || !first || !last) return hash
  const text =
    runs.length === 1 && first.length <= WHOLE_WORDS
      ? fragmentText(first)
      : `${fragmentText(first.slice(0, EDGE_WORDS))},${fragmentText(last.slice(-EDGE_WORDS))}`
  return `${hash || '#'}:~:text=${text}`
}
