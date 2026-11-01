import { existsSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import type {
  PublicComment,
  PublicCommentWrite,
} from '#/content/public-comment-record'
import { getCurrentAccount, type Account } from './accounts'
import { openDatabase } from './database'

const SENDS_PER_HOUR = 10
const HOUR = 3_600_000
const MAX_LENGTH = 4000

/** A write the reader can be told about. Its message is PT-BR, for the form;
 * any other error stays on the server. */
export class PublicCommentRefusal extends Error {}

/** A new comment and an edit both put text in front of everybody, so both
 * spend the account's hourly limit. Deleting frees nothing. */
function spendSend(db: DatabaseSync, accountId: number, at: number) {
  db.prepare('DELETE FROM public_comment_sends WHERE sent_at <= ?').run(
    at - HOUR,
  )
  const count = db
    .prepare(
      'SELECT count(*) AS n FROM public_comment_sends WHERE account_id = ?',
    )
    .get(accountId)!
  if (Number(count.n) >= SENDS_PER_HOUR)
    throw new PublicCommentRefusal(
      `Você chegou ao limite de ${SENDS_PER_HOUR} envios por hora. Tente mais tarde.`,
    )
  db.prepare('INSERT INTO public_comment_sends VALUES (?, ?)').run(
    accountId,
    at,
  )
}

function publish(
  db: DatabaseSync,
  input: Extract<PublicCommentWrite, { action: 'publish' }>,
  accountId: number,
  at: number,
) {
  // The page reads a quote with one space between blocks (`highlight-text.ts`);
  // kept that way, the mark finds a quote that crosses paragraphs.
  let quote = typeof input.quote === 'string' ? squeeze(input.quote) : ''
  if (!quote) throw new PublicCommentRefusal('Trecho inválido.')
  if (quote.length > MAX_LENGTH)
    throw new PublicCommentRefusal('Selecione um trecho menor.')
  if (input.parentId !== undefined) {
    const parent = Number.isSafeInteger(input.parentId)
      ? db
          .prepare(
            'SELECT quote FROM public_comments WHERE id = ? AND path = ? AND parent_id IS NULL AND hidden = 0',
          )
          .get(input.parentId, input.path)
      : undefined
    if (!parent)
      throw new PublicCommentRefusal('Esta resposta não está disponível.')
    quote = String(parent.quote)
  }
  spendSend(db, accountId, at)
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
  if (!Number.isSafeInteger(id))
    throw new PublicCommentRefusal('Comentário inválido.')
  const comment = db
    .prepare('SELECT body FROM public_comments WHERE id = ? AND account_id = ?')
    .get(id, accountId)
  if (!comment)
    throw new PublicCommentRefusal('Este comentário não está disponível.')
  if (input.action === 'delete')
    db.prepare('DELETE FROM public_comments WHERE id = ?').run(id)
  else {
    spendSend(db, accountId, at)
    db.prepare(
      'INSERT INTO public_comment_history (comment_id, body, replaced_at) VALUES (?, ?, ?)',
    ).run(id, comment.body!, at)
    db.prepare(
      'UPDATE public_comments SET body = ?, edited_at = ? WHERE id = ?',
    ).run(input.body.trim(), at, id)
  }
  return id
}

const squeeze = (text: string) => text.replace(/\s+/g, ' ').trim()

/** Checks what needs no database: where the write came from, who sent it and
 * whether its text fits. */
function refusal(
  request: Request,
  account: Account | null,
  input: PublicCommentWrite,
  isPage: (path: string) => boolean,
): string | null {
  if (
    request.method !== 'POST' ||
    request.headers.get('origin') !==
      (process.env.APP_ORIGIN ?? new URL(request.url).origin)
  )
    return 'Abra o formulário neste site.'
  if (!account?.nickname) return 'Entre e crie um apelido para publicar.'
  if (!input || !['publish', 'edit', 'delete'].includes(input.action))
    return 'Comentário inválido.'
  if (
    input.action !== 'delete' &&
    (typeof input.body !== 'string' ||
      !input.body.trim() ||
      input.body.length > MAX_LENGTH)
  )
    return 'Escreva de 1 a 4.000 caracteres.'
  if (
    input.action === 'publish' &&
    (typeof input.path !== 'string' || !isPage(input.path))
  )
    return 'Esta página não aceita comentários.'
  return null
}

function listComments(
  path: string,
  page: string,
  account: Account | null,
): PublicComment[] {
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
    /** Whether the path is a page that shows comments. */
    isPage?: (path: string) => boolean
  } = {},
) {
  const path =
    options.databasePath ?? process.env.DATABASE_PATH ?? '/data/app.sqlite'
  const current = options.current ?? getCurrentAccount
  const now = options.now ?? Date.now
  const isPage = options.isPage ?? (() => true)
  return {
    /** Reading never depends on the database (ADR 0045): whatever goes wrong
     * here, the page opens, with no comments. */
    list(page: string, request?: Request): PublicComment[] {
      try {
        if (!existsSync(path)) return []
        return listComments(path, page, request ? current(request) : null)
      } catch {
        return []
      }
    },
    write(request: Request, input: PublicCommentWrite): number {
      const account = current(request)
      const refused = refusal(request, account, input, isPage)
      if (refused) throw new PublicCommentRefusal(refused)
      const accountId = account!.id
      const db = openDatabase(path)
      try {
        db.exec('BEGIN IMMEDIATE')
        try {
          const id =
            input.action === 'publish'
              ? publish(db, input, accountId, now())
              : revise(db, input, accountId, now())
          db.exec('COMMIT')
          return id
        } catch (error) {
          db.exec('ROLLBACK')
          throw error
        }
      } finally {
        db.close()
      }
    },
  }
}
