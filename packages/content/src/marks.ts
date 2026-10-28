// The marks a Guide's body writes inside a sentence (ADR 0042), with no
// dependency: the page's view imports them without pulling Effect along.

/** `{{brazil}}`: the sentence that follows has Brazilian data. */
export const BRAZIL_MARK = /\{\{brazil\}\}/g

/** `{{you:<finding>}}`: the finding's sample may be the reader's, which the
 * page marks with "vale para você" once it knows the Profile. */
export const YOU_MARK = /\{\{you:([a-z0-9]+(?:-[a-z0-9]+)*)\}\}/g

/** `[[Pew]]` or `[[satisfacao|satisfeitos]]`: a Verbete (#349). Alone, the
 * word is one of the Verbete's forms; with a `|`, the slug comes first and
 * the text the reader sees after it. */
export const TERM_MARK = /\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g

/** The text with each Verbete mark turned into the word the reader sees. */
export const withoutTermMarks = (markdown: string): string =>
  markdown.replace(
    TERM_MARK,
    (_, first: string, shown: string | undefined) => shown ?? first,
  )
