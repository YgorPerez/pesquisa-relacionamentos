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
  SCALARS.includes(key) || /^(note|highlight|comment):./.test(key)

function readEntry(key: string, entry: unknown): SyncEntry | null {
  if (!isQuoteRecord(entry) || !knownKey(key)) return null
  const { at } = entry
  if (typeof at !== 'number' || !Number.isSafeInteger(at) || at < 0) return null
  const value = entry.value === null ? null : validateSyncValue(key, entry.value)
  return value || entry.value === null ? { at, value } : null
}

/** All of it, or `null` if any entry fails: what a device may send. */
export function readSyncData(raw: unknown): SyncData | null {
  if (!isQuoteRecord(raw)) return null
  const entries = Object.entries(raw).map(
    ([key, entry]) => [key, readEntry(key, entry)] as const,
  )
  return entries.every(([, entry]) => entry)
    ? (Object.fromEntries(entries) as SyncData)
    : null
}

/** What the account holds that this version can read. An entry it cannot, from
 * another version of these rules, stays stored and is not offered. */
export const readableSyncData = (stored: Record<string, unknown>): SyncData =>
  Object.fromEntries(
    Object.entries(stored).flatMap(([key, raw]) => {
      const entry = readEntry(key, raw)
      return entry ? [[key, entry]] : []
    }),
  )

/** `mergeSyncData` over the stored JSON: only an entry that wins is written, so
 * everything else stays byte for byte, the unreadable above all. */
export function mergeStoredSyncData(
  stored: Record<string, unknown>,
  incoming: SyncData,
): Record<string, unknown> {
  const merged = { ...stored }
  for (const [key, next] of Object.entries(incoming)) {
    const previous = readEntry(key, stored[key])
    if (stored[key] === undefined || (previous && next.at > previous.at))
      merged[key] = next
  }
  return merged
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
