import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { type Health, readHealth, regressions } from './before-merge.ts'

const PENALTIES = { unit_size: 3.6, coupling: 2.4, dead_exports: 0 }

function health(change: Partial<Health> = {}): Health {
  return {
    penalties: PENALTIES,
    functionsOver60PerThousand: 7.2,
    coupled: ['src/ui/shadcn/button.tsx'],
    ...change,
  }
}

describe('readHealth', () => {
  it('counts as coupled a file with fan-in above max(p95, 10), relative to frontend', () => {
    const read = readHealth({
      health_score: { penalties: PENALTIES },
      vital_signs: { functions_over_60_loc_per_k: 7.2, p95_fan_in: 12 },
      file_scores: [
        { path: '/tmp/x/frontend/src/a.ts', fan_in: 13 },
        { path: '/repo/frontend/src/b.ts', fan_in: 12 },
      ],
    })
    assert.deepEqual(read.coupled, ['src/a.ts'])
  })

  it('with a low p95, the limit is 10', () => {
    const read = readHealth({
      health_score: { penalties: PENALTIES },
      vital_signs: { functions_over_60_loc_per_k: 0, p95_fan_in: 3 },
      file_scores: [{ path: 'frontend/src/a.ts', fan_in: 10 }],
    })
    assert.deepEqual(read.coupled, [])
  })
})

describe('regressions', () => {
  it('nothing got worse: empty', () => {
    assert.deepEqual(regressions(health(), health()), [])
  })

  it('names the file that started counting toward coupling', () => {
    const [sentence] = regressions(
      health(),
      health({
        coupled: [
          'src/features/atletas/graduacao.ts',
          'src/ui/shadcn/button.tsx',
        ],
      }),
    )
    assert.match(
      sentence ?? '',
      /^coupling: src\/features\/atletas\/graduacao\.ts/,
    )
  })

  it('swapping one coupled file for another is not a regression', () => {
    assert.deepEqual(
      regressions(health(), health({ coupled: ['src/other.ts'] })),
      [],
    )
  })

  it('more functions over 60 lines is a regression', () => {
    const [sentence] = regressions(
      health(),
      health({ functionsOver60PerThousand: 7.3 }),
    )
    assert.match(sentence ?? '', /^size: .* from 7\.2 to 7\.3/)
  })

  it('another penalty going up too', () => {
    assert.deepEqual(
      regressions(
        health(),
        health({ penalties: { ...PENALTIES, dead_exports: 0.5 } }),
      ),
      ["fallow's dead_exports penalty went from 0 to 0.5."],
    )
  })
})
