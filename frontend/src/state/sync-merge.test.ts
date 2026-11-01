// The merge across devices, through what the browser really stores: each
// "device" is its own localStorage, and the account is a merge of what they
// send, as `platform/sync.ts` does it.
import { beforeEach, expect, test, vi } from 'vite-plus/test'
import {
  addHighlight,
  readHighlights,
  removeHighlight,
  setNote,
} from './highlights'
import { savedProfile, saveProfile } from './profile'
import {
  addSentComment,
  readSentComments,
  removeSentComment,
} from './sent-comments'
import { withStorageSource } from './storage-events'
import {
  applySyncData,
  deviceSyncData,
  releaseLinkFields,
  syncBinding,
} from './sync-device'
import { mergeSyncData, readSyncData, type SyncData } from './sync-data'

vi.mock('virtual:possible-group', () => ({
  default: { base: '', places: [], example: {} },
}))

const devices = new Map<string, Map<string, string>>()
let items = new Map<string, string>()
let account: SyncData = {}
let failJournalWrites = false

function on(device: string) {
  items = devices.get(device) ?? new Map<string, string>()
  devices.set(device, items)
}
function bind() {
  syncBinding.write(1)
}
/** One round trip, as `account-sync.ts` makes it. */
function sync() {
  const sent = deviceSyncData()
  account = mergeSyncData(account, readSyncData(sent)!)
  applySyncData(account, sent)
}
const quote = (exact: string) => ({
  path: '/guia',
  pageTitle: 'Guia',
  link: '/guia',
  text: exact,
  exact,
  prefix: '',
  suffix: '',
})
const sentComment = (text: string) => ({
  ...quote(text),
  kind: 'wrong' as const,
  comment: text,
  issue: 7,
})
const raw = () => [...items.values()].join('\n')

beforeEach(() => {
  devices.clear()
  account = {}
  failJournalWrites = false
  on('a')
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (failJournalWrites && key.endsWith('sync-journal'))
          throw new Error('quota')
        items.set(key, value)
      },
      removeItem: (key: string) => {
        items.delete(key)
      },
    },
  })
})

test('first merge adds up the Grifos of both devices and keeps each Nota', () => {
  const mine = addHighlight(quote('um'))
  setNote(mine.id, 'nota do celular')
  bind()
  sync()
  on('b')
  const theirs = addHighlight(quote('dois'))
  setNote(theirs.id, 'nota do computador')
  bind()
  sync()
  on('a')
  sync()
  for (const device of ['a', 'b']) {
    on(device)
    expect(
      readHighlights()
        .map((h) => [h.exact, h.note])
        .sort(),
    ).toEqual([
      ['dois', 'nota do computador'],
      ['um', 'nota do celular'],
    ])
  }
})

test('sent Comentários add up across devices', () => {
  addSentComment(sentComment('um'))
  bind()
  sync()
  on('b')
  addSentComment(sentComment('dois'))
  bind()
  sync()
  expect(
    readSentComments()
      .map((c) => c.comment)
      .sort(),
  ).toEqual(['dois', 'um'])
})

test('the Perfil keeps the most recent version, whichever device merges last', () => {
  vi.useFakeTimers({ now: 1_000 })
  saveProfile({ age: 30 })
  on('b')
  vi.setSystemTime(2_000)
  saveProfile({ age: 40 })
  bind()
  sync()
  on('a')
  bind()
  sync()
  expect(savedProfile.read()).toEqual({ age: 40 })
  on('b')
  sync()
  expect(savedProfile.read()).toEqual({ age: 40 })
  vi.useRealTimers()
})

test('an empty account or an empty device removes nothing', () => {
  addHighlight(quote('um'))
  saveProfile({ age: 30 })
  bind()
  applySyncData({})
  expect(readHighlights()).toHaveLength(1)
  expect(savedProfile.read()).toEqual({ age: 30 })
  sync()
  on('b')
  bind()
  sync()
  expect(readHighlights()).toHaveLength(1)
  expect(savedProfile.read()).toEqual({ age: 30 })
  on('a')
  sync()
  expect(readHighlights()).toHaveLength(1)
})

test('a Grifo the journal could not hold survives a merge', () => {
  bind()
  sync()
  failJournalWrites = true
  addHighlight(quote('um'))
  applySyncData(account)
  expect(readHighlights().map((h) => h.exact)).toEqual(['um'])
})

test('a Grifo the reader removes leaves every device and does not come back', () => {
  const mine = addHighlight(quote('um'))
  setNote(mine.id, 'nota íntima')
  bind()
  sync()
  on('b')
  bind()
  sync()
  expect(readHighlights()).toHaveLength(1)
  removeHighlight(mine.id)
  sync()
  expect(readHighlights()).toEqual([])
  expect(raw()).not.toContain('nota íntima')
  on('a')
  sync()
  expect(readHighlights()).toEqual([])
  expect(raw()).not.toContain('nota íntima')
  expect(JSON.stringify(account)).not.toContain('nota íntima')
})

test('a Nota written after the removal on another device keeps its Grifo', () => {
  vi.useFakeTimers({ now: 1_000 })
  const mine = addHighlight(quote('um'))
  bind()
  sync()
  on('b')
  bind()
  sync()
  on('a')
  vi.setSystemTime(2_000)
  removeHighlight(mine.id)
  sync()
  on('b')
  vi.setSystemTime(3_000)
  setNote(mine.id, 'escrita depois')
  sync()
  expect(readHighlights()[0]?.note).toBe('escrita depois')
  on('a')
  sync()
  expect(readHighlights()[0]?.note).toBe('escrita depois')
  vi.useRealTimers()
})

test('a removed Comentário and a removed Perfil stay removed', () => {
  const comment = addSentComment(sentComment('um'))
  saveProfile({ age: 30 })
  bind()
  sync()
  on('b')
  bind()
  sync()
  removeSentComment(comment.id)
  saveProfile(null)
  sync()
  on('a')
  sync()
  expect(readSentComments()).toEqual([])
  expect(savedProfile.read()).toBeNull()
})

test('the same passage marked on two devices shows once, and no Nota is hidden', () => {
  addHighlight(quote('um'))
  bind()
  sync()
  on('b')
  const twin = addHighlight(quote('um'))
  bind()
  sync()
  expect(readHighlights()).toHaveLength(1)
  on('b')
  removeHighlight(readHighlights()[0]!.id)
  sync()
  expect(readHighlights()).toEqual([])
  expect(twin.id).toBeTruthy()
  on('a')
  sync()
  expect(readHighlights()).toEqual([])
})

test('two Notas on the same passage both stay', () => {
  setNote(addHighlight(quote('um')).id, 'primeira')
  bind()
  sync()
  on('b')
  setNote(addHighlight(quote('um')).id, 'segunda')
  bind()
  sync()
  expect(
    readHighlights()
      .map((h) => h.note)
      .sort(),
  ).toEqual(['primeira', 'segunda'])
})

test('a device clock ahead cannot keep beating later edits once the account corrects it', () => {
  saveProfile({ age: 30 })
  bind()
  const sent = deviceSyncData()
  account = { profile: { at: 5, value: { age: 31 } } }
  applySyncData(account, sent)
  expect(savedProfile.read()).toEqual({ age: 31 })
  expect(deviceSyncData().profile?.at).toBe(5)
})

test('an edit made while the exchange was in flight is not lost', () => {
  bind()
  saveProfile({ age: 30 })
  const sent = deviceSyncData()
  account = mergeSyncData(account, readSyncData(sent)!)
  saveProfile({ age: 31 })
  applySyncData(account, sent)
  expect(savedProfile.read()).toEqual({ age: 31 })
  expect(deviceSyncData().profile?.value).toEqual({ age: 31 })
})

test('a shared link stays on the device until the reader edits that field', () => {
  saveProfile({ age: 30 })
  bind()
  sync()
  withStorageSource('link', () => saveProfile({ age: 22 }))
  sync()
  expect(savedProfile.read()).toEqual({ age: 22 })
  expect(account.profile?.value).toEqual({ age: 30 })
  on('b')
  bind()
  sync()
  expect(savedProfile.read()).toEqual({ age: 30 })
  on('a')
  saveProfile({ age: 23 })
  sync()
  expect(account.profile?.value).toEqual({ age: 23 })
})

test('clearing a Perfil that came by link does not erase the account version', () => {
  saveProfile({ age: 30 })
  bind()
  sync()
  withStorageSource('link', () => saveProfile({ age: 22 }))
  saveProfile(null)
  sync()
  expect(account.profile?.value).toEqual({ age: 30 })
  expect(savedProfile.read()).toEqual({ age: 30 })
})

test('going back to the account version replaces the link and uploads nothing', () => {
  saveProfile({ age: 30 })
  bind()
  sync()
  withStorageSource('link', () => saveProfile({ age: 22 }))
  releaseLinkFields()
  expect(savedProfile.read()).toEqual({ age: 30 })
  sync()
  expect(account.profile?.value).toEqual({ age: 30 })
})

test('going back when the account has no version forgets the link and sends nothing', () => {
  bind()
  sync()
  withStorageSource('link', () => saveProfile({ age: 22 }))
  releaseLinkFields()
  sync()
  expect(savedProfile.read()).toBeNull()
  expect(account.profile).toBeUndefined()
})

test('a device that never joined keeps no copy of Notas and Perfil outside their own stores', () => {
  setNote(addHighlight(quote('um')).id, 'nota íntima')
  saveProfile({ age: 30 })
  expect([...items.keys()].filter((key) => key.includes('journal'))).toEqual([])
})
