// The aggregator for the 2022 Census sample microdata (public access): reads
// the lines of `Pessoas_<UF>_publico.csv` and returns the long, sparse CSV of
// the possible group (#10, #8), one line per non-empty combination with the
// sum of the weights and the number of records. The codes come from the
// "Dicionário de Variáveis - Microdados CD2022"; empty means IBGE does not
// have the data.

/** Minimum wage in July 2022, the Census reference date. */
export const MINIMUM_WAGE_2022 = 1212

export const STATE_CODES: Readonly<Record<string, string>> = {
  '11': 'RO',
  '12': 'AC',
  '13': 'AM',
  '14': 'RR',
  '15': 'PA',
  '16': 'AP',
  '17': 'TO',
  '21': 'MA',
  '22': 'PI',
  '23': 'CE',
  '24': 'RN',
  '25': 'PB',
  '26': 'PE',
  '27': 'AL',
  '28': 'SE',
  '29': 'BA',
  '31': 'MG',
  '32': 'ES',
  '33': 'RJ',
  '35': 'SP',
  '41': 'PR',
  '42': 'SC',
  '43': 'RS',
  '50': 'MS',
  '51': 'MT',
  '52': 'GO',
  '53': 'DF',
}

/** P0180 (5-year groups, public version), from age 15 up. */
export const AGE_GROUPS: Readonly<Record<string, string>> = {
  '04': '15-19',
  '05': '20-24',
  '06': '25-29',
  '07': '30-34',
  '08': '35-39',
  '09': '40-44',
  '10': '45-49',
  '11': '50-54',
  '12': '55-59',
  '13': '60-64',
  '14': '65-69',
  '15': '70-74',
  '16': '75-79',
  '17': '80+',
}
const UNDER_15 = new Set(['01', '02', '03'])

const SEX: Readonly<Record<string, string>> = { '1': 'homem', '2': 'mulher' }
/** P0280: 1 lives with a spouse; 2 has lived with one; 3 never has. */
const UNION: Readonly<Record<string, string>> = {
  '1': 'sim',
  '2': 'nao',
  '3': 'nao',
}
/** P0760 grouped into the steps of the "minimum education" Requirement. */
const EDUCATION: Readonly<Record<string, string>> = {
  '1': 'sem-fundamental',
  '2': 'sem-fundamental',
  '3': 'fundamental',
  '4': 'fundamental',
  '5': 'medio',
  '6': 'medio',
  '7': 'superior',
}
const RACE: Readonly<Record<string, string>> = {
  '1': 'branca',
  '2': 'preta',
  '3': 'amarela',
  '4': 'parda',
  '5': 'indigena',
}
/** P0410 (9 groups). 8 and 9 (does not know, not declared) get no data. */
const RELIGION: Readonly<Record<string, string>> = {
  '1': 'catolica',
  '2': 'evangelica',
  '3': 'espirita',
  '4': 'umbanda-candomble',
  '5': 'outra',
  '6': 'outra',
  '7': 'sem-religiao',
}

export const COLUMNS = [
  'sexo',
  'idade',
  'uf',
  'uniao',
  'escolaridade',
  'renda',
  'cor',
  'religiao',
  'filhos',
  'pais',
  'trabalho',
  'casa',
] as const
export type Column = (typeof COLUMNS)[number]

/** One CSV row: the keys are the CSV columns. */
export type Cell = { readonly [K in Column]: string } & {
  readonly peso: number
  readonly n_registros: number
}

export interface Discard {
  readonly records: number
  readonly weight: number
}

export interface Aggregate {
  /** In column order, so the CSV always comes out the same. */
  readonly cells: ReadonlyArray<Cell>
  /** The sum of all weights per state, discarded ones included. */
  readonly totalWeight: Readonly<Record<string, number>>
  readonly discarded: {
    readonly under15: Discard
    readonly sexOrAgeSuppressed: Discard
  }
  /** Records (aged 15 or more) whose household the households file lacks. */
  readonly withoutHousehold: number
}

const READ = [
  'P0020',
  'P0110',
  'P0150',
  'P0180',
  'P0210',
  'P0280',
  'P0340',
  'P0410',
  'P0760',
  'P1110',
  'P0300',
  'P0310',
  'P0950',
  'P0990',
  'P0100',
  'P0170',
] as const

/** P1110, income from all sources, in minimum-wage bands. */
function incomeBand(value: string): string {
  const reais = value === '' ? 0 : Number(value)
  if (!(reais > 0)) return 'sem-renda'
  const mw = reais / MINIMUM_WAGE_2022
  if (mw <= 1) return 'ate-1'
  if (mw <= 2) return '1-2'
  if (mw <= 5) return '2-5'
  return '5+'
}

/** P0340 only exists for women aged 12 or more. */
function children(sex: string, value: string): string {
  if (sex !== 'mulher' || value === '') return ''
  return Number(value) > 0 ? 'sim' : 'nao'
}

/** P0300 (mother or stepmother) and P0310 (father or stepfather) live in the
 * person's household: 1 yes, 2 no. Either one is "sim", whoever's house it
 * is. */
function livesWithParents(mother: string, father: string): string {
  if (mother === '1' || father === '1') return 'sim'
  return mother === '2' && father === '2' ? 'nao' : ''
}

/** P0950: 1 employed in the reference week (25 to 31 July 2022), 0
 * unemployed, blank outside the labor force. P0990 07 (employer) and 08
 * (self-employed) are "negocio"; any other employed person is "sim". */
function work(employed: string, position: string): string {
  if (employed !== '1') return 'nao'
  return position === '07' || position === '08' ? 'negocio' : 'sim'
}

/** P0170 01 is the household head; 02 and 03 the head's spouse. */
const HEAD_OR_SPOUSE = new Set(['01', '02', '03'])

/** The household's D0190 (1 owned and paid, 2 owned and still paying, 3 to 7
 * rented, lent or other; blank in a collective household) and the person's
 * P0170. The home is "of some resident", so it counts as the person's only
 * when they head the household or are the head's spouse: whoever lives in
 * the parents' own house is "nao". */
function ownsHome(tenure: string | undefined, condition: string): string {
  if (!tenure) return ''
  return (tenure === '1' || tenure === '2') && HEAD_OR_SPOUSE.has(condition)
    ? 'sim'
    : 'nao'
}

/**
 * Reads the lines of one or more households files
 * (`Domicilios_<UF>_publico.csv`, each with its header) into D0190 by the
 * household's control number (D0100, the person's P0100).
 */
export async function readHouseholds(
  lines: Iterable<string> | AsyncIterable<string>,
): Promise<Map<string, string>> {
  const tenure = new Map<string, string>()
  let control = -1
  let condition = -1
  for await (const line of lines) {
    if (line === '') continue
    const fields = line.split(';')
    if (/^[A-Z]/.test(line)) {
      const names = fields.map((name) => name.trim())
      control = names.indexOf('D0100')
      condition = names.indexOf('D0190')
      if (control < 0 || condition < 0)
        throw new Error(
          'D0100 or D0190 missing from the households file header',
        )
      continue
    }
    if (control < 0)
      throw new Error('the households file must start with its header')
    tenure.set(fields[control] ?? '', fields[condition] ?? '')
  }
  return tenure
}

/**
 * Aggregates the lines of one or more people files. Each file starts with
 * its header; the lines may come from a stream (`readline`). `households`
 * gives each household's D0190 by its control number (`readHouseholds`); the
 * pipeline swaps it state by state, so it only needs `get`.
 */
export async function aggregatePeople(
  lines: Iterable<string> | AsyncIterable<string>,
  households: Pick<ReadonlyMap<string, string>, 'get'> = new Map(),
): Promise<Aggregate> {
  const byKey = new Map<
    string,
    { values: string[]; weight: number; n: number }
  >()
  const totalWeight: Record<string, number> = {}
  const under15 = { records: 0, weight: 0 }
  const suppressed = { records: 0, weight: 0 }
  let withoutHousehold = 0
  let index: Record<(typeof READ)[number], number> | null = null

  for await (const line of lines) {
    if (line === '') continue
    const fields = line.split(';')
    if (/^[A-Z]/.test(line)) {
      const position = new Map(fields.map((name, i) => [name.trim(), i]))
      const next = {} as Record<(typeof READ)[number], number>
      for (const name of READ) {
        const i = position.get(name)
        if (i === undefined)
          throw new Error(`column ${name} missing from the people file header`)
        next[name] = i
      }
      index = next
      continue
    }
    if (!index) throw new Error('the people file must start with its header')
    const field = (name: (typeof READ)[number]) => fields[index![name]] ?? ''

    const state = STATE_CODES[field('P0020')]
    if (!state) throw new Error(`unknown state: ${field('P0020')}`)
    const weight = Number(field('P0110'))
    if (!Number.isFinite(weight))
      throw new Error(`invalid weight: ${field('P0110')}`)
    totalWeight[state] = (totalWeight[state] ?? 0) + weight

    const group = field('P0180')
    if (UNDER_15.has(group)) {
      under15.records++
      under15.weight += weight
      continue
    }
    const sex = SEX[field('P0150')]
    const age = AGE_GROUPS[group]
    if (!sex || !age) {
      suppressed.records++
      suppressed.weight += weight
      continue
    }

    const tenure = households.get(field('P0100'))
    if (tenure === undefined) withoutHousehold++
    const values = [
      sex,
      age,
      state,
      UNION[field('P0280')] ?? '',
      EDUCATION[field('P0760')] ?? '',
      incomeBand(field('P1110')),
      RACE[field('P0210')] ?? '',
      RELIGION[field('P0410')] ?? '',
      children(sex, field('P0340')),
      livesWithParents(field('P0300'), field('P0310')),
      work(field('P0950'), field('P0990')),
      ownsHome(tenure, field('P0170')),
    ]
    const key = values.join('|')
    const cell = byKey.get(key)
    if (cell) {
      cell.weight += weight
      cell.n++
    } else byKey.set(key, { values, weight, n: 1 })
  }

  const cells = [...byKey.values()]
    .sort((a, b) => compare(a.values, b.values))
    .map(({ values, weight, n }) => {
      const cell: Record<string, string | number> = {}
      COLUMNS.forEach((column, i) => (cell[column] = values[i] ?? ''))
      cell.peso = weight
      cell.n_registros = n
      return cell as Cell
    })

  return {
    cells,
    totalWeight,
    discarded: { under15, sexOrAgeSuppressed: suppressed },
    withoutHousehold,
  }
}

function compare(a: ReadonlyArray<string>, b: ReadonlyArray<string>): number {
  for (let i = 0; i < a.length; i++) {
    const x = a[i] ?? ''
    const y = b[i] ?? ''
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

/** The possible group CSV: commas, no quotes (no value has a comma). */
export function cellsToCsv(cells: ReadonlyArray<Cell>): string {
  const lines = [[...COLUMNS, 'peso', 'n_registros'].join(',')]
  for (const c of cells)
    lines.push(
      [...COLUMNS.map((k) => c[k]), c.peso.toFixed(2), c.n_registros].join(','),
    )
  return lines.join('\n') + '\n'
}
