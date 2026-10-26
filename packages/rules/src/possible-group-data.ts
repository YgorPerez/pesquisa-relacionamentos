// The possible group data (#36) on its way to the browser.
//
// The Census CSV is 119 MB, but it is the whole of Brazil in 1.6 million
// cells. The build cuts it into packs per place: Brazil's (the states
// summed) and one per state, with its municipalities. Each place has a
// default pack, with parents, work and home summed out (Brazil: 44 thousand
// cells, 0.24 MB gzipped), and a detail pack with them (238 thousand cells,
// 1.1 MB gzipped), downloaded only when one of those Requirements is on. The
// browser downloads Brazil's and, if the visitor picks a state, that one too.
// Each pack carries the SIDRA 9514 single ages; Brazil's also carries the PNS
// cells, which are national and small (a few thousand).
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

/** The PNS 2019 age brackets. Each Census group falls into exactly one. */
export const PNS_BRACKETS = [
  '18-24',
  '25-29',
  '30-34',
  '35-39',
  '40-49',
  '50-59',
  '60-69',
  '70+',
] as const

/** Columns of the PNS CSV that are not a variable. */
const PNS_FIXED_COLUMNS = [
  'sexo',
  'idade',
  'peso',
  'n_registros',
  'efeito_plano',
] as const

/**
 * The PNS 2019 cells: adults grouped by sex, age bracket and the answer to
 * each PNS variable (orientation, height, smoking…), with their weight and
 * records. Keeping the persons' answers together, instead of one probability
 * per question, is what lets the count cross the PNS Requirements on the
 * same person (#287). Columns, one position per cell.
 */
export interface Pns {
  readonly sex: ReadonlyArray<number>
  /** Position in `PNS_BRACKETS`. */
  readonly bracket: ReadonlyArray<number>
  /** One per CSV variable column, by its name (`orientacao`, `altura`…). The
   * code is 0 for no answer and i + 1 for `levels[i]`. */
  readonly variables: Readonly<
    Record<
      string,
      {
        readonly levels: ReadonlyArray<string>
        readonly codes: ReadonlyArray<number>
      }
    >
  >
  readonly weight: ReadonlyArray<number>
  readonly records: ReadonlyArray<number>
  /** The design effect of the sex × bracket, in `sex * PNS_BRACKETS.length +
   * bracket` order: how much the PNS sample design widens the variance
   * relative to a simple random sample of the same records. */
  readonly designEffect: ReadonlyArray<number>
}

/** A row of the PNAD CSV (office occupation, #294): [p, p_min, p_max], by
 * the key `universo|sexo|idade|escolaridade`, with the Census age group and
 * `escolaridade` empty for every education together. */
export type Pnad = Readonly<Record<string, readonly [number, number, number]>>

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
  readonly pnad: Pnad
}

// --- cell code -------------------------------------------------------------
// Each dimension becomes an index. In an optional one, "no data" (an empty
// CSV value) is 0 and the list's value i is i + 1; sex, age group and union
// always have a value, and value i is i.
const NO_YES = ['nao', 'sim'] as const

/** The Census CSV's dimensions, in the order of the cell code. */
const DIMENSIONS = [
  { key: 'sex', column: 'sexo', values: SEXES, optional: false },
  { key: 'ageGroup', column: 'idade', values: AGE_GROUPS, optional: false },
  { key: 'union', column: 'uniao', values: NO_YES, optional: false },
  {
    key: 'education',
    column: 'escolaridade',
    values: EDUCATIONS,
    optional: true,
  },
  { key: 'income', column: 'renda', values: INCOMES, optional: true },
  { key: 'color', column: 'cor', values: COLORS, optional: true },
  { key: 'religion', column: 'religiao', values: RELIGIONS, optional: true },
  /** Women only: 1 = has none, 2 = has. */
  { key: 'children', column: 'filhos', values: NO_YES, optional: true },
  // From here on, the detail dimensions (see `DETAIL_DIMENSIONS`).
  /** 1 = lives with neither parent, 2 = with the mother, the father or a
   * step-parent. */
  { key: 'parents', column: 'pais', values: NO_YES, optional: true },
  /** 0 = not employed, 1 = employed, 2 = employer or self-employed. */
  {
    key: 'work',
    column: 'trabalho',
    values: ['nao', 'sim', 'negocio'],
    optional: false,
  },
  /** 0 = no data (collective household), 1 = does not own, 2 = owns. */
  { key: 'home', column: 'casa', values: NO_YES, optional: true },
] as const
type Dimension = (typeof DIMENSIONS)[number]['key']

const RADICES = DIMENSIONS.map((d) => d.values.length + (d.optional ? 1 : 0))

/** The last dimensions (parents, work, home) only travel in the detail
 * pack: they multiply the cells by 4 to 5, and only three Requirements read
 * them. The default pack sums them out. */
const DETAIL_DIMENSIONS = 3
const DEFAULT_DIMENSIONS = DIMENSIONS.length - DETAIL_DIMENSIONS
/** A full code divided by this is the code without the detail dimensions. */
const DETAIL_SPAN = RADICES.slice(DEFAULT_DIMENSIONS).reduce((a, b) => a * b)

function encode(parts: ReadonlyArray<number>): number {
  let code = 0
  for (let i = 0; i < RADICES.length; i++) code = code * RADICES[i]! + parts[i]!
  return code
}

/** Decodes the first `dimensions` parts; the rest stay 0. */
function decode(code: number, out: number[], dimensions: number): void {
  out.fill(0, dimensions, RADICES.length)
  for (let i = dimensions - 1; i >= 0; i--) {
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
  const uf = col('uf')
  const weight = col('peso')
  const records = col('n_registros')
  const dimensions = DIMENSIONS.map((d) => ({ ...d, at: col(d.column) }))
  return rows.map((l) => ({
    uf: l[uf] ?? '',
    code: encode(
      dimensions.map((d) =>
        d.optional
          ? optionalIndex(d.values, l[d.at], d.key)
          : indexOrThrow(d.values, l[d.at], d.key),
      ),
    ),
    weight: Number(l[weight]),
    records: Number(l[records]),
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

/** Every column that is not in `PNS_FIXED_COLUMNS` is a variable: a new PNS
 * Requirement only adds a column to the CSV. "" is no answer. */
function readPns(text: string): Pns {
  const { header, rows } = csvLines(text)
  const col = (name: string) => indexOrThrow(header, name, 'column')
  const names = header.filter(
    (h) => !(PNS_FIXED_COLUMNS as ReadonlyArray<string>).includes(h),
  )
  const variables = Object.fromEntries(
    names.map((name) => {
      const c = col(name)
      const levels = [
        ...new Set(rows.map((l) => l[c] ?? '').filter((v) => v !== '')),
      ].sort()
      const codes = rows.map((l) => optionalIndex(levels, l[c], name))
      return [name, { levels, codes }]
    }),
  )
  const sex = col('sexo')
  const bracket = col('idade')
  const effect = col('efeito_plano')
  const designEffect = Array<number>(SEXES.length * PNS_BRACKETS.length).fill(1)
  const positions = rows.map((l) => {
    const s = indexOrThrow(SEXES, l[sex], 'sex')
    const b = indexOrThrow(PNS_BRACKETS, l[bracket], 'PNS bracket')
    designEffect[s * PNS_BRACKETS.length + b] = Number(l[effect])
    return [s, b] as const
  })
  return {
    sex: positions.map(([s]) => s),
    bracket: positions.map(([, b]) => b),
    variables,
    weight: rows.map((l) => Number(l[col('peso')])),
    records: rows.map((l) => Number(l[col('n_registros')])),
    designEffect,
  }
}

function readPnad(text: string): Pnad {
  const { rows } = csvLines(text)
  return Object.fromEntries(
    rows.map(([universe, sex, ageGroup, education, p, min, max]) => [
      `${universe}|${sex}|${ageGroup}|${education}`,
      [Number(p), Number(min), Number(max)] as const,
    ]),
  )
}

/** The files of `data/possible-group/`, as text. */
export interface GroupFiles {
  /** `censo-2022.csv.gz`, already gunzipped */
  readonly census: string
  /** `sidra-9514-idade.csv` */
  readonly ages: string
  /** `sidra-10185-municipios.csv` */
  readonly municipalities: string
  /** `pns-2019.csv` */
  readonly pns: string
  /** `pnad-2022.csv` */
  readonly pnad: string
}

export function readGroupBase(files: GroupFiles): GroupBase {
  return {
    census: readCensus(files.census),
    ages: readAges(files.ages),
    municipalities: readMunicipalities(files.municipalities),
    pns: readPns(files.pns),
    pnad: readPnad(files.pnad),
  }
}

// --- pack ------------------------------------------------------------------

export type PackPlace = 'BR' | StateCode

/** The pack's file under the version folder: `SP.json`, `SP-detalhe.json`
 * (a public URL, so in Portuguese). */
export const packFile = (place: PackPlace, detail: boolean): string =>
  `${place}${detail ? '-detalhe' : ''}.json`

/** Goes up when the cell code changes. */
const PACK_VERSION = 4

/** What the browser downloads for a place. Only numbers and texts, in
 * columns. The build writes it under a path hashed from its content, so a
 * new format never meets an old page. */
export interface Pack {
  readonly version: typeof PACK_VERSION
  readonly place: PackPlace
  /** The cells carry the detail dimensions (parents, work, home); without
   * them they are summed out. */
  readonly detail: boolean
  readonly cells: ReadonlyArray<number>
  readonly weights: ReadonlyArray<number>
  readonly records: ReadonlyArray<number>
  readonly ages: AgesBySex
  /** `[code, name, ...people]` of each municipality in the state. */
  readonly municipalities: ReadonlyArray<ReadonlyArray<string | number>>
  /** The PNS is national: only Brazil's packs (default and detail), one of
   * which the page always downloads, carry it. */
  readonly pns: Pns | null
  readonly pnad: Pnad
}

/** A place's pack: for Brazil, the states' cells summed; without `detail`,
 * the cells that differ only in parents, work or home summed too. The weight
 * is rounded to the person, which is what the count shows. */
export function packForPlace(
  base: GroupBase,
  place: PackPlace,
  { detail = false } = {},
): Pack {
  const sums = new Map<number, { weight: number; records: number }>()
  for (const row of base.census) {
    if (place !== 'BR' && row.uf !== place) continue
    const code = detail ? row.code : Math.floor(row.code / DETAIL_SPAN)
    const current = sums.get(code) ?? { weight: 0, records: 0 }
    current.weight += row.weight
    current.records += row.records
    sums.set(code, current)
  }
  const codes = [...sums.keys()].sort((a, b) => a - b)
  const ages = base.ages.get(place)
  if (!ages) throw new Error(`no SIDRA 9514 single ages for ${place}`)
  return {
    version: PACK_VERSION,
    place,
    detail,
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
    pns: place === 'BR' ? base.pns : null,
    pnad: base.pnad,
  }
}

/** A place opened for the count: one typed column per dimension (see
 * `DIMENSIONS`: in an optional one, 0 = no data and i + 1 = position i of the
 * list). Without `detail`, parents, work and home are all 0 and mean
 * nothing. */
export type PlaceData = { readonly [K in Dimension]: Uint8Array } & {
  readonly place: PackPlace
  readonly detail: boolean
  readonly size: number
  readonly weight: Float64Array
  readonly records: Float64Array
  readonly ages: AgesBySex
  readonly municipalities: ReadonlyMap<string, Municipality>
  /** Only in Brazil's. */
  readonly pns: Pns | null
  readonly pnad: Pnad
}

/** A pack of the version this code reads. */
function isPack(value: unknown): value is Pack {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === PACK_VERSION &&
    'detail' in value &&
    typeof value.detail === 'boolean' &&
    'cells' in value &&
    Array.isArray(value.cells)
  )
}

/** Opens a pack (which came from the network or the disk, as JSON: it checks
 * the format first). */
export function openPack(pack: unknown): PlaceData {
  if (!isPack(pack)) throw new Error('possible group pack in an unknown format')
  const n = pack.cells.length
  const columns = DIMENSIONS.map(() => new Uint8Array(n))
  const parts: number[] = Array(RADICES.length).fill(0)
  const dimensions = pack.detail ? RADICES.length : DEFAULT_DIMENSIONS
  for (let i = 0; i < n; i++) {
    decode(pack.cells[i]!, parts, dimensions)
    for (let d = 0; d < columns.length; d++) columns[d]![i] = parts[d]!
  }
  const uf = pack.place === 'BR' ? undefined : pack.place
  return {
    ...(Object.fromEntries(
      DIMENSIONS.map((d, i) => [d.key, columns[i]!]),
    ) as Record<Dimension, Uint8Array>),
    place: pack.place,
    detail: pack.detail,
    size: n,
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
    pnad: pack.pnad,
  }
}
