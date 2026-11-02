import { useSyncExternalStore } from 'react'

interface Readable<T> {
  readonly read: () => T | null
  readonly subscribe: (notify: () => void) => () => void
}

/** The saved value in a React component; `null` on the server and during
 * hydration. */
export function useStored<T>(part: Readable<T>): T | null {
  return useSyncExternalStore(part.subscribe, part.read, () => null)
}
