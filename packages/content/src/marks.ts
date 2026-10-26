// The marks a Guide's body writes inside a sentence (ADR 0042), with no
// dependency: the page's view imports them without pulling Effect along.

/** `{{brazil}}`: the sentence that follows has Brazilian data. */
export const BRAZIL_MARK = /\{\{brazil\}\}/g

/** `{{you:<finding>}}`: the finding's sample may be the reader's, which the
 * page marks with "vale para você" once it knows the Profile. */
export const YOU_MARK = /\{\{you:([a-z0-9]+(?:-[a-z0-9]+)*)\}\}/g
