import { fromThisSite, getCurrentAccount } from './accounts'
import { openDatabase } from './database'
import { serverEnv } from './server-env'
import { isQuoteRecord } from '#/state/json-record'
import {
  mergeStoredSyncData,
  readableSyncData,
  readSyncData,
  type SyncData,
} from '#/state/sync-data'

/** One account's stored JSON. A device past it keeps its data and is told so. */
const MAX_ACCOUNT_LENGTH = 5_000_000

/** The account's JSON as stored, entries not yet read; `null` if it is no record. */
function parseStored(text: string): Record<string, unknown> | null {
  try {
    const raw: unknown = JSON.parse(text)
    return isQuoteRecord(raw) ? raw : null
  } catch {
    return null
  }
}

/** A device clock running ahead must not win over every later edit. */
const heldToNow = (data: SyncData, now: number): SyncData =>
  Object.fromEntries(
    Object.entries(data).map(([key, entry]) => [
      key,
      { ...entry, at: Math.min(entry.at, now) },
    ]),
  )

const reply = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'cache-control': 'private, no-store' },
  })

export async function handleSyncRequest(
  request: Request,
): Promise<Response | null> {
  if (new URL(request.url).pathname !== '/api/sync') return null
  if (!['GET', 'POST'].includes(request.method)) return reply({}, 405)
  if (request.method === 'POST' && !fromThisSite(request)) return reply({}, 403)
  // Before reading a body; the check below is the one the transaction trusts.
  if (!getCurrentAccount(request)?.nickname) return reply({}, 401)
  let input: Record<string, unknown> = {}
  if (request.method === 'POST') {
    if (Number(request.headers.get('content-length')) > 2_000_000)
      return reply({}, 413)
    const text = await request.text()
    if (text.length > 2_000_000) return reply({}, 413)
    try {
      const raw: unknown = JSON.parse(text)
      if (!isQuoteRecord(raw)) return reply({}, 400)
      input = raw
    } catch {
      return reply({}, 400)
    }
  }
  const account = getCurrentAccount(request)
  if (!account?.nickname) return reply({}, 401)
  const db = openDatabase(serverEnv().DATABASE_PATH)
  try {
    db.exec('BEGIN IMMEDIATE')
    const row = db
      .prepare('SELECT consent, data FROM account_sync WHERE account_id = ?')
      .get(account.id)
    let consent = row ? row.consent === 1 : null
    let data = row ? parseStored(String(row.data)) : {}
    // Not even a record: nothing here can tell what it holds, so nothing touches
    // it. Closing rolls the transaction back and the device keeps its own data.
    if (!data) return reply({}, 500)
    if (typeof input.consent === 'boolean') {
      // A refusal can become consent. Consent is not undone here: another
      // device's stale refusal must not cut this one off. Ending it is the
      // account deletion (#562) or stopping on a device, which is local.
      if (consent === null) {
        consent = input.consent
        db.prepare(
          'INSERT INTO account_sync (account_id, consent) VALUES (?, ?)',
        ).run(account.id, consent ? 1 : 0)
      } else if (!consent && input.consent) {
        consent = true
        db.prepare(
          'UPDATE account_sync SET consent = 1 WHERE account_id = ?',
        ).run(account.id)
      }
    }
    if ('data' in input) {
      if (consent !== true) return reply({}, 403)
      if (input.accountId !== account.id) return reply({}, 409)
      const incoming = readSyncData(input.data)
      if (!incoming) return reply({}, 400)
      data = mergeStoredSyncData(data, heldToNow(incoming, Date.now()))
      const stored = JSON.stringify(data)
      if (stored.length > MAX_ACCOUNT_LENGTH) return reply({}, 413)
      db.prepare('UPDATE account_sync SET data = ? WHERE account_id = ?').run(
        stored,
        account.id,
      )
    }
    db.exec('COMMIT')
    return reply({
      accountId: account.id,
      consent,
      ...(consent === true ? { data: readableSyncData(data) } : {}),
    })
  } finally {
    // Closing rolls back any early return in a transaction.
    db.close()
  }
}
