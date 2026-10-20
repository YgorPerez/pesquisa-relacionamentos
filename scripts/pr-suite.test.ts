import { describe, expect, it } from 'vite-plus/test'
import { planForDiff } from './affected.ts'
import { suiteQueues } from './pr-suite.ts'

const BASE = 'abc1234'
const names = (queues: ReturnType<typeof suiteQueues>) =>
  queues.map((queue) => queue.map((s) => (s.skip ? `skip ${s.name}` : s.name)))

describe('suiteQueues', () => {
  it('the full suite runs every pr.yml step, with coverage, fallow and the whole e2e', () => {
    const queues = suiteQueues({ plan: null, base: BASE })
    expect(names(queues)).toEqual([
      ['check', 'folders', 'pieces', 'tests', 'fallow', 'doctor'],
      ['types', 'suppressions'],
      ['stories'],
      ['build', 'storybook', 'e2e'],
    ])
    const step = (name: string) => queues.flat().find((s) => s.name === name)
    expect(step('tests')?.command).toBe('pnpm exec vp run -r test:coverage')
    expect(step('e2e')?.command).toBe('pnpm e2e')
    expect(step('suppressions')?.command).toContain(`--base ${BASE}`)
  })

  it("the diff's suite runs Vitest only in the affected folders and only the term's specs", () => {
    const queues = suiteQueues({
      plan: planForDiff(['frontend/src/ui/profile.tsx']),
      base: BASE,
    })
    expect(names(queues)).toEqual([
      ['check', 'folders', 'pieces', 'tests:frontend', 'fallow', 'doctor'],
      ['types', 'suppressions'],
      ['stories'],
      ['build', 'storybook', 'e2e'],
    ])
    const step = (name: string) => queues.flat().find((s) => s.name === name)
    expect(step('tests:frontend')).toMatchObject({
      dir: 'frontend',
      command: `pnpm exec vp test run --changed ${BASE} --passWithNoTests`,
    })
    expect(step('e2e')?.command).toBe(
      'pnpm e2e accessibility.e2e.ts home.e2e.ts profile.e2e.ts',
    )
    // Without the whole coverage, fallow runs only what does not depend on it.
    expect(step('fallow')?.command).toBe(
      'pnpm exec fallow dead-code && pnpm exec fallow dupes',
    )
  })

  it('a root script skips the site and the stories, and says why', () => {
    const queues = suiteQueues({
      plan: planForDiff(['scripts/affected.ts']),
      base: BASE,
    })
    expect(names(queues)).toEqual([
      [
        'check',
        'skip folders',
        'skip pieces',
        'tests:.',
        'skip fallow',
        'skip doctor',
      ],
      ['types', 'suppressions'],
      ['skip stories'],
      ['skip build', 'skip storybook', 'skip e2e'],
    ])
    expect(queues.flat().find((s) => s.name === 'e2e')?.skip).toBe(
      'no spec goes through what changed',
    )
  })

  it('a failed test reruns only its file, in the folder it ran in', () => {
    const queues = suiteQueues({ plan: null, base: BASE })
    const tests = queues.flat().find((s) => s.name === 'tests')
    expect(
      tests?.retry?.command({ dir: '/repo/frontend', file: 'src/a.test.ts' }),
    ).toBe("pnpm exec vp test run 'src/a.test.ts'")
    const e2e = queues.flat().find((s) => s.name === 'e2e')
    expect(e2e?.retry?.command({ dir: null, file: 'e2e/profile.e2e.ts' })).toBe(
      "pnpm exec playwright test 'e2e/profile.e2e.ts' --retries=0",
    )
  })
})
