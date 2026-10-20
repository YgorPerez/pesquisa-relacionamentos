import { describe, expect, it } from 'vite-plus/test'
import { profileInGuide } from './profile-in-guide.ts'
import type { Coverage } from './applies-to-you.ts'

const HETERO: Coverage = { couple: 'different-sex' }
const YOUNG: Coverage = {
  genders: ['man', 'woman'],
  seeks: ['men', 'women'],
  ages: { min: 18, max: 35 },
}

// The e2e fixture's guide: the key number comes from the young people's fact
// sheet; the second finding, from straight couples; the tip cites both.
const GUIDE = {
  key: [YOUNG],
  findings: [[YOUNG], [HETERO]],
  tips: [[YOUNG, HETERO]],
}

describe('profileInGuide', () => {
  it('without a profile it marks nothing', () => {
    expect(profileInGuide(null, GUIDE)).toBeNull()
  })

  it('counts the findings with data and says the key number applies', () => {
    const r = profileInGuide(
      { gender: 'homem', seeks: 'homens', age: 30 },
      GUIDE,
    )
    expect(r?.findings).toEqual([{ covered: true }, { covered: false }])
    expect(r?.tips).toEqual([{ covered: true }])
    expect(r?.withData).toBe(1)
    expect(r?.key).toEqual({ applies: true })
  })

  it('when the key number does not apply, it points to the first finding that does', () => {
    const r = profileInGuide(
      { gender: 'mulher', seeks: 'homens', age: 50 },
      GUIDE,
    )
    expect(r?.findings).toEqual([{ covered: false }, { covered: true }])
    expect(r?.key).toEqual({ applies: false, finding: 1 })
  })

  it('when nothing covers, the key points to no finding and withData is zero', () => {
    const r = profileInGuide(
      { gender: 'outro', seeks: 'homens', age: 30 },
      GUIDE,
    )
    expect(r?.withData).toBe(0)
    expect(r?.key).toEqual({ applies: false, finding: null })
  })

  it('without a marked key number, the line speaks only of the findings', () => {
    const r = profileInGuide(
      { gender: 'homem', seeks: 'mulheres', age: 30 },
      { ...GUIDE, key: null },
    )
    expect(r?.key).toBeNull()
  })
})
