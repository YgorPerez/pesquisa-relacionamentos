import { describe, expect, it } from 'vite-plus/test'
import { profileInGuide } from './profile-in-guide.ts'
import type { Coverage } from './applies-to-you.ts'

const HETERO: Coverage = { casal: 'hetero' }
const YOUNG: Coverage = {
  generos: ['homem', 'mulher'],
  procura: ['homens', 'mulheres'],
  idades: { min: 18, max: 35 },
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
      { genero: 'homem', procura: 'homens', idade: 30 },
      GUIDE,
    )
    expect(r?.findings).toEqual([{ covered: true }, { covered: false }])
    expect(r?.tips).toEqual([{ covered: true }])
    expect(r?.withData).toBe(1)
    expect(r?.key).toEqual({ applies: true })
  })

  it('when the key number does not apply, it points to the first finding that does', () => {
    const r = profileInGuide(
      { genero: 'mulher', procura: 'homens', idade: 50 },
      GUIDE,
    )
    expect(r?.findings).toEqual([{ covered: false }, { covered: true }])
    expect(r?.key).toEqual({ applies: false, finding: 1 })
  })

  it('when nothing covers, the key points to no finding and withData is zero', () => {
    const r = profileInGuide(
      { genero: 'outro', procura: 'homens', idade: 30 },
      GUIDE,
    )
    expect(r?.withData).toBe(0)
    expect(r?.key).toEqual({ applies: false, finding: null })
  })

  it('without a marked key number, the line speaks only of the findings', () => {
    const r = profileInGuide(
      { genero: 'homem', procura: 'mulheres', idade: 30 },
      { ...GUIDE, key: null },
    )
    expect(r?.key).toBeNull()
  })
})
