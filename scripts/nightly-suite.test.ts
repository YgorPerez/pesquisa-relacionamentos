import { describe, expect, it } from 'vite-plus/test'
import type { Gh } from './issue-by-title.ts'
import { failureSummary, nextAction, report } from './nightly-suite.ts'

describe('nextAction', () => {
  it('a red night opens the issue, or comments on the open one', () => {
    expect(nextAction(false, null)).toBe('open')
    expect(nextAction(false, 812)).toBe('comment')
  })

  it('a green night closes the open issue, and without one does nothing', () => {
    expect(nextAction(true, 812)).toBe('close')
    expect(nextAction(true, null)).toBe('nothing')
  })
})

const JOBS = {
  check: { result: 'success' },
  e2e: { result: 'failure' },
  stories: { result: 'cancelled' },
}

describe('failureSummary', () => {
  it('names the SHA, each job that did not pass, the run link and the end of the log', () => {
    const body = failureSummary({
      sha: 'abc1234',
      jobs: JOBS,
      url: 'https://github.com/x/y/actions/runs/1',
      log: 'line 1\n  1 failed\n    e2e/profile.e2e.ts:72:1 › the profile',
    })
    expect(body).toMatch(/on `main` at abc1234/)
    expect(body).toMatch(/- `e2e`: failure/)
    expect(body).toMatch(/- `stories`: cancelled/)
    expect(body).not.toMatch(/`check`/)
    expect(body).toMatch(/actions\/runs\/1/)
    expect(body).toMatch(/profile\.e2e\.ts:72:1/)
  })

  it('cuts a long log from the start, and keeps the end', () => {
    const body = failureSummary({
      sha: 'abc1234',
      jobs: JOBS,
      url: 'u',
      log: `${'x'.repeat(100_000)}\nTHE LAST`,
    })
    expect(body.length).toBeLessThan(65_536)
    expect(body).toMatch(/THE LAST/)
  })
})

/** A fake `gh`: records each call and answers the `issue list`. */
function fakeGh(open: { number: number; title: string }[]) {
  const calls: string[][] = []
  const gh: Gh = (args) => {
    calls.push(args)
    if (args[1] === 'list') return JSON.stringify(open)
    if (args[1] === 'create') return 'https://github.com/x/y/issues/90'
    return ''
  }
  return { gh, calls }
}

describe('report', () => {
  const red = { sha: 'abc1234', jobs: JOBS, url: 'u', log: '' }

  it('the first red night opens the issue with the bug label', () => {
    const { gh, calls } = fakeGh([])
    expect(report(gh, red)).toBe('open')
    expect(calls[1]).toEqual(
      expect.arrayContaining(['create', 'Suíte noturna vermelha', 'bug']),
    )
  })

  it('a green night closes the open one', () => {
    const { gh, calls } = fakeGh([
      { number: 7, title: 'Suíte noturna vermelha' },
    ])
    expect(report(gh, { ...red, jobs: { check: { result: 'success' } } })).toBe(
      'close',
    )
    expect(calls[1]?.slice(0, 3)).toEqual(['issue', 'close', '7'])
  })
})
