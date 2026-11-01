// What this device gives to and takes from the account (ADR 0046). The journal
// holds each synced value with the time it changed. It starts only when the
// device joins: a reader who never does keeps no second copy, only the time of
// each Perfil-like edit, so a first merge can tell which version is the newest.
import { sameQuote, type Highlight } from './highlight-record'
import { highlights, validateHighlights } from './highlight-storage'
import { savedPriorities } from './priorities'
import { savedProfile } from './profile-storage'
import { savedRequirements } from './requirements-storage'
import {
  comments,
  validateSentComments,
  type SentComment,
} from './sent-comment-storage'
import {
  followRemovals,
  followStoredWrites,
  withStorageSource,
} from './storage-events'
import { stored, useStored } from './stored'
import { mergeSyncData, readSyncData, type SyncData } from './sync-data'

const journal = stored('sync-journal', readSyncData)
const edits = stored('sync-edits', (raw) =>
  typeof raw === 'object' && raw !== null
    ? (raw as Readonly<Record<string, number>>)
    : null,
)
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
type ScalarKey = keyof typeof scalarStores
const isScalar = (key: string): key is ScalarKey => key in scalarStores
const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b)
const tracking = () => syncBinding.read() !== null || journal.read() !== null

function record(key: string, value: unknown, at: number, force = false) {
  const previous = journal.read() ?? {}
  if (!force && previous[key] && same(previous[key].value, value)) return
  journal.write({
    ...previous,
    [key]: { at: Math.max(at, (previous[key]?.at ?? -1) + 1), value },
  })
}

function followScalarWrite(key: ScalarKey, value: unknown, fromLink: boolean) {
  const blocked = new Set(protectedFields.read() ?? [])
  const wasFromLink = blocked.has(key)
  if (fromLink) blocked.add(key)
  // Clearing what a link brought only drops the link's copy: the account's
  // version comes back on the next merge, nothing is erased there.
  else blocked.delete(key)
  protectedFields.write(blocked.size > 0 ? [...blocked] : null)
  if (fromLink || (wasFromLink && value === null)) return
  if (tracking()) record(key, value, Date.now())
  else {
    const { [key]: _dropped, ...rest } = edits.read() ?? {}
    edits.write(value === null ? rest : { ...rest, [key]: Date.now() })
  }
}

function followList(key: string, value: unknown) {
  if (!tracking()) return
  if (key === 'highlights')
    for (const item of validateHighlights(value) ?? []) {
      // A newer Nota also renews its Grifo, so it survives an older removal.
      const noteMoved = !same(journal.read()?.[`note:${item.id}`]?.value, {
        text: item.note,
      })
      if (noteMoved) record(`note:${item.id}`, { text: item.note }, Date.now())
      record(`highlight:${item.id}`, { ...item, note: '' }, Date.now(), noteMoved)
    }
  else
    for (const item of validateSentComments(value) ?? [])
      record(`comment:${item.id}`, item, Date.now())
}

// Registered at module load, before a route applies a received link.
followStoredWrites((key, value, source) => {
  if (source === 'sync') return
  if (isScalar(key)) followScalarWrite(key, value, source === 'link')
  else if (source === 'local' && (key === 'highlights' || key === 'sent-comments'))
    followList(key, value)
})

followRemovals((kind, id) => {
  if (!tracking()) return
  const now = Date.now()
  if (kind === 'comment') {
    record(`comment:${id}`, null, now)
    return
  }
  // A twin of this passage, hidden by `shownHighlights`, goes with it.
  const entries = journal.read() ?? {}
  const removed = entries[`highlight:${id}`]?.value as Highlight | null | undefined
  for (const [key, entry] of Object.entries(entries)) {
    const other = entry.value as Highlight | null
    if (!key.startsWith('highlight:') || !other || !removed) continue
    if (other.path === removed.path && sameQuote(other, removed)) {
      record(key, null, now)
      record(`note:${other.id}`, null, now)
    }
  }
  record(`highlight:${id}`, null, now)
  record(`note:${id}`, null, now)
})

/** A value from before sync has no known edit time: it never claims to be
 * newer than a timed account version. A field a link replaced is not offered:
 * the journal still holds what the account had. */
export function deviceSyncData(): SyncData {
  const blocked = new Set(protectedFields.read() ?? [])
  for (const [key, store] of Object.entries(scalarStores)) {
    const value = store.read()
    if (value !== null && !blocked.has(key) && !journal.read()?.[key])
      record(key, value, edits.read()?.[key] ?? 0)
  }
  for (const item of highlights.read() ?? []) {
    if (!journal.read()?.[`note:${item.id}`])
      record(`note:${item.id}`, { text: item.note }, item.at)
    if (!journal.read()?.[`highlight:${item.id}`])
      record(`highlight:${item.id}`, { ...item, note: '' }, item.at)
  }
  for (const item of comments.read() ?? [])
    if (!journal.read()?.[`comment:${item.id}`])
      record(`comment:${item.id}`, item, item.at)
  return journal.read() ?? {}
}

/** What the journal says plus what only this device's list has, because a
 * merge never loses an item the journal failed to hold. */
function mergedList<T extends { readonly id: string; readonly at: number }>(
  prefix: string,
  merged: SyncData,
  current: ReadonlyArray<T> | null,
  decode: (raw: unknown) => ReadonlyArray<T> | null,
): T[] {
  const fromJournal = Object.entries(merged)
    .filter(([key, entry]) => key.startsWith(prefix) && entry.value !== null)
    .map(([, entry]) => entry.value)
  const onlyHere = (current ?? []).filter(
    (item) => !merged[`${prefix}${item.id}`],
  )
  return [...(decode(fromJournal) ?? []), ...onlyHere].sort(
    (a, b) => a.at - b.at || a.id.localeCompare(b.id),
  )
}

/** Two devices can mark the same passage under different ids. It shows once,
 * and a twin with a Nota always shows: hiding one only ever hides an empty
 * mark, which stays in the journal. */
function shownHighlights(list: ReadonlyArray<Highlight>) {
  return list.filter(
    (item, index) =>
      item.note !== '' ||
      !list.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          other.path === item.path &&
          sameQuote(other, item) &&
          (other.note !== '' || otherIndex < index),
      ),
  )
}

function writeIfChanged<T>(
  store: {
    read: () => T | null
    write: (value: T | null) => void
  },
  next: T | null,
) {
  if (!same(store.read(), next)) store.write(next)
}

function applyHighlights(merged: SyncData) {
  const list = mergedList(
    'highlight:',
    merged,
    highlights.read(),
    validateHighlights,
  ).map((item) => {
    const note = merged[`note:${item.id}`]?.value as { text: string } | null
    return note ? { ...item, note: note.text } : item
  })
  const shown = shownHighlights(list)
  writeIfChanged(highlights, shown.length > 0 ? shown : null)
}

function applyComments(merged: SyncData) {
  const list: SentComment[] = mergedList(
    'comment:',
    merged,
    comments.read(),
    validateSentComments,
  )
  writeIfChanged(comments, list.length > 0 ? list : null)
}

/** Takes the account's answer. `sent` is what this device offered: an entry
 * still as it was sent gives way to the account's, which holds a clock that
 * ran ahead to the server's time; one edited since is still newer. */
export function applySyncData(remote: SyncData, sent: SyncData = {}) {
  const local = journal.read() ?? {}
  const keep = Object.fromEntries(
    Object.entries(local).filter(
      ([key, entry]) => !remote[key] || sent[key]?.at !== entry.at,
    ),
  )
  const merged = mergeSyncData(remote, keep)
  const blocked = new Set(protectedFields.read() ?? [])
  withStorageSource('sync', () => {
    journal.write(merged)
    for (const key of Object.keys(scalarStores) as ScalarKey[]) {
      const entry = merged[key]
      if (!blocked.has(key) && entry)
        writeIfChanged(
          scalarStores[key] as {
            read: () => unknown
            write: (value: unknown) => void
          },
          entry.value,
        )
    }
    applyHighlights(merged)
    applyComments(merged)
  })
}

/** The fields a link replaced here, which the reader can trade back. */
export const useLinkFields = () => useStored(protectedFields)

/** "Voltar aos dados da conta": a field the account never had goes empty,
 * since keeping the link's value would upload it on the next merge. */
export function releaseLinkFields() {
  const fields = protectedFields.read() ?? []
  protectedFields.write(null)
  const local = journal.read() ?? {}
  withStorageSource('sync', () => {
    for (const key of fields)
      if (isScalar(key) && !local[key]) scalarStores[key].write(null)
  })
  applySyncData(local)
}
