import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'vite-plus/test'
import {
  enter,
  playwrightRequest,
  type QueuedRun,
  turn,
  vitestRequest,
} from './machine-queue.ts'

const argv = (...args: string[]) => ['node', 'vitest.mjs', ...args]
const argvPw = (...args: string[]) => ['node', 'cli.js', ...args]

describe('vitestRequest', () => {
  it('the unfiltered suite is heavy', () => {
    assert.equal(vitestRequest(argv('run'), 12)?.heavy, true)
    assert.equal(
      vitestRequest(argv('run', '--coverage', '--maxWorkers', '3'), 12)?.heavy,
      true,
    )
  })

  it('a file, a folder or a test name is light', () => {
    assert.equal(vitestRequest(argv('run', 'src/a.test.ts'), 12)?.heavy, false)
    assert.equal(vitestRequest(argv('run', 'src/features'), 12)?.heavy, false)
    assert.equal(vitestRequest(argv('run', '-t', 'placar'), 12)?.heavy, false)
    assert.equal(
      vitestRequest(argv('run', '--project=telas'), 12)?.heavy,
      false,
    )
  })

  it('a flag value does not count as a filter', () => {
    assert.equal(
      vitestRequest(argv('run', '--reporter', 'dot', '--testTimeout', '9'), 12)
        ?.heavy,
      true,
    )
  })

  it('loose files ask for one worker each, and the rest for the cores minus one', () => {
    assert.equal(
      vitestRequest(argv('run', 'a.test.ts', 'b.test.tsx'), 12)?.max,
      2,
    )
    assert.equal(vitestRequest(argv('run', 'src/features'), 12)?.max, 11)
  })

  it('watch mode does not join the queue', () => {
    assert.equal(vitestRequest(argv('watch'), 12), undefined)
    assert.equal(vitestRequest(argv('run', '--watch'), 12), undefined)
  })
})

describe('playwrightRequest', () => {
  it('the whole run is heavy, and the filtered one is light', () => {
    assert.equal(playwrightRequest(argvPw('test'), 4)?.heavy, true)
    assert.equal(
      playwrightRequest(argvPw('test', 'e2e/recap.e2e.ts'), 4)?.heavy,
      false,
    )
    assert.equal(
      playwrightRequest(argvPw('test', '-g', 'recap'), 4)?.heavy,
      false,
    )
  })

  it('--workers beats the config, and the queue does not lower it', () => {
    for (const args of [['--workers=2'], ['--workers', '2'], ['-j', '2']])
      assert.deepEqual(
        playwrightRequest(argvPw('test', 'x.e2e.ts', ...args), 4),
        {
          name: `playwright test x.e2e.ts ${args.join(' ')}`,
          heavy: false,
          max: 2,
          fixed: true,
        },
      )
    const me = run({ state: 'waiting', max: 2, fixed: true })
    assert.deepEqual(turn(me, [run({ heavy: true, workers: 12 })], 12), {
      enters: true,
      workers: 2,
    })
  })

  it('counts the e2e workers, each with its own Chrome', () => {
    assert.equal(playwrightRequest(argvPw('test', 'x.e2e.ts'), 4)?.max, 4)
  })

  it('listing, opening the report or the UI does not join the queue', () => {
    assert.equal(playwrightRequest(argvPw('test', '--list'), 4), undefined)
    assert.equal(playwrightRequest(argvPw('test', '--ui'), 4), undefined)
    assert.equal(playwrightRequest(argvPw('show-report'), 4), undefined)
    assert.equal(
      playwrightRequest(argvPw('test', '--ui-port=8080'), 4),
      undefined,
    )
  })
})

function run(partial: Partial<QueuedRun>): QueuedRun {
  return {
    pid: 1,
    root: 'C:/r',
    name: 'x',
    heavy: false,
    max: 1,
    workers: 1,
    state: 'running',
    start: 0,
    ...partial,
  }
}

describe('turn', () => {
  it('a heavy run waits for the running heavy one, and says which', () => {
    const owner = run({ heavy: true, workers: 12, name: 'suite' })
    const me = run({ heavy: true, state: 'waiting', start: 5 })
    assert.deepEqual(turn(me, [owner], 12), { enters: false, owner })
  })

  it('among waiting heavy runs, the oldest gets in', () => {
    const earlier = run({ heavy: true, state: 'waiting', start: 1 })
    const me = run({ heavy: true, state: 'waiting', start: 5 })
    assert.deepEqual(turn(me, [earlier], 12), { enters: false, owner: earlier })
    assert.deepEqual(turn(earlier, [me], 12), { enters: true, workers: 1 })
  })

  it('a heavy run takes what it asks for, even with light ones running', () => {
    const light = run({ workers: 6 })
    const me = run({ heavy: true, state: 'waiting', max: 12 })
    assert.deepEqual(turn(me, [light], 12), { enters: true, workers: 12 })
  })

  it('a light run never waits, and takes its share of what is left', () => {
    const me = run({ state: 'waiting', max: 11 })
    assert.deepEqual(turn(me, [], 12), { enters: true, workers: 11 })
    assert.deepEqual(turn(me, [run({ workers: 2 })], 12), {
      enters: true,
      workers: 6,
    })
    assert.deepEqual(turn(me, [run({ workers: 9 })], 12), {
      enters: true,
      workers: 3,
    })
    assert.deepEqual(turn(me, [run({ heavy: true, workers: 12 })], 12), {
      enters: true,
      workers: 1,
    })
  })

  it('a light run does not ask for more than its max', () => {
    const me = run({ state: 'waiting', max: 1 })
    assert.deepEqual(turn(me, [], 12), { enters: true, workers: 1 })
  })
})

describe('enter', () => {
  const folder = () => mkdtempSync(join(tmpdir(), 'queue-test-'))
  const heavy = { name: 'suite', heavy: true, max: 12 }
  const options = (f: string) => ({ folder: f, cores: 12, intervalMs: 20 })

  it('the second heavy run waits for the first to leave, and says who is running', async () => {
    const f = folder()
    const notices: string[] = []
    const first = await enter(heavy, options(f))
    let entered = false
    const second = enter(
      { ...heavy, name: 'e2e' },
      { ...options(f), notify: (text) => notices.push(text) },
    ).then((slot) => {
      entered = true
      return slot
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
    assert.equal(entered, false)
    assert.match(notices[0] ?? '', /waiting.*suite/)
    first.leave()
    const slot = await second
    assert.equal(slot.workers, 12)
    slot.leave()
    assert.deepEqual(readdirSync(f), [])
  })

  it('a heavy run takes the turn of a run whose process died', async () => {
    const f = folder()
    const dead = spawnSync(process.execPath, ['-e', '']).pid
    const owner = run({ pid: dead, heavy: true, workers: 12 })
    writeFileSync(join(f, `${dead}-a.json`), JSON.stringify(owner))
    const slot = await enter(heavy, options(f))
    assert.equal(slot.workers, 12)
    slot.leave()
    assert.deepEqual(readdirSync(f), [])
  })

  it('and of one that stopped sending heartbeats, if the PID went to another process', async () => {
    const f = folder()
    const owner = run({ pid: process.pid, heavy: true, workers: 12 })
    const file = join(f, 'reused.json')
    writeFileSync(file, JSON.stringify(owner))
    const earlier = new Date(Date.now() - 10 * 60_000)
    utimesSync(file, earlier, earlier)
    const slot = await enter(heavy, options(f))
    assert.equal(slot.workers, 12)
    slot.leave()
  })

  it('a light run shares with the others running', async () => {
    const f = folder()
    const light = { name: 'one file', heavy: false, max: 11 }
    const first = await enter(light, options(f))
    const second = await enter(light, options(f))
    assert.deepEqual([first.workers, second.workers], [11, 1])
    first.leave()
    second.leave()
  })
})
