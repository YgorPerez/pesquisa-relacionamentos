import { savedProfile } from './profile'
import { savedRequirements } from './possible-group'
import { savedPriorities } from './priorities'
import { highlights, validateHighlights } from './highlights'
import { comments, validateSentComments } from './sent-comments'
import { followStoredWrites, stored, withStorageSource } from './stored'
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
    for (const item of entries ?? [])
      record(
        `${key === 'highlights' ? 'highlight' : 'comment'}:${item.id}`,
        item,
        Date.now(),
      )
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
    for (const item of items ?? [])
      if (!journal.read()?.[`${prefix}:${item.id}`])
        record(`${prefix}:${item.id}`, item, item.at)
  return journal.read() ?? {}
}

export function applySyncData(remote: SyncData) {
  const merged = mergeSyncData(journal.read() ?? {}, remote)
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
    highlights.write(
      validateHighlights(
        Object.entries(merged)
          .filter(([key]) => key.startsWith('highlight:'))
          .map(([, entry]) => entry.value),
      ),
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
