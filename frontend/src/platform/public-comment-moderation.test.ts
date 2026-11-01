import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test'
import type { Account } from './accounts'
import { openDatabase } from './database'
import { createPublicComments } from './public-comments'

const PAGE = '/dicas/exemplo'
const CURATOR_SUB = 'curator-sub'
const account = (id: number): Account => ({
  id,
  googleSub: id === 9 ? CURATOR_SUB : `sub-${id}`,
  nickname: id === 8 ? null : `Conta ${id}`,
})
const post = () =>
  new Request('https://example.org', {
    method: 'POST',
    headers: { origin: 'https://example.org' },
  })

let folder: string
let databasePath: string
let who: Account | null
let clock: number
const notify =
  vi.fn<(comment: { id: number; path: string }) => Promise<number | null>>()

const service = (curator: string | null = CURATOR_SUB) =>
  createPublicComments({
    databasePath,
    current: () => who,
    now: () => clock,
    curator: () => curator ?? undefined,
    notify,
  })

/** Comment 1 by account 1, with a reply 2 by account 2. */
beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'moderation-'))
  databasePath = join(folder, 'app.sqlite')
  clock = 1_000_000
  who = null
  notify.mockReset()
  notify.mockResolvedValue(77)
  const db = openDatabase(databasePath)
  for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 9])
    db.prepare(
      'INSERT INTO accounts (id, google_sub, nickname) VALUES (?, ?, ?)',
    ).run(id, account(id).googleSub, account(id).nickname)
  db.exec(`INSERT INTO public_comments (id, account_id, path, quote, body, created_at, parent_id) VALUES
    (1, 1, '${PAGE}', 'Um trecho', 'Texto', 10, NULL),
    (2, 2, '${PAGE}', 'Um trecho', 'Resposta', 20, 1)`)
  db.close()
})
afterEach(() => rmSync(folder, { recursive: true, force: true }))

async function reportAs(id: number, comment = 1) {
  who = account(id)
  await service().report(post(), comment)
}
const visible = () =>
  service()
    .list(PAGE)
    .map(({ id }) => id)

test('three different accounts hide a comment; the same account counts once', async () => {
  await reportAs(3)
  await reportAs(3)
  await reportAs(3)
  await reportAs(4)
  expect(visible()).toContain(1)
  await reportAs(5)
  expect(visible()).toEqual([])
})

test('a report needs a finished account, this site and someone else’s visible comment', async () => {
  const report = (request: Request, id: number) => service().report(request, id)
  who = null
  await expect(report(post(), 1)).rejects.toThrow('Entre')
  who = account(8)
  await expect(report(post(), 1)).rejects.toThrow('Entre')
  who = account(3)
  await expect(
    report(
      new Request('https://example.org', {
        method: 'POST',
        headers: { origin: 'https://other.example' },
      }),
      1,
    ),
  ).rejects.toThrow('neste site')
  await expect(report(post(), 999)).rejects.toThrow('não está disponível')
  who = account(1)
  await expect(report(post(), 1)).rejects.toThrow('próprio')
  expect(notify).not.toHaveBeenCalled()
})

test('only the first report tells the curator, with the comment and nothing about the reader', async () => {
  await reportAs(3)
  await reportAs(4)
  await reportAs(5)
  expect(notify).toHaveBeenCalledTimes(1)
  expect(notify).toHaveBeenCalledWith({ id: 1, path: PAGE })
})

test.each([
  ['refuses', () => notify.mockResolvedValue(null)],
  ['throws', () => notify.mockRejectedValue(new Error('offline'))],
])(
  'when GitHub %s, the report and the hiding hold and no later report retries',
  async (_, fail) => {
    fail()
    await reportAs(3)
    await reportAs(4)
    await reportAs(5)
    expect(visible()).toEqual([])
    expect(notify).toHaveBeenCalledTimes(1)
    who = account(9)
    expect(service().curatorDesk(post())?.pending[0]).toMatchObject({
      id: 1,
      issue: null,
      notifyFailed: true,
    })
  },
)

test('restoring keeps the comment up against the old reports, and three new accounts open a new round', async () => {
  await reportAs(3)
  await reportAs(4)
  await reportAs(5)
  who = account(9)
  service().decide(post(), { action: 'restore', id: 1 })
  expect(visible()).toContain(1)

  await reportAs(3)
  await reportAs(4)
  await reportAs(5)
  expect(visible()).toContain(1)
  expect(notify).toHaveBeenCalledTimes(1)

  await reportAs(6)
  expect(notify).toHaveBeenCalledTimes(2)
  await reportAs(7)
  expect(visible()).toContain(1)
  who = account(9)
  await reportAs(9)
  expect(visible()).toEqual([])
})

test('an account has a limit of reports per hour, freed as the hour passes', async () => {
  const db = openDatabase(databasePath)
  for (let id = 100; id < 120; id += 1)
    db.prepare(
      `INSERT INTO public_comments (id, account_id, path, quote, body, created_at) VALUES (?, 1, '${PAGE}', 'q', 'b', 1)`,
    ).run(id)
  db.close()
  for (let id = 100; id < 120; id += 1) await reportAs(3, id)
  await expect(reportAs(3)).rejects.toThrow('limite')
  clock += 3_600_001
  await reportAs(3)
})

test('the reader’s own list says what they already reported', async () => {
  await reportAs(3)
  const seen = () =>
    service()
      .list(PAGE, post())
      .find((comment) => comment.id === 1)
  expect(seen()?.reported).toBe(true)
  who = account(4)
  expect(seen()?.reported).toBe(false)
})

test('nobody but the configured curator reads or decides anything', async () => {
  for (const [person, curator] of [
    [null, CURATOR_SUB],
    [account(3), CURATOR_SUB],
    [account(9), null],
    [account(9), ''],
    [{ ...account(3), googleSub: '' }, ''],
  ] as const) {
    who = person
    const desk = service(curator)
    expect(desk.curatorDesk(post())).toBeNull()
    for (const action of ['restore', 'remove'] as const)
      expect(() => desk.decide(post(), { action, id: 1 })).toThrow('curador')
  }
  expect(visible()).toEqual([1, 2])
})

test('a decision only comes as a POST from this site', () => {
  who = account(9)
  expect(() =>
    service().decide(new Request('https://example.org'), {
      action: 'remove',
      id: 1,
    }),
  ).toThrow('neste site')
  expect(visible()).toEqual([1, 2])
})

test('the curator sees reports, hidden comments and edit history without any Google subject', async () => {
  who = account(1)
  service().write(post(), { action: 'edit', id: 1, body: 'Texto novo' })
  await reportAs(3)
  who = account(9)
  const desk = service().curatorDesk(post())!
  expect(desk.pending).toHaveLength(1)
  expect(desk.pending[0]).toMatchObject({
    id: 1,
    path: PAGE,
    body: 'Texto novo',
    nickname: 'Conta 1',
    hidden: false,
    reports: 1,
    issue: 77,
    notifyFailed: false,
    history: [{ body: 'Texto', replacedAt: clock }],
  })
  expect(desk.recent.map(({ id }) => id)).toEqual([2])
  const shown = JSON.stringify(desk)
  for (const id of [1, 2, 3, 9]) expect(shown).not.toContain(`sub-${id}`)
  expect(shown).not.toContain(CURATOR_SUB)
})

test('the recent list pages back through the older comments', () => {
  const db = openDatabase(databasePath)
  for (let id = 100; id < 160; id += 1)
    db.prepare(
      `INSERT INTO public_comments (id, account_id, path, quote, body, created_at) VALUES (?, 1, '${PAGE}', 'q', 'b', 1)`,
    ).run(id)
  db.close()
  who = account(9)
  const first = service().curatorDesk(post())!
  expect(first.recent).toHaveLength(50)
  expect(first.recent[0]?.id).toBe(159)
  expect(first.before).toBe(110)
  const last = service().curatorDesk(post(), first.before!)!
  expect(last.recent.map(({ id }) => id).at(0)).toBe(109)
  expect(last.recent.map(({ id }) => id).at(-1)).toBe(1)
  expect(last.before).toBeNull()
})

test('removing deletes the comment with its replies, and a removed author reads as removed', async () => {
  const db = openDatabase(databasePath)
  db.exec('DELETE FROM accounts WHERE id = 2')
  db.close()
  who = account(9)
  expect(service().curatorDesk(post())?.recent[0]).toMatchObject({
    id: 2,
    nickname: 'leitor removido',
  })
  service().decide(post(), { action: 'remove', id: 1 })
  expect(visible()).toEqual([])
  expect(service().curatorDesk(post())).toMatchObject({
    pending: [],
    recent: [],
  })
  expect(() => service().decide(post(), { action: 'remove', id: 1 })).toThrow(
    'não está disponível',
  )
})
