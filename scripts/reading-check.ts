import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { parseHTML } from 'linkedom'
import { parse } from 'yaml'
import { findOpenIssue, ghIn, openIssue } from './issue-by-title.ts'

// Run with Node 24+ after `pnpm install`:
//   node scripts/reading-check.ts --dry-run
// Review the page's claims before accepting its new baseline:
//   node scripts/reading-check.ts --dry-run --update-baseline --url <reading-url>
// Omit --url to bootstrap all Readings. Failed pages never replace a baseline.
// Commit data/reading-baseline.json after reviewing the diff. The scheduled job
// never updates it. --dry-run never writes state or calls GitHub.
// State is restored from the last successful workflow's artifact, not a cache
// (caches are immutable). Keep failures of the job visible if that restore fails.

export type Fingerprint = string[]

// Hashed word triples retain changes in phrasing without storing the article.
export function fingerprint(text: string): Fingerprint {
  const words =
    text
      .normalize('NFKC')
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  return [
    ...new Set(
      words.slice(0, -2).map((_, i) =>
        createHash('sha256')
          .update(words.slice(i, i + 3).join(' '))
          .digest('hex')
          .slice(0, 16),
      ),
    ),
  ].sort()
}

export function decide(
  baseline: Fingerprint | undefined,
  current: Fingerprint | null,
  failures: number,
) {
  if (current === null)
    return {
      failures: failures + 1,
      alert: failures + 1 >= 2,
      reason: 'Page fetch or text extraction failed',
    }
  if (!baseline)
    return { failures: 0, alert: true, reason: 'Missing reviewed baseline' }
  const before = new Set(baseline)
  const overlap = current.filter((word) => before.has(word)).length
  const similarity = overlap / Math.max(baseline.length, current.length, 1)
  return {
    failures: 0,
    alert: similarity < 0.7,
    reason: `Text similarity: ${(similarity * 100).toFixed(1)}% (alert below 70%)`,
  }
}

export function issueAction(alert: boolean, open: number | null) {
  return alert ? (open === null ? 'open' : 'update') : 'nothing'
}

export function extractText(html: string): string {
  const { document } = parseHTML(html)
  document
    .querySelectorAll(
      'script, style, nav, header, footer, aside, form, [hidden]',
    )
    .forEach((element) => element.remove())
  const root =
    document.querySelector('[itemprop="articleBody"], article, main') ??
    document.body
  const paragraphs = [...root.querySelectorAll('p')]
    .map((p) => p.textContent)
    .join(' ')
  const text = paragraphs.replace(/\s+/g, ' ').trim()
  if (text.length < 500)
    throw new Error(
      'Too little article text (possibly a bot challenge or JS-only page)',
    )
  return text
}

type Baseline = Record<string, { hashes: Fingerprint; checkedAt: string }>
type State = Record<string, number>
type Reading = { title: string; url: string }

async function main() {
  const { values } = parseArgs({
    options: {
      'dry-run': { type: 'boolean' },
      'update-baseline': { type: 'boolean' },
      url: { type: 'string' },
      state: { type: 'string', default: '.reading-check-state.json' },
    },
  })
  if (values['update-baseline'] && !values['dry-run'])
    throw new Error('Baseline updates require --dry-run')
  const baselinePath = 'data/reading-baseline.json'
  const baseline: Baseline = existsSync(baselinePath)
    ? JSON.parse(readFileSync(baselinePath, 'utf8'))
    : {}
  const state: State = existsSync(values.state)
    ? JSON.parse(readFileSync(values.state, 'utf8'))
    : {}
  const { readings } = parse(
    readFileSync('data/neighbor-sites.yaml', 'utf8'),
  ) as { readings: Reading[] }
  if (values.url && !readings.some((r) => r.url === values.url))
    throw new Error('URL is not a Reading')
  const gh = ghIn(process.cwd())
  let failures = 0
  for (const reading of readings.filter(
    (r) => !values.url || r.url === values.url,
  )) {
    let current: Fingerprint | null = null
    let error = ''
    try {
      const response = await fetch(reading.url, {
        signal: AbortSignal.timeout(30_000),
        headers: {
          'User-Agent':
            'TemEstudo-ReadingCheck/1.0 (+https://github.com/YgorPerez/pesquisa-relacionamentos/issues/207)',
        },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.headers.get('content-type')?.includes('text/html'))
        throw new Error('Expected HTML')
      current = fingerprint(extractText(await response.text()))
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause)
      failures++
    }
    const decision = decide(
      baseline[reading.url]?.hashes,
      current,
      state[reading.url] ?? 0,
    )
    state[reading.url] = decision.failures
    console.log(
      `${current ? 'OK' : 'FAIL'} ${reading.url}: ${error || decision.reason}`,
    )
    if (values['update-baseline'] && current)
      baseline[reading.url] = {
        hashes: current,
        checkedAt: new Date().toISOString(),
      }
    if (values['dry-run'] || !decision.alert) continue
    // The URL hash keeps identity stable across title edits. Never auto-close:
    // a curator must review changed claims even if the next fetch succeeds.
    const id = createHash('sha256')
      .update(reading.url)
      .digest('hex')
      .slice(0, 16)
    const title = `Reading check: ${id}`
    const open = findOpenIssue(gh, title)
    const body = [
      `Reading: ${reading.title}`,
      reading.url,
      '',
      decision.reason,
      error,
      `Consecutive failures: ${decision.failures}.`,
      '',
      `Last checked: ${new Date().toISOString()}.`,
      `Run: ${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY ?? 'YgorPerez/pesquisa-relacionamentos'}/actions/runs/${process.env.GITHUB_RUN_ID ?? ''}`,
      '',
      'Review the page and its cited studies before updating the baseline. See scripts/reading-check.ts for the command.',
    ]
      .filter(Boolean)
      .join('\n')
    const action = issueAction(decision.alert, open)
    if (action === 'open') openIssue(gh, title, body, ['needs-triage'])
    if (action === 'update')
      gh(['issue', 'edit', String(open), '--body-file', '-'], body)
  }
  if (values['update-baseline'])
    writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`)
  if (!values['dry-run'])
    writeFileSync(values.state, `${JSON.stringify(state, null, 2)}\n`)
  console.log(
    `Checked Readings; ${failures} fetch/extraction failures. ${values['dry-run'] ? 'Dry run: no issues or state written.' : ''}`,
  )
}

if (import.meta.main) await main()
