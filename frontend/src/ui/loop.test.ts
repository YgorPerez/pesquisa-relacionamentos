import { describe, expect, it } from 'vite-plus/test'
import { loopPath } from './loop'

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

describe('loopPath', () => {
  it('stretches the loop to the Fact sheet real size, without deforming the stroke', () => {
    const base = numbers(loopPath(100, 100))
    const wide = numbers(loopPath(400, 120))
    expect(wide).toHaveLength(base.length)
    wide.forEach((n, i) => {
      const scale = i % 2 === 0 ? 4 : 1.2
      expect(n).toBeCloseTo((base[i] ?? 0) * scale, 1)
    })
  })

  it('ends near where it started, with the overlapping stroke', () => {
    const ns = numbers(loopPath(300, 90))
    const [x0 = 0, y0 = 0] = ns
    const [xf = 0, yf = 0] = ns.slice(-2)
    expect(Math.abs(x0 - xf)).toBeLessThan(30)
    expect(Math.abs(y0 - yf)).toBeLessThan(10)
  })
})
