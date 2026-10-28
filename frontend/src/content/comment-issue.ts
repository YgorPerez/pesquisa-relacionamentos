// A Comentário on its way to the curator (#337, ADR 0043): what the form may
// send, the issue it becomes in the private sources repo, its edit by the
// device that sent it (#442), and the anti-spam, all kept in the server's
// memory. Nothing that identifies the reader goes into the issue: the IP
// serves the rate limit only and is never written.
//
// The server functions (`comment.ts`) wire this to the request, the token
// and the real `fetch`; the tests give a fake GitHub.
import { ORIGIN } from '@tem-estudo/content/search'
import {
  COMMENT_KINDS,
  COMMENT_LIMITS,
  KIND_LABEL,
  type CommentKind,
} from './comment-kinds'

/** What the form sends. `website` is the honeypot: a field no reader sees,
 * which a bot fills. */
export interface CommentInput {
  readonly kind: CommentKind
  readonly text: string
  readonly quote: string
  readonly link: string
  readonly page: string
  readonly website: string
}

/** The reply, the same for a sent comment and for one the anti-spam
 * dropped: a bot learns nothing from it. A sent one carries the number of
 * its issue and the key that edits it, which the reader's device keeps
 * (#347, #442); a dropped one, a made-up number and a key that matches
 * nothing. */
export type CommentReply =
  | { readonly sent: true; readonly issue: number; readonly editKey: string }
  | { readonly sent: false }

/** What an edit sends: the issue, the key its send replied with, and the
 * new type and text. */
export interface EditInput {
  readonly issue: number
  readonly key: string
  readonly kind: CommentKind
  readonly text: string
}

/** `edited` also for a key that does not match and for an issue that does
 * not exist, so a bot learns nothing; `closed` once the curator closed it;
 * `failed` when it did not go out and the reader may try again. */
export type EditReply = { readonly edit: 'edited' | 'closed' | 'failed' }

export interface Issue {
  readonly title: string
  readonly body: string
  readonly labels: readonly string[]
}

/** An issue as GitHub gives it to an edit. */
export interface OpenedIssue extends Issue {
  readonly open: boolean
}

const REPO = 'YgorPerez/pesquisa-relacionamentos-fontes'

/** The error carries no field: what the reader wrote never reaches a log. */
const invalid = () => new Error('Invalid comment.')

function field(data: Record<string, unknown>, name: string, max: number) {
  const value = data[name]
  if (typeof value !== 'string') throw invalid()
  const trimmed = value.trim()
  if (trimmed.length > max) throw invalid()
  return trimmed
}

function record(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null) throw invalid()
  return data as Record<string, unknown>
}

function kindOf(data: Record<string, unknown>): CommentKind {
  const kind = data.kind
  if (!COMMENT_KINDS.includes(kind as CommentKind)) throw invalid()
  return kind as CommentKind
}

function textOf(data: Record<string, unknown>): string {
  const text = field(data, 'text', COMMENT_LIMITS.text)
  if (!text) throw invalid()
  return text
}

/** The validator of the send: the comment, trimmed, or an error that says
 * nothing of what came. */
export function readComment(data: unknown): CommentInput {
  const fields = record(data)
  const kind = kindOf(fields)
  const text = textOf(fields)
  const link = field(fields, 'link', COMMENT_LIMITS.link)
  if (!/^https?:\/\//.test(link) || !URL.canParse(link)) throw invalid()
  return {
    kind,
    text,
    quote: field(fields, 'quote', COMMENT_LIMITS.quote),
    link,
    page: field(fields, 'page', COMMENT_LIMITS.page),
    website: field(fields, 'website', COMMENT_LIMITS.page),
  }
}

/** 32 random bytes in base64url. */
const EDIT_KEY = /^[\w-]{43}$/

/** The validator of the edit, as `readComment`. */
export function readEdit(data: unknown): EditInput {
  const fields = record(data)
  const { issue, key } = fields
  if (!Number.isSafeInteger(issue) || (issue as number) < 1) throw invalid()
  if (typeof key !== 'string' || !EDIT_KEY.test(key)) throw invalid()
  return {
    issue: issue as number,
    key,
    kind: kindOf(fields),
    text: textOf(fields),
  }
}

/** A new edit key: only the reader's device ever holds it. */
export function newEditKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

/** The SHA-256 of the key, in hex: what the issue holds instead of it. */
export async function editKeyHash(key: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(key),
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

/** An `@name` written by the reader would notify that account: a zero-width
 * space after the `@` keeps the text and drops the mention. */
const noMentions = (text: string) => text.replaceAll('@', '@​')

/** The link on the site's own address, whatever host the form ran on: the
 * curator only ever opens a page of the site. */
const onTheSite = (link: string) => {
  const url = new URL(link)
  return `${ORIGIN}${url.pathname}${url.search}${url.hash}`
}

/** Where the reader's text starts. The quote's lines all start with `>` and
 * the link has no line break, so the first one is the heading's. */
const TEXT_HEADING = '\n**Comentário**\n\n'

/** The body's last line, hidden on GitHub. The reader's text comes before
 * it, so it cannot write a line that passes for this one. */
const hashLine = (hash: string) => `<!-- edit-key-sha256: ${hash} -->`
const HASH_LINE = /\n<!-- edit-key-sha256: ([0-9a-f]{64}) -->\s*$/

const readerText = (text: string, hash: string) =>
  `${noMentions(text)}\n\n${hashLine(hash)}`

/** The issue: titled by type and page, labelled by type, with the quote,
 * the link, the reader's text and the hash of its edit key. */
function issueOf(comment: CommentInput, hash: string): Issue {
  const label = KIND_LABEL[comment.kind]
  const quote = noMentions(comment.quote)
    .split('\n')
    .map((line) => `> ${line}`)
  return {
    title: `${label}: ${comment.page || new URL(comment.link).pathname}`,
    labels: [label],
    body: [
      '**Trecho**',
      '',
      ...quote,
      '',
      `**Link:** ${onTheSite(comment.link)}`,
      '',
      TEXT_HEADING.slice(1) + readerText(comment.text, hash),
    ].join('\n'),
  }
}

const TYPE_LABELS: readonly string[] = Object.values(KIND_LABEL)

/** The issue with the new type and text, keeping the quote, the link, the
 * hash and the labels the curator added; `null` when its key's hash is not
 * `hash`, as for an issue sent before the edit key existed. */
function editedIssue(issue: Issue, edit: EditInput, hash: string) {
  const at = issue.body.indexOf(TEXT_HEADING)
  if (at < 0 || issue.body.match(HASH_LINE)?.[1] !== hash) return null
  const label = KIND_LABEL[edit.kind]
  const type = TYPE_LABELS.find((old) => issue.title.startsWith(`${old}: `))
  return {
    title: type ? `${label}${issue.title.slice(type.length)}` : issue.title,
    labels: [
      ...issue.labels.filter((old) => !TYPE_LABELS.includes(old)),
      label,
    ],
    body:
      issue.body.slice(0, at + TEXT_HEADING.length) +
      readerText(edit.text, hash),
  }
}

/** The IP the rate limit counts by. Nginx appends the connection's address
 * to `X-Forwarded-For` (`../../nginx/temestudo.conf`), so only the last one
 * is not the reader's to write; without the header, the connection's own. */
export function clientIp(
  forwardedFor: string | undefined,
  connection: string | undefined,
): string {
  const last = forwardedFor?.split(',').at(-1)?.trim()
  return last || connection || ''
}

const headers = (token: string) => ({
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
  'x-github-api-version': '2022-11-28',
})

/** The issue's number in GitHub's reply to its creation, or `null`. */
async function createdNumber(response: Response): Promise<number | null> {
  if (response.status !== 201) return null
  const { number } = (await response.json()) as { number?: unknown }
  return Number.isSafeInteger(number) && (number as number) > 0
    ? (number as number)
    : null
}

/** Opens the issue on GitHub; its number only when it was created. */
export function postIssue(fetch: typeof globalThis.fetch) {
  return async (issue: Issue, token: string): Promise<number | null> => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/issues`,
        {
          method: 'POST',
          headers: headers(token),
          body: JSON.stringify(issue),
        },
      )
      return await createdNumber(response)
    } catch {
      return null
    }
  }
}

/** An issue in GitHub's reply, or `null` when it is not one (a pull
 * request, or a reply without the fields). */
function openedIssue(raw: unknown): OpenedIssue | null {
  if (typeof raw !== 'object' || raw === null || 'pull_request' in raw)
    return null
  const { title, body, labels, state } = raw as Record<string, unknown>
  if (typeof title !== 'string' || !Array.isArray(labels)) return null
  return {
    title,
    body: typeof body === 'string' ? body.replaceAll('\r\n', '\n') : '',
    labels: labels.flatMap((label: unknown) =>
      typeof label === 'object' && label !== null && 'name' in label
        ? typeof label.name === 'string'
          ? [label.name]
          : []
        : [],
    ),
    open: state === 'open',
  }
}

/** Reads and rewrites one issue on GitHub. `read` is `'missing'` for an
 * issue that is not there and `null` when GitHub did not answer. */
export function githubIssues(fetch: typeof globalThis.fetch) {
  const url = (issue: number) =>
    `https://api.github.com/repos/${REPO}/issues/${issue}`
  return {
    async read(
      issue: number,
      token: string,
    ): Promise<OpenedIssue | 'missing' | null> {
      try {
        const response = await fetch(url(issue), { headers: headers(token) })
        if (response.status === 404 || response.status === 410) return 'missing'
        if (!response.ok) return null
        return openedIssue(await response.json()) ?? 'missing'
      } catch {
        return null
      }
    },
    async update(issue: number, edit: Issue, token: string): Promise<boolean> {
      try {
        const response = await fetch(url(issue), {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify(edit),
        })
        return response.ok
      } catch {
        return false
      }
    },
  }
}

export type GitHubIssues = ReturnType<typeof githubIssues>

interface Delivery {
  /** For the rate limit only; it never leaves this module's memory. */
  readonly ip: string
  /** `COMMENT_GITHUB_TOKEN`; blank, no comment goes out. */
  readonly token: string | undefined
  /** Milliseconds. */
  readonly now: number
  readonly post: (issue: Issue, token: string) => Promise<number | null>
}

interface Editing {
  readonly ip: string
  readonly token: string | undefined
  readonly now: number
  readonly github: Pick<GitHubIssues, 'read' | 'update'>
}

/** A made-up number lands 1 to `SPREAD` past the last reply, where the
 * next real one would. */
const SPREAD = 3

/** Before any real issue since the server started, a made-up number lands
 * between 1 and this. */
const FIRST_GUESS = 100

/** The numbers the replies carry: the real ones GitHub gave, and for a
 * comment the anti-spam dropped, a number a real issue could have. A
 * made-up one may match a real issue, whose status is all it reveals
 * (#346); its key matches nothing, so it cannot edit that issue (#442). */
function issueNumbers(random: () => number) {
  /** The highest number returned, real or made-up; 0 before the first. */
  let latest = 0
  return {
    opened(issue: number, editKey: string): CommentReply {
      latest = Math.max(latest, issue)
      return { sent: true, issue, editKey }
    },
    madeUp(): CommentReply {
      const issue =
        latest > 0
          ? latest + 1 + Math.floor(random() * SPREAD)
          : 1 + Math.floor(random() * FIRST_GUESS)
      latest = issue
      return { sent: true, issue, editKey: newEditKey() }
    },
  }
}

/** The anti-spam in memory: a server restart forgets it, and the IPs live
 * only in this `Map`, dropped once their window passes. Sends and edits
 * share one count per IP. */
export function commentDesk({
  limit,
  windowMs,
  random = Math.random,
}: {
  /** How many sends and edits one IP makes per window. */
  limit: number
  windowMs: number
  /** In [0, 1), for the made-up numbers. */
  random?: () => number
}) {
  const sent = new Map<string, number[]>()
  const numbers = issueNumbers(random)
  /** Whether this IP still has room, holding a place for this one if it
   * has: two sends at once cannot both take the last place. */
  const admit = (ip: string, now: number) => {
    for (const [key, times] of sent) {
      const recent = times.filter((time) => now - time < windowMs)
      if (recent.length > 0) sent.set(key, recent)
      else sent.delete(key)
    }
    const times = sent.get(ip) ?? []
    if (times.length >= limit) return false
    sent.set(ip, [...times, now])
    return true
  }
  /** Gives back the place a send that did not go out held. */
  const release = (ip: string, now: number) => {
    const times = sent.get(ip) ?? []
    const at = times.lastIndexOf(now)
    if (at < 0) return
    const rest = times.filter((_, i) => i !== at)
    if (rest.length > 0) sent.set(ip, rest)
    else sent.delete(ip)
  }
  const failed = (ip: string, now: number): EditReply => {
    release(ip, now)
    return { edit: 'failed' }
  }
  return {
    // Only a comment that became an issue counts against the IP: a reader
    // whose send failed (no token, GitHub refusing or offline) keeps the
    // text and may try again.
    async deliver(
      comment: CommentInput,
      { ip, token, now, post }: Delivery,
    ): Promise<CommentReply> {
      if (comment.website !== '') return numbers.madeUp()
      if (!admit(ip, now)) return numbers.madeUp()
      const editKey = newEditKey()
      const issue = token
        ? await post(issueOf(comment, await editKeyHash(editKey)), token)
        : null
      if (issue === null) {
        release(ip, now)
        return { sent: false }
      }
      return numbers.opened(issue, editKey)
    },
    // An edit that reached GitHub counts, matching key or not; one that
    // did not go out gives its place back, as a send does. Past the limit,
    // the reply is the same as a key that does not match.
    async edit(
      edit: EditInput,
      { ip, token, now, github }: Editing,
    ): Promise<EditReply> {
      if (!admit(ip, now)) return { edit: 'edited' }
      if (!token) return failed(ip, now)
      const issue = await github.read(edit.issue, token)
      if (issue === null) return failed(ip, now)
      if (issue === 'missing') return { edit: 'edited' }
      const next = editedIssue(issue, edit, await editKeyHash(edit.key))
      if (!next) return { edit: 'edited' }
      if (!issue.open) return { edit: 'closed' }
      const done = await github.update(edit.issue, next, token)
      return done ? { edit: 'edited' } : failed(ip, now)
    },
  }
}
