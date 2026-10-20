// Measures the five pages on mobile against the target (ADR 0033) and prints
// a table. Modeled on the Festival dos Macacos' `medir-paginas.ts`.
//
//   pnpm --filter frontend measure [--site https://temestudo.cloud] [--runs 5]
//     [--pages "home,Fact sheet"] [--guide <path>] [--fact-sheet <path>]
//     [--check]
//
// Without `--site`, measures this checkout's `pnpm start`
// (`scripts/ports.ts`). The default Guide and Fact sheet are the fixture's
// (`e2e/library`), which the e2e build serves; with the real library, pass
// `--fact-sheet` and measure without the Guide.
//
// Each page opens `--runs` times in a clean Chrome, with Lighthouse mobile's
// phone screen, network and CPU. Each opening yields the JS and CSS bytes as
// they arrived, the LCP, and the INP of a tap as soon as the page paints
// (`tap` in `./measure-pages-meta.ts`). The target reads the median.
//
// On localhost, a proxy in front of the server compresses like the VPS's
// Nginx (`nginx/temestudo.conf`): the app server does not compress, and
// without it the local measurement would weigh the raw JS.
//
// `--check` opens each page once, without throttling, and says whether the
// tap target shows up: a page whose markup changed would make the measurement
// wait and fail.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

import { readFileSync } from 'node:fs'
import { createServer, request, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { createGzip } from 'node:zlib'
import { type Browser, chromium } from '@playwright/test'
import { requestedPort } from '../../scripts/ports.ts'
import {
  FIXTURE_PATHS,
  compressesLikeNginx,
  type Run,
  type Gzip,
  nginxGzip,
  rowOf,
  type Row,
  type Page,
  pages,
  table,
} from './measure-pages-meta.ts'

/** Lighthouse mobile's network and CPU with devtools (`mobileSlow4G` in
 * `core/config/constants.js`): 150 ms RTT, which devtools applies as 562.5 ms
 * per request, 1.6 Mbps and a 4× slower CPU. The screen is the Moto G
 * Power's, the preset's. */
const NETWORK = {
  offline: false,
  latency: 562.5,
  downloadThroughput: (1474.56 * 1024) / 8,
  uploadThroughput: (675 * 1024) / 8,
}
const CPU = 4
const PHONE = {
  viewport: { width: 412, height: 823 },
  deviceScaleFactor: 1.75,
  isMobile: true,
  hasTouch: true,
}

const { values: options } = parseArgs({
  options: {
    site: { type: 'string' },
    runs: { type: 'string', default: '3' },
    pages: { type: 'string' },
    guide: { type: 'string', default: FIXTURE_PATHS.guide },
    'fact-sheet': { type: 'string', default: FIXTURE_PATHS.factSheet },
    check: { type: 'boolean', default: false },
  },
})
const SITE = (
  options.site ?? `http://localhost:${requestedPort('start')}`
).replace(/\/+$/, '')
const RUNS = Number(options.runs)

/** A proxy on `127.0.0.1` that forwards to `target` and compresses the
 * response as Nginx would. */
async function gzipProxy(target: string, gzip: Gzip): Promise<Server> {
  const upstream = new URL(target)
  const server = createServer((req, res) => {
    const forward = request(
      {
        host: upstream.hostname,
        port: upstream.port,
        method: req.method,
        path: req.url,
        headers: { ...req.headers, host: upstream.host },
      },
      (incoming) => {
        const headers = { ...incoming.headers }
        const accepts = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')
        const compress =
          accepts &&
          !headers['content-encoding'] &&
          compressesLikeNginx(headers['content-type'], gzip)
        if (!compress) {
          res.writeHead(incoming.statusCode ?? 502, headers)
          incoming.pipe(res)
          return
        }
        delete headers['content-length']
        headers['content-encoding'] = 'gzip'
        headers.vary = 'Accept-Encoding'
        res.writeHead(incoming.statusCode ?? 502, headers)
        incoming.pipe(createGzip({ level: gzip.level })).pipe(res)
      },
    )
    forward.on('error', () => res.destroy())
    req.pipe(forward)
  })
  await new Promise<void>((ready) => server.listen(0, '127.0.0.1', ready))
  return server
}

/** Watches LCP and INP from the first byte. INP is the longest duration of an
 * interaction: `first-input` always comes, and `event` only from 16 ms up. */
const OBSERVERS = `
  window.__lcp = 0
  window.__inp = 0
  window.__tapped = false
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lcp = e.startTime
  }).observe({ type: 'largest-contentful-paint', buffered: true })
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__inp = Math.max(window.__inp, e.duration)
      window.__tapped = true
    }
  }).observe({ type: 'first-input', buffered: true })
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      if (e.interactionId) window.__inp = Math.max(window.__inp, e.duration)
  }).observe({ type: 'event', durationThreshold: 16, buffered: true })
`

type MeasuredWindow = { __lcp: number; __inp: number; __tapped: boolean }

/** One opening of the page in a clean context, with slow network and CPU. */
async function open(browser: Browser, base: string, page: Page): Promise<Run> {
  const context = await browser.newContext(PHONE)
  await context.addInitScript(OBSERVERS)
  const tab = await context.newPage()
  const cdp = await context.newCDPSession(tab)
  const types = new Map<string, string>()
  const bytes = { Script: 0, Stylesheet: 0 }
  cdp.on('Network.responseReceived', (e) => types.set(e.requestId, e.type))
  cdp.on('Network.loadingFinished', (e) => {
    const type = types.get(e.requestId)
    if (type === 'Script' || type === 'Stylesheet')
      bytes[type] += e.encodedDataLength
  })
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', NETWORK)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU })

  await tab.goto(`${base}${page.path}`, {
    waitUntil: 'load',
    timeout: 120_000,
  })
  await tab.locator(page.tap).first().tap({ timeout: 60_000 })
  await tab.waitForFunction(
    () => (window as unknown as MeasuredWindow).__tapped,
    null,
    { timeout: 30_000 },
  )
  // The JS the page requests after the tap is also its own.
  await tab.waitForLoadState('networkidle', { timeout: 60_000 })
  const { lcp, inp } = await tab.evaluate(() => {
    const measured = window as unknown as MeasuredWindow
    return { lcp: measured.__lcp, inp: measured.__inp }
  })
  await context.close()
  return { js: bytes.Script, css: bytes.Stylesheet, lcp, inp }
}

/** `--check`: opens each page once and says whether the tap target showed
 * up. */
async function check(browser: Browser, base: string, list: Page[]) {
  for (const page of list) {
    const context = await browser.newContext(PHONE)
    const tab = await context.newPage()
    const response = await tab.goto(`${base}${page.path}`)
    const found = await tab
      .locator(page.tap)
      .first()
      .waitFor({ timeout: 15_000 })
      .then(
        () => true,
        () => false,
      )
    console.log(
      `[measure] ${found ? 'ok     ' : 'MISSING'} ${page.name} (${response?.status()}): ${page.tap}`,
    )
    await context.close()
  }
}

function pagesToMeasure(): Page[] {
  const all = pages({ guide: options.guide, factSheet: options['fact-sheet'] })
  if (!options.pages) return all
  const chosen = new Set(options.pages.split(',').map((p) => p.trim()))
  return all.filter((p) => chosen.has(p.name))
}

async function measure() {
  const local = ['localhost', '127.0.0.1'].includes(new URL(SITE).hostname)
  const proxy = local
    ? await gzipProxy(
        SITE,
        nginxGzip(
          readFileSync(
            join(import.meta.dirname, '../nginx/temestudo.conf'),
            'utf8',
          ),
        ),
      )
    : undefined
  const base = proxy
    ? `http://127.0.0.1:${(proxy.address() as AddressInfo).port}`
    : SITE
  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    const list = pagesToMeasure()
    if (options.check) return await check(browser, base, list)
    const rows: Row[] = []
    for (const page of list) {
      const runs: Run[] = []
      for (let i = 0; i < RUNS; i++) runs.push(await open(browser, base, page))
      const row = rowOf(page.name, runs)
      rows.push(row)
      console.log(
        `[measure] ${page.name}: ${runs
          .map(
            (e) =>
              `JS ${Math.round(e.js / 1024)} KB, CSS ${Math.round(e.css / 1024)} KB, LCP ${Math.round(e.lcp)} ms, INP ${Math.round(e.inp)} ms`,
          )
          .join(' · ')}`,
      )
    }
    console.log(
      `\n${SITE}${proxy ? " (with Nginx's gzip)" : ''}, median of ${RUNS} on mobile with Lighthouse's slow 4G.\n`,
    )
    console.log(table(rows))
    if (rows.some((l) => l.failures.length)) process.exitCode = 1
  } finally {
    await browser.close()
    proxy?.close()
  }
}

await measure()
