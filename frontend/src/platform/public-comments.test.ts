import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { openDatabase } from './database'
import { createPublicComments } from './public-comments'

test('publishes immediately, checks ownership and keeps edits out of the public history', () => {
  const folder = mkdtempSync(join(tmpdir(), 'public-comments-'))
  const databasePath = join(folder, 'app.sqlite')
  const db = openDatabase(databasePath)
  db.exec(
    "INSERT INTO accounts (id, google_sub, nickname) VALUES (1, 'one', 'Leitora'), (2, 'two', 'Outro')",
  )
  db.close()
  let account = { id: 1, googleSub: 'one', nickname: 'Leitora' }
  const service = createPublicComments({ databasePath, current: () => account })
  const request = new Request('https://example.org', {
    method: 'POST',
    headers: { origin: 'https://example.org' },
  })
  const passage = {
    path: '/onde-conhecer-pessoas',
    quote: 'Um trecho.',
    body: '<img src=x onerror=alert(1)>',
  }
  try {
    const id = service.write(request, { action: 'publish', ...passage })
    expect(service.list(passage.path)).toEqual([
      expect.objectContaining({
        id,
        body: passage.body,
        nickname: 'Leitora',
        edited: false,
      }),
    ])
    account = { id: 2, googleSub: 'two', nickname: 'Outro' }
    expect(() =>
      service.write(request, { action: 'edit', id, body: 'Stolen' }),
    ).toThrow()
    const reply = service.write(request, {
      action: 'publish',
      ...passage,
      parentId: id,
    })
    expect(() =>
      service.write(request, {
        action: 'publish',
        ...passage,
        parentId: reply,
      }),
    ).toThrow()
    account = { id: 1, googleSub: 'one', nickname: 'Leitora' }
    service.write(request, { action: 'edit', id, body: 'Corrigido' })
    expect(service.list(passage.path)[0]).toMatchObject({
      body: 'Corrigido',
      edited: true,
    })
    service.write(request, { action: 'delete', id })
    expect(service.list(passage.path)).toEqual([])
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})

test('rejects anonymous, unfinished, expired and cross-origin writes and limits sends across connections', () => {
  const folder = mkdtempSync(join(tmpdir(), 'public-comments-'))
  const databasePath = join(folder, 'app.sqlite')
  const db = openDatabase(databasePath)
  db.exec(
    "INSERT INTO accounts (id, google_sub, nickname) VALUES (1, 'one', 'Leitora')",
  )
  db.close()
  let account: {
    id: number
    googleSub: string
    nickname: string | null
  } | null = null
  let now = 10000000
  const service = () =>
    createPublicComments({
      databasePath,
      current: () => account,
      now: () => now,
    })
  const request = new Request('https://example.org', {
    method: 'POST',
    headers: { origin: 'https://example.org' },
  })
  const input = {
    action: 'publish' as const,
    path: '/dicas/exemplo',
    quote: 'Trecho',
    body: 'Comentário',
  }
  try {
    expect(() => service().write(request, input)).toThrow('Entre')
    account = { id: 1, googleSub: 'one', nickname: null }
    expect(() => service().write(request, input)).toThrow('Entre')
    account.nickname = 'Leitora'
    expect(() =>
      service().write(
        new Request('https://example.org', { method: 'POST' }),
        input,
      ),
    ).toThrow('formulário')
    for (let i = 0; i < 10; i++) service().write(request, input)
    expect(() => service().write(request, input)).toThrow('10 envios')
    account = null
    expect(() => service().write(request, { action: 'delete', id: 1 })).toThrow(
      'Entre',
    )
    account = { id: 1, googleSub: 'one', nickname: 'Leitora' }
    now += 3600000
    expect(service().write(request, input)).toBe(11)
    const hidden = openDatabase(databasePath)
    hidden.exec('UPDATE public_comments SET hidden = 1 WHERE id = 1')
    hidden.close()
    expect(
      service()
        .list(input.path)
        .some((comment) => comment.id === 1),
    ).toBe(false)
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})
