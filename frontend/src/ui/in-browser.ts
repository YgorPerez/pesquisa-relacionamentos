import { useSyncExternalStore } from 'react'

/** Being in the browser does not change after hydration: no one to
 * notify. */
const noSubscribers = () => () => {}

/** `false` on the server and during hydration, `true` on the next render:
 * for a piece that only the browser can draw. */
export const useInBrowser = () =>
  useSyncExternalStore(
    noSubscribers,
    () => true,
    () => false,
  )
