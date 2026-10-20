// What the deploy checks from outside, over the internet, after putting the
// app live (ADR 0008), modeled on the Festival dos Macacos
// (`conferir-no-ar.ts` there): the `/` page arrives with
// `Referrer-Policy: strict-origin`, each `/assets/*.js` and `/assets/*.css` it
// cites arrives with its type, and not as an HTML error page, and http leads
// to https with the query along. `deploy.yml` calls it like this:
//
//   node scripts/check-live.ts temestudo.cloud <sha>
//
// The TanStack page carries a NUL byte (the `"__root__\0"` id of the
// dehydrated root route), and `grep` reads it as binary: here the search is
// on the text.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

import { stopwatch } from './stopwatch.ts'

type Fetch = (url: string, init?: RequestInit) => Promise<Response>

export type CheckOptions = {
  host: string
  /** Goes in the page's query, to bust the cache of whoever is in between. */
  mark: string
  fetch?: Fetch
  /** How long, in total, to keep trying while the app comes up. */
  deadlineMs?: number
  /** How long to wait between two attempts. */
  intervalMs?: number
  wait?: (ms: number) => Promise<void>
  now?: () => number
}

export type CheckResult =
  | { ok: true; lines: string[] }
  | { ok: false; reason: string }

const ASSET = /\/assets\/[A-Za-z0-9._-]+\.(?:js|css)/g

/** The type each asset extension must carry. */
const ASSET_TYPE = { js: /javascript/i, css: /^text\/css\b/i } as const

/** The start of what came, on one line, for the error message. */
function excerpt(text: string) {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > 200 ? `${line.slice(0, 200)}…` : line
}

class Failure extends Error {}

const NO_CACHE = {
  cache: 'no-store',
  headers: { 'cache-control': 'no-cache' },
} as const

/** One attempt: the lines of what passed, or a `Failure` with what went
 * wrong and what came. */
async function checkOnce(fetch: Fetch, host: string, mark: string) {
  const base = `https://${host}/`
  const lines: string[] = []

  const page = await fetch(`${base}?check=${mark}`, {
    ...NO_CACHE,
    signal: AbortSignal.timeout(15_000),
  })
  const html = await page.text()
  if (page.status !== 200) throw new Failure(`/ answered ${page.status}`)
  const policy = page.headers.get('referrer-policy')
  if (policy !== 'strict-origin')
    throw new Failure(
      `/ does not send Referrer-Policy: strict-origin (got ${policy ?? 'none'})`,
    )
  lines.push(`${host}: / arrives with Referrer-Policy: strict-origin`)

  const assets = [...new Set(html.match(ASSET))]
  if (!assets.some((a) => a.endsWith('.js')))
    throw new Failure(`the HTML of / cites no /assets/*.js: ${excerpt(html)}`)
  // All together; the first failure, in page order, is the reason.
  const arrivals = await Promise.all(
    assets.map(async (path) => {
      const response = await fetch(new URL(path, base).href, {
        ...NO_CACHE,
        signal: AbortSignal.timeout(15_000),
      })
      await response.body?.cancel()
      const type = response.headers.get('content-type') ?? '(no content-type)'
      const expected = path.endsWith('.js') ? ASSET_TYPE.js : ASSET_TYPE.css
      const right = response.status === 200 && expected.test(type)
      return { path, type, right, status: response.status }
    }),
  )
  for (const { path, type, right, status } of arrivals) {
    if (!right) throw new Failure(`${path} arrived with ${status} and ${type}`)
    lines.push(`${host}: ${path} arrives as ${type}`)
  }

  const http = `http://${host}/?x=1`
  const https = `https://${host}/?x=1`
  const redirect = await fetch(http, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  })
  await redirect.body?.cancel()
  const target = redirect.headers.get('location')
  if (target !== https)
    throw new Failure(
      `${http} leads to ${target ?? 'nothing'}, not to ${https}`,
    )
  lines.push(`${host}: ${http} leads to ${https}`)

  return lines
}

/** Checks the host, trying again every `intervalMs` until `deadlineMs`: the
 * container has just swapped, and the first connection may drop. */
export async function checkLive({
  host,
  mark,
  fetch: get = fetch,
  deadlineMs = 60_000,
  intervalMs = 5_000,
  wait = (ms) => new Promise((ready) => setTimeout(ready, ms)),
  now = Date.now,
}: CheckOptions): Promise<CheckResult> {
  const limit = now() + deadlineMs
  let attempts = 0
  for (;;) {
    attempts++
    try {
      return { ok: true, lines: await checkOnce(get, host, mark) }
    } catch (error) {
      const reason =
        error instanceof Failure
          ? error.message
          : `the connection failed: ${String((error as Error)?.cause ?? error)}`
      if (now() + intervalMs > limit)
        return {
          ok: false,
          reason: `${host}: ${reason} (${attempts} attempts in ${Math.round(deadlineMs / 1000)} s)`,
        }
      await wait(intervalMs)
    }
  }
}

if (import.meta.main) {
  const [host, mark] = process.argv.slice(2)
  if (!host || !mark) {
    console.error('[live] Usage: node scripts/check-live.ts <host> <sha>')
    process.exit(1)
  }
  const say = (line: string) => console.log(`[live] ${line}`)
  const r = await stopwatch(say).step('Outside check', () =>
    checkLive({ host, mark }),
  )
  if (r.ok) for (const line of r.lines) say(line)
  else {
    console.error(`::error title=Site live::${r.reason}`)
    process.exit(1)
  }
}
