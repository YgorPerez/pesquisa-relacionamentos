// The count of the popover's actions (#332): one GoatCounter event per
// action, its name only, never the text nor the page. The actions count
// through here and not `analytics/counting.ts` itself, which many pages
// import already.
import { countEvent } from '#/analytics/counting'
import { EVENTS, type SelectionAction } from '#/analytics/events'

export function countSelection(action: SelectionAction) {
  countEvent(EVENTS.selection(action))
}
