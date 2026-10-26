import { describe, expect, it } from 'vite-plus/test'
import census from '../fixtures/possible-group/censo-2022.csv?raw'
import ages from '../fixtures/possible-group/sidra-9514-idade.csv?raw'
import municipalities from '../fixtures/possible-group/sidra-10185-municipios.csv?raw'
import pns from '../fixtures/possible-group/pns-2019.csv?raw'
import { openPack, readGroupBase, packForPlace } from './possible-group-data.ts'
import { estimateGroup, type CountData } from './possible-group.ts'
import type { Profile } from './profile.ts'
import {
  DEFAULT_REQUIREMENTS,
  release,
  type VisitorRequirement,
  type Requirements,
} from './requirements.ts'

// The real path: CSV → JSON pack (what the browser downloads) → count.
const base = readGroupBase({ census, ages, municipalities, pns })
const pack = (place: 'BR' | 'AC' | 'AP') =>
  openPack(JSON.parse(JSON.stringify(packForPlace(base, place))))
const data = (uf?: 'AC' | 'AP'): CountData => ({
  brazil: pack('BR'),
  ...(uf && { state: pack(uf) }),
})

const count = (profile: Profile | null, change: Partial<Requirements>) => {
  const requirements = { ...DEFAULT_REQUIREMENTS, ...change }
  return estimateGroup(
    { profile, requirements },
    data(requirements.place?.state as 'AC' | undefined),
  )
}

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
  // interval on records / 2, worked out by hand.
  const ac = { age: { min: 25, max: 29 }, place: { state: 'AC' } } as const
  const error = 1.96 / Math.sqrt(400)

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
