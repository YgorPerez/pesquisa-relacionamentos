import { useSyncExternalStore } from 'react'

const stable = () => () => {}

/** Whether the page runs JS: the server's HTML has no button that would do
 * nothing. */
export const useHydrated = () =>
  useSyncExternalStore(
    stable,
    () => true,
    () => false,
  )
