// Whether the quotes of the Comentários sent from a page are still on it
// (#347). The Grifo layer (`highlight-layer.tsx`) calls it each time it
// paints, so "Seus trechos" can say "Este trecho mudou" of a Comentário as
// it does of a Grifo. Nothing is painted: a Comentário is not a Grifo. It
// does not need the CSS Custom Highlight API, only the page's text.
import { markCommentsFound, readSentComments } from '#/state/sent-comments'
import { findQuote, pageText } from './highlight-text'

/** Looks for the quotes of the Comentários sent from the page at `path` and
 * marks the missing ones changed in the store. */
export function checkSentComments(path: string) {
  const here = readSentComments().filter((comment) => comment.path === path)
  // Most pages have none: no need to read the page's text.
  if (here.length === 0) return
  const page = pageText()
  const found = here.filter((comment) => findQuote(page, comment) !== null)
  markCommentsFound(path, new Set(found.map((comment) => comment.id)))
}
