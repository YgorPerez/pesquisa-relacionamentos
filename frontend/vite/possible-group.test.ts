// The real data (`data/possible-group/`) through the packs the browser
// downloads, against the case checked by hand in #36.
import { resolve } from 'node:path'
import { openPack, type PackPlace } from '@tem-estudo/rules/possible-group-data'
import { estimateGroup } from '@tem-estudo/rules/possible-group'
import { formatAmount } from '@tem-estudo/rules/numbers'
import {
  DEFAULT_REQUIREMENTS,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import { describe, expect, it } from 'vite-plus/test'
import { buildPacks } from './possible-group.ts'

const built = buildPacks(
  resolve(import.meta.dirname, '../../data/possible-group'),
)
const open = (place: PackPlace) => openPack(JSON.parse(built.packs.get(place)!))
const brazil = open('BR')
const sp = open('SP')

const women25to29 = (place: Requirements['place']) =>
  estimateGroup(
    {
      profile: { seeks: 'mulheres' },
      requirements: {
        ...DEFAULT_REQUIREMENTS,
        age: { min: 25, max: 29 },
        place,
      },
    },
    { brazil, state: sp },
  )

describe('the Possible group packs', () => {
  it('one for Brazil and one per state, each much smaller than the CSV', () => {
    expect(built.packs.size).toBe(28)
    const largest = Math.max(...[...built.packs.values()].map((t) => t.length))
    expect(largest).toBeLessThan(4_000_000)
  })

  it('the default packs sum out parents, work and home: Brazil stays under 1 MB; the detail ones stay under 4 MB', () => {
    expect(built.packs.get('BR')!.length).toBeLessThan(1_000_000)
    expect(built.detailPacks.size).toBe(28)
    const largest = Math.max(
      ...[...built.detailPacks.values()].map((t) => t.length),
    )
    expect(largest).toBeLessThan(4_000_000)
  })

  it('with a detail Requirement on, the detail packs give the same counts as when every pack carried the detail', () => {
    // Pinned from the single full pack of before the split (3be6cf7).
    const detail = (place: PackPlace) =>
      openPack(JSON.parse(built.detailPacks.get(place)!))
    const data = { brazil: detail('BR'), state: detail('SP') }
    const count = (change: Partial<Requirements>) => {
      const r = estimateGroup(
        {
          profile: { seeks: 'mulheres' },
          requirements: {
            ...DEFAULT_REQUIREMENTS,
            age: { min: 25, max: 29 },
            place: { state: 'SP' },
            ...change,
          },
        },
        data,
      )
      return [
        Math.round(r.result.central),
        r.result.records,
        ...r.costs.map((c) => `${c.requirement}:${Math.round(c.without)}`),
      ]
    }
    expect(count({ notWithParents: true })).toEqual([
      251_329,
      19_099,
      'age:5352617',
      'place:1239988',
      'partner:1104654',
      'parents:746306',
    ])
    expect(count({ work: 'negocio' })).toEqual([
      89_842,
      6_914,
      'age:828642',
      'work:746306',
      'place:379946',
      'partner:217108',
    ])
    expect(
      count({ notWithParents: true, work: 'trabalha', ownsHome: true }),
    ).toEqual([
      41_550,
      3_238,
      'age:1109945',
      'partner:286142',
      'place:210444',
      'home:186463',
      'parents:60134',
      'work:56815',
    ])
  })

  it('SP, women aged 25 to 29 not living in a union: the CSV gives 746,284 (SIDRA 747,507)', () => {
    const r = women25to29({ state: 'SP' })
    expect(Math.abs(r.result.central - 746_284)).toBeLessThan(50)
    expect(r.result.records).toBe(57_931)
    expect(formatAmount(r.result.central)).toBe('750 mil')
  })

  it('in the capital, the same group matches the municipal SIDRA 10185 (229,861)', () => {
    const r = women25to29({ state: 'SP', municipality: '3550308' })
    expect(Math.abs(r.result.central - 229_861)).toBeLessThan(1)
  })

  it("office work over the Census cells lands near the PNAD's own rate for women aged 25 to 29 (29.4%)", () => {
    // The Census weighs each education with its own people; if its mix
    // matches the PNAD's, the share comes back to the PNAD row without
    // education.
    const requirements = {
      ...DEFAULT_REQUIREMENTS,
      age: { min: 25, max: 29 },
      noLiveInPartner: false,
    }
    const share = (office: boolean) =>
      estimateGroup(
        {
          profile: { seeks: 'mulheres' },
          requirements: { ...requirements, office },
        },
        { brazil },
      ).result.central
    expect(Math.abs(share(true) / share(false) - 0.294)).toBeLessThan(0.03)
  })

  it('the estimate for someone who said nothing is adult Brazil not living with a partner', () => {
    expect(built.example.active).toEqual(['partner'])
    expect(built.example.target).toBe('people')
    expect(built.example.result.central).toBeGreaterThan(60e6)
    expect(built.example.result.central).toBeLessThan(90e6)
  })
})
