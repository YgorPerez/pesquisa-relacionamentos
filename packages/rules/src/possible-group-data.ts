// The possible group data (#36) on its way to the browser.
//
// The Census CSV is 31 MB, but it is the whole of Brazil in 490 thousand
// cells. The build cuts it into one pack per place: Brazil's (the states
// summed, ~44 thousand cells) and one per state, with its municipalities. The
// browser downloads Brazil's and, if the visitor picks a state, that one too.
// Each pack carries the SIDRA 9514 single ages and the PNS probabilities,
// which are small.
//
// Build side: `readGroupBase` (the CSVs) → `packForPlace` (JSON).
// Browser side: `openPack` (JSON → typed columns for the count).
//
// The CSV columns and values are the data contract and stay in Portuguese.
import {
  COLORS,
  EDUCATIONS,
  RELIGIONS,
  INCOMES,
  STATES,
  type StateCode,
} from './requirements.ts'

export const SEXES = ['homem', 'mulher'] as const
export type Sex = (typeof SEXES)[number]

/** The microdata's 5-year age groups, from 15. */
export const AGE_GROUPS = [
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

/** SIDRA 9514 single ages: 15 to 99 and "100+" (position 85). */
export const SINGLE_AGES = 86

/** A row of the PNS CSV: [p, p_min, p_max], by the key
 * `medida|sexo|faixa|categoria`. */
export type Pns = Readonly<Record<string, readonly [number, number, number]>>

export interface Municipality {
  readonly code: string
  readonly name: string
  readonly uf: StateCode
  /** SIDRA 10185: people by sex × age group × union, in `unionIndex` order. */
  readonly people: ReadonlyArray<number>
}

/** The position of sex × age group × union (1 = lives in a union) in the
 * per-cell tables. */
export const unionIndex = (sex: number, ageGroup: number, union: number) =>
  (sex * AGE_GROUPS.length + ageGroup) * 2 + union
export const UNION_CELLS = SEXES.length * AGE_GROUPS.length * 2

interface CensusRow {
  readonly uf: string
  /** The cell's code (see `encode`). */
  readonly code: number
  readonly weight: number
  readonly records: number
}

/** People by single age, for men and women. The keys are the `SEXES` values. */
export interface AgesBySex {
  readonly homem: ReadonlyArray<number>
  readonly mulher: ReadonlyArray<number>
}

export interface GroupBase {
  readonly census: ReadonlyArray<CensusRow>
  readonly ages: ReadonlyMap<string, AgesBySex>
  readonly municipalities: ReadonlyArray<Municipality>
  readonly pns: Pns
}

// --- cell code -------------------------------------------------------------
// Each dimension becomes an index; "no data" is 0 and the list's value i is
// i + 1. Sex, age group and union have no "no data".
const RADICES = [
  2,
  AGE_GROUPS.length,
  2,
  EDUCATIONS.length + 1,
  INCOMES.length + 1,
  COLORS.length + 1,
  RELIGIONS.length + 1,
  3,
] as const

function encode(parts: ReadonlyArray<number>): number {
  let code = 0
  for (let i = 0; i < RADICES.length; i++) code = code * RADICES[i]! + parts[i]!
  return code
}

function decode(code: number, out: number[]): void {
  for (let i = RADICES.length - 1; i >= 0; i--) {
    out[i] = code % RADICES[i]!
    code = Math.floor(code / RADICES[i]!)
  }
}

// --- reading the CSVs ------------------------------------------------------

function csvLines(text: string): { header: string[]; rows: string[][] } {
  const [first = '', ...rest] = text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
  return {
    header: first.split(','),
    rows: rest.map((l) => l.split(',')),
  }
}

function indexOrThrow(
  list: ReadonlyArray<string>,
  value: string | undefined,
  name: string,
): number {
  const i = list.indexOf(value ?? '')
  if (i < 0) throw new Error(`unknown ${name} in the CSV: "${value}"`)
  return i
}

/** "" is no data (0); a value from the list is its position + 1. */
function optionalIndex(
  list: ReadonlyArray<string>,
  value: string | undefined,
  name: string,
): number {
  return value === '' || value === undefined
    ? 0
    : indexOrThrow(list, value, name) + 1
}

function readCensus(text: string): CensusRow[] {
  const { header, rows } = csvLines(text)
  const col = (name: string) => indexOrThrow(header, name, 'column')
  const c = {
    sex: col('sexo'),
    age: col('idade'),
    uf: col('uf'),
    union: col('uniao'),
    education: col('escolaridade'),
    income: col('renda'),
    color: col('cor'),
    religion: col('religiao'),
    children: col('filhos'),
    weight: col('peso'),
    records: col('n_registros'),
  }
  return rows.map((l) => ({
    uf: l[c.uf] ?? '',
    code: encode([
      indexOrThrow(SEXES, l[c.sex], 'sex'),
      indexOrThrow(AGE_GROUPS, l[c.age], 'age group'),
      indexOrThrow(['nao', 'sim'], l[c.union], 'union'),
      optionalIndex(EDUCATIONS, l[c.education], 'education'),
      optionalIndex(INCOMES, l[c.income], 'income'),
      optionalIndex(COLORS, l[c.color], 'color'),
      optionalIndex(RELIGIONS, l[c.religion], 'religion'),
      optionalIndex(['nao', 'sim'], l[c.children], 'children'),
    ]),
    weight: Number(l[c.weight]),
    records: Number(l[c.records]),
  }))
}

function readAges(text: string): Map<string, AgesBySex> {
  const { rows } = csvLines(text)
  const byPlace = new Map<string, { homem: number[]; mulher: number[] }>()
  for (const [place = '', sex = '', age = '', people = '0'] of rows) {
    const current = byPlace.get(place) ?? {
      homem: Array(SINGLE_AGES).fill(0),
      mulher: Array(SINGLE_AGES).fill(0),
    }
    byPlace.set(place, current)
    const position = age === '100+' ? SINGLE_AGES - 1 : Number(age) - 15
    current[SEXES[indexOrThrow(SEXES, sex, 'sex')]!][position] = Number(people)
  }
  return byPlace
}

function readMunicipalities(text: string): Municipality[] {
  const { header, rows } = csvLines(text)
  const positions = header.map((name) => {
    const [sex, ageGroup, union] = name.split('_')
    const s = SEXES.indexOf(sex as Sex)
    const g = AGE_GROUPS.indexOf(ageGroup as (typeof AGE_GROUPS)[number])
    const u = ['nao', 'sim'].indexOf(union ?? '')
    return s < 0 || g < 0 || u < 0 ? -1 : unionIndex(s, g, u)
  })
  return rows.map((l) => {
    const people = Array<number>(UNION_CELLS).fill(0)
    l.forEach((value, i) => {
      const p = positions[i]!
      if (p >= 0) people[p] = Number(value)
    })
    const state = STATES.find((u) => u.abbr === l[2])
    if (!state)
      throw new Error(`unknown state in the municipalities CSV: "${l[2]}"`)
    return { code: l[0] ?? '', name: l[1] ?? '', uf: state.abbr, people }
  })
}

function readPns(text: string): Pns {
  const { rows } = csvLines(text)
  return Object.fromEntries(
    rows.map(([measure, sex, bracket, category, p, min, max]) => [
      `${measure}|${sex}|${bracket}|${category}`,
      [Number(p), Number(min), Number(max)] as const,
    ]),
  )
}

/** The files of `dados/grupo-possivel/`, as text. */
export interface GroupFiles {
  /** `censo-2022.csv` */
  readonly census: string
  /** `sidra-9514-idade.csv` */
  readonly ages: string
  /** `sidra-10185-municipios.csv` */
  readonly municipalities: string
  /** `pns-2019.csv` */
  readonly pns: string
}

export function readGroupBase(files: GroupFiles): GroupBase {
  return {
    census: readCensus(files.census),
    ages: readAges(files.ages),
    municipalities: readMunicipalities(files.municipalities),
    pns: readPns(files.pns),
  }
}

// --- pack ------------------------------------------------------------------

export type PackPlace = 'BR' | StateCode

/** What the browser downloads for a place. Only numbers and texts, in
 * columns. The build writes it under a path hashed from its content, so a
 * new format never meets an old page. */
export interface Pack {
  readonly version: 1
  readonly place: PackPlace
  readonly cells: ReadonlyArray<number>
  readonly weights: ReadonlyArray<number>
  readonly records: ReadonlyArray<number>
  readonly ages: AgesBySex
  /** `[code, name, ...people]` of each municipality in the state. */
  readonly municipalities: ReadonlyArray<ReadonlyArray<string | number>>
  readonly pns: Pns
}

/** A place's pack: for Brazil, the states' cells summed. The weight is
 * rounded to the person, which is what the count shows. */
export function packForPlace(base: GroupBase, place: PackPlace): Pack {
  const sums = new Map<number, { weight: number; records: number }>()
  for (const row of base.census) {
    if (place !== 'BR' && row.uf !== place) continue
    const current = sums.get(row.code) ?? { weight: 0, records: 0 }
    current.weight += row.weight
    current.records += row.records
    sums.set(row.code, current)
  }
  const codes = [...sums.keys()].sort((a, b) => a - b)
  const ages = base.ages.get(place)
  if (!ages) throw new Error(`no SIDRA 9514 single ages for ${place}`)
  return {
    version: 1,
    place,
    cells: codes,
    weights: codes.map((c) => Math.round(sums.get(c)!.weight)),
    records: codes.map((c) => sums.get(c)!.records),
    ages,
    municipalities:
      place === 'BR'
        ? []
        : base.municipalities
            .filter((m) => m.uf === place)
            .map((m) => [m.code, m.name, ...m.people]),
    pns: base.pns,
  }
}

/** A place opened for the count: one typed column per dimension. */
export interface PlaceData {
  readonly place: PackPlace
  readonly size: number
  readonly sex: Uint8Array
  readonly ageGroup: Uint8Array
  readonly union: Uint8Array
  /** 0 = no data; i + 1 = position i of the list (EDUCATIONS, INCOMES…). */
  readonly education: Uint8Array
  readonly income: Uint8Array
  readonly color: Uint8Array
  readonly religion: Uint8Array
  /** 0 = no data (men), 1 = has none, 2 = has. */
  readonly children: Uint8Array
  readonly weight: Float64Array
  readonly records: Float64Array
  readonly ages: AgesBySex
  readonly municipalities: ReadonlyMap<string, Municipality>
  readonly pns: Pns
}

/** A pack of the version this code reads. */
function isPack(value: unknown): value is Pack {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === 1 &&
    'cells' in value &&
    Array.isArray(value.cells)
  )
}

/** Opens a pack (which came from the network or the disk, as JSON: it checks
 * the format first). */
export function openPack(pack: unknown): PlaceData {
  if (!isPack(pack)) throw new Error('possible group pack in an unknown format')
  const n = pack.cells.length
  const columns = Array.from(
    { length: RADICES.length },
    () => new Uint8Array(n),
  )
  const parts: number[] = []
  for (let i = 0; i < n; i++) {
    decode(pack.cells[i]!, parts)
    for (let d = 0; d < RADICES.length; d++) columns[d]![i] = parts[d]!
  }
  const [sex, ageGroup, union, education, income, color, religion, children] =
    columns as [
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
    ]
  const uf = pack.place === 'BR' ? undefined : pack.place
  return {
    place: pack.place,
    size: n,
    sex,
    ageGroup,
    union,
    education,
    income,
    color,
    religion,
    children,
    weight: Float64Array.from(pack.weights),
    records: Float64Array.from(pack.records),
    ages: pack.ages,
    municipalities: new Map(
      uf
        ? pack.municipalities.map(([code, name, ...people]) => [
            String(code),
            {
              code: String(code),
              name: String(name),
              uf,
              people: people.map(Number),
            },
          ])
        : [],
    ),
    pns: pack.pns,
  }
}
