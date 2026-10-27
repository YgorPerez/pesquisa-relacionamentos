// A Comentário on its way to the curator (#337, ADR 0043): what the form may
// send, the issue it becomes in the private sources repo, and the anti-spam,
// all kept in the server's memory. Nothing that identifies the reader goes
// into the issue: the IP serves the rate limit only and is never written.
//
// The server function (`comment.ts`) wires this to the request, the token
// and the real `fetch`; the tests give a fake `post`.
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
 * dropped: a bot learns nothing from it. */
export interface CommentReply {
  readonly sent: boolean
}

export interface Issue {
  readonly title: string
  readonly body: string
  readonly labels: readonly string[]
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

/** The validator of the server function: the comment, trimmed, or an error
 * that says nothing of what came. */
export function readComment(data: unknown): CommentInput {
  if (typeof data !== 'object' || data === null) throw invalid()
  const record = data as Record<string, unknown>
  const kind = record.kind
  if (!COMMENT_KINDS.includes(kind as CommentKind)) throw invalid()
  const text = field(record, 'text', COMMENT_LIMITS.text)
  if (!text) throw invalid()
  const link = field(record, 'link', COMMENT_LIMITS.link)
  if (!/^https?:\/\//.test(link) || !URL.canParse(link)) throw invalid()
  return {
    kind: kind as CommentKind,
    text,
    quote: field(record, 'quote', COMMENT_LIMITS.quote),
    link,
    page: field(record, 'page', COMMENT_LIMITS.page),
    website: field(record, 'website', COMMENT_LIMITS.page),
  }
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

/** The issue: titled by type and page, labelled by type, with the quote,
 * the link and the reader's text. */
function issueOf(comment: CommentInput): Issue {
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
      '**Comentário**',
      '',
      noMentions(comment.text),
    ].join('\n'),
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

/** Opens the issue on GitHub; `true` only when it was created. */
export function postIssue(fetch: typeof globalThis.fetch) {
  return async (issue: Issue, token: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/issues`,
        {
          method: 'POST',
          headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            'x-github-api-version': '2022-11-28',
          },
          body: JSON.stringify(issue),
        },
      )
      return response.status === 201
    } catch {
      return false
    }
  }
}

interface Delivery {
  /** For the rate limit only; it never leaves this module's memory. */
  readonly ip: string
  /** `COMMENT_GITHUB_TOKEN`; blank, no comment goes out. */
  readonly token: string | undefined
  /** Milliseconds. */
  readonly now: number
  readonly post: (issue: Issue, token: string) => Promise<boolean>
}

/** The anti-spam in memory: a server restart forgets it, and the IPs live
 * only in this `Map`, dropped once their window passes. */
export function commentDesk({
  limit,
  windowMs,
}: {
  /** How many comments one IP sends per window. */
  limit: number
  windowMs: number
}) {
  const sent = new Map<string, number[]>()
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
  return {
    // Only a comment that became an issue counts against the IP: a reader
    // whose send failed (no token, GitHub refusing or offline) keeps the
    // text and may try again.
    async deliver(
      comment: CommentInput,
      { ip, token, now, post }: Delivery,
    ): Promise<CommentReply> {
      if (comment.website !== '') return { sent: true }
      if (!admit(ip, now)) return { sent: true }
      const went = token ? await post(issueOf(comment), token) : false
      if (!went) release(ip, now)
      return { sent: went }
    },
  }
}
