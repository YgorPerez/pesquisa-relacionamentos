// The count of the popover's actions on selected text (#332): one event per
// action, with its name and never the text. The actions import this, and
// not the analytics, so the popover adds one importer to `counting.ts`, not
// one per action.
import { countEvent } from '#/analytics/counting'
import { EVENTS, type SelectionAction } from '#/analytics/events'

export const countSelection = (action: SelectionAction) =>
  countEvent(EVENTS.selection(action))
