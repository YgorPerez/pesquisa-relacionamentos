import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { openDatabase } from './database'
import { createPublicComments, PublicCommentRefusal } from './public-comments'

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
    ).toThrow('não está disponível')
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
    ).toThrow('resposta não está disponível')
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
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})

function fixture() {
  const folder = mkdtempSync(join(tmpdir(), 'public-comments-'))
  const databasePath = join(folder, 'app.sqlite')
  const db = openDatabase(databasePath)
  db.exec(
    "INSERT INTO accounts (id, google_sub, nickname) VALUES (1, 'one', 'Leitora')",
  )
  db.close()
  const account = { id: 1, googleSub: 'one', nickname: 'Leitora' }
  const request = new Request('https://example.org', {
    method: 'POST',
    headers: { origin: 'https://example.org' },
  })
  return {
    folder,
    request,
    service: (isPage?: (path: string) => boolean) =>
      createPublicComments({ databasePath, current: () => account, isPage }),
    cleanup: () => rmSync(folder, { recursive: true, force: true }),
  }
}

const PASSAGE = {
  action: 'publish' as const,
  path: '/dicas/exemplo',
  quote: 'Trecho',
  body: 'Comentário',
}

test('a database that cannot be read leaves the page readable, with no comments', () => {
  const { folder, service, cleanup } = fixture()
  try {
    // A directory exists but opens as no database at all.
    const broken = createPublicComments({
      databasePath: folder,
      current: () => {
        throw new Error('no session lookup')
      },
    })
    expect(broken.list('/dicas/exemplo', new Request('https://a.org'))).toEqual(
      [],
    )
    expect(service().list('/dicas/exemplo')).toEqual([])
  } finally {
    cleanup()
  }
})

test('a quote that crosses blocks is kept as the page reads it, on one line', () => {
  const { request, service, cleanup } = fixture()
  try {
    service().write(request, {
      ...PASSAGE,
      quote: ' Primeiro bloco.\n\nSegundo   bloco. ',
    })
    expect(service().list(PASSAGE.path)[0]?.quote).toBe(
      'Primeiro bloco. Segundo bloco.',
    )
  } finally {
    cleanup()
  }
})

test('edits spend the same hourly limit as new comments', () => {
  const { request, service, cleanup } = fixture()
  try {
    const id = service().write(request, PASSAGE)
    for (let i = 0; i < 9; i++)
      service().write(request, { action: 'edit', id, body: `Versão ${i}` })
    expect(() =>
      service().write(request, { action: 'edit', id, body: 'Mais uma' }),
    ).toThrow(PublicCommentRefusal)
    expect(service().list(PASSAGE.path)[0]?.body).toBe('Versão 8')
  } finally {
    cleanup()
  }
})

test('refuses a reply to a malformed parent and a page that does not exist', () => {
  const { request, service, cleanup } = fixture()
  try {
    expect(() =>
      service().write(request, {
        ...PASSAGE,
        parentId: 'x' as unknown as number,
      }),
    ).toThrow(PublicCommentRefusal)
    expect(() => service(() => false).write(request, PASSAGE)).toThrow(
      PublicCommentRefusal,
    )
    expect(service(() => true).write(request, PASSAGE)).toBe(1)
  } finally {
    cleanup()
  }
})

test('tells the author their own comment, and deleting it takes its replies along', () => {
  const { request, service, cleanup } = fixture()
  try {
    const id = service().write(request, PASSAGE)
    service().write(request, { ...PASSAGE, parentId: id })
    expect(service().list(PASSAGE.path, request)[0]).toMatchObject({
      own: true,
      canReply: true,
    })
    expect(service().list(PASSAGE.path)[0]).toMatchObject({
      own: false,
      canReply: false,
    })
    service().write(request, { action: 'delete', id })
    expect(service().list(PASSAGE.path)).toEqual([])
  } finally {
    cleanup()
  }
})

test('a hidden comment leaves the list, and its replies with it', () => {
  const { folder, request, service, cleanup } = fixture()
  try {
    const id = service().write(request, PASSAGE)
    service().write(request, { ...PASSAGE, parentId: id })
    const db = openDatabase(join(folder, 'app.sqlite'))
    db.prepare('UPDATE public_comments SET hidden = 1 WHERE id = ?').run(id)
    db.close()
    expect(service().list(PASSAGE.path)).toEqual([])
  } finally {
    cleanup()
  }
})
