// The count of an action of the popover on selected text (#332): one
// GoatCounter event with the action's name, never the text nor the page.
// The actions count through here, so the count's module keeps a small
// fan-in however many actions there are.
import { countEvent } from '#/analytics/counting'
import { EVENTS, type SelectionAction } from '#/analytics/events'

export const countSelection = (action: SelectionAction) =>
  countEvent(EVENTS.selection(action))
