import { describe, expect, it } from 'vite-plus/test'
import { badges, lineCoverage } from './badges.ts'

/** A `coverage-final.json` file: one statement per given line, with how many
 * times it ran. */
const file = (...lines: [number, number][]) => ({
  statementMap: Object.fromEntries(
    lines.map(([line], i) => [String(i), { start: { line } }]),
  ),
  s: Object.fromEntries(lines.map(([, times], i) => [String(i), times])),
})

describe('lineCoverage', () => {
  it('counts a line as covered if any of its statements ran, and rounds down', () => {
    const coverage = lineCoverage([
      {
        folder: '/repo/frontend',
        files: {
          '/repo/frontend/src/ui/a.tsx': file([1, 1], [1, 0], [2, 0]),
          '/repo/frontend/src/ui/a.test.tsx': file([1, 0]),
        },
      },
      {
        folder: '/repo/packages/rules',
        files: { '/repo/packages/rules/src/b.ts': file([5, 3]) },
      },
    ])
    // 2 of 3 lines: 66.6% comes out as 66.
    expect(coverage).toBe(66)
  })
})

describe('badges', () => {
  it('draws the fallow grade, the doctor score and the coverage', () => {
    const { fallow, reactDoctor, coverage, summary } = badges({
      health: { health_score: { score: 92.4, grade: 'A' } },
      doctor: { summary: { score: 100, scoreLabel: 'Great' } },
      coverage: 41,
    })
    expect(fallow).toContain('aria-label="fallow health: A (92)"')
    expect(fallow).toContain('#4c1')
    expect(reactDoctor).toContain('react doctor: 100 · Great')
    expect(coverage).toContain('coverage: 41%')
    // From 40 to 59, orange.
    expect(coverage).toContain('#fe7d37')
    expect(summary).toBe('fallow: A (92) · react doctor: 100 · coverage: 41%')
  })

  it('without a doctor score, the badge says so instead of making up a number', () => {
    const { reactDoctor } = badges({
      health: { health_score: { score: 80, grade: 'B' } },
      doctor: { summary: { score: null, scoreLabel: '' } },
      coverage: 90,
    })
    expect(reactDoctor).toContain('react doctor: no score')
  })
})
