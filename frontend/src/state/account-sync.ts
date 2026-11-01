import { useSyncExternalStore } from 'react'
import { followStoredWrites } from './stored'
import { applySyncData, deviceSyncData, syncBinding } from './sync-device'
import { readSyncData } from './sync-data'

export type SyncStatus =
  | 'loading'
  | 'anonymous'
  | 'ask'
  | 'declined'
  | 'device'
  | 'active'
  | 'failed'
let status: SyncStatus = 'loading'
const listeners = new Set<() => void>()
function setStatus(next: SyncStatus) {
  status = next
  for (const listener of listeners) listener()
}
export function useSyncStatus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => status,
    () => 'loading' as const,
  )
}

async function request(body?: unknown) {
  const response = await fetch('/api/sync', {
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
  })
  if (response.status === 401) {
    setStatus('anonymous')
    return null
  }
  if (!response.ok) throw new Error('Sync failed')
  return (await response.json()) as {
    accountId: number
    consent: boolean | null
    data?: unknown
  }
}

let running: Promise<void> | null = null
let pending = false
async function exchange() {
  const state = await request()
  if (!state) return
  if (state.consent === null) {
    setStatus('ask')
    return
  }
  if (!state.consent) {
    setStatus('declined')
    return
  }
  if (syncBinding.read() !== state.accountId) {
    setStatus('device')
    return
  }
  const binding = state.accountId
  const result = await request({ accountId: binding, data: deviceSyncData() })
  if (!result || result.accountId !== binding || syncBinding.read() !== binding)
    return
  const data = readSyncData(result.data)
  if (!data) throw new Error('Invalid sync response')
  applySyncData(data)
  setStatus('active')
}
export function refreshSync(): Promise<void> {
  pending = true
  if (running) return running
  running = (async () => {
    try {
      while (pending) {
        pending = false
        await exchange()
      }
    } catch {
      setStatus('failed')
    } finally {
      running = null
    }
  })()
  return running
}

export async function decideSync(accept: boolean) {
  try {
    const result = await request({ consent: accept })
    if (!result) return
    if (accept && result.consent === true) syncBinding.write(result.accountId)
    await refreshSync()
  } catch {
    setStatus('failed')
  }
}

/** Runs only in the browser. Anonymous requests don't open the database. */
export function startAccountSync() {
  void refreshSync()
  const stop = followStoredWrites((key, _value, source) => {
    if (
      source === 'local' &&
      [
        'profile',
        'requirements',
        'priorities',
        'highlights',
        'sent-comments',
      ].includes(key) &&
      status === 'active'
    )
      void refreshSync()
  })
  const refresh = () => {
    void refreshSync()
  }
  window.addEventListener('online', refresh)
  window.addEventListener('focus', refresh)
  return () => {
    stop()
    window.removeEventListener('online', refresh)
    window.removeEventListener('focus', refresh)
  }
}
