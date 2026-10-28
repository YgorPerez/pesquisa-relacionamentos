import { createHash } from 'node:crypto'
import {
  appendFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { parseHTML } from 'linkedom'
import { parse } from 'yaml'
import { findOpenIssue, ghIn, openIssue } from './issue-by-title.ts'
import type { Gh } from './issue-by-title.ts'

// Run with Node 24+ after `pnpm install`:
//   node scripts/reading-check.ts --dry-run
// Review the page's claims before accepting its new baseline:
//   node scripts/reading-check.ts --dry-run --update-baseline --url <reading-url>
// Omit --url to bootstrap all Readings. Failed pages never replace a baseline.
// Commit data/reading-baseline.json after reviewing the diff. The scheduled job
// never updates it. --dry-run never writes state or calls GitHub.
// State comes from the latest completed run, even if issue publication failed.
// Missing/expired artifacts restart counters with a job-summary warning.
// Only DNS/network errors, timeouts, HTTP 404/410 and 5xx count toward two
// consecutive failures. Access restrictions (401/403/429, Cloudflare,
// Incapsula, CAPTCHA), other unexpected responses and unreadable/JS-only pages
// are BLOCKED: reset the streak, report in the summary, never open an issue.
// Observations are saved before any issue operation; upload runs even on error.

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
  if (!baseline)
    return { failures: 0, alert: false, reason: 'Missing reviewed baseline' }
  if (current === null)
    return {
      failures: failures + 1,
      alert: failures + 1 >= 2,
      reason: 'Page fetch or text extraction failed',
    }
  const before = new Set(baseline)
  const overlap = current.filter((word) => before.has(word)).length
  const similarity = overlap / Math.max(baseline.length, current.length, 1)
  return {
    failures: 0,
    alert: similarity < 0.7,
    reason: `Text similarity: ${(similarity * 100).toFixed(1)}% (alert below 70%)`,
  }
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

export function restoreReadingState(
  gh: Gh,
  statePath: string,
  report: (message: string) => void,
) {
  writeFileSync(statePath, '{}\n')
  try {
    const runs = JSON.parse(
      gh([
        'run',
        'list',
        '--workflow',
        'reading-check.yml',
        ...(process.env.GITHUB_REF_NAME
          ? ['--branch', process.env.GITHUB_REF_NAME]
          : []),
        '--status',
        'completed',
        '--limit',
        '20',
        '--json',
        'databaseId',
      ]),
    ) as { databaseId: number }[]
    for (const run of runs) {
      const dir = mkdtempSync(join(tmpdir(), 'reading-state-'))
      try {
        gh([
          'run',
          'download',
          String(run.databaseId),
          '--name',
          'reading-check-state',
          '--dir',
          dir,
        ])
        const state = JSON.parse(
          readFileSync(join(dir, 'reading-state.json'), 'utf8'),
        ) as State
        if (
          !state ||
          Array.isArray(state) ||
          typeof state !== 'object' ||
          Object.values(state).some(
            (count) => !Number.isInteger(count) || count < 0,
          )
        )
          throw new Error('Invalid observation state')
        writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`)
        report(`Restored observations from run ${run.databaseId}.`)
        return
      } catch (error) {
        report(
          `Warning: state artifact unavailable for run ${run.databaseId}: ${String(error)}`,
        )
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    }
  } catch (error) {
    report(`Warning: could not restore observations: ${String(error)}`)
  }
  report(
    'Warning: no usable observation artifact; starting counters at zero. Readings will still be checked.',
  )
}

function report(message: string) {
  console.log(message)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${message}\n\n`)
}

async function main() {
  const { values } = parseArgs({
    options: {
      'dry-run': { type: 'boolean' },
      'update-baseline': { type: 'boolean' },
      'restore-state': { type: 'boolean' },
      url: { type: 'string' },
      state: { type: 'string', default: '.reading-check-state.json' },
    },
  })
  if (values['restore-state']) {
    restoreReadingState(ghIn(process.cwd()), values.state, report)
    return
  }
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
  await checkReadings({
    readings: readings.filter((r) => !values.url || r.url === values.url),
    baseline,
    state,
    gh,
    fetchPage: fetch,
    dryRun: values['dry-run'],
    updateBaseline: values['update-baseline'],
    saveState: () =>
      writeFileSync(values.state, `${JSON.stringify(state, null, 2)}\n`),
    report,
  })
  if (values['update-baseline'])
    writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`)
}

export async function checkReadings({
  readings,
  baseline,
  state,
  gh,
  fetchPage,
  saveState,
  report,
  dryRun,
  updateBaseline,
}: {
  readings: Reading[]
  baseline: Baseline
  state: State
  gh: Gh
  fetchPage: typeof fetch
  saveState: () => void
  report: (message: string) => void
  dryRun?: boolean
  updateBaseline?: boolean
}) {
  let failures = 0
  const publications: (() => void)[] = []
  for (const reading of readings) {
    let current: Fingerprint | null = null
    let error = ''
    let blocked = false
    try {
      const response = await fetchPage(reading.url, {
        signal: AbortSignal.timeout(30_000),
        headers: {
          'User-Agent':
            'TemEstudo-ReadingCheck/1.0 (+https://github.com/YgorPerez/pesquisa-relacionamentos/issues/207)',
        },
      })
      blocked =
        !response.ok &&
        response.status !== 404 &&
        response.status !== 410 &&
        response.status < 500
      const html = await response.text()
      if (
        /cdn-cgi\/challenge-platform|cf-chl-|incapsula incident|_Incapsula_Resource|captcha|verify (?:that )?you are human|checking your browser|<title[^>]*>\s*Just a moment/i.test(
          html,
        )
      ) {
        blocked = true
        throw new Error('Access challenge')
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      blocked = true
      if (!response.headers.get('content-type')?.includes('text/html'))
        throw new Error('Expected HTML')
      current = fingerprint(extractText(html))
      blocked = false
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause)
      if (!blocked) failures++
    }
    const decision = blocked
      ? { failures: 0, alert: false, reason: error }
      : decide(baseline[reading.url]?.hashes, current, state[reading.url] ?? 0)
    state[reading.url] = decision.failures
    report(
      `${blocked ? 'BLOCKED' : current ? 'OK' : 'FAIL'} ${reading.url}: ${error || decision.reason}`,
    )
    if (!baseline[reading.url])
      report(
        `Missing reviewed baseline for ${reading.title} (${reading.url}). Review the page, then run: node scripts/reading-check.ts --dry-run --update-baseline --url ${reading.url}`,
      )
    if (updateBaseline && current)
      baseline[reading.url] = {
        hashes: current,
        checkedAt: new Date().toISOString(),
      }
    if (dryRun || !decision.alert) continue
    // The URL hash keeps identity stable across title edits. Never auto-close:
    // a curator must review changed claims even if the next fetch succeeds.
    const id = createHash('sha256')
      .update(reading.url)
      .digest('hex')
      .slice(0, 16)
    const title = `Reading check: ${id}`
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
    publications.push(() => {
      const open = findOpenIssue(gh, title)
      if (open === null) openIssue(gh, title, body, ['needs-triage'])
      else gh(['issue', 'edit', String(open), '--body-file', '-'], body)
    })
  }
  if (!dryRun) saveState()
  report(
    `Checked Readings; ${failures} fetch/extraction failures. ${dryRun ? 'Dry run: no issues or state written.' : ''}`,
  )
  const errors: unknown[] = []
  for (const publish of publications) {
    try {
      publish()
    } catch (error) {
      errors.push(error)
    }
  }
  if (errors.length)
    throw new AggregateError(errors, 'Reading issue publication failed')
}

if (import.meta.main) await main()
