import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test'
import { openDatabase } from './database'
import { handleSyncRequest } from './sync'

let folder: string
beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'sync-'))
  vi.stubEnv('DATABASE_PATH', join(folder, 'app.sqlite'))
  vi.stubEnv('APP_ORIGIN', 'https://example.org')
  vi.stubEnv('GOOGLE_CLIENT_ID', 'test')
  vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test')
  const db = openDatabase()
  for (const id of [1, 2, 3]) {
    db.prepare(
      'INSERT INTO accounts (id, google_sub, nickname) VALUES (?, ?, ?)',
    ).run(id, String(id), id === 3 ? null : 'Reader')
    db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
      createHash('sha256').update(`token${id}`).digest('base64url'),
      id,
      Date.now() + 60_000,
    )
  }
  db.close()
})
afterEach(() => {
  vi.unstubAllEnvs()
  rmSync(folder, { recursive: true, force: true })
})
const call = async (
  id: number,
  body?: unknown,
  origin = 'https://example.org',
) =>
  (await handleSyncRequest(
    new Request('https://example.org/api/sync', {
      headers: { cookie: `__Host-session=token${id}`, origin },
      ...(body === undefined
        ? {}
        : { method: 'POST', body: JSON.stringify(body) }),
    }),
  ))!

test('only completed sessions may read or write; consent is needed before any data transfer', async () => {
  expect((await call(0)).status).toBe(401)
  expect((await call(3)).status).toBe(401)
  expect((await call(1, { data: {} })).status).toBe(403)
  expect((await call(1, { consent: true }, 'https://evil.org')).status).toBe(
    403,
  )
  expect(await (await call(1, { consent: false })).json()).toMatchObject({
    consent: false,
  })
  expect((await call(1, { data: {} })).status).toBe(403)
  expect(await (await call(1)).json()).toMatchObject({ consent: false })
})

test('declining can later become accepting, but accepting is not undone by a stale refusal', async () => {
  await call(1, { consent: false })
  expect(await (await call(1, { consent: true })).json()).toMatchObject({
    consent: true,
    data: {},
  })
  expect(await (await call(1, { consent: false })).json()).toMatchObject({
    consent: true,
  })
})

test('a removal stays, without the removed text, and an older copy does not revive it', async () => {
  await call(1, { consent: true })
  const note = 'note:a'
  await call(1, {
    accountId: 1,
    data: { [note]: { at: 10, value: { text: 'íntima' } } },
  })
  await call(1, { accountId: 1, data: { [note]: { at: 20, value: null } } })
  const reply = await call(1, {
    accountId: 1,
    data: { [note]: { at: 15, value: { text: 'íntima' } } },
  })
  expect(await reply.json()).toMatchObject({
    data: { [note]: { at: 20, value: null } },
  })
  const db = openDatabase()
  const row = db.prepare('SELECT data FROM account_sync').get()
  db.close()
  expect(String(row?.data)).not.toContain('íntima')
})

test('a time from the future is held to the server clock, so a later edit wins', async () => {
  await call(1, { consent: true })
  vi.useFakeTimers({ toFake: ['Date'], now: 1_000 })
  const year = 365 * 24 * 60 * 60 * 1000
  await call(1, {
    accountId: 1,
    data: { profile: { at: 1_000 + year, value: { age: 24 } } },
  })
  vi.setSystemTime(2_000)
  const reply = await call(1, {
    accountId: 1,
    data: { profile: { at: 2_000, value: { age: 42 } } },
  })
  vi.useRealTimers()
  expect(await reply.json()).toMatchObject({
    data: { profile: { at: 2_000, value: { age: 42 } } },
  })
})

test('an account that would pass the storage limit is refused and keeps what it had', async () => {
  await call(1, { consent: true })
  const notes = (from: number) =>
    Object.fromEntries(
      Array.from({ length: 3000 }, (_, i) => [
        `note:${from + i}`,
        { at: 1, value: { text: 'x'.repeat(500) } },
      ]),
    )
  expect((await call(1, { accountId: 1, data: notes(0) })).status).toBe(200)
  expect((await call(1, { accountId: 1, data: notes(3000) })).status).toBe(200)
  expect((await call(1, { accountId: 1, data: notes(6000) })).status).toBe(200)
  expect((await call(1, { accountId: 1, data: notes(9000) })).status).toBe(413)
  const { data } = (await (await call(1)).json()) as { data: object }
  expect(Object.keys(data)).toHaveLength(9000)
})

test('account scoped merge survives stale devices, retries, empty uploads and account deletion', async () => {
  await call(1, { consent: true })
  const latest = { profile: { at: 20, value: { age: 42 } } }
  await call(1, { data: latest, accountId: 1 })
  await call(1, {
    data: { profile: { at: 10, value: { age: 24 } } },
    accountId: 1,
  })
  expect(
    await (await call(1, { data: {}, accountId: 1 })).json(),
  ).toMatchObject({ data: latest })
  expect(await (await call(2)).json()).not.toHaveProperty('data')
  await call(2, { consent: true })
  expect((await call(2, { data: latest, accountId: 1 })).status).toBe(409)
  expect(await (await call(2)).json()).toMatchObject({ data: {} })
  const db = openDatabase()
  db.prepare('DELETE FROM accounts WHERE id = 1').run()
  expect(
    db.prepare('SELECT * FROM account_sync WHERE account_id = 1').all(),
  ).toEqual([])
  db.close()
  expect((await call(1)).status).toBe(401)
})
