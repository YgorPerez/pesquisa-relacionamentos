import { describe, expect, it } from 'vite-plus/test'
import census from '../fixtures/possible-group/censo-2022.csv?raw'
import ages from '../fixtures/possible-group/sidra-9514-idade.csv?raw'
import municipalities from '../fixtures/possible-group/sidra-10185-municipios.csv?raw'
import pns from '../fixtures/possible-group/pns-2019.csv?raw'
import pnad from '../fixtures/possible-group/pnad-2022.csv?raw'
import { openPack, readGroupBase, packForPlace } from './possible-group-data.ts'
import { estimateGroup, needsDetail, type CountData } from './possible-group.ts'
import type { Profile } from './profile.ts'
import {
  DEFAULT_REQUIREMENTS,
  release,
  type VisitorRequirement,
  type Requirements,
} from './requirements.ts'

// The real path: CSV → JSON pack (what the browser downloads) → count.
const base = readGroupBase({ census, ages, municipalities, pns, pnad })
const pack = (place: 'BR' | 'AC' | 'AP', detail = false) =>
  openPack(JSON.parse(JSON.stringify(packForPlace(base, place, { detail }))))
const data = (uf?: 'AC' | 'AP', detail = false): CountData => ({
  brazil: pack('BR', detail),
  ...(uf && { state: pack(uf, detail) }),
})

/** The count over the packs the browser would download for it: the detail
 * ones when a Requirement needs them. */
const count = (profile: Profile | null, change: Partial<Requirements>) => {
  const requirements = { ...DEFAULT_REQUIREMENTS, ...change }
  const input = { profile, requirements }
  return estimateGroup(
    input,
    data(requirements.place?.state as 'AC' | undefined, needsDetail(input)),
  )
}

describe('the default pack and the detail pack', () => {
  const ac = { age: { min: 25, max: 34 }, place: { state: 'AC' } } as const

  it('only "não mora com os pais", "trabalha" and "tem casa própria" need the detail pack', () => {
    const needs = (change: Partial<Requirements>) =>
      needsDetail({
        profile: null,
        requirements: { ...DEFAULT_REQUIREMENTS, ...change },
      })
    expect(needs({})).toBe(false)
    expect(needs({ ...ac, education: 'superior', nonSmoker: true })).toBe(false)
    expect(needs({ notWithParents: true })).toBe(true)
    expect(needs({ work: 'negocio' })).toBe(true)
    expect(needs({ ownsHome: true })).toBe(true)
  })

  it('BMI, depression symptoms and religious attendance come only in the detail pack, which keeps the default Brazil pack small', () => {
    const needs = (change: Partial<Requirements>) =>
      needsDetail({
        profile: null,
        requirements: { ...DEFAULT_REQUIREMENTS, ...change },
      })
    expect(needs({ notObese: true })).toBe(true)
    expect(needs({ noDepressionSymptoms: true })).toBe(true)
    expect(needs({ weeklyWorship: true })).toBe(true)
    // Bisexual reads the orientation, which every pack has.
    expect(needs({ bisexual: true })).toBe(false)
    const plain = pack('BR').pns!
    const full = pack('BR', true).pns!
    expect(Object.keys(plain.variables)).not.toContain('obesidade')
    expect(Object.keys(plain.variables)).not.toContain('depressao')
    expect(Object.keys(plain.variables)).not.toContain('culto')
    expect(Object.keys(full.variables)).toContain('obesidade')
    const sum = (xs: ReadonlyArray<number>) => xs.reduce((s, x) => s + x, 0)
    expect(sum(plain.weight)).toBe(sum(full.weight))
    expect(sum(plain.records)).toBe(sum(full.records))
    const input = {
      profile: { gender: 'homem', seeks: 'mulheres' } as const,
      requirements: {
        ...DEFAULT_REQUIREMENTS,
        ...ac,
        nonSmoker: true,
        bisexual: true,
      },
    } as const
    expect(estimateGroup(input, data('AC')).result).toEqual(
      estimateGroup(input, data('AC', true)).result,
    )
  })

  it('without those, both packs give the same count', () => {
    const input = {
      profile: { seeks: 'mulheres' } as const,
      requirements: { ...DEFAULT_REQUIREMENTS, ...ac, education: 'medio' },
    } as const
    expect(estimateGroup(input, data('AC')).result).toEqual(
      estimateGroup(input, data('AC', true)).result,
    )
  })

  it('the default pack refuses to count a Requirement it summed out', () => {
    expect(() =>
      estimateGroup(
        {
          profile: null,
          requirements: { ...DEFAULT_REQUIREMENTS, ownsHome: true },
        },
        data(),
      ),
    ).toThrow(/detail pack/)
  })
})

describe('estimateGroup: Census requirements', () => {
  it('sums the weight of the matching cells and opens the range by the sampling error', () => {
    // Women aged 25 to 29 in Acre who do not live with a partner: 1,000 +
    // 3,000, in 400 records. Error = 1.96/√400 = 9.8%.
    const r = count(
      { seeks: 'mulheres' },
      { age: { min: 25, max: 29 }, place: { state: 'AC' } },
    )
    expect(r.result.central).toBeCloseTo(4000)
    expect(r.result.records).toBeCloseTo(400)
    expect(r.result.min).toBeCloseTo(4000 * (1 - 0.098))
    expect(r.result.max).toBeCloseTo(4000 * (1 + 0.098))
    expect(r.result.unstable).toBe(false)
  })

  it("takes the exact age out of the 5-year group by the place's single ages", () => {
    // In Acre, ages 25 to 28 are 400 of the 1,000 women aged 25 to 29 (age 29
    // weighs 600).
    const r = count(
      { seeks: 'mulheres' },
      { age: { min: 25, max: 28 }, place: { state: 'AC' } },
    )
    expect(r.result.central).toBeCloseTo(1600)
    expect(r.result.records).toBeCloseTo(160)
  })

  it('the base is the adults of the sought gender in Brazil, from 18', () => {
    // 4,000 + 2,000 + 400 + 700 and, from the 15 to 19 group, only ages 18
    // and 19 (2 of 5): 200.
    const r = count({ seeks: 'mulheres' }, { noLiveInPartner: false })
    expect(r.active).toEqual([])
    expect(r.base.central).toBeCloseTo(7300)
    expect(r.result.central).toBeCloseTo(7300)
  })

  it('education and income are minimums; color and religion, any of the checked ones', () => {
    const ac = { age: { min: 25, max: 34 }, place: { state: 'AC' } } as const
    const women = { seeks: 'mulheres' } as const
    expect(
      count(women, { ...ac, education: 'superior' }).result.central,
    ).toBeCloseTo(1400)
    expect(
      count(women, { ...ac, education: 'medio', income: '2-5' }).result.central,
    ).toBeCloseTo(1400)
    expect(count(women, { ...ac, income: '5+' }).result.central).toBeCloseTo(
      400,
    )
    expect(
      count(women, { ...ac, colors: ['parda', 'preta'] }).result.central,
    ).toBeCloseTo(3400)
    // Whoever did not state a religion (the 15 to 19 group) is out when a
    // religion is checked.
    expect(
      count(women, {
        place: { state: 'AC' },
        religions: ['catolica', 'evangelica'],
      }).result.central,
    ).toBeCloseTo(4000)
  })

  it('a result below 50 records is unstable and says so in a strong caveat', () => {
    const r = count(
      { seeks: 'homens' },
      { age: { min: 25, max: 29 }, place: { state: 'AP' } },
    )
    expect(r.result.records).toBeCloseTo(3)
    expect(r.result.unstable).toBe(true)
    expect(r.caveats.find((x) => x.id === 'unstable')).toMatchObject({
      strong: true,
    })
  })
})

describe('estimateGroup: "não mora com os pais"', () => {
  const ac = { age: { min: 25, max: 29 }, place: { state: 'AC' } } as const

  it('removes whoever lives with the mother, the father or a step-parent, crossed with the other Census requirements', () => {
    // Women 25 to 29 in Acre without a partner: 1,000 + 3,000, and the 3,000
    // live with a parent.
    const r = count({ seeks: 'mulheres' }, { ...ac, notWithParents: true })
    expect(r.active).toContain('parents')
    expect(r.result.central).toBeCloseTo(1000)
    expect(r.caveats.map((c) => c.id)).toContain('parents')
  })

  it('is off by default and released by "soltar"', () => {
    const on = { ...DEFAULT_REQUIREMENTS, notWithParents: true }
    expect(DEFAULT_REQUIREMENTS.notWithParents).toBe(false)
    expect(release(on, 'parents').notWithParents).toBe(false)
  })
})

describe('estimateGroup: "trabalha" and "tem negócio próprio"', () => {
  const ac = { age: { min: 25, max: 34 }, place: { state: 'AC' } } as const
  const women = { seeks: 'mulheres' } as const

  it('"trabalha" keeps whoever was employed, in their own business or not', () => {
    // Without a partner: 1,000 employed, 3,000 not, 400 with a business.
    const r = count(women, { ...ac, work: 'trabalha' })
    expect(r.active).toContain('work')
    expect(r.result.central).toBeCloseTo(1400)
    expect(r.caveats.map((c) => c.id)).toContain('work')
  })

  it('"tem negócio próprio" keeps only employers and the self-employed', () => {
    expect(count(women, { ...ac, work: 'negocio' }).result.central).toBeCloseTo(
      400,
    )
  })

  it('is any by default and released by "soltar"', () => {
    expect(DEFAULT_REQUIREMENTS.work).toBeNull()
    expect(
      release({ ...DEFAULT_REQUIREMENTS, work: 'negocio' }, 'work').work,
    ).toBeNull()
  })
})

describe('estimateGroup: "tem casa própria"', () => {
  const ac = { age: { min: 25, max: 34 }, place: { state: 'AC' } } as const

  it('keeps only whoever heads an owned household or is the spouse, crossed with the other Census requirements', () => {
    // Without a partner: 1,000 own, 3,000 do not, and the 400 live in a
    // collective household (no data), so they are out.
    const r = count({ seeks: 'mulheres' }, { ...ac, ownsHome: true })
    expect(r.active).toContain('home')
    expect(r.result.central).toBeCloseTo(1000)
    expect(r.caveats.map((c) => c.id)).toContain('home')
  })

  it('is off by default and released by "soltar"', () => {
    expect(DEFAULT_REQUIREMENTS.ownsHome).toBe(false)
    expect(
      release({ ...DEFAULT_REQUIREMENTS, ownsHome: true }, 'home').ownsHome,
    ).toBe(false)
  })
})

describe('estimateGroup: "sem filhos"', () => {
  const ac = {
    age: { min: 25, max: 29 },
    place: { state: 'AC' },
    noChildren: true,
  } as const

  it('seeking women, removes those who have children', () => {
    const r = count({ seeks: 'mulheres' }, ac)
    expect(r.children).toBe('applies')
    expect(r.result.central).toBeCloseTo(1000)
  })

  it('seeking men, it does not apply: the Census does not ask them about children', () => {
    const r = count({ seeks: 'homens' }, ac)
    expect(r.children).toBe('no-data')
    expect(r.active).not.toContain('children')
    expect(r.result.central).toBeCloseTo(1500)
  })

  it('seeking both, it applies only to women, with a strong warning', () => {
    const r = count({ seeks: 'ambos' }, ac)
    expect(r.children).toBe('women-only')
    expect(r.result.central).toBeCloseTo(1000 + 1500)
    expect(r.caveats.find((x) => x.id === 'children-women-only')).toMatchObject(
      {
        strong: true,
      },
    )
  })
})

describe('estimateGroup: PNS requirements', () => {
  // The PNS fixture has the same cells (weight, records) in every sex × age
  // bracket: straight non-smokers of 160 cm (500, 50) and 180 cm (200, 20),
  // straight smokers of 170 cm (200, 20), bi non-smoker (20, 2), gay smoker
  // (40, 4), "não sabe" non-smoker (30, 3) and "recusou" with no height or
  // smoking (10, 1). Drinking, in the same order: never, weekly, under once a
  // week, under once a week, weekly, never, empty. Exercise (150 min a week):
  // yes, no, yes, no, yes, yes, empty. Oral health: good, good, not, good,
  // not, good, empty. E-cigarette: no, no, uses, no, uses, no, empty. Design
  // effect 2. The interval literals are the Wilson
  // interval on records / 2, worked out by hand. Only the straight
  // non-smokers of 180 cm have a BMI of 30 or more; "recusou" has no BMI.
  // Only the straight smokers have depression symptoms; "não sabe" and
  // "recusou" have no PHQ-9. Weekly religion: straight of 160 and 170 cm and
  // gay.
  const ac = { age: { min: 25, max: 29 }, place: { state: 'AC' } } as const
  const error = 1.96 / Math.sqrt(400)

  it('"vai à religião toda semana" counts weekly attendance and, with a religion checked, says it assumes the same attendance in every religion', () => {
    // Weekly: straight of 160 cm and 170 cm and gay, 740 of 990.
    const r = count({ seeks: 'mulheres' }, { ...ac, weeklyWorship: true })
    expect(r.active).toContain('worship')
    expect(r.result.central).toBeCloseTo((4000 * 740) / 990)
    const caveat = r.caveats.find((x) => x.id === 'worship')
    expect(caveat?.text).toContain('não pergunta qual é a religião')
    expect(caveat?.text).not.toContain('mesma em todas')
    const withReligion = count(
      { seeks: 'mulheres' },
      { ...ac, weeklyWorship: true, religions: ['evangelica'] },
    )
    expect(withReligion.active).toEqual(
      expect.arrayContaining(['religion', 'worship']),
    )
    expect(
      withReligion.caveats.find((x) => x.id === 'worship')?.text,
    ).toContain('mesma em todas as religiões')
  })

  it('"bissexual" counts who said bisexual among who answered, on top of the orientation from the Profile', () => {
    // 20 of the 960 who answered; with the orientation (straight or bi),
    // still the same 20.
    const alone = count({ seeks: 'mulheres' }, { ...ac, bisexual: true })
    expect(alone.active).toContain('bisexual')
    expect(alone.result.central).toBeCloseTo((4000 * 20) / 960)
    const withProfile = count(
      { gender: 'homem', seeks: 'mulheres' },
      { ...ac, bisexual: true },
    )
    expect(withProfile.result.central).toBeCloseTo((4000 * 20) / 960)
    expect(withProfile.result.pnsRecords).toBe(2)
    expect(withProfile.result.unstable).toBe(true)
    expect(
      withProfile.caveats.find((x) => x.id === 'bisexual')?.text,
    ).toContain('estatística experimental')
  })

  it('"sem sintomas de depressão" counts who scored under 10 on the PHQ-9, and says it is the last 2 weeks', () => {
    // 760 of the 960 with a PHQ-9.
    const r = count(
      { seeks: 'mulheres' },
      { ...ac, noDepressionSymptoms: true },
    )
    expect(r.active).toContain('depression')
    expect(r.result.central).toBeCloseTo((4000 * 760) / 960)
    const caveat = r.caveats.find((x) => x.id === 'depression')
    expect(caveat?.strong).toBe(false)
    expect(caveat?.text).toContain('2 últimas semanas')
    expect(caveat?.text).toContain('não é diagnóstico')
  })

  it('"IMC abaixo de 30" counts who answered with a BMI under 30, crossed with the other PNS Requirements', () => {
    // 790 of the 990 with a BMI.
    const r = count({ seeks: 'mulheres' }, { ...ac, notObese: true })
    expect(r.active).toContain('obesity')
    expect(r.result.central).toBeCloseTo((4000 * 790) / 990)
    // Non-smoker too: 160 cm, bi and "não sabe", 550 of the 990.
    const both = count(
      { seeks: 'mulheres' },
      { ...ac, notObese: true, nonSmoker: true },
    )
    expect(both.result.central).toBeCloseTo((4000 * 550) / 990)
    expect(r.caveats.find((x) => x.id === 'obesity')?.text).toContain(
      'autodeclarados',
    )
  })

  it('orientation comes from the profile: straight + bi of the sought sex, not counting who did not answer', () => {
    // 920 of the 960 who answered, on 96 records.
    const r = count({ gender: 'homem', seeks: 'mulheres' }, ac)
    expect(r.active).toContain('orientation')
    expect(r.result.central).toBeCloseTo((4000 * 920) / 960)
    expect(r.result.min).toBeCloseTo(4000 * 0.86024089 * (1 - error), 1)
    expect(r.result.max).toBeCloseTo(4000 * 0.98849835 * (1 + error), 1)
    expect(r.caveats.find((x) => x.id === 'orientation')?.text).toContain(
      '4% não souberam',
    )
  })

  it('seeking the same gender, counts gay + bi', () => {
    const r = count({ gender: 'mulher', seeks: 'mulheres' }, ac)
    expect(r.result.central).toBeCloseTo((4000 * 60) / 960)
  })

  it('gender "outro" does not discount orientation and carries the strong ceiling warning', () => {
    const r = count({ gender: 'outro', seeks: 'mulheres' }, ac)
    expect(r.active).not.toContain('orientation')
    expect(r.result.central).toBeCloseTo(4000)
    const warning = r.caveats.find((x) => x.id === 'other-gender')
    expect(warning?.strong).toBe(true)
    expect(warning?.text).toContain('identidade de gênero')
    expect(warning?.text).toContain('teto')
  })

  it('without a gender in the profile, it does not discount either and warns', () => {
    const r = count({ seeks: 'mulheres' }, ac)
    expect(r.caveats.find((x) => x.id === 'no-gender')).toMatchObject({
      strong: true,
    })
  })

  it('"não fuma" takes the share of non-smokers among who answered, with the interval of the design', () => {
    // 750 of 990; Wilson on 99 records / 2.
    const r = count({ seeks: 'mulheres' }, { ...ac, nonSmoker: true })
    expect(r.result.central).toBeCloseTo((4000 * 750) / 990)
    expect(r.result.min).toBeCloseTo(4000 * 0.62253204 * (1 - error), 1)
    expect(r.result.max).toBeCloseTo(4000 * 0.85551886 * (1 + error), 1)
  })

  it('height in a range counts who is between min and max centimeters', () => {
    // 160 to 170 cm: 790 of the 990 who gave a height.
    const r = count(
      { seeks: 'mulheres' },
      { ...ac, height: { min: 160, max: 170 } },
    )
    expect(r.result.central).toBeCloseTo((4000 * 790) / 990)
  })

  it('crosses the PNS Requirements on the same person instead of multiplying them', () => {
    // Straight or bi and non-smoker: 720 of the 960 who answered both. The
    // product of the two alone would give 920/960 × 750/990.
    const r = count(
      { gender: 'homem', seeks: 'mulheres' },
      { ...ac, nonSmoker: true },
    )
    expect(r.result.central).toBeCloseTo((4000 * 720) / 960)
    expect(r.result.min).toBeCloseTo(4000 * 0.61215356 * (1 - error), 1)
    expect(r.result.max).toBeCloseTo(4000 * 0.85079511 * (1 + error), 1)
    // From 175 cm, non-smoker and straight: only the 180 cm cell, 200 of the
    // 960 who answered all three.
    const tall = count(
      { gender: 'homem', seeks: 'mulheres' },
      { ...ac, nonSmoker: true, height: { min: 175, max: 200 } },
    )
    expect(tall.result.central).toBeCloseTo((4000 * 200) / 960)
  })

  it('drinking counts who drinks as often as one of the checked answers, with a caveat on self-report', () => {
    // Never or under once a week: 500 + 200 + 20 + 30 = 750 of the 990 who
    // answered. Crossed with "não fuma": 500 + 20 + 30 = 550.
    const r = count(
      { seeks: 'mulheres' },
      { ...ac, drinking: ['nunca', 'raramente'] },
    )
    expect(r.active).toContain('drinking')
    expect(r.result.central).toBeCloseTo((4000 * 750) / 990)
    expect(r.caveats.find((x) => x.id === 'drinking')?.text).toContain(
      'subdeclarad',
    )
    const crossed = count(
      { seeks: 'mulheres' },
      { ...ac, drinking: ['nunca', 'raramente'], nonSmoker: true },
    )
    expect(crossed.result.central).toBeCloseTo((4000 * 550) / 990)
  })

  it('"faz exercício" counts who reaches 150 minutes a week, crossed with the other PNS Requirements', () => {
    // 500 + 200 + 40 + 30 = 770 of 990. Never drinks too: 500 + 30 = 530.
    const r = count({ seeks: 'mulheres' }, { ...ac, exercises: true })
    expect(r.active).toContain('exercise')
    expect(r.result.central).toBeCloseTo((4000 * 770) / 990)
    expect(r.caveats.find((x) => x.id === 'exercise')?.text).toContain(
      '150 minutos',
    )
    const crossed = count(
      { seeks: 'mulheres' },
      { ...ac, exercises: true, drinking: ['nunca'] },
    )
    expect(crossed.result.central).toBeCloseTo((4000 * 530) / 990)
  })

  it('"saúde bucal boa" counts who rates their teeth good or very good', () => {
    // 500 + 200 + 20 + 30 = 750 of 990.
    const r = count({ seeks: 'mulheres' }, { ...ac, goodTeeth: true })
    expect(r.active).toContain('teeth')
    expect(r.result.central).toBeCloseTo((4000 * 750) / 990)
    expect(r.caveats.find((x) => x.id === 'teeth')?.text).toContain(
      'autoavaliação',
    )
  })

  it('"não usa cigarro eletrônico" counts who does not use it today, with the 2019 caveat', () => {
    // 500 + 200 + 20 + 30 = 750 of 990.
    const r = count({ seeks: 'mulheres' }, { ...ac, nonVaper: true })
    expect(r.active).toContain('vape')
    expect(r.result.central).toBeCloseTo((4000 * 750) / 990)
    expect(r.caveats.find((x) => x.id === 'vape')?.text).toContain('2019')
  })

  it('a PNS block below 50 records is unstable and says so, even with a large Census cell', () => {
    // Gay or bi women: 6 PNS records in the 25-29 bracket.
    const r = count({ gender: 'mulher', seeks: 'mulheres' }, ac)
    expect(r.result.records).toBeCloseTo(400)
    expect(r.result.pnsRecords).toBe(6)
    expect(r.result.unstable).toBe(true)
    const caveat = r.caveats.find((x) => x.id === 'unstable-pns')
    expect(caveat?.strong).toBe(true)
    expect(caveat?.text).toContain('6 registros da PNS')
    expect(r.caveats.find((x) => x.id === 'unstable')).toBeUndefined()
  })

  it('sums the PNS records of every bracket the group covers', () => {
    // 25 to 34: brackets 25-29 and 30-34, 92 straight or bi records each.
    const r = count(
      { gender: 'homem', seeks: 'mulheres' },
      { age: { min: 25, max: 34 }, place: { state: 'AC' } },
    )
    expect(r.result.pnsRecords).toBe(184)
    expect(r.result.unstable).toBe(false)
  })

  it('without a PNS Requirement, there are no PNS records to count', () => {
    const r = count({ seeks: 'mulheres' }, ac)
    expect(r.result.pnsRecords).toBeNull()
  })
})

describe('estimateGroup: the independence range (#301)', () => {
  // Women aged 25 to 29 in Acre: 6,000, of whom 4,000 do not live with a
  // partner. Straight or bi: 920 of 960, so 5,750 of the 6,000.
  const ac = { age: { min: 25, max: 29 }, place: { state: 'AC' } } as const
  const man = { gender: 'homem', seeks: 'mulheres' } as const

  it('goes from the least to the most the Census and PNS groups can overlap, in the same sex and age', () => {
    // At least 4,000 + 5,750 − 6,000; at most the smaller of the two.
    const r = count(man, ac)
    expect(r.independence?.min).toBeCloseTo(3750)
    expect(r.independence?.max).toBeCloseTo(4000)
    expect(r.result.central).toBeGreaterThan(r.independence!.min)
    expect(r.result.central).toBeLessThan(r.independence!.max)
  })

  it('does not fall below zero when the two groups fit side by side', () => {
    // Non-smokers: 750 of 990 → 4,545 of 6,000. With higher education and no
    // partner, 1,000: they may not overlap at all.
    const r = count(
      { seeks: 'mulheres' },
      { ...ac, nonSmoker: true, education: 'superior' },
    )
    expect(r.independence?.min).toBe(0)
    expect(r.independence?.max).toBeCloseTo(1000)
  })

  it('bounds each age group on its own and sums them', () => {
    // 30 to 34: 400 women, none living with a partner, so the Census cuts no
    // one there and the bracket adds 400 × 920/960 to both ends.
    const r = count(man, { age: { min: 25, max: 34 }, place: { state: 'AC' } })
    const thirties = (400 * 920) / 960
    expect(r.independence?.min).toBeCloseTo(3750 + thirties)
    expect(r.independence?.max).toBeCloseTo(4000 + thirties)
  })

  it('has no range without a PNS Requirement, or when the Census cuts no one inside sex and age', () => {
    expect(count({ seeks: 'mulheres' }, ac).independence).toBeNull()
    expect(
      count(man, { ...ac, noLiveInPartner: false }).independence,
    ).toBeNull()
  })
})

describe('estimateGroup: office occupation (PNAD)', () => {
  const error = 1.96 / Math.sqrt(400)

  it("multiplies each cell by the probability in its sex, age group and education, with that row's interval", () => {
    // Women 25 to 29 in Acre not in a union: 1,000 college × 0.7 + 3,000
    // high school × 0.2.
    const r = count(
      { seeks: 'mulheres' },
      { age: { min: 25, max: 29 }, place: { state: 'AC' }, office: true },
    )
    expect(r.active).toContain('office')
    expect(r.result.central).toBeCloseTo(1300)
    expect(r.result.min).toBeCloseTo((660 + 540) * (1 - error))
    expect(r.result.max).toBeCloseTo((740 + 660) * (1 + error))
  })

  it('a cell whose education has no row takes the all-educations one', () => {
    // The 400 college women aged 30 to 34 take 0.5.
    const r = count(
      { seeks: 'mulheres' },
      { age: { min: 25, max: 34 }, place: { state: 'AC' }, office: true },
    )
    expect(r.result.central).toBeCloseTo(1300 + 200)
  })

  it('with "trabalha" on, takes the chance among the employed, so the job is not counted twice', () => {
    // Women 25 to 29 in Acre not in a union who work: the 1,000 college
    // ones. Among the employed the file has only the all-educations row,
    // 0.4; among everyone, college would give 0.7.
    const r = count(
      { seeks: 'mulheres' },
      {
        age: { min: 25, max: 29 },
        place: { state: 'AC' },
        office: true,
        work: 'trabalha',
      },
    )
    expect(r.result.central).toBeCloseTo(400)
    expect(r.caveats.find((x) => x.id === 'office')?.text).toContain(
      'entre quem trabalha',
    )
  })

  it('says which occupations count and that it assumes the rest does not change them', () => {
    const r = count(
      { seeks: 'mulheres' },
      { age: { min: 25, max: 29 }, place: { state: 'AC' }, office: true },
    )
    const caveat = r.caveats.find((x) => x.id === 'office')?.text
    expect(caveat).toContain('PNAD Contínua')
    expect(caveat).toContain('apoio administrativo')
    expect(caveat).toContain('renda')
  })

  it('the source line names the PNAD only when office is on', () => {
    const ac = { age: { min: 25, max: 29 }, place: { state: 'AC' } } as const
    const source = (office: boolean) =>
      count({ seeks: 'mulheres' }, { ...ac, office }).caveats.find(
        (x) => x.id === 'source',
      )?.text
    expect(source(true)).toBe(
      'Censo de julho de 2022, PNS 2019 e PNAD Contínua do 3º trimestre de 2022. Fonte: IBGE.',
    )
    expect(source(false)).toBe(
      'Censo de julho de 2022 e PNS 2019. Fonte: IBGE.',
    )
  })

  it('enters the independence range: bounded in each education first, then against the PNS block', () => {
    // Women 25 to 29 in Acre. High school: 3,000, all without a partner, 600
    // in an office: exactly 600. College: 3,000, 1,000 without a partner,
    // 2,100 in an office: from 100 to 1,000. Together, 700 to 1,600.
    const ac = { age: { min: 25, max: 29 }, place: { state: 'AC' } } as const
    const alone = count({ seeks: 'mulheres' }, { ...ac, office: true })
    expect(alone.independence?.min).toBeCloseTo(700)
    expect(alone.independence?.max).toBeCloseTo(1600)
    // Straight or bi: 5,750 of the 6,000. At least 700 + 5,750 − 6,000.
    const withPns = count(
      { gender: 'homem', seeks: 'mulheres' },
      { ...ac, office: true },
    )
    expect(withPns.independence?.min).toBeCloseTo(450)
    expect(withPns.independence?.max).toBeCloseTo(1600)
  })

  it('with "trabalha" on, bounds the office share among the employed', () => {
    // College: 3,000 employed, 1,000 of them without a partner; 0.4 of the
    // employed in an office, 1,200. From 0 to 1,000, around the 400.
    const r = count(
      { seeks: 'mulheres' },
      {
        age: { min: 25, max: 29 },
        place: { state: 'AC' },
        office: true,
        work: 'trabalha',
      },
    )
    expect(r.independence?.min).toBeCloseTo(0)
    expect(r.independence?.max).toBeCloseTo(1000)
    expect(r.result.central).toBeCloseTo(400)
  })
})

describe('estimateGroup: municipality', () => {
  it("scales the state's cells by the municipality's population in SIDRA 10185", () => {
    // Rio Branco has 2,000 of Acre's 4,000 women aged 25 to 29 not in a
    // union: the number matches what SIDRA publishes for the city.
    const r = count(
      { seeks: 'mulheres' },
      {
        age: { min: 25, max: 29 },
        place: { state: 'AC', municipality: '1200401' },
      },
    )
    expect(r.result.central).toBeCloseTo(2000)
    expect(r.result.records).toBeCloseTo(200)
    expect(r.caveats.map((x) => x.id)).toContain('municipality')
  })

  it('with people living in a union, each side has its own scale', () => {
    // 2,000 not in a union (×0.5) + 500 of the 2,000 in a union (×0.25).
    const r = count(
      { seeks: 'mulheres' },
      {
        age: { min: 25, max: 29 },
        place: { state: 'AC', municipality: '1200401' },
        noLiveInPartner: false,
      },
    )
    expect(r.result.central).toBeCloseTo(2500)
  })
})

describe('estimateGroup: what weighs most, funnel and naive count', () => {
  const requested = {
    age: { min: 25, max: 29 },
    place: { state: 'AC' },
    education: 'superior',
  } as const
  const r = count({ seeks: 'mulheres' }, requested)

  it('the cost of releasing each one keeps the others, from the one that weighs most to the least', () => {
    // Current: 1,000. Without education, 4,000; without "não mora com
    // companheiro(a)", 1,000 + 2,000; without Acre, 1,000 + 700 from Amapá;
    // without the age, 1,000 + 400.
    expect(r.result.central).toBeCloseTo(1000)
    expect(
      r.costs.map((c) => [
        c.requirement,
        Math.round(c.without),
        Number(c.times.toFixed(2)),
      ]),
    ).toEqual([
      ['education', 4000, 4],
      ['partner', 3000, 3],
      ['place', 1700, 1.7],
      ['age', 1400, 1.4],
    ])
    expect(r.costs[0]?.gain).toBeCloseTo(3000)
  })

  it('releasing through the button gives the same number the cost announced, in any order', () => {
    for (const cost of r.costs) {
      const released = release(
        { ...DEFAULT_REQUIREMENTS, ...requested },
        cost.requirement as VisitorRequirement,
      )
      expect(count({ seeks: 'mulheres' }, released).result.central).toBeCloseTo(
        cost.without,
      )
    }
  })

  it('the funnel cuts in the fixed order and ends at the result', () => {
    expect(r.funnel.map((e) => [e.requirement, Math.round(e.central)])).toEqual(
      [
        ['age', 6700],
        ['place', 6000],
        ['partner', 4000],
        ['education', 1000],
      ],
    )
  })

  it('the naive count multiplies the fraction each requirement leaves alone in Brazil', () => {
    // Base 7,300. Alone: ages 25 to 29 6,700; Acre 6,600; not in a union
    // 5,300; college 4,100.
    expect(r.naive).toBeCloseTo((6700 * 6600 * 5300 * 4100) / 7300 ** 3)
  })
})
