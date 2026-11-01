import { existsSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import type {
  CuratorDecision,
  CuratorDesk,
  PublicComment,
  PublicCommentWrite,
} from '#/content/public-comment-record'
import { getCurrentAccount, type Account } from './accounts'
import { openDatabase } from './database'
import {
  PublicCommentRefusal,
  readDesk,
  recordReport,
  recordReportIssue,
  removeComment,
  restoreComment,
  type ReportedComment,
} from './public-comment-moderation'
import { serverEnv } from './server-env'

export { PublicCommentRefusal }

const SENDS_PER_HOUR = 10
const HOUR = 3_600_000
const MAX_LENGTH = 4000

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

const OTHER_SITE = 'Abra o formulário neste site.'

/** A POST from this site's own pages. */
const fromThisSite = (request: Request) =>
  request.method === 'POST' &&
  request.headers.get('origin') ===
    (process.env.APP_ORIGIN ?? new URL(request.url).origin)

/** Checks what needs no database: where the write came from, who sent it and
 * whether its text fits. */
function refusal(
  request: Request,
  account: Account | null,
  input: PublicCommentWrite,
  isPage: (path: string) => boolean,
): string | null {
  if (!fromThisSite(request)) return OTHER_SITE
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
      .prepare(`SELECT c.*, a.nickname, EXISTS
        (SELECT 1 FROM public_comment_reports r WHERE r.comment_id = c.id AND r.account_id = ?) AS reported
      FROM public_comments c
      LEFT JOIN accounts a ON a.id = c.account_id
      WHERE c.path = ? AND c.hidden = 0 AND (c.parent_id IS NULL OR EXISTS
        (SELECT 1 FROM public_comments p WHERE p.id = c.parent_id AND p.hidden = 0))
      ORDER BY c.created_at, c.id`)
      .all(account?.id ?? null, page)
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
        reported: row.reported === 1,
      }))
  } finally {
    db.close()
  }
}

/** Runs one write in a transaction on its own connection. */
function inTransaction<T>(path: string, work: (db: DatabaseSync) => T): T {
  const db = openDatabase(path)
  try {
    db.exec('BEGIN IMMEDIATE')
    try {
      const result = work(db)
      db.exec('COMMIT')
      return result
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  } finally {
    db.close()
  }
}

/** Reports and the curator's desk. Each read and write checks who asks. */
function moderation({
  path,
  current,
  now,
  curator,
  notify,
}: {
  path: string
  current: (request: Request) => Account | null
  now: () => number
  curator: () => string | undefined
  notify: (comment: ReportedComment) => Promise<number | null>
}) {
  const isCurator = (request: Request) => {
    const subject = curator()
    return Boolean(subject) && current(request)?.googleSub === subject
  }
  return {
    /** Everything is committed before GitHub is called: whatever happens to
     * the notice, the report and the hiding hold. */
    async report(request: Request, id: number): Promise<void> {
      if (!fromThisSite(request)) throw new PublicCommentRefusal(OTHER_SITE)
      const account = current(request)
      if (!account?.nickname)
        throw new PublicCommentRefusal(
          'Entre e crie um apelido para denunciar.',
        )
      if (!Number.isSafeInteger(id))
        throw new PublicCommentRefusal('Comentário inválido.')
      const at = now()
      const reported = inTransaction(path, (db) =>
        recordReport(db, id, account.id, at),
      )
      if (!reported) return
      try {
        const issue = await notify(reported)
        if (issue !== null)
          inTransaction(path, (db) => recordReportIssue(db, id, at, issue))
      } catch {
        // The curator's page shows that the notice did not go out.
      }
    },
    /** `null` for anyone but the curator. */
    curatorDesk(request: Request, before?: number): CuratorDesk | null {
      if (!isCurator(request)) return null
      const db = openDatabase(path)
      try {
        return readDesk(db, Number.isSafeInteger(before) ? before : undefined)
      } finally {
        db.close()
      }
    },
    decide(request: Request, decision: CuratorDecision): void {
      if (!fromThisSite(request)) throw new PublicCommentRefusal(OTHER_SITE)
      if (!isCurator(request))
        throw new PublicCommentRefusal('Esta ação é só do curador.')
      const id = decision?.id
      if (!Number.isSafeInteger(id))
        throw new PublicCommentRefusal('Comentário inválido.')
      inTransaction(path, (db) => {
        if (decision.action === 'restore') restoreComment(db, id, now())
        else if (decision.action === 'remove') removeComment(db, id)
        else throw new PublicCommentRefusal('Decisão inválida.')
      })
    },
  }
}

export function createPublicComments(
  options: {
    databasePath?: string
    current?: (request: Request) => Account | null
    now?: () => number
    /** Whether the path is a page that shows comments. */
    isPage?: (path: string) => boolean
    /** The curator's Google subject; without one, nobody is the curator. */
    curator?: () => string | undefined
    /** Tells the curator of a first report; the issue's number, or `null`. */
    notify?: (comment: ReportedComment) => Promise<number | null>
  } = {},
) {
  const path =
    options.databasePath ?? process.env.DATABASE_PATH ?? '/data/app.sqlite'
  const current = options.current ?? getCurrentAccount
  const now = options.now ?? Date.now
  const isPage = options.isPage ?? (() => true)
  return {
    ...moderation({
      path,
      current,
      now,
      curator: options.curator ?? (() => serverEnv().CURATOR_GOOGLE_SUB),
      notify: options.notify ?? (async () => null),
    }),
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
      return inTransaction(path, (db) =>
        input.action === 'publish'
          ? publish(db, input, accountId, now())
          : revise(db, input, accountId, now()),
      )
    },
  }
}
