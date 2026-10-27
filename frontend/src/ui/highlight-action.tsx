// "Grifar" in the popover on selected text (#334): saves the selection as a
// Grifo in this browser, paints it and opens its popover, where the Nota is
// written. A selection inside a Grifo already painted gets "Ver grifo"
// instead, which opens that one: the way in for a keyboard, which has no
// tap. The count carries the action's name only.
import { addHighlight } from '#/state/highlights'
import { SEE_HIGHLIGHT } from './highlight.copy'
import { canPaint, requestOpen, usePainted, within } from './highlight-paint'
import { pageText, quoteInPage } from './highlight-text'
import { pageTitle } from './quote-text'
import { ACTION_LABEL } from './selection-popover.copy'
import type { Quote, SelectionActionProps } from './selection-action'
import { ActionButton } from './selection-button'
import { countSelection } from './selection-count'

/** Saves the quote as a Grifo; `null` when it holds no quotable text. */
function save(quote: Quote) {
  const where = quoteInPage(pageText(), quote.range)
  if (!where) return null
  return addHighlight({
    ...where,
    path: quote.path,
    pageTitle: pageTitle() || quote.path,
    link: quote.link.slice(new URL(quote.link).origin.length),
    text: quote.text,
  })
}

export function HighlightAction({ quote, close }: SelectionActionProps) {
  const painted = usePainted()
  if (!canPaint()) return null
  const open = (id: string) => {
    document.getSelection()?.removeAllRanges()
    close()
    requestOpen(id)
  }
  const inside = painted.find((p) => within(p.whole, quote.range))
  if (inside)
    return (
      <ActionButton onClick={() => open(inside.highlight.id)}>
        {SEE_HIGHLIGHT}
      </ActionButton>
    )
  const highlight = () => {
    const made = save(quote)
    if (!made) return
    countSelection('highlight')
    open(made.id)
  }
  return (
    <ActionButton onClick={highlight}>{ACTION_LABEL.highlight}</ActionButton>
  )
}
