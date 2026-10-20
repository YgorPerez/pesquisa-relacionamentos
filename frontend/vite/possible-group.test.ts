// The real data (`dados/grupo-possivel/`) through the packs the browser
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
  resolve(import.meta.dirname, '../../dados/grupo-possivel'),
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

  it('the estimate for someone who said nothing is adult Brazil not living with a partner', () => {
    expect(built.example.active).toEqual(['partner'])
    expect(built.example.target).toBe('people')
    expect(built.example.result.central).toBeGreaterThan(60e6)
    expect(built.example.result.central).toBeLessThan(90e6)
  })
})
