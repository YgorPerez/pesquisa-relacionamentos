// Marital status by municipality, sex and age group (SIDRA 10185, from age
// 15 up), for the possible group in a municipality (#31).
//
// Proportional adjustment by population (9514) applies the whole state's
// no-union share to the city, and in the city of São Paulo that comes out 10%
// below what IBGE publishes: the capital has more people without a union than
// the interior. Table 10185 publishes union status per municipality, so the
// calculator scales each state cell by the municipality's population in the
// same sex × group × union combination.
import type { MaritalCell } from './cross-check.ts'

export const GROUPS = [
  '15-19',
  '20-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50-54',
  '55-59',
  '60-64',
  '65-69',
  '70-74',
  '75-79',
  '80+',
] as const
const COLUMNS = (['homem', 'mulher'] as const).flatMap((s) =>
  GROUPS.flatMap((g) => [`${s}_${g}_sim`, `${s}_${g}_nao`]),
)

export interface MunicipalityMarital {
  readonly code: string
  readonly name: string
  readonly state: string
  /** People per `sexo_grupo_sim|nao` column. */
  readonly people: ReadonlyMap<string, number>
}

const unionLabel = {
  sim: 'living in a union',
  nao: 'not living in a union',
} as const

/** Table 10185 comes from the sample and each published number is rounded to
 * the person: summed, the municipalities drift from the state by a few people. */
export const MUNICIPALITY_TOLERANCE = { people: 30, relative: 0.001 }

/** Each published state × sex × group × union must be the sum of its municipalities. */
export function crossCheckMunicipalities(
  municipalities: ReadonlyArray<MunicipalityMarital>,
  byState: ReadonlyArray<MaritalCell>,
): string[] {
  const sums = new Map<string, number>()
  for (const m of municipalities)
    for (const [column, people] of m.people)
      sums.set(
        `${m.state}_${column}`,
        (sums.get(`${m.state}_${column}`) ?? 0) + people,
      )
  return byState
    .filter((c) => c.place !== 'BR')
    .flatMap((c) => {
      const sum = sums.get(`${c.place}_${c.sex}_${c.age}_${c.union}`) ?? 0
      const tolerance = Math.max(
        MUNICIPALITY_TOLERANCE.people,
        c.people * MUNICIPALITY_TOLERANCE.relative,
      )
      return Math.abs(sum - c.people) <= tolerance
        ? []
        : [
            `${c.place} ${c.sex} ${c.age} ${unionLabel[c.union]}: municipalities sum to ${sum}, the state publishes ${c.people}`,
          ]
    })
}

export function municipalitiesToCsv(
  municipalities: ReadonlyArray<MunicipalityMarital>,
): string {
  const lines = [...municipalities]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((m) => {
      if (m.name.includes(','))
        throw new Error(`municipality name with a comma: ${m.name}`)
      return [
        m.code,
        m.name,
        m.state,
        ...COLUMNS.map((c) => m.people.get(c) ?? 0),
      ].join(',')
    })
  return (
    [['municipio', 'nome', 'uf', ...COLUMNS].join(','), ...lines].join('\n') +
    '\n'
  )
}
