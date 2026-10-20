import { describe, expect, it } from 'vite-plus/test'
import { stopwatch, duration } from './stopwatch.ts'

/** A clock that only moves when the test says so. */
function clock() {
  let now = 0
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms
    },
  }
}

describe('duration', () => {
  it('says seconds with one decimal under a minute', () => {
    expect(duration(0)).toBe('0.0 s')
    expect(duration(12_340)).toBe('12.3 s')
    expect(duration(59_940)).toBe('59.9 s')
  })

  it('says minutes and seconds from a minute up', () => {
    expect(duration(59_960)).toBe('1 min 0 s')
    expect(duration(82_400)).toBe('1 min 22 s')
    expect(duration(3_725_000)).toBe('62 min 5 s')
  })
})

describe('stopwatch', () => {
  it('says how long each step took and the total', () => {
    const c = clock()
    const lines: string[] = []
    const s = stopwatch((l) => lines.push(l), c.now)

    const value = s.step('Upload', () => {
      c.advance(1_500)
      return 7
    })
    c.advance(500)
    s.step('Swap', () => c.advance(42_000))
    s.total()

    expect(value).toBe(7)
    expect(lines).toEqual([
      'Upload took 1.5 s.',
      'Swap took 42.0 s.',
      'Total: 44.0 s.',
    ])
  })

  it('a step that fails says no time, and the error goes on', () => {
    const lines: string[] = []
    const s = stopwatch((l) => lines.push(l), clock().now)

    expect(() =>
      s.step('Swap', () => {
        throw new Error('nginx -t refused')
      }),
    ).toThrow('nginx -t refused')
    expect(lines).toEqual([])
  })

  it("waits for the step's promise before saying the time", async () => {
    const c = clock()
    const lines: string[] = []
    const s = stopwatch((l) => lines.push(l), c.now)

    const value = await s.step('Check', async () => {
      await Promise.resolve()
      c.advance(3_000)
      return 'ok'
    })

    expect(value).toBe('ok')
    expect(lines).toEqual(['Check took 3.0 s.'])
  })
})
