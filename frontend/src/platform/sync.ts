import { getCurrentAccount } from './accounts'
import { openDatabase } from './database'
import { isQuoteRecord } from '#/state/highlight-record'
import { mergeSyncData, readSyncData } from '#/state/sync-data'

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
  if (
    request.method === 'POST' &&
    request.headers.get('origin') !== process.env.APP_ORIGIN
  )
    return reply({}, 403)
  const account = getCurrentAccount(request)
  if (!account?.nickname) return reply({}, 401)
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
  const db = openDatabase()
  try {
    db.exec('BEGIN IMMEDIATE')
    const row = db
      .prepare('SELECT consent, data FROM account_sync WHERE account_id = ?')
      .get(account.id)
    let consent = row ? row.consent === 1 : null
    let data = row ? readSyncData(JSON.parse(String(row.data)))! : {}
    if (typeof input.consent === 'boolean') {
      // The first decision is permanent here; changing it belongs to an explicit
      // account-settings flow. Refusal never accepts a data payload.
      if (consent === null) {
        consent = input.consent
        db.prepare(
          'INSERT INTO account_sync (account_id, consent) VALUES (?, ?)',
        ).run(account.id, consent ? 1 : 0)
      }
    }
    if ('data' in input) {
      if (consent !== true) return reply({}, 403)
      if (input.accountId !== account.id) return reply({}, 409)
      const incoming = readSyncData(input.data)
      if (!incoming) return reply({}, 400)
      data = mergeSyncData(data, incoming)
      db.prepare('UPDATE account_sync SET data = ? WHERE account_id = ?').run(
        JSON.stringify(data),
        account.id,
      )
    }
    db.exec('COMMIT')
    return reply({
      accountId: account.id,
      consent,
      ...(consent === true ? { data } : {}),
    })
  } finally {
    // Closing rolls back any early return in a transaction.
    db.close()
  }
}
