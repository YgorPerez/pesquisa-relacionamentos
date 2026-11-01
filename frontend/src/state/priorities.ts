// The Priorities top 3 and outcome, saved in the browser and read by the
// `/prioridades` page and by the B1 Guide card. The value is plain JSON
// (`PrioritiesState`), the same the link carries.
import {
  INITIAL_OUTCOME,
  readPriorities,
  type PrioritiesState,
} from '@tem-estudo/rules/priorities'
import { savedPriorities } from './reader-choices'
import { useStored } from './use-stored'

export { LEGACY_PRIORITIES } from './reader-choices'

const NO_PRIORITIES: PrioritiesState = {
  top3: [],
  outcome: INITIAL_OUTCOME,
}

/** The saved state, only with the traits that exist in the data. Before
 * hydration (and on the server), the empty state. */
export function usePriorities(ids: ReadonlyArray<string>): PrioritiesState {
  const saved = useStored(savedPriorities)
  return (saved && readPriorities(saved, ids)) ?? NO_PRIORITIES
}

/** Saves (through the same validation as the reader); `null` deletes. */
export const savePriorities = (state: PrioritiesState | null) =>
  savedPriorities.write(state && readPriorities(state))
