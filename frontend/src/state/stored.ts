function subscribeToStorage(
  name: string,
  subscribers: Set<() => void>,
  notify: () => void,
) {
  const onOtherTab = (event: StorageEvent) => {
    if (event.key === name || event.key === null) notify()
  }
  return (subscriber: () => void) => {
    subscribers.add(subscriber)
    if (subscribers.size === 1) window.addEventListener('storage', onOtherTab)
    return () => {
      subscribers.delete(subscriber)
      if (subscribers.size === 0)
        window.removeEventListener('storage', onOtherTab)
    }
  }
}

// State that lives only in the browser (spec, "Estado no link"; story 68): the
// Profile, the Requirements, and the calculators' top 3 and outcome. Each part
// has its own localStorage key and a reader that validates what it finds
// there, because the storage may hold junk from another version.
//
// On the server, and during hydration, the value is always `null`: the page
// comes out the same for everyone and the browser applies the saved state
// right after.
import { useSyncExternalStore } from 'react'

export interface Stored<T> {
  /** The saved value, already validated; `null` if there is nothing (or on
   * the server). */
  readonly read: () => T | null
  /** Saves and notifies the subscribers; `null` deletes. */
  readonly write: (value: T | null) => void
  readonly subscribe: (notify: () => void) => () => void
}

/** Where a part was saved before the code moved to English (ADR 0039), and
 * how its old JSON becomes the new one. */
export interface LegacyKey {
  readonly key: string
  readonly migrate: (raw: unknown) => unknown
}

/** The prefix of every site key in localStorage and sessionStorage. */
export const PREFIX = 'tem-estudo:'

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    // A browser with storage blocked: the site works without saving.
    return null
  }
}

/** The object with its keys renamed by `names` (old → new); the others go
 * through unchanged. Anything that is not an object comes back as is. */
export function renameKeys(
  raw: unknown,
  names: Readonly<Record<string, string>>,
): unknown {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [names[key] ?? key, value]),
  )
}

/** Moves the value under the legacy key to the new one, in the new shape, and
 * removes the legacy key. A value already under the new key wins. */
function migrate(local: Storage, name: string, legacy: LegacyKey) {
  const legacyName = PREFIX + legacy.key
  const old = local.getItem(legacyName)
  if (old === null) return
  if (local.getItem(name) === null) {
    try {
      local.setItem(name, JSON.stringify(legacy.migrate(JSON.parse(old))))
    } catch {
      // Junk under the legacy key: nothing to carry over.
    }
  }
  local.removeItem(legacyName)
}

/** A part of the local state, in `tem-estudo:<key>`. `validate` receives the
 * raw JSON and returns the value or `null`. With `legacy`, the first read
 * carries over what an older version saved under another key. */
export function stored<T>(
  key: string,
  validate: (raw: unknown) => T | null,
  legacy?: LegacyKey,
): Stored<T> {
  const name = PREFIX + key
  const subscribers = new Set<() => void>()
  // `useSyncExternalStore` compares by reference: keep the last one read.
  let lastRaw: string | null | undefined
  let value: T | null = null
  let migrated = !legacy

  const read = (): T | null => {
    let current: string | null = null
    try {
      const local = storage()
      if (!migrated && local && legacy) {
        migrated = true
        migrate(local, name, legacy)
      }
      current = local?.getItem(name) ?? null
    } catch {
      current = null
    }
    if (current !== lastRaw) {
      lastRaw = current
      try {
        value = current === null ? null : validate(JSON.parse(current))
      } catch {
        value = null
      }
    }
    return value
  }

  const notify = () => subscribers.forEach((subscriber) => subscriber())

  const write = (next: T | null) => {
    try {
      const local = storage()
      if (next === null) local?.removeItem(name)
      else local?.setItem(name, JSON.stringify(next))
    } catch {
      // No space or blocked: the value is gone on reload, and that is all.
    }
    notify()
  }

  const subscribe = subscribeToStorage(name, subscribers, notify)

  return { read, write, subscribe }
}

/** The saved value in a React component; `null` on the server and during
 * hydration. */
export function useStored<T>(part: Stored<T>): T | null {
  return useSyncExternalStore(part.subscribe, part.read, () => null)
}
