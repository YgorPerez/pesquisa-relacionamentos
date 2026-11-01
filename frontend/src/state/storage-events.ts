type WriteSource = 'local' | 'link' | 'sync'
let writeSource: WriteSource = 'local'
const writeListeners = new Set<
  (key: string, value: unknown, source: WriteSource) => void
>()
export function withStorageSource<T>(source: WriteSource, action: () => T): T {
  const previous = writeSource
  writeSource = source
  try {
    return action()
  } finally {
    writeSource = previous
  }
}
export function followStoredWrites(
  listener: (key: string, value: unknown, source: WriteSource) => void,
) {
  writeListeners.add(listener)
  return () => {
    writeListeners.delete(listener)
  }
}

export function notifyStoredWrite(key: string, value: unknown) {
  for (const listener of writeListeners) listener(key, value, writeSource)
}

const removalListeners = new Set<(kind: RemovedKind, id: string) => void>()
export type RemovedKind = 'highlight' | 'comment'

/** The reader removed this item. A list without it is not enough to say so:
 * a list can also be short because it was never complete on this device. */
export function notifyRemoved(kind: RemovedKind, id: string) {
  for (const listener of removalListeners) listener(kind, id)
}
export function followRemovals(
  listener: (kind: RemovedKind, id: string) => void,
) {
  removalListeners.add(listener)
  return () => {
    removalListeners.delete(listener)
  }
}
