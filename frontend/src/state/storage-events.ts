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
