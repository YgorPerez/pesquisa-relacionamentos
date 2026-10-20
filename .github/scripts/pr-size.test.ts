import { describe, expect, it } from 'vite-plus/test'
import { measure } from './pr-size.ts'

const numstat = (...lines: [number | '-', number | '-', string][]) =>
  lines.map((l) => l.join('\t')).join('\n')

describe('measure', () => {
  it('adds up what changed and gives the range', () => {
    const { size, lines, counted } = measure(
      numstat([20, 5, 'scripts/affected.ts'], [3, 2, 'AGENTS.md']),
    )
    expect(size.name).toBe('tamanho:M')
    expect(lines).toBe(30)
    expect(counted).toBe(2)
  })

  it('lockfile, route tree, badge, vendored skill and binary stay out', () => {
    const { size, lines } = measure(
      numstat(
        [4, 0, 'scripts/ports.ts'],
        [900, 300, 'pnpm-lock.yaml'],
        [80, 10, 'frontend/src/routeTree.gen.ts'],
        [1, 1, 'docs/badges/fallow.svg'],
        [400, 0, '.agents/skills/tdd/SKILL.md'],
        ['-', '-', 'frontend/public/og.png'],
      ),
    )
    expect(lines).toBe(4)
    expect(size.name).toBe('tamanho:PP')
  })

  it('in a code and test PR, tests do not count; in a test-only one, they do', () => {
    const mixed = measure(
      numstat(
        [10, 0, 'scripts/affected.ts'],
        [600, 0, 'scripts/affected.test.ts'],
        [200, 0, 'frontend/e2e/perfil.e2e.ts'],
      ),
    )
    expect(mixed.lines).toBe(10)
    expect(mixed.tests).toBe(2)
    expect(
      measure(numstat([600, 0, 'scripts/affected.test.ts'])).size.name,
    ).toBe('tamanho:GG')
  })

  it('a thousand lines or more is XG', () => {
    expect(measure(numstat([1000, 0, 'scripts/x.ts'])).size.name).toBe(
      'tamanho:XG',
    )
  })
})
