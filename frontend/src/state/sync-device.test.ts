import { beforeEach, expect, test, vi } from 'vite-plus/test'
import { savedProfile, saveProfile } from './profile'
import { withStorageSource } from './storage-events'
import { applySyncData, deviceSyncData } from './sync-device'
import { addHighlight, readHighlights, setNote, markFound } from './highlights'

vi.mock('virtual:possible-group', () => ({
  default: { base: '', places: [], example: {} },
}))
beforeEach(() => {
  const items = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => {
        items.set(key, value)
      },
      removeItem: (key: string) => {
        items.delete(key)
      },
    },
  })
})

test('a received link replaces device data without uploading it, including after another sync', () => {
  applySyncData({ profile: { at: 20, value: { age: 42 } } })
  withStorageSource('link', () => saveProfile({ age: 24 }))
  expect(savedProfile.read()).toEqual({ age: 24 })
  expect(deviceSyncData().profile?.value).toEqual({ age: 42 })
  applySyncData({ profile: { at: 30, value: { age: 43 } } })
  expect(savedProfile.read()).toEqual({ age: 24 })
  saveProfile({ age: 25 })
  expect(deviceSyncData().profile?.value).toEqual({ age: 25 })
})

test('first consent after a shared link never seeds its fields', () => {
  withStorageSource('link', () => saveProfile({ age: 24 }))
  expect(deviceSyncData()).toEqual({})
})

test('highlights add up, latest notes survive retries and omission never deletes', () => {
  const first = addHighlight({
    path: '/guia',
    pageTitle: 'Guia',
    link: '/guia',
    text: 'a',
    exact: 'a',
    prefix: '',
    suffix: '',
  })
  const initial = deviceSyncData()
  setNote(first.id, 'Minha nota nova')
  applySyncData(initial)
  expect(readHighlights()[0]?.note).toBe('Minha nota nova')
  applySyncData({})
  expect(readHighlights()).toHaveLength(1)
})

test('moving a highlight mark does not promote an old note over a newer account note', () => {
  const first = addHighlight({
    path: '/guia',
    pageTitle: 'Guia',
    link: '/guia',
    text: 'a',
    exact: 'a',
    prefix: '',
    suffix: '',
  })
  setNote(first.id, 'Nota antiga')
  const stale = deviceSyncData()
  markFound('/guia', new Set())
  const moved = deviceSyncData()
  expect(moved[`note:${first.id}`]).toEqual(stale[`note:${first.id}`])
  applySyncData({
    [`note:${first.id}`]: {
      at: Date.now() + 1000,
      value: { text: 'Nota nova do outro aparelho' },
    },
  })
  expect(readHighlights()[0]?.note).toBe('Nota nova do outro aparelho')
})
