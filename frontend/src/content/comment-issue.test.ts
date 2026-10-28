// A Comentário on its way to the private repo (#337, ADR 0043): what the
// form may send, the issue it becomes, and the anti-spam. GitHub here is a
// fake `post` that keeps what it got; no test reaches the real API.
import { describe, expect, it } from 'vite-plus/test'
import {
  clientIp,
  commentDesk,
  editKeyHash,
  githubIssues,
  postIssue,
  readEdit,
  readComment,
  type CommentInput,
  type EditInput,
  type Issue,
  type OpenedIssue,
} from './comment-issue'

const COMMENT: CommentInput = {
  kind: 'wrong',
  text: 'Esse número não bate com a Ficha.',
  quote: 'A satisfação de quem se conheceu online\nfica perto',
  link: 'http://localhost:43500/onde-conhecer-pessoas#o-lugar:~:text=A%20satisfa%C3%A7%C3%A3o',
  page: 'Onde conhecer pessoas',
  website: '',
}

/** GitHub numbers the issues from here on. */
const FIRST_ISSUE = 41

function setup({
  token = 'github_pat_test',
  limit = 3,
  random = (): number => 0,
} = {}) {
  const posted: Issue[] = []
  let ok = true
  let clock = 0
  const desk = commentDesk({ limit, windowMs: 60_000, random })
  const send = (input: CommentInput = COMMENT, ip = '203.0.113.7') =>
    desk.deliver(input, {
      ip,
      token,
      now: clock,
      post: async (issue) => {
        posted.push(issue)
        return ok ? FIRST_ISSUE + posted.length - 1 : null
      },
    })
  return {
    send,
    posted,
    fail: () => void (ok = false),
    recover: () => void (ok = true),
    later: (ms: number) => void (clock += ms),
  }
}

describe('a Comentário', () => {
  it('becomes one issue titled by type and page, labelled by type, with the quote, the link and the text', async () => {
    const { send, posted } = setup()

    const reply = await send()
    expect(reply).toEqual({
      sent: true,
      issue: FIRST_ISSUE,
      editKey: expect.stringMatching(/^[\w-]{43}$/),
    })

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
        '',
        `<!-- edit-key-sha256: ${await editKeyHash(reply.sent ? reply.editKey : '')} -->`,
      ].join('\n'),
    })
    expect(posted[0]!.body).not.toContain(reply.sent && reply.editKey)
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
  it('keeps repeated dropped replies distinct and increasing after a real send', async () => {
    const { send, posted } = setup({ limit: 1 })
    const replies = [await send()]
    for (let i = 0; i < 4; i++) replies.push(await send())
    replies.push(await send({ ...COMMENT, website: 'bot' }))
    expect(replies.map((reply) => reply.sent && reply.issue)).toEqual([
      41, 42, 43, 44, 45, 46,
    ])
    expect(posted).toHaveLength(1)
  })

  it('with the honeypot filled, opens no issue and replies as if it had, with a made-up number', async () => {
    const { send, posted } = setup()
    const reply = await send({ ...COMMENT, website: 'http://spam.example' })
    expect(reply).toEqual({
      sent: true,
      issue: expect.any(Number),
      editKey: expect.stringMatching(/^[\w-]{43}$/),
    })
    expect(posted).toEqual([])
  })

  it('past the limit for one IP, opens no issue and replies the same; another IP and a later hour go through', async () => {
    const { send, posted, later } = setup({ limit: 2 })
    await send()
    await send()
    expect(await send()).toMatchObject({
      sent: true,
      issue: expect.any(Number),
    })
    expect(posted).toHaveLength(2)

    await send(COMMENT, '192.0.2.1')
    expect(posted).toHaveLength(3)

    later(60_001)
    await send()
    expect(posted).toHaveLength(4)
  })

  it('a send that did not go out leaves the room it took, so the reader can try again', async () => {
    const { send, posted, fail, recover } = setup({ limit: 2 })
    fail()
    await send()
    await send()
    await send()
    recover()
    expect(await send()).toMatchObject({ sent: true })
    expect(await send()).toMatchObject({ sent: true })
    expect(posted).toHaveLength(5)

    await send()
    expect(posted).toHaveLength(5)

    const noToken = setup({ token: '', limit: 1 })
    await noToken.send()
    await noToken.send()
    expect(await noToken.send()).toEqual({ sent: false })
  })

  it('a made-up number advances past the previous reply, as the next issue would', async () => {
    const steps = [0, 0.5, 0.99]
    const { send, posted } = setup({ limit: 2, random: () => steps.shift()! })
    expect(await send()).toMatchObject({ sent: true, issue: FIRST_ISSUE })
    expect(await send()).toMatchObject({
      sent: true,
      issue: FIRST_ISSUE + 1,
    })
    const madeUp = await Promise.all([send(), send(), send()])
    expect(madeUp.map((reply) => reply.sent && reply.issue)).toEqual([
      FIRST_ISSUE + 2,
      FIRST_ISSUE + 4,
      FIRST_ISSUE + 7,
    ])
    expect(posted).toHaveLength(2)
  })

  it('before any real issue, a made-up number is still a plausible one', async () => {
    const { send } = setup({ random: () => 0.5 })
    const reply = await send({ ...COMMENT, website: 'bot' })
    expect(reply.sent && reply.issue).toBeGreaterThan(0)
    expect(Number.isInteger(reply.sent && reply.issue)).toBe(true)
  })

  it('two sends at once from one IP with room for one: only one reaches GitHub', async () => {
    const { send, posted } = setup({ limit: 1 })
    await Promise.all([send(), send()])
    expect(posted).toHaveLength(1)
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
  it('goes to the private sources repo with the token, and only an issue created counts, by its number', async () => {
    const calls: Request[] = []
    const post = postIssue(async (input, init) => {
      calls.push(new Request(input, init))
      return Response.json({ number: 57, title: 't' }, { status: 201 })
    })
    const issue = { title: 't', body: 'b', labels: ['Outro'] }

    expect(await post(issue, 'github_pat_test')).toBe(57)
    const [call] = calls
    expect(call!.url).toBe(
      'https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues',
    )
    expect(call!.method).toBe('POST')
    expect(call!.headers.get('authorization')).toBe('Bearer github_pat_test')
    expect(await call!.json()).toEqual(issue)

    const refused = postIssue(async () => new Response('', { status: 403 }))
    expect(await refused(issue, 'x')).toBeNull()
    const offline = postIssue(async () => {
      throw new TypeError('fetch failed')
    })
    expect(await offline(issue, 'x')).toBeNull()
    const noNumber = postIssue(async () => new Response('{}', { status: 201 }))
    expect(await noNumber(issue, 'x')).toBeNull()
  })
})

/** A desk with a fake GitHub that keeps its issues, for sends and edits. */
function editing({ limit = 5, token = 'github_pat_test' } = {}) {
  const issues = new Map<number, OpenedIssue>()
  const updates: number[] = []
  let ok = true
  const github = {
    async read(issue: number) {
      if (!ok) return null
      return issues.get(issue) ?? ('missing' as const)
    },
    async update(issue: number, edit: Issue) {
      if (!ok) return false
      updates.push(issue)
      issues.set(issue, { ...issues.get(issue)!, ...edit })
      return true
    },
  }
  const desk = commentDesk({ limit, windowMs: 60_000, random: () => 0 })
  const ip = '203.0.113.7'
  const send = async (input: CommentInput = COMMENT) => {
    const reply = await desk.deliver(input, {
      ip,
      token,
      now: 0,
      post: async (issue) => {
        const number = FIRST_ISSUE + issues.size
        issues.set(number, { ...issue, open: true })
        return number
      },
    })
    if (!reply.sent) throw new Error('not sent')
    return reply
  }
  const edit = (input: EditInput) =>
    desk.edit(input, { ip, token, now: 0, github })
  return {
    send,
    edit,
    issues,
    updates,
    close: (issue: number) =>
      issues.set(issue, { ...issues.get(issue)!, open: false }),
    fail: () => void (ok = false),
    recover: () => void (ok = true),
  }
}

describe('editing a sent Comentário', () => {
  it('with its key, rewrites the type and the text, and keeps the quote, the link, the hash and the curator’s labels', async () => {
    const desk = editing()
    const { issue, editKey } = await desk.send()
    const before = desk.issues.get(issue)!
    desk.issues.set(issue, { ...before, labels: [...before.labels, 'triado'] })

    expect(
      await desk.edit({
        issue,
        key: editKey,
        kind: 'unclear',
        text: 'Na verdade, não entendi @alguem.',
      }),
    ).toEqual({ edit: 'edited' })

    const after = desk.issues.get(issue)!
    expect(after.title).toBe('Não entendi: Onde conhecer pessoas')
    expect(after.labels).toEqual(['triado', 'Não entendi'])
    const [head] = before.body.split('Esse número')
    expect(after.body).toBe(
      `${head}Na verdade, não entendi @​alguem.\n\n<!-- edit-key-sha256: ${await editKeyHash(editKey)} -->`,
    )
  })

  it('edits again after an edit', async () => {
    const desk = editing()
    const { issue, editKey } = await desk.send()
    const edit = { issue, key: editKey, kind: 'other', text: 'um' } as const
    await desk.edit(edit)
    await desk.edit({ ...edit, text: 'dois' })
    expect(desk.issues.get(issue)!.body).toMatch(/\*\*Comentário\*\*\n\ndois\n/)
    expect(desk.updates).toEqual([issue, issue])
  })

  it('with another key, a missing issue or one sent before the key existed, changes nothing and replies the same as an edit', async () => {
    const desk = editing()
    const { issue } = await desk.send()
    const other = await desk.send()
    const old = 99
    desk.issues.set(old, {
      title: 'Outro: Guia',
      labels: ['Outro'],
      body: '**Trecho**\n\n> a\n\n**Link:** x\n\n**Comentário**\n\nantigo',
      open: true,
    })
    const edit = { kind: 'other', text: 'trocado' } as const

    expect(await desk.edit({ ...edit, issue, key: other.editKey })).toEqual({
      edit: 'edited',
    })
    expect(
      await desk.edit({ ...edit, issue: 500, key: other.editKey }),
    ).toEqual({ edit: 'edited' })
    expect(
      await desk.edit({ ...edit, issue: old, key: other.editKey }),
    ).toEqual({ edit: 'edited' })
    expect(desk.updates).toEqual([])
  })
})

describe('what a sent Comentário cannot edit', () => {
  it('the key a dropped comment got edits nothing, even when its made-up number is a real issue', async () => {
    const desk = editing()
    const real = await desk.send()
    const dropped = await desk.send({ ...COMMENT, website: 'bot' })
    expect(
      await desk.edit({
        issue: real.issue,
        key: dropped.editKey,
        kind: 'other',
        text: 'spam',
      }),
    ).toEqual({ edit: 'edited' })
    expect(desk.updates).toEqual([])
  })

  it('a closed issue is never edited, and says so', async () => {
    const desk = editing()
    const { issue, editKey } = await desk.send()
    desk.close(issue)
    expect(
      await desk.edit({ issue, key: editKey, kind: 'other', text: 'tarde' }),
    ).toEqual({ edit: 'closed' })
    expect(desk.updates).toEqual([])
  })

  it('counts against the same limit as a send; past it, replies as an edit and changes nothing', async () => {
    const desk = editing({ limit: 2 })
    const { issue, editKey } = await desk.send()
    const edit = { issue, key: editKey, kind: 'other', text: 'um' } as const
    await desk.edit(edit)
    expect(await desk.edit({ ...edit, text: 'dois' })).toEqual({
      edit: 'edited',
    })
    expect(desk.updates).toEqual([issue])
  })

  it('when GitHub does not answer, or there is no token, says it failed and gives the place back', async () => {
    const desk = editing({ limit: 2 })
    const { issue, editKey } = await desk.send()
    const edit = { issue, key: editKey, kind: 'other', text: 'um' } as const
    desk.fail()
    expect(await desk.edit(edit)).toEqual({ edit: 'failed' })
    expect(await desk.edit(edit)).toEqual({ edit: 'failed' })
    desk.recover()
    expect(await desk.edit(edit)).toEqual({ edit: 'edited' })
    expect(desk.updates).toEqual([issue])

    const noToken = editing({ token: '' })
    expect(await noToken.edit(edit)).toEqual({ edit: 'failed' })
  })
})

describe('what an edit may send', () => {
  const EDIT = {
    issue: 41,
    key: 'a'.repeat(43),
    kind: 'wrong',
    text: '  outro texto  ',
  }

  it('takes a well-formed edit, trimmed', () => {
    expect(readEdit(EDIT)).toEqual({ ...EDIT, text: 'outro texto' })
  })

  it.each([
    ['no issue number', { issue: 0 }],
    ['a fractional issue number', { issue: 4.5 }],
    ['a short key', { key: 'abc' }],
    ['a key that is not base64url', { key: '+'.repeat(43) }],
    ['an unknown type', { kind: 'spam' }],
    ['an empty text', { text: ' ' }],
    ['a text over 2000 characters', { text: 'a'.repeat(2001) }],
  ])('refuses %s, without echoing it', (_, change) => {
    expect(() => readEdit({ ...EDIT, ...change })).toThrow(
      /^Invalid comment\.$/,
    )
  })
})

describe('reading and rewriting the issue on GitHub', () => {
  it('reads the issue from the private sources repo and patches it there', async () => {
    const calls: Request[] = []
    const github = githubIssues(async (input, init) => {
      const call = new Request(input, init)
      calls.push(call)
      return call.method === 'PATCH'
        ? Response.json({})
        : Response.json({
            title: 't',
            body: 'a\r\nb',
            labels: [{ name: 'Outro' }],
            state: 'closed',
          })
    })
    expect(await github.read(41, 'tok')).toEqual({
      title: 't',
      body: 'a\nb',
      labels: ['Outro'],
      open: false,
    })
    const edit = { title: 't', body: 'c', labels: ['Outro'] }
    expect(await github.update(41, edit, 'tok')).toBe(true)
    expect(calls.map((call) => [call.method, call.url])).toEqual([
      [
        'GET',
        'https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues/41',
      ],
      [
        'PATCH',
        'https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues/41',
      ],
    ])
    expect(calls[1]!.headers.get('authorization')).toBe('Bearer tok')
    expect(await calls[1]!.json()).toEqual(edit)
  })
})

describe('the issue GitHub does not give', () => {
  it('a missing issue or a pull request is missing; a refusal or no network is no answer', async () => {
    const answering = (response: () => Response) =>
      githubIssues(async () => response()).read(41, 'tok')
    expect(await answering(() => new Response('', { status: 404 }))).toBe(
      'missing',
    )
    expect(
      await answering(() =>
        Response.json({ title: 't', labels: [], pull_request: {} }),
      ),
    ).toBe('missing')
    expect(await answering(() => new Response('', { status: 403 }))).toBeNull()
    expect(
      await githubIssues(async () => {
        throw new TypeError('fetch failed')
      }).read(41, 'tok'),
    ).toBeNull()
    expect(
      await githubIssues(async () => new Response('', { status: 422 })).update(
        41,
        { title: 't', body: 'b', labels: [] },
        'tok',
      ),
    ).toBe(false)
  })
})
