// Which file a step's log says failed, the retry of each one, and the report
// on the "Testes intermitentes" issue. The logs are the ones Festival dos
// Macacos recorded, where these tests came from.

import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'vite-plus/test'
import {
  type Failure,
  failuresFromLog,
  flakyComment,
  MAX_RETRIES,
  reportOnIssue,
  retryFailures,
} from './flaky.ts'
import type { Gh } from './issue-by-title.ts'

const FRONT = '/repo/frontend'

/** The log of a failed step, in a temporary file. */
function stepLog(lines: string[]) {
  const file = join(mkdtempSync(join(tmpdir(), 'flaky-')), 'p.log')
  writeFileSync(file, lines.join('\n'))
  return file
}

/** The log of a Vitest run in which `files` failed. */
const redVitest = (files: string[]) =>
  stepLog([
    ` RUN  v5.0.4 ${FRONT}`,
    ...files.map((file) => ` FAIL  ${file} > a test`),
    ` Test Files  ${files.length} failed | 10 passed (${files.length + 10})`,
  ])

/** A fake retry: records each file and passes, except those in `red`. */
function retries(red: string[] = []) {
  const runs: { failure: Failure; attempt: number }[] = []
  const rerun = async (failure: Failure, attempt: number) => {
    runs.push({ failure, attempt })
    return {
      log: `/logs/retry-${attempt}.log`,
      passed: !red.includes(failure.file),
    }
  }
  return { runs, rerun }
}

describe('retryFailures', () => {
  it('runs each failed file once, alone, and with all green the step passes with the flaky tests', async () => {
    const log = redVitest(['src/a.test.ts', 'src/b.test.ts'])
    const { runs, rerun } = retries()

    const final = await retryFailures({
      step: 'front:tests',
      result: { name: 'front:tests', log, passed: false },
      tool: 'vitest',
      load: [41, 40, 39],
      rerun,
    })

    assert.deepEqual(
      runs.map(({ failure, attempt }) => [failure.file, failure.dir, attempt]),
      [
        ['src/a.test.ts', FRONT, 1],
        ['src/b.test.ts', FRONT, 2],
      ],
    )
    assert.equal(final.passed, true)
    assert.equal(final.log, log)
    assert.deepEqual(final.flaky, [
      {
        step: 'front:tests',
        file: 'src/a.test.ts',
        load: [41, 40, 39],
        log: '/logs/retry-1.log',
      },
      {
        step: 'front:tests',
        file: 'src/b.test.ts',
        load: [41, 40, 39],
        log: '/logs/retry-2.log',
      },
    ])
  })

  it('a file that fails again leaves the step red and stops the retry', async () => {
    const { runs, rerun } = retries(['src/a.test.ts'])

    const final = await retryFailures({
      step: 'back:tests',
      result: {
        log: redVitest(['src/a.test.ts', 'src/b.test.ts']),
        passed: false,
      },
      tool: 'vitest',
      load: [1, 1, 1],
      rerun,
    })

    assert.equal(final.passed, false)
    assert.equal(final.flaky, undefined)
    assert.deepEqual(
      runs.map(({ failure }) => failure.file),
      ['src/a.test.ts'],
    )
  })

  it('does not retry what the log does not pin to a file, and says why', async () => {
    const { runs, rerun } = retries()
    const said: string[] = []

    const final = await retryFailures({
      step: 'e2e',
      result: {
        log: stepLog([
          'Error: Timed out waiting 180000ms from config.webServer.',
        ]),
        passed: false,
      },
      tool: 'playwright',
      load: [1, 1, 1],
      rerun,
      say: (text) => said.push(text),
    })

    assert.equal(final.passed, false)
    assert.deepEqual(runs, [])
    assert.match(
      said.join('\n'),
      /e2e without retry: the log does not say which file/,
    )
  })

  it('a green step comes back as it was, without reading the log', async () => {
    const { runs, rerun } = retries()
    const green = { log: '/does/not/exist.log', passed: true }

    const final = await retryFailures({
      step: 'front:tests',
      result: green,
      tool: 'vitest',
      load: [1, 1, 1],
      rerun,
    })

    assert.equal(final, green)
    assert.deepEqual(runs, [])
  })
})

/** A fake `gh`: records each call and answers the `issue list`. */
function fakeGh(open: { number: number; title: string }[]) {
  const calls: { args: string[]; input?: string }[] = []
  const gh: Gh = (args, input) => {
    calls.push({ args, input })
    if (args[1] === 'list') return JSON.stringify(open)
    if (args[1] === 'create') return 'https://github.com/owner/repo/issues/77'
    return ''
  }
  return { gh, calls }
}

const ONE = [
  {
    step: 'front:tests',
    file: 'src/a.test.ts',
    load: [1, 2, 3],
    log: '/logs/retry-1.log',
  },
]

describe('reportOnIssue', () => {
  it('comments on the open issue with the exact title, without opening another', () => {
    const { gh, calls } = fakeGh([
      { number: 5, title: 'Testes intermitentes no e2e' },
      { number: 9, title: 'Testes intermitentes' },
    ])

    assert.deepEqual(reportOnIssue(gh, 'abc1234def', ONE), { issue: 9 })
    assert.deepEqual(
      calls.map(({ args }) => args.slice(0, 3).join(' ')),
      ['issue list --state', 'issue comment 9'],
    )
    assert.match(calls[1]?.input ?? '', /src\/a\.test\.ts/)
  })

  it('without an open issue, opens one and comments on it', () => {
    const { gh, calls } = fakeGh([])

    assert.deepEqual(reportOnIssue(gh, 'abc1234def', ONE), { issue: 77 })
    assert.deepEqual(
      calls.map(({ args }) => args.slice(0, 2).join(' ')),
      ['issue list', 'issue create', 'issue comment'],
    )
  })

  it('a failing gh becomes the error, without throwing', () => {
    const gh: Gh = () => {
      throw new Error('gh issue list: no network')
    }

    assert.deepEqual(reportOnIssue(gh, 'abc1234def', ONE), {
      error: 'gh issue list: no network',
    })
  })
})

describe('failuresFromLog, for Vitest', () => {
  it("finds the failed file, the project and the RUN's folder, once per file", () => {
    const log = [
      ` RUN  v5.0.4 ${FRONT}`,
      '',
      ' FAIL  |telas| src/routes/c/$slug/telao.test.tsx > na concluída, a pílula diz que é o placar final',
      ' FAIL  |telas| src/routes/c/$slug/telao.test.tsx > com a TV ligada, o Publicar leva o telão à cerimônia',
      '',
      ' Test Files  1 failed | 383 passed (384)',
      '      Tests  2 failed | 2000 passed (2002)',
    ].join('\n')

    assert.deepEqual(failuresFromLog(log, 'vitest'), {
      failures: [
        {
          dir: FRONT,
          file: 'src/routes/c/$slug/telao.test.tsx',
          project: 'telas',
        },
      ],
    })
  })

  it('in the backend, each file takes the folder of the package it ran in', () => {
    const log = [
      ' RUN  v5.0.4 /repo/packages/rules',
      ' Test Files  19 passed (19)',
      ' RUN  v5.0.4 /repo/backend',
      ' FAIL  src/temporadas/eu.test.ts > a Temporada Eu responde a tempo',
      ' FAIL  src/boulders/rotas.test.ts [ src/boulders/rotas.test.ts ]',
      ' Test Files  2 failed | 120 passed (122)',
    ].join('\n')

    assert.deepEqual(failuresFromLog(log, 'vitest'), {
      failures: [
        { dir: '/repo/backend', file: 'src/temporadas/eu.test.ts' },
        { dir: '/repo/backend', file: 'src/boulders/rotas.test.ts' },
      ],
    })
  })

  it('does not retry what is not just a failed file', () => {
    const cases: [string, string[], RegExp][] = [
      [
        'error outside a test',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > one',
          '⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯',
          ' Test Files  1 failed | 3 passed (4)',
          '     Errors  1 error',
        ],
        /outside a test/,
      ],
      [
        'coverage',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > one',
          ' Test Files  1 failed | 3 passed (4)',
          'ERROR: Coverage for lines (80%) does not meet global threshold (90%)',
        ],
        /coverage/,
      ],
      [
        'the summary counts more files',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > one',
          ' Test Files  2 failed | 3 passed (5)',
        ],
        /summary/,
      ],
      [
        'no file',
        [` RUN  v5.0.4 ${FRONT}`, ' Test Files  3 passed (3)', 'ELIFECYCLE'],
        /does not say which file/,
      ],
      [
        'a Vitest that ended without the summary',
        [
          ' RUN  v5.0.4 /repo/packages/rules',
          ' FAIL  src/a.test.ts > one',
          ' Test Files  1 failed | 3 passed (4)',
          ' RUN  v5.0.4 /repo/backend',
          'Error: failed to load the config',
        ],
        /without the summary/,
      ],
      [
        'the time limit',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > one',
          '[suite] front:tests ran past 30 min without finishing: stopped its tree.',
        ],
        /time limit/,
      ],
      [
        'too many files',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ...Array.from(
            { length: MAX_RETRIES + 1 },
            (_, i) => ` FAIL  src/t${i}.test.ts > one`,
          ),
          ` Test Files  ${MAX_RETRIES + 1} failed | 3 passed (9)`,
        ],
        /more than/,
      ],
    ]
    for (const [name, lines, reason] of cases) {
      const parsed = failuresFromLog(lines.join('\n'), 'vitest')
      assert.ok('reason' in parsed, name)
      assert.match(parsed.reason, reason, name)
    }
  })

  it('reads the log with terminal colors', () => {
    const log = `\u001b[1m RUN \u001b[22m v5.0.4 ${FRONT}\n\u001b[31m FAIL \u001b[39m src/a.test.ts > one\n Test Files  \u001b[31m1 failed\u001b[39m | 3 passed (4)`

    assert.deepEqual(failuresFromLog(log, 'vitest'), {
      failures: [{ dir: FRONT, file: 'src/a.test.ts' }],
    })
  })
})

describe('failuresFromLog, for Playwright', () => {
  it('finds the specs from the list summary and the e2e summary, once each', () => {
    const log = [
      '  ✘  12 e2e/fila.e2e.ts:72:1 › o flash marcado na parede (5.0s)',
      '  ✘  13 e2e/fila.e2e.ts:72:1 › o flash marcado na parede (retry #1) (5.0s)',
      '  2 failed',
      '    e2e/fila.e2e.ts:72:1 › o flash marcado na parede',
      '    [chromium] › e2e/sessao.e2e.ts:4:1 › a organizadora entra',
      '  1 flaky',
      '    e2e/rolagem.e2e.ts:50:3 › na parede › a pílula',
      '  40 passed (2.1m)',
      '[e2e] failed: 40 passaram, 2 falharam, 1 instáveis, 0 pulados, em 2.1 min',
      '[e2e] falhou: e2e/fila.e2e.ts:72 › o flash marcado na parede',
    ].join('\n')

    assert.deepEqual(failuresFromLog(log, 'playwright'), {
      failures: [
        { dir: null, file: 'e2e/fila.e2e.ts' },
        { dir: null, file: 'e2e/sessao.e2e.ts' },
      ],
    })
  })

  it('does not retry an error outside a test, nor a server that did not start', () => {
    const outside = failuresFromLog(
      [
        '  1 failed',
        '    e2e/fila.e2e.ts:72:1 › o flash',
        '  1 error was not a part of any test, see above for details',
      ].join('\n'),
      'playwright',
    )
    assert.ok('reason' in outside)
    assert.match(outside.reason, /outside a test/)

    const server = failuresFromLog(
      'Error: Timed out waiting 180000ms from config.webServer.',
      'playwright',
    )
    assert.ok('reason' in server)
    assert.match(server.reason, /does not say which file/)
  })
})

describe('flakyComment', () => {
  it('names the test, the step, the commit and the load average', () => {
    const text = flakyComment('457900cdc1c5c64df0648b61781d81cd0fdcecc8', [
      {
        step: 'front:tests',
        file: 'src/routes/c/$slug/telao.test.tsx',
        load: [42.5, 40.12, 38],
        log: '/tmp/x/front-tests-retry-1.log',
      },
    ])

    assert.match(text, /457900c/)
    assert.match(text, /`src\/routes\/c\/\$slug\/telao\.test\.tsx`/)
    assert.match(text, /front:tests/)
    assert.match(text, /42\.50, 40\.12, 38\.00/)
  })
})
