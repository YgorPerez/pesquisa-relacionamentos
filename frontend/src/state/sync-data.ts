import { readProfile } from '@tem-estudo/rules/profile'
import { readRequirements } from '@tem-estudo/rules/requirements'
import { readPriorities } from '@tem-estudo/rules/priorities'
import { validateHighlights } from './highlight-storage'
import { validateSentComments } from './sent-comment-storage'
import { isQuoteRecord } from './json-record'

export interface SyncEntry {
  readonly at: number
  readonly value: unknown
}
export type SyncData = Readonly<Record<string, SyncEntry>>

function validateSyncValue(key: string, value: unknown): unknown {
  if (key === 'profile') return readProfile(value)
  if (key === 'requirements') return readRequirements(value)
  if (key === 'priorities') return readPriorities(value)
  if (
    key.startsWith('note:') &&
    isQuoteRecord(value) &&
    typeof value.text === 'string'
  )
    return { text: value.text.slice(0, 500) }
  if (key.startsWith('highlight:')) {
    const item = validateHighlights([value])?.[0]
    return item && key === `highlight:${item.id}` ? item : null
  }
  if (key.startsWith('comment:')) {
    const item = validateSentComments([value])?.[0]
    return item && key === `comment:${item.id}` ? item : null
  }
  return null
}

export function readSyncData(raw: unknown): SyncData | null {
  if (!isQuoteRecord(raw)) return null
  const entries: [string, SyncEntry][] = []
  for (const [key, entry] of Object.entries(raw)) {
    if (!isQuoteRecord(entry)) return null
    const { at } = entry
    if (typeof at !== 'number' || !Number.isSafeInteger(at) || at < 0)
      return null
    const value = validateSyncValue(key, entry.value)
    if (!value) return null
    entries.push([key, { at, value }])
  }
  return Object.fromEntries(entries)
}

/** Missing entries are never tombstones. Equal timestamps keep the server's
 * value so a retry cannot replace a version that already won. */
export function mergeSyncData(current: SyncData, incoming: SyncData): SyncData {
  const merged = { ...current }
  for (const [key, next] of Object.entries(incoming)) {
    const previous = merged[key]
    if (!previous || next.at > previous.at) merged[key] = next
  }
  return merged
}
