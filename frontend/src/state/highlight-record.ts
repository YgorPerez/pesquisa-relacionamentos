// What one Grifo holds (#334), apart from its store (`highlights.ts`), so a
// piece that only shows Grifos, like the list of `/grifos` (#335), reads the
// shape without importing the store.

export interface Highlight {
  readonly id: string
  /** The page's path (`/onde-conhecer-pessoas`). */
  readonly path: string
  /** The page's title when the Grifo was made, to group them by page. */
  readonly pageTitle: string
  /** The path, the section anchor and the Text Fragment: what "Copiar link"
   * gives, without the origin. */
  readonly link: string
  /** The text as the page shows it, one line per block (`Quote.text`). */
  readonly text: string
  /** The quote in the page's text, spaces collapsed: what is looked for. */
  readonly exact: string
  /** Up to `CONTEXT_LENGTH` characters before and after it. */
  readonly prefix: string
  readonly suffix: string
  /** The Nota; `''` when there is none. */
  readonly note: string
  /** The last time its page was open, the quote was not found there. */
  readonly changed: boolean
  /** When it was made (ms since 1970). */
  readonly at: number
}
