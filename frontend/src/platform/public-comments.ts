import { existsSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import type {
  PublicComment,
  PublicCommentWrite,
} from '#/content/public-comment-record'
import { getCurrentAccount, type Account } from './accounts'
import { openDatabase } from './database'

function publish(
  db: DatabaseSync,
  input: Extract<PublicCommentWrite, { action: 'publish' }>,
  accountId: number,
  at: number,
) {
  if (
    typeof input.path !== 'string' ||
    !/^\/[\p{L}\p{N}/-]+$/u.test(input.path) ||
    input.path.length > 300 ||
    typeof input.quote !== 'string' ||
    !input.quote.trim() ||
    input.quote.length > 4000
  )
    throw new Error('Trecho inválido.')
  let quote = input.quote
  if (input.parentId !== undefined) {
    const parent = db
      .prepare(
        'SELECT quote FROM public_comments WHERE id = ? AND path = ? AND parent_id IS NULL AND hidden = 0',
      )
      .get(input.parentId, input.path)
    if (!parent) throw new Error('Esta resposta não está disponível.')
    quote = String(parent.quote)
  }
  db.prepare('DELETE FROM public_comment_sends WHERE sent_at <= ?').run(
    at - 3600000,
  )
  const count = db
    .prepare(
      'SELECT count(*) AS n FROM public_comment_sends WHERE account_id = ?',
    )
    .get(accountId)!
  if (Number(count.n) >= 10)
    throw new Error(
      'Você chegou ao limite de 10 envios por hora. Tente mais tarde.',
    )
  db.prepare('INSERT INTO public_comment_sends VALUES (?, ?)').run(
    accountId,
    at,
  )
  return Number(
    db
      .prepare(
        'INSERT INTO public_comments (account_id, path, quote, body, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(
        accountId,
        input.path,
        quote,
        input.body.trim(),
        input.parentId ?? null,
        at,
      ).lastInsertRowid,
  )
}

function revise(
  db: DatabaseSync,
  input: Exclude<PublicCommentWrite, { action: 'publish' }>,
  accountId: number,
  at: number,
) {
  const id = input.id
  if (!Number.isSafeInteger(id)) throw new Error('Comentário inválido.')
  const comment = db
    .prepare('SELECT body FROM public_comments WHERE id = ? AND account_id = ?')
    .get(id, accountId)
  if (!comment) throw new Error('Este comentário não está disponível.')
  if (input.action === 'delete')
    db.prepare('DELETE FROM public_comments WHERE id = ?').run(id)
  else {
    db.prepare(
      'INSERT INTO public_comment_history (comment_id, body, replaced_at) VALUES (?, ?, ?)',
    ).run(id, comment.body!, at)
    db.prepare(
      'UPDATE public_comments SET body = ?, edited_at = ? WHERE id = ?',
    ).run(input.body.trim(), at, id)
  }
  return id
}

function listComments(
  path: string,
  page: string,
  account: Account | null,
): PublicComment[] {
  if (!existsSync(path)) return []
  const db = openDatabase(path)
  try {
    return db
      .prepare(`SELECT c.*, a.nickname FROM public_comments c
      LEFT JOIN accounts a ON a.id = c.account_id
      WHERE c.path = ? AND c.hidden = 0 AND (c.parent_id IS NULL OR EXISTS
        (SELECT 1 FROM public_comments p WHERE p.id = c.parent_id AND p.hidden = 0))
      ORDER BY c.created_at, c.id`)
      .all(page)
      .map((row) => ({
        id: Number(row.id),
        parentId: row.parent_id === null ? null : Number(row.parent_id),
        quote: String(row.quote),
        body: String(row.body),
        nickname:
          row.nickname === null ? 'leitor removido' : String(row.nickname),
        edited: row.edited_at !== null,
        createdAt: Number(row.created_at),
        own: account?.id === row.account_id,
        canReply: Boolean(account?.nickname),
      }))
  } finally {
    db.close()
  }
}

export function createPublicComments(
  options: {
    databasePath?: string
    current?: (request: Request) => Account | null
    now?: () => number
  } = {},
) {
  const path =
    options.databasePath ?? process.env.DATABASE_PATH ?? '/data/app.sqlite'
  const current = options.current ?? getCurrentAccount
  const now = options.now ?? Date.now
  return {
    list(page: string, request?: Request): PublicComment[] {
      return listComments(path, page, request ? current(request) : null)
    },
    write(request: Request, input: PublicCommentWrite): number {
      if (
        request.method !== 'POST' ||
        request.headers.get('origin') !==
          (process.env.APP_ORIGIN ?? new URL(request.url).origin)
      )
        throw new Error('Abra o formulário neste site.')
      const account = current(request)
      if (!account?.nickname)
        throw new Error('Entre e crie um apelido para publicar.')
      if (!input || !['publish', 'edit', 'delete'].includes(input.action))
        throw new Error('Comentário inválido.')
      if (
        input.action !== 'delete' &&
        (typeof input.body !== 'string' ||
          !input.body.trim() ||
          input.body.length > 4000)
      )
        throw new Error('Escreva de 1 a 4.000 caracteres.')
      const db = openDatabase(path)
      db.exec('BEGIN IMMEDIATE')
      try {
        const id =
          input.action === 'publish'
            ? publish(db, input, account.id, now())
            : revise(db, input, account.id, now())
        db.exec('COMMIT')
        return id
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      } finally {
        db.close()
      }
    },
  }
}
