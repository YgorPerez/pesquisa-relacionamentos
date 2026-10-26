// The first step of the pipeline (#8, #36): the aggregated microdata must
// reproduce numbers published in SIDRA, or the weights and codes are wrong
// and nothing is written.
//
// Three checks:
// - the sum of the weights in each state gives the state's population (table
//   9514). It is the only thing the public file's calibration guarantees, so
//   the tolerance is one person;
// - in Brazil, each sex × age group × marital status cell of table 10185
//   matches the microdata within 2.5%;
// - in each state, the share not living in a union, by sex × age group,
//   matches within 3 percentage points. The absolute count in a small state
//   can drift further (IBGE warns that only the state total is calibrated),
//   but a swapped code moves the share far more than that.
//
// In the PNS, the distribution of sexual orientation by sex must give Table
// 1.1.1 published by IBGE, which checks the weight, the adult filter and the
// Y008 codes.
import type { Aggregate } from './census.ts'
import { proportion, type PnsRecord } from './pns.ts'

export interface MaritalCell {
  /** `BR` or the state abbreviation. */
  readonly place: string
  readonly sex: string
  readonly age: string
  readonly union: 'sim' | 'nao'
  readonly people: number
}

export interface Published {
  /** Resident population by state (SIDRA 9514, total). */
  readonly population: Readonly<Record<string, number>>
  /** SIDRA 10185, all races, from age 15 up. */
  readonly marital: ReadonlyArray<MaritalCell>
}

export interface CrossCheck {
  readonly failures: ReadonlyArray<string>
  readonly checkedCells: number
  /** The largest relative difference in Brazil, for the `.meta.yaml`. */
  readonly maxDifferenceBrazil: number
  /** The largest share difference across states, in points (0.01 = 1 point). */
  readonly maxDifferenceState: number
}

export const BRAZIL_TOLERANCE = 0.025
export const STATE_TOLERANCE = 0.03

const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const signed = (x: number) =>
  (x >= 0 ? '+' : '−') + oneDecimal.format(Math.abs(x * 100))
const unionLabel = {
  sim: 'living in a union',
  nao: 'not living in a union',
} as const

export function crossCheck(
  aggregate: Aggregate,
  published: Published,
): CrossCheck {
  const failures: string[] = []

  for (const [state, people] of Object.entries(published.population)) {
    const sum = aggregate.totalWeight[state] ?? 0
    if (Math.abs(sum - people) >= 1)
      failures.push(
        `${state}: the weights sum to ${integer.format(sum)} people and SIDRA publishes ${integer.format(people)}`,
      )
  }

  const micro = new Map<string, number>()
  const add = (key: string, weight: number) =>
    micro.set(key, (micro.get(key) ?? 0) + weight)
  for (const c of aggregate.cells) {
    add([c.uf, c.sexo, c.idade, c.uniao].join('|'), c.peso)
    add(['BR', c.sexo, c.idade, c.uniao].join('|'), c.peso)
  }
  const fromMicro = (place: string, sex: string, age: string, union: string) =>
    micro.get([place, sex, age, union].join('|')) ?? 0

  let maxDifferenceBrazil = 0
  let maxDifferenceState = 0
  const publishedBy = new Map(
    published.marital.map((c) => [
      [c.place, c.sex, c.age, c.union].join('|'),
      c.people,
    ]),
  )

  for (const c of published.marital) {
    if (c.place === 'BR') {
      const m = fromMicro(c.place, c.sex, c.age, c.union)
      const difference = (m - c.people) / c.people
      maxDifferenceBrazil = Math.max(maxDifferenceBrazil, Math.abs(difference))
      if (Math.abs(difference) > BRAZIL_TOLERANCE)
        failures.push(
          `BR ${c.sex} ${c.age} ${unionLabel[c.union]}: the microdata gives ${integer.format(m)} and SIDRA publishes ${integer.format(c.people)} (${signed(difference)}%)`,
        )
    } else if (c.union === 'nao') {
      const yes = publishedBy.get([c.place, c.sex, c.age, 'sim'].join('|')) ?? 0
      const pSidra = c.people / (c.people + yes)
      const mNo = fromMicro(c.place, c.sex, c.age, 'nao')
      const mTotal = mNo + fromMicro(c.place, c.sex, c.age, 'sim')
      const pMicro = mTotal > 0 ? mNo / mTotal : 0
      const difference = Math.abs(pMicro - pSidra)
      maxDifferenceState = Math.max(maxDifferenceState, difference)
      if (difference > STATE_TOLERANCE)
        failures.push(
          `${c.place} ${c.sex} ${c.age}: not living in a union ${oneDecimal.format(pMicro * 100)}% in the microdata and ${oneDecimal.format(pSidra * 100)}% in SIDRA (${oneDecimal.format(difference * 100)} points)`,
        )
    }
  }

  return {
    failures,
    checkedCells: published.marital.length,
    maxDifferenceBrazil,
    maxDifferenceState,
  }
}

export interface PublishedPns {
  readonly sex: 'homem' | 'mulher'
  readonly category: string
  /** In %, one decimal place, as in the table. */
  readonly percent: number
}

/**
 * PNS 2019, Table 1.1.1 ("Distribuição das pessoas de 18 anos ou mais de
 * idade, por sexo [...] segundo a orientação sexual - Brasil - 2019"), from
 * the file `PNS_2019_Orientacao_Sexual_Autoidentificada_xls.zip` on IBGE's FTP.
 */
export const TABLE_1_1_1: ReadonlyArray<PublishedPns> = [
  { sex: 'homem', category: 'heterossexual', percent: 94.7 },
  { sex: 'homem', category: 'bissexual', percent: 0.5 },
  { sex: 'homem', category: 'homossexual', percent: 1.4 },
  { sex: 'homem', category: 'outra', percent: 0.0 },
  { sex: 'homem', category: 'nao-sabe', percent: 1.1 },
  { sex: 'homem', category: 'recusou', percent: 2.3 },
  { sex: 'mulher', category: 'heterossexual', percent: 94.8 },
  { sex: 'mulher', category: 'bissexual', percent: 0.8 },
  { sex: 'mulher', category: 'homossexual', percent: 0.9 },
  { sex: 'mulher', category: 'outra', percent: 0.1 },
  { sex: 'mulher', category: 'nao-sabe', percent: 1.1 },
  { sex: 'mulher', category: 'recusou', percent: 2.3 },
]

/** Adults' sexual orientation, by sex, must give the published table. */
export function crossCheckPns(
  records: ReadonlyArray<PnsRecord>,
  table: ReadonlyArray<PublishedPns> = TABLE_1_1_1,
): string[] {
  const failures: string[] = []
  for (const row of table) {
    const domain = records.filter(
      (r) => r.sex === row.sex && r.values.orientacao !== null,
    )
    const { p } = proportion(
      domain,
      (r) => r.values.orientacao === row.category,
    )
    // The table rounds to one decimal: the microdata must land within the same half tenth.
    if (Math.abs(p * 100 - row.percent) > 0.05 + 1e-9)
      failures.push(
        `PNS ${row.sex} ${row.category}: the microdata gives ${oneDecimal.format(p * 100)}% and Table 1.1.1 publishes ${oneDecimal.format(row.percent)}%`,
      )
  }
  return failures
}
