import { describe, expect, test } from 'vite-plus/test'
import { withRequestLog } from './request-log'

// The share link carries the Profile in the query (ADR 0001). The app log
// keeps only method, path, status and time.
const LINK = 'https://temestudo.cloud/grupo-possivel?v=1&g=h&p=m&i=30&f=25-35'

function setup(response: () => Response | Promise<Response>) {
  const lines: string[] = []
  let clock = 1000
  const fetch = withRequestLog(async () => response(), {
    write: (line) => lines.push(line),
    now: () => (clock += 12),
  })
  return { fetch, lines }
}

describe("the server's log of each request", () => {
  test('a request with a query leaves in the log line only method, path, status and time', async () => {
    const { fetch, lines } = setup(() => new Response('ok', { status: 200 }))

    await fetch(new Request(LINK))

    expect(lines).toEqual(['GET /grupo-possivel 200 12ms'])
  })

  test('no piece of the query reaches the log, not even encoded', async () => {
    const { fetch, lines } = setup(() => new Response(null, { status: 302 }))

    await fetch(
      new Request('https://temestudo.cloud/?g=mulher%20trans&o=bi#topo', {
        method: 'HEAD',
      }),
    )

    expect(lines).toEqual(['HEAD / 302 12ms'])
    expect(lines.join('\n')).not.toMatch(/[?&=#%]|mulher|trans|bi/)
  })

  test('a Comentário, which goes in the body of a POST, never reaches the log, nor the IP it came from', async () => {
    const { fetch, lines } = setup(() => new Response('{}', { status: 200 }))

    await fetch(
      new Request('https://temestudo.cloud/_serverFn/abc?createServerFn', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.7' },
        body: JSON.stringify({ text: 'meu namorado e eu' }),
      }),
    )

    expect(lines).toEqual(['POST /_serverFn/abc 200 12ms'])
  })

  test('every response goes out with Referrer-Policy: strict-origin', async () => {
    const { fetch } = setup(
      () => new Response('ok', { headers: { 'content-type': 'text/html' } }),
    )

    const response = await fetch(new Request(LINK))

    expect(response.headers.get('referrer-policy')).toBe('strict-origin')
    expect(response.headers.get('content-type')).toBe('text/html')
    expect(await response.text()).toBe('ok')
  })

  test('a redirect, which has immutable headers, also carries the header', async () => {
    const { fetch } = setup(() =>
      Response.redirect('https://temestudo.cloud/', 301),
    )

    const response = await fetch(new Request(LINK))

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://temestudo.cloud/')
    expect(response.headers.get('referrer-policy')).toBe('strict-origin')
  })

  test('the request that blows up on the server becomes a line with status 500, without the query', async () => {
    const { fetch, lines } = setup(() => {
      throw new Error('broke')
    })

    await expect(fetch(new Request(LINK))).rejects.toThrow('broke')
    expect(lines).toEqual(['GET /grupo-possivel 500 12ms'])
  })
})
