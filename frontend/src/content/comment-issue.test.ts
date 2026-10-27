// A Comentário on its way to the private repo (#337, ADR 0043): what the
// form may send, the issue it becomes, and the anti-spam. GitHub here is a
// fake `post` that keeps what it got; no test reaches the real API.
import { describe, expect, it } from 'vite-plus/test'
import {
  clientIp,
  commentDesk,
  postIssue,
  readComment,
  type CommentInput,
  type Issue,
} from './comment-issue'

const COMMENT: CommentInput = {
  kind: 'wrong',
  text: 'Esse número não bate com a Ficha.',
  quote: 'A satisfação de quem se conheceu online\nfica perto',
  link: 'http://localhost:43500/onde-conhecer-pessoas#o-lugar:~:text=A%20satisfa%C3%A7%C3%A3o',
  page: 'Onde conhecer pessoas',
  website: '',
}

function setup({ token = 'github_pat_test', limit = 3 } = {}) {
  const posted: Issue[] = []
  let ok = true
  let clock = 0
  const desk = commentDesk({ limit, windowMs: 60_000 })
  const send = (input: CommentInput = COMMENT, ip = '203.0.113.7') =>
    desk.deliver(input, {
      ip,
      token,
      now: clock,
      post: async (issue) => {
        posted.push(issue)
        return ok
      },
    })
  return {
    send,
    posted,
    fail: () => void (ok = false),
    later: (ms: number) => void (clock += ms),
  }
}

describe('a Comentário', () => {
  it('becomes one issue titled by type and page, labelled by type, with the quote, the link and the text', async () => {
    const { send, posted } = setup()

    expect(await send()).toEqual({ sent: true })

    expect(posted).toHaveLength(1)
    expect(posted[0]).toEqual({
      title: 'Está errado: Onde conhecer pessoas',
      labels: ['Está errado'],
      body: [
        '**Trecho**',
        '',
        '> A satisfação de quem se conheceu online',
        '> fica perto',
        '',
        '**Link:** https://temestudo.cloud/onde-conhecer-pessoas#o-lugar:~:text=A%20satisfa%C3%A7%C3%A3o',
        '',
        '**Comentário**',
        '',
        'Esse número não bate com a Ficha.',
      ].join('\n'),
    })
  })

  it('carries nothing that identifies the reader: no IP in the issue', async () => {
    const { send, posted } = setup()
    await send(COMMENT, '198.51.100.23')
    expect(JSON.stringify(posted)).not.toContain('198.51.100.23')
  })

  it('a mention in the text does not notify anyone', async () => {
    const { send, posted } = setup()
    await send({ ...COMMENT, text: 'fala com @alguem' })
    expect(posted[0]!.body).not.toMatch(/@alguem/)
    expect(posted[0]!.body).toContain('alguem')
  })
})

describe('the anti-spam and the failures', () => {
  it('with the honeypot filled, opens no issue and replies as if it had', async () => {
    const { send, posted } = setup()
    expect(await send({ ...COMMENT, website: 'http://spam.example' })).toEqual({
      sent: true,
    })
    expect(posted).toEqual([])
  })

  it('past the limit for one IP, opens no issue and replies the same; another IP and a later hour go through', async () => {
    const { send, posted, later } = setup({ limit: 2 })
    await send()
    await send()
    expect(await send()).toEqual({ sent: true })
    expect(posted).toHaveLength(2)

    await send(COMMENT, '192.0.2.1')
    expect(posted).toHaveLength(3)

    later(60_001)
    await send()
    expect(posted).toHaveLength(4)
  })

  it('when GitHub refuses, or there is no token, the reply says it was not sent', async () => {
    const refused = setup()
    refused.fail()
    expect(await refused.send()).toEqual({ sent: false })

    const noToken = setup({ token: '' })
    expect(await noToken.send()).toEqual({ sent: false })
    expect(noToken.posted).toEqual([])
  })
})

describe('what the form may send', () => {
  it('takes a well-formed comment, trimmed', () => {
    expect(readComment({ ...COMMENT, text: '  oi  ' })).toEqual({
      ...COMMENT,
      text: 'oi',
    })
  })

  it.each([
    ['an unknown type', { kind: 'spam' }],
    ['an empty text', { text: '   ' }],
    ['a text over 2000 characters', { text: 'a'.repeat(2001) }],
    ['a quote over 1500 characters', { quote: 'a'.repeat(1501) }],
    ['a link that is not a web address', { link: 'javascript:alert(1)' }],
    ['a page title that is not text', { page: 3 }],
  ])('refuses %s, without echoing it', (_, change) => {
    expect(() => readComment({ ...COMMENT, ...change })).toThrow(
      /^Invalid comment\.$/,
    )
  })
})

describe("the reader's IP, for the rate limit only", () => {
  it('is the one Nginx appended last to X-Forwarded-For, not what the reader wrote in front', () => {
    expect(clientIp('1.1.1.1, 203.0.113.7', '127.0.0.1')).toBe('203.0.113.7')
  })

  it('without the header, is the connection’s', () => {
    expect(clientIp(undefined, '127.0.0.1')).toBe('127.0.0.1')
    expect(clientIp(undefined, undefined)).toBe('')
  })
})

describe('the issue on GitHub', () => {
  it('goes to the private sources repo with the token, and only an issue created counts', async () => {
    const calls: Request[] = []
    const post = postIssue(async (input, init) => {
      calls.push(new Request(input, init))
      return new Response('{}', { status: 201 })
    })
    const issue = { title: 't', body: 'b', labels: ['Outro'] }

    expect(await post(issue, 'github_pat_test')).toBe(true)
    const [call] = calls
    expect(call!.url).toBe(
      'https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues',
    )
    expect(call!.method).toBe('POST')
    expect(call!.headers.get('authorization')).toBe('Bearer github_pat_test')
    expect(await call!.json()).toEqual(issue)

    const refused = postIssue(async () => new Response('', { status: 403 }))
    expect(await refused(issue, 'x')).toBe(false)
    const offline = postIssue(async () => {
      throw new TypeError('fetch failed')
    })
    expect(await offline(issue, 'x')).toBe(false)
  })
})
