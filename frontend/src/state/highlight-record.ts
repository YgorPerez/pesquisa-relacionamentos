// What one Grifo holds (#334), apart from its store (`highlights.ts`), so a
// piece that only shows Grifos, like the list of `/trechos` (#335), reads the
// shape without importing the store. A sent Comentário keeps its quote the
// same way (`sent-comments.ts`, #347).

/** Where the quote is in the page's text, as a W3C TextQuoteSelector puts
 * it: the quote, spaces collapsed, which is what is looked for, and up to
 * `CONTEXT_LENGTH` characters before and after it, which only pick among
 * repeats (`ui/highlight-text.ts`). */
export interface TextQuote {
  readonly exact: string
  readonly prefix: string
  readonly suffix: string
}

/** Whether two quotes are the same text at the same place. */
export const sameQuote = (a: TextQuote, b: TextQuote): boolean =>
  a.exact === b.exact && a.prefix === b.prefix && a.suffix === b.suffix

/** A quote kept in this browser that its page looks for when it opens: a
 * Grifo, or a sent Comentário (`sent-comments.ts`, #347). */
export interface KeptQuote extends TextQuote {
  readonly id: string
  /** The page's path (`/onde-conhecer-pessoas`). */
  readonly path: string
  /** The last time its page was open, the quote was not found there. */
  readonly changed: boolean
}

/** After the page at `path` looked for its quotes: the ones in `found` were
 * there, the others are marked changed. `null` when no mark moves, so the
 * store writes nothing. */
export function markedFound<T extends KeptQuote>(
  saved: ReadonlyArray<T>,
  path: string,
  found: ReadonlySet<string>,
): ReadonlyArray<T> | null {
  const moved = saved.some(
    (kept) => kept.path === path && kept.changed === found.has(kept.id),
  )
  if (!moved) return null
  return saved.map((kept) =>
    kept.path === path ? { ...kept, changed: !found.has(kept.id) } : kept,
  )
}

/** A Grifo, as `localStorage` keeps it: its `TextQuote` fields sit flat
 * next to the others. */
export interface Highlight extends KeptQuote {
  /** The page's title when the Grifo was made, to group them by page. */
  readonly pageTitle: string
  /** The path, the section anchor and the Text Fragment: what "Copiar link"
   * gives, without the origin. */
  readonly link: string
  /** The text as the page shows it, one line per block (`Quote.text`). */
  readonly text: string
  /** The Nota; `''` when there is none. */
  readonly note: string
  /** When it was made (ms since 1970). */
  readonly at: number
}

/** How much text on each side is kept to tell repeats apart. */
export const CONTEXT_LENGTH = 32

export const isQuoteRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw)

const QUOTE_STRINGS = [
  'id',
  'path',
  'pageTitle',
  'link',
  'text',
  'exact',
] as const

/** The page and quote fields shared by saved highlights and sent comments. */
export function decodeKeptQuote(
  raw: Record<string, unknown>,
): Omit<Highlight, 'note'> | null {
  for (const key of QUOTE_STRINGS)
    if (typeof raw[key] !== 'string' || raw[key] === '') return null
  const { prefix, suffix, changed, at } = raw
  if (typeof prefix !== 'string' || typeof suffix !== 'string') return null
  if (typeof at !== 'number' || !Number.isFinite(at)) return null
  const text = (key: (typeof QUOTE_STRINGS)[number]) => raw[key] as string
  return {
    id: text('id'),
    path: text('path'),
    pageTitle: text('pageTitle'),
    link: text('link'),
    text: text('text'),
    exact: text('exact'),
    prefix: prefix.slice(-CONTEXT_LENGTH),
    suffix: suffix.slice(0, CONTEXT_LENGTH),
    changed: changed === true,
    at,
  }
}

/** Drop invalid records and repeated IDs, keeping the first valid record. */
export function decodeQuoteList<T extends KeptQuote>(
  raw: unknown,
  decode: (item: unknown) => T | null,
): ReadonlyArray<T> | null {
  if (!Array.isArray(raw)) return null
  const seen = new Set<string>()
  return raw.flatMap((item) => {
    const valid = decode(item)
    if (!valid || seen.has(valid.id)) return []
    seen.add(valid.id)
    return [valid]
  })
}
