import { describe, expect, it } from 'vite-plus/test'
import { checkLive } from './check-live.ts'

const HTML = 'text/html;charset=utf-8'
const JS = 'text/javascript; charset=utf-8'
const CSS = 'text/css; charset=utf-8'

/** The page as TanStack Start draws it: the CSS in a `<link>`, the JS in a
 * `modulepreload` and in the inline script's `import()`, and the
 * `__root__`'s NUL. */
const PAGE = `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="/assets/estilo-B3x_9a.css"/>
<link rel="modulepreload" href="/assets/main-Df81kZ.js"/>
</head><body><script>"__root__\0"</script>
<script type="module">import("/assets/main-Df81kZ.js")</script></body></html>`

type Answer = {
  status?: number
  type?: string
  body?: string
  headers?: Record<string, string>
}

/** A `fetch` that answers by path (with the query) and keeps what was
 * requested. */
function site(answers: Record<string, Answer>) {
  const requests: string[] = []
  const fetch = async (url: string) => {
    const { pathname, search, protocol } = new URL(url)
    const prefix = protocol === 'http:' ? 'http ' : ''
    requests.push(`${prefix}${pathname}${search}`)
    const r = answers[`${prefix}${pathname}`]
    if (!r) return new Response('not found', { status: 404 })
    return new Response(r.body ?? '', {
      status: r.status ?? 200,
      headers: { 'content-type': r.type ?? HTML, ...r.headers },
    })
  }
  return { fetch, requests }
}

const LIVE: Record<string, Answer> = {
  '/': {
    body: PAGE,
    headers: { 'referrer-policy': 'strict-origin' },
  },
  '/assets/main-Df81kZ.js': { type: JS, body: 'export {}' },
  '/assets/estilo-B3x_9a.css': { type: CSS, body: 'body{}' },
  'http /': {
    status: 301,
    headers: { location: 'https://temestudo.cloud/?x=1' },
  },
}

/** No real waiting: the clock moves what the interval asks. */
function noWait() {
  let now = 0
  return {
    now: () => now,
    wait: async (ms: number) => {
      now += ms
    },
  }
}

const check = (answers: Record<string, Answer>) =>
  checkLive({
    host: 'temestudo.cloud',
    mark: 'abc1234',
    fetch: site(answers).fetch,
    deadlineMs: 10_000,
    intervalMs: 5_000,
    ...noWait(),
  })

describe('checkLive', () => {
  it('passes when the page, its assets and https are right', async () => {
    const { fetch, requests } = site(LIVE)

    const r = await checkLive({
      host: 'temestudo.cloud',
      mark: 'abc1234',
      fetch,
      ...noWait(),
    })

    expect(r).toEqual({
      ok: true,
      lines: [
        'temestudo.cloud: / arrives with Referrer-Policy: strict-origin',
        'temestudo.cloud: /assets/estilo-B3x_9a.css arrives as text/css; charset=utf-8',
        'temestudo.cloud: /assets/main-Df81kZ.js arrives as text/javascript; charset=utf-8',
        'temestudo.cloud: http://temestudo.cloud/?x=1 leads to https://temestudo.cloud/?x=1',
      ],
    })
    // The query busts the cache of whoever is in between.
    expect(requests[0]).toBe('/?check=abc1234')
    // The same asset cited twice is requested once.
    expect(requests.filter((p) => p.endsWith('.js'))).toHaveLength(1)
  })

  it('fails if an asset comes as HTML', async () => {
    const r = await check({
      ...LIVE,
      '/assets/main-Df81kZ.js': { body: '<!DOCTYPE html>', type: HTML },
    })

    expect(r).toEqual({
      ok: false,
      reason:
        'temestudo.cloud: /assets/main-Df81kZ.js arrived with 200 and text/html;charset=utf-8 (3 attempts in 10 s)',
    })
  })

  it('fails if the CSS comes with another type', async () => {
    const r = await check({
      ...LIVE,
      '/assets/estilo-B3x_9a.css': { type: 'text/plain' },
    })

    expect(r.ok).toBe(false)
    expect(!r.ok && r.reason).toContain(
      '/assets/estilo-B3x_9a.css arrived with 200 and text/plain',
    )
  })

  it('fails if a cited asset is gone', async () => {
    const { '/assets/estilo-B3x_9a.css': _, ...withoutCss } = LIVE

    const r = await check(withoutCss)

    expect(!r.ok && r.reason).toContain(
      '/assets/estilo-B3x_9a.css arrived with 404',
    )
  })

  it('fails if the page cites no JavaScript', async () => {
    const r = await check({
      ...LIVE,
      '/': { ...LIVE['/'], body: '<html>Domínio estacionado</html>' },
    })

    expect(!r.ok && r.reason).toContain(
      'the HTML of / cites no /assets/*.js: <html>Domínio estacionado</html>',
    )
  })

  it('fails without Referrer-Policy: strict-origin', async () => {
    const r = await check({ ...LIVE, '/': { body: PAGE } })

    expect(!r.ok && r.reason).toContain(
      '/ does not send Referrer-Policy: strict-origin (got none)',
    )
  })

  it('fails if http does not lead to https with the query', async () => {
    const r = await check({
      ...LIVE,
      'http /': {
        status: 301,
        headers: { location: 'https://temestudo.cloud/' },
      },
    })

    expect(!r.ok && r.reason).toContain(
      'http://temestudo.cloud/?x=1 leads to https://temestudo.cloud/, not to https://temestudo.cloud/?x=1',
    )
  })

  it('tries again while the app comes up', async () => {
    let times = 0
    const { fetch } = site(LIVE)
    const r = await checkLive({
      host: 'temestudo.cloud',
      mark: 'abc1234',
      fetch: async (url) => {
        if (times++ === 0) throw new Error('connection refused')
        return fetch(url)
      },
      ...noWait(),
    })

    expect(r.ok).toBe(true)
  })

  it('a connection that does not open becomes the reason', async () => {
    const r = await checkLive({
      host: 'temestudo.cloud',
      mark: 'abc1234',
      fetch: async () => {
        throw new TypeError('fetch failed', { cause: 'ECONNREFUSED' })
      },
      deadlineMs: 0,
      ...noWait(),
    })

    expect(r).toEqual({
      ok: false,
      reason:
        'temestudo.cloud: the connection failed: ECONNREFUSED (1 attempts in 0 s)',
    })
  })
})
