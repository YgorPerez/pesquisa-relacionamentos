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
