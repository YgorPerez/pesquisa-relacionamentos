import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse } from 'yaml'
import { expect, test } from 'vite-plus/test'
import type { Gh } from './issue-by-title.ts'
import {
  decide,
  extractText,
  fingerprint,
  checkReadings,
  restoreReadingState,
} from './reading-check.ts'

test('ignores small additions but reports a rewritten Reading', () => {
  const baseline = fingerprint(
    'one two three four five six seven eight nine ten',
  )
  expect(
    decide(
      baseline,
      fingerprint('one two three four five six seven eight nine ten eleven'),
      0,
    ).alert,
  ).toBe(false)
  expect(
    decide(
      baseline,
      fingerprint('a completely different article with new claims'),
      0,
    ).alert,
  ).toBe(true)
})

test('requires consecutive failures and resets the count after recovery', () => {
  const baseline = fingerprint('a reviewed reading about relationships')
  const first = decide(baseline, null, 0)
  expect(first).toMatchObject({ failures: 1, alert: false })
  expect(decide(baseline, null, first.failures)).toMatchObject({
    failures: 2,
    alert: true,
  })
  expect(decide(baseline, baseline, first.failures)).toMatchObject({
    failures: 0,
    alert: false,
  })
})

const reading = { title: 'Reading', url: 'https://example.com/article' }
const article = 'A paragraph explaining a relationship study. '.repeat(20)
const hashes = fingerprint(article)

test.each([404, 410, 500, 'DNS', 'Timeout'])(
  'counts real failures (%s) only after two consecutive observations',
  async (failure) => {
    const state = {}
    const publications: string[] = []
    const options = {
      readings: [reading],
      baseline: { [reading.url]: { hashes, checkedAt: '' } },
      state,
      fetchPage: async () => {
        if (typeof failure === 'string') throw new Error(failure)
        return new Response('', { status: failure })
      },
      gh: (args: string[]) => {
        if (args[1] === 'list') return '[]'
        publications.push(args[1]!)
        return 'https://github.com/example/repo/issues/123'
      },
      saveState: () => {},
      report: () => {},
    }
    await checkReadings(options)
    expect(publications).toEqual([])
    await checkReadings(options)
    expect(publications).toEqual(['create'])
  },
)

test('restarts counters and warns when the prior artifact has expired', () => {
  const dir = mkdtempSync(join(tmpdir(), 'reading-restore-'))
  try {
    const statePath = join(dir, 'reading-state.json')
    const messages: string[] = []
    restoreReadingState(
      (args) => {
        if (args[1] === 'list') return '[{"databaseId":123}]'
        throw new Error('artifact expired')
      },
      statePath,
      (message) => {
        messages.push(message)
      },
    )
    expect(JSON.parse(readFileSync(statePath, 'utf8'))).toEqual({})
    expect(messages.join('\n')).toContain('starting counters at zero')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('restores observations from the latest completed run even when publication failed', () => {
  const dir = mkdtempSync(join(tmpdir(), 'reading-restore-'))
  const commands: string[][] = []
  try {
    const statePath = join(dir, 'reading-state.json')
    restoreReadingState(
      (args) => {
        commands.push(args)
        if (args[1] === 'list') {
          return '[{"databaseId":456}]'
        }
        writeFileSync(
          join(args[args.indexOf('--dir') + 1]!, 'reading-state.json'),
          JSON.stringify({ [reading.url]: 0 }),
        )
        return ''
      },
      statePath,
      () => {},
    )
    expect(JSON.parse(readFileSync(statePath, 'utf8'))).toEqual({
      [reading.url]: 0,
    })
    expect(commands[0]![commands[0]!.indexOf('--status') + 1]).toBe('completed')
    expect(commands[1]!.slice(0, 3)).toEqual(['run', 'download', '456'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('every Reading has a reviewed baseline', () => {
  const { readings } = parse(
    readFileSync('data/neighbor-sites.yaml', 'utf8'),
  ) as { readings: { url: string }[] }
  const baseline = JSON.parse(
    readFileSync('data/reading-baseline.json', 'utf8'),
  ) as Record<string, { hashes: string[] }>
  for (const { url } of readings) {
    expect(
      baseline[url]?.hashes.length,
      `Missing reviewed baseline for ${url}. Review the page, then run: node scripts/reading-check.ts --dry-run --update-baseline --url ${url}`,
    ).toBeGreaterThan(0)
  }
})

test('reports a missing baseline with its Reading and setup command without publishing', async () => {
  const messages: string[] = []
  const publications: string[][] = []
  await checkReadings({
    readings: [reading],
    baseline: {},
    state: {},
    fetchPage: async () => new Response('', { status: 404 }),
    gh: (args) => {
      publications.push(args)
      return '[]'
    },
    saveState: () => {},
    report: (message) => {
      messages.push(message)
    },
  })
  expect(publications).toEqual([])
  expect(messages.join('\n')).toContain(
    `node scripts/reading-check.ts --dry-run --update-baseline --url ${reading.url}`,
  )
  expect(messages.join('\n')).toContain(reading.title)
})

test.each([
  [401, 'Unauthorized'],
  [403, 'Forbidden'],
  [429, 'Rate limit'],
  [
    200,
    '<title>Just a moment...</title><script src="/cdn-cgi/challenge-platform/x"></script>',
  ],
  [200, '<title>Access denied</title> Incapsula incident ID'],
  [
    503,
    '<title>Just a moment...</title><script src="/cdn-cgi/challenge-platform/x"></script>',
  ],
  [200, '<p>Please complete the CAPTCHA to verify you are human</p>'],
])(
  'reports blocked access (%s) without publishing an issue',
  async (status, html) => {
    const messages: string[] = []
    const state = { [reading.url]: 1 }
    const publications: string[][] = []
    await checkReadings({
      readings: [reading],
      baseline: { [reading.url]: { hashes, checkedAt: '' } },
      state,
      fetchPage: async () =>
        new Response(html, {
          status,
          headers: { 'content-type': 'text/html' },
        }),
      gh: (args) => {
        publications.push(args)
        return '[]'
      },
      saveState: () => {},
      report: (message) => {
        messages.push(message)
      },
    })
    expect(publications).toEqual([])
    expect(state[reading.url]).toBe(0)
    expect(messages.join('\n')).toContain(`BLOCKED ${reading.url}`)
  },
)

test('persists all observations before a failed issue operation, including a later recovery', async () => {
  const recovered = { title: 'Recovered', url: 'https://example.com/recovered' }
  const state = { [reading.url]: 1, [recovered.url]: 1 }
  let saved = {}
  await expect(
    checkReadings({
      readings: [reading, recovered],
      baseline: Object.fromEntries(
        [reading, recovered].map((r) => [r.url, { hashes, checkedAt: '' }]),
      ),
      state,
      saveState: () => {
        saved = { ...state }
      },
      report: () => {},
      fetchPage: async (url) =>
        url === reading.url
          ? new Response('', { status: 404 })
          : new Response(`<main><p>${article}</p></main>`, {
              headers: { 'content-type': 'text/html' },
            }),
      gh: () => {
        throw new Error('GitHub unavailable')
      },
    }),
  ).rejects.toThrow('Reading issue publication failed')
  expect(saved).toEqual({ [reading.url]: 2, [recovered.url]: 0 })
})

test('creates an issue, updates it on recurrence, and leaves recovery alone', async () => {
  let issue: { number: number; title: string } | undefined
  const publications: string[] = []
  const gh: Gh = (args) => {
    if (args[1] === 'list') return JSON.stringify(issue ? [issue] : [])
    publications.push(args[1]!)
    if (args[1] === 'create') {
      issue = { number: 123, title: args[args.indexOf('--title') + 1]! }
      return 'https://github.com/example/repo/issues/123'
    }
    expect(args.slice(0, 3)).toEqual(['issue', 'edit', '123'])
    return ''
  }
  const state = { [reading.url]: 1 }
  const options = {
    readings: [reading],
    baseline: { [reading.url]: { hashes, checkedAt: '' } },
    state,
    gh,
    saveState: () => {},
    report: () => {},
    fetchPage: async () => new Response('', { status: 404 }),
  }
  await checkReadings(options)
  await checkReadings(options)
  await checkReadings({
    ...options,
    fetchPage: async () =>
      new Response(`<main><p>${article}</p></main>`, {
        headers: { 'content-type': 'text/html' },
      }),
  })
  expect(publications).toEqual(['create', 'edit'])
  expect(state[reading.url]).toBe(0)
})

test('ignores punctuation, capitalization and whitespace changes', () => {
  expect(
    decide(
      fingerprint('The same words, with punctuation!'),
      fingerprint('THE same   words with punctuation'),
      0,
    ).alert,
  ).toBe(false)
})

test('does not alert when a Reading has no reviewed baseline', () => {
  expect(
    decide(
      undefined,
      fingerprint('A new reading without a reviewed baseline'),
      0,
    ).alert,
  ).toBe(false)
  expect(decide(undefined, null, 5).alert).toBe(false)
})

test('extracts article paragraphs without navigation, adverts or scripts', () => {
  const text = 'A paragraph explaining a relationship study. '.repeat(20).trim()
  const html = `<html><body><nav><p>Menu</p></nav><main><article><p>${text}</p><aside><p>Advert</p></aside><script>tracking()</script></article></main><footer><p>Legal</p></footer></body></html>`
  expect(extractText(html)).toBe(text)
  expect(() =>
    extractText('<html><body><p>Verify you are human</p></body></html>'),
  ).toThrow('Too little article text')
})
