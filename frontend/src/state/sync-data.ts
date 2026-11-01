import { readProfile } from '@tem-estudo/rules/profile'
import { readRequirements } from '@tem-estudo/rules/requirements'
import { readPriorities } from '@tem-estudo/rules/priorities'
import { validateHighlights } from './highlight-storage'
import { validateSentComments } from './sent-comment-storage'
import { isQuoteRecord } from './json-record'

export interface SyncEntry {
  readonly at: number
  /** `null` when the reader removed it: the id stays, the content does not. */
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

const SCALARS = ['profile', 'requirements', 'priorities']
const knownKey = (key: string) =>
  SCALARS.includes(key) ||
  /^(note|highlight|comment):./.test(key)

export function readSyncData(raw: unknown): SyncData | null {
  if (!isQuoteRecord(raw)) return null
  const entries: [string, SyncEntry][] = []
  for (const [key, entry] of Object.entries(raw)) {
    if (!isQuoteRecord(entry)) return null
    const { at } = entry
    if (typeof at !== 'number' || !Number.isSafeInteger(at) || at < 0)
      return null
    const value =
      entry.value === null && knownKey(key)
        ? null
        : validateSyncValue(key, entry.value)
    if (!value && entry.value !== null) return null
    if (!knownKey(key)) return null
    entries.push([key, { at, value }])
  }
  return Object.fromEntries(entries)
}

/** A missing entry never deletes; only an entry the reader removed, with
 * `value: null`, can replace an older one. Equal timestamps keep the server's
 * value so a retry cannot replace a version that already won. */
export function mergeSyncData(current: SyncData, incoming: SyncData): SyncData {
  const merged = { ...current }
  for (const [key, next] of Object.entries(incoming)) {
    const previous = merged[key]
    if (!previous || next.at > previous.at) merged[key] = next
  }
  return merged
}
