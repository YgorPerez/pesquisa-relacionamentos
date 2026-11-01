import { savedProfile } from './profile-storage'
import { savedRequirements } from './possible-group'
import { savedPriorities } from './priorities'
import { highlights, validateHighlights } from './highlight-storage'
import { comments, validateSentComments } from './sent-comment-storage'
import { stored } from './stored'
import { followStoredWrites, withStorageSource } from './storage-events'
import { mergeSyncData, readSyncData, type SyncData } from './sync-data'

const journal = stored('sync-journal', readSyncData)
const protectedFields = stored('sync-link-fields', (raw) =>
  Array.isArray(raw) && raw.every((key) => typeof key === 'string')
    ? (raw as string[])
    : null,
)
export const syncBinding = stored('sync-account', (raw) =>
  typeof raw === 'number' ? raw : null,
)
const scalarStores = {
  profile: savedProfile,
  requirements: savedRequirements,
  priorities: savedPriorities,
}

function record(key: string, value: unknown, at: number) {
  const previous = journal.read() ?? {}
  if (JSON.stringify(previous[key]?.value) === JSON.stringify(value)) return
  journal.write(
    mergeSyncData(previous, {
      [key]: { at: Math.max(at, (previous[key]?.at ?? -1) + 1), value },
    }),
  )
}

// Registered at module load, before a route applies a received link. The
// journal survives offline edits and reloads; link overrides are device-only.
followStoredWrites((key, value, source) => {
  if (source === 'sync') return
  if (key in scalarStores) {
    const blocked = new Set(protectedFields.read() ?? [])
    if (source === 'link') blocked.add(key)
    else blocked.delete(key)
    protectedFields.write([...blocked])
    if (source !== 'link' && value !== null) record(key, value, Date.now())
  }
  if (key === 'highlights' || key === 'sent-comments') {
    const entries =
      key === 'highlights'
        ? validateHighlights(value)
        : validateSentComments(value)
    for (const item of entries ?? []) {
      if ('note' in item)
        record(`note:${item.id}`, { text: item.note }, Date.now())
      record(
        `${key === 'highlights' ? 'highlight' : 'comment'}:${item.id}`,
        'note' in item ? { ...item, note: '' } : item,
        Date.now(),
      )
    }
  }
})

/** Legacy values have no known edit time: never claim they are newer than a
 * timed account version. Seed only on an explicit device merge. */
export function deviceSyncData(): SyncData {
  const blocked = new Set(protectedFields.read() ?? [])
  for (const [key, store] of Object.entries(scalarStores)) {
    const value = store.read()
    if (value !== null && !blocked.has(key) && !journal.read()?.[key])
      record(key, value, 0)
  }
  for (const [prefix, items] of [
    ['highlight', highlights.read()],
    ['comment', comments.read()],
  ] as const)
    for (const item of items ?? []) {
      if ('note' in item && !journal.read()?.[`note:${item.id}`])
        record(`note:${item.id}`, { text: item.note }, item.at)
      if (!journal.read()?.[`${prefix}:${item.id}`])
        record(
          `${prefix}:${item.id}`,
          'note' in item ? { ...item, note: '' } : item,
          item.at,
        )
    }
  return journal.read() ?? {}
}

export function applySyncData(remote: SyncData) {
  const merged = mergeSyncData(remote, journal.read() ?? {})
  const blocked = new Set(protectedFields.read() ?? [])
  withStorageSource('sync', () => {
    journal.write(merged)
    if (!blocked.has('profile') && merged.profile)
      savedProfile.write(
        merged.profile.value as ReturnType<typeof savedProfile.read>,
      )
    if (!blocked.has('requirements') && merged.requirements)
      savedRequirements.write(
        merged.requirements.value as ReturnType<typeof savedRequirements.read>,
      )
    if (!blocked.has('priorities') && merged.priorities)
      savedPriorities.write(
        merged.priorities.value as ReturnType<typeof savedPriorities.read>,
      )
    const syncedHighlights = validateHighlights(
      Object.entries(merged)
        .filter(([key]) => key.startsWith('highlight:'))
        .map(([, entry]) => entry.value),
    )
    highlights.write(
      syncedHighlights?.map((item) => {
        const note = merged[`note:${item.id}`]?.value as
          | { text: string }
          | undefined
        return note ? { ...item, note: note.text } : item
      }) ?? null,
    )
    comments.write(
      validateSentComments(
        Object.entries(merged)
          .filter(([key]) => key.startsWith('comment:'))
          .map(([, entry]) => entry.value),
      ),
    )
  })
}
