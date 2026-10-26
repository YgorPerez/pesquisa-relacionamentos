// The PNS 2019 cells that the possible group crosses on top of the Census
// (#8, #287): adults grouped by sex × age bracket and their answers to every
// PNS variable (orientation Y008, height P00404, smoking P050…), with the
// weight and the records of each group. Keeping the answers of the same
// person together lets the count cross the PNS Requirements with each other
// instead of multiplying one probability per question.
//
// The universe is the selected resident aged 18 or more with a completed
// interview (M001 = 1), weighted by V00291. The cells carry no stratum or
// PSU, so each sex × bracket carries its design effect: the variance of the
// sample design (linearizing the ratio with stratum V0024 and PSU UPA_PNS,
// the ultimate cluster approximation IBGE uses in the PNS tables) over that
// of a simple random sample of the same records. The count widens its
// interval by it.
//
// A new PNS variable is one entry in `PNS_VARIABLES` (and its positions in
// `POSITIONS`): it becomes a CSV column that the rules read without change.

export type Sex = 'homem' | 'mulher'

/** The CSV column of each PNS variable. */
export type PnsColumn = (typeof PNS_VARIABLES)[number]['column']

export interface PnsRecord {
  readonly stratum: string
  readonly psu: string
  readonly weight: number
  readonly sex: Sex
  readonly age: number
  /** The answer as the CSV writes it; `null` when it went unanswered. */
  readonly values: Readonly<Record<PnsColumn, string | null>>
}

/** One CSV row: the keys are the CSV columns. */
export interface PnsCell {
  readonly sexo: Sex
  readonly idade: string
  readonly values: Readonly<Record<PnsColumn, string | null>>
  readonly peso: number
  readonly n_registros: number
  readonly efeito_plano: number
}

/** The PNS age groups. Each 5-year Census group falls into exactly one. */
export const PNS_AGE_GROUPS = [
  { group: '18-24', min: 18, max: 24 },
  { group: '25-29', min: 25, max: 29 },
  { group: '30-34', min: 30, max: 34 },
  { group: '35-39', min: 35, max: 39 },
  { group: '40-49', min: 40, max: 49 },
  { group: '50-59', min: 50, max: 59 },
  { group: '60-69', min: 60, max: 69 },
  { group: '70+', min: 70, max: Infinity },
] as const

/** Positions from `input_PNS_2019.sas` (start column, length), 1-based. */
const POSITIONS = {
  V0024: [3, 7],
  UPA_PNS: [10, 9],
  C006: [108, 1],
  C008: [117, 3],
  M001: [527, 1],
  P00404: [617, 3],
  P027: [662, 1],
  P02801: [663, 1],
  P050: [711, 1],
  Y008: [1304, 1],
  V00291: [1426, 14],
} as const
type Field = keyof typeof POSITIONS

const field = (line: string, name: Field) => {
  const [start, length] = POSITIONS[name]
  return line.slice(start - 1, start - 1 + length).trim()
}

/** The requirements' height range; outside it, a height only needs to fall
 * below or above, so it goes to 139 or 201 and the cells stay few. */
export const MIN_HEIGHT = 140
export const MAX_HEIGHT = 200

/** Y008, in dictionary order. */
const ORIENTATIONS = [
  'heterossexual',
  'bissexual',
  'homossexual',
  'outra',
  'nao-sabe',
  'recusou',
] as const

interface PnsVariable {
  readonly column: string
  /** The dictionary variables it reads, for the `.meta.yaml`. */
  readonly fields: ReadonlyArray<Field>
  readonly read: (line: string) => string | null
  /** Ordered answers (height) count as "up to" each one for the design
   * effect; the others, each answer on its own. */
  readonly ordered: boolean
}

const code =
  (name: Field, values: Readonly<Record<string, string>>) => (line: string) =>
    values[field(line, name)] ?? null

/** The PNS variables, one CSV column each. The answers keep only the detail
 * the Requirements need, so the cells stay few. */
export const PNS_VARIABLES = [
  {
    column: 'orientacao',
    fields: ['Y008'],
    read: code(
      'Y008',
      Object.fromEntries(ORIENTATIONS.map((o, i) => [String(i + 1), o])),
    ),
    ordered: false,
  },
  {
    column: 'altura',
    fields: ['P00404'],
    read: (line) => {
      const cm = Number(field(line, 'P00404'))
      if (!(cm > 0 && cm < 999)) return null
      return String(Math.min(MAX_HEIGHT + 1, Math.max(MIN_HEIGHT - 1, cm)))
    },
    ordered: true,
  },
  {
    // P050: daily, less than daily, does not smoke.
    column: 'fumo',
    fields: ['P050'],
    read: code('P050', { '1': 'diario', '2': 'ocasional', '3': 'nao' }),
    ordered: false,
  },
  {
    // P027: never, under once a month, once a month or more. Only the last
    // are asked P02801, the days a week (0 = under once a week). The doses
    // (P029) and binge (P03201) stay out: the Requirement asks how often.
    column: 'bebida',
    fields: ['P027', 'P02801'],
    read: (line) => {
      const often = field(line, 'P027')
      if (often === '1') return 'nunca'
      if (often === '2') return 'raramente'
      if (often !== '3') return null
      const days = field(line, 'P02801')
      if (days === '0') return 'raramente'
      return /^[1-7]$/.test(days) ? 'semanal' : null
    },
    ordered: false,
  },
] as const satisfies ReadonlyArray<PnsVariable>

/** The dictionary variables the CSV comes from, for the `.meta.yaml`. */
export const PNS_FIELDS: ReadonlyArray<Field> = [
  'V0024',
  'UPA_PNS',
  'V00291',
  'M001',
  'C006',
  'C008',
  ...PNS_VARIABLES.flatMap((v) => v.fields),
]

const ageGroupOf = (age: number) =>
  PNS_AGE_GROUPS.find((g) => age >= g.min && age <= g.max)?.group

/**
 * One line of `PNS_2019.txt` (fixed-width text). Returns `null` for anyone
 * who is not a selected resident aged 18 or more with a completed interview.
 */
export function readPnsRecord(line: string): PnsRecord | null {
  if (field(line, 'M001') !== '1') return null
  const age = Number(field(line, 'C008'))
  if (!(age >= 18)) return null
  const sex =
    field(line, 'C006') === '1'
      ? 'homem'
      : field(line, 'C006') === '2'
        ? 'mulher'
        : null
  const weight = Number(field(line, 'V00291'))
  if (!sex || !(weight > 0)) return null
  return {
    stratum: field(line, 'V0024'),
    psu: field(line, 'UPA_PNS'),
    weight,
    sex,
    age,
    values: Object.fromEntries(
      PNS_VARIABLES.map((v) => [v.column, v.read(line)]),
    ) as PnsRecord['values'],
  }
}

/** The cells, ordered by sex, age group and answers. */
export function pnsCells(records: ReadonlyArray<PnsRecord>): PnsCell[] {
  const cells: PnsCell[] = []
  for (const sex of ['homem', 'mulher'] as const) {
    for (const { group } of PNS_AGE_GROUPS) {
      const domain = records.filter(
        (r) => r.sex === sex && ageGroupOf(r.age) === group,
      )
      if (domain.length === 0) continue
      const effect = designEffect(domain)
      const byAnswers = new Map<string, PnsRecord[]>()
      for (const r of domain) {
        const key = JSON.stringify(PNS_VARIABLES.map((v) => r.values[v.column]))
        const same = byAnswers.get(key) ?? []
        same.push(r)
        byAnswers.set(key, same)
      }
      const groups = [...byAnswers.values()].map((same) => ({
        sexo: sex,
        idade: group,
        values: same[0]!.values,
        peso: same.reduce((s, r) => s + r.weight, 0),
        n_registros: same.length,
        efeito_plano: effect,
      }))
      cells.push(...groups.sort(byAnswersOrder))
    }
  }
  return cells
}

/** No answer first, then the answers in text order. */
function byAnswersOrder(a: PnsCell, b: PnsCell): number {
  for (const { column } of PNS_VARIABLES) {
    const x = a.values[column] ?? ''
    const y = b.values[column] ?? ''
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

/**
 * The design effect of a sex × bracket: the median, over the indicators of
 * every PNS variable that are neither 0 nor 1 in it, of the design variance
 * over the simple random sample variance. Never below 1.
 */
function designEffect(domain: ReadonlyArray<PnsRecord>): number {
  const effects: number[] = []
  for (const v of PNS_VARIABLES) {
    const answered = domain.filter((r) => r.values[v.column] !== null)
    const levels = [...new Set(answered.map((r) => r.values[v.column]!))].sort()
    for (const level of levels) {
      const y = v.ordered
        ? (r: PnsRecord) => Number(r.values[v.column]) <= Number(level)
        : (r: PnsRecord) => r.values[v.column] === level
      const { p, variance } = estimate(answered, y)
      if (p <= 0 || p >= 1) continue
      effects.push(variance / ((p * (1 - p)) / answered.length))
    }
  }
  if (effects.length === 0) return 1
  effects.sort((a, b) => a - b)
  const middle = effects.length / 2
  const median = Number.isInteger(middle)
    ? (effects[middle - 1]! + effects[middle]!) / 2
    : effects[Math.floor(middle)]!
  return Math.max(1, median)
}

/** A weighted proportion with its 95% interval, for the cross-check. */
export interface Proportion {
  readonly p: number
  readonly p_min: number
  readonly p_max: number
  readonly n_registros: number
}

const Z95 = 1.96

/** The weighted proportion of `y` in the domain, with the 95% interval of
 * the sample design. */
export function proportion(
  domain: ReadonlyArray<PnsRecord>,
  y: (r: PnsRecord) => boolean,
): Proportion {
  const { p, variance } = estimate(domain, y)
  const error = Z95 * Math.sqrt(variance)
  return {
    p,
    p_min: Math.max(0, p - error),
    p_max: Math.min(1, p + error),
    n_registros: domain.length,
  }
}

/**
 * The ratio p = Σwy / Σw and its variance by linearization: the residual
 * z = w(y − p)/Σw summed per PSU, and the variance between PSUs within each
 * stratum. A stratum with a single PSU in the domain does not contribute.
 */
function estimate(
  domain: ReadonlyArray<PnsRecord>,
  y: (r: PnsRecord) => boolean,
): { p: number; variance: number } {
  const total = domain.reduce((s, r) => s + r.weight, 0)
  const p = domain.reduce((s, r) => s + (y(r) ? r.weight : 0), 0) / total
  const byStratum = new Map<string, Map<string, number>>()
  for (const r of domain) {
    const psus = byStratum.get(r.stratum) ?? new Map<string, number>()
    byStratum.set(r.stratum, psus)
    const z = (r.weight * ((y(r) ? 1 : 0) - p)) / total
    psus.set(r.psu, (psus.get(r.psu) ?? 0) + z)
  }
  let variance = 0
  for (const psus of byStratum.values()) {
    const n = psus.size
    if (n < 2) continue
    const zs = [...psus.values()]
    const mean = zs.reduce((s, z) => s + z, 0) / n
    variance += (n / (n - 1)) * zs.reduce((s, z) => s + (z - mean) ** 2, 0)
  }
  return { p, variance }
}

const PNS_COLUMNS = [
  'sexo',
  'idade',
  ...PNS_VARIABLES.map((v) => v.column),
  'peso',
  'n_registros',
  'efeito_plano',
]

/** The weight is rounded to the person, as in the Census pack. */
export function pnsToCsv(cells: ReadonlyArray<PnsCell>): string {
  const out = [PNS_COLUMNS.join(',')]
  for (const c of cells)
    out.push(
      [
        c.sexo,
        c.idade,
        ...PNS_VARIABLES.map((v) => c.values[v.column] ?? ''),
        Math.round(c.peso),
        c.n_registros,
        c.efeito_plano.toFixed(3),
      ].join(','),
    )
  return out.join('\n') + '\n'
}
