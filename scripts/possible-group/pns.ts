// The PNS 2019 probabilities that the possible group applies on top of the
// Census (#8): sexual orientation (Y008), height (P00404) and smoking (P050),
// by sex × age group, with the 95% interval of the sample design.
//
// The universe is the selected resident aged 18 or more with a completed
// interview (M001 = 1), weighted by V00291. The interval comes from
// linearizing the ratio with stratum (V0024) and PSU (UPA_PNS), the ultimate
// cluster approximation that IBGE uses in the PNS tables.

export type Sex = 'homem' | 'mulher'

export interface PnsRecord {
  readonly stratum: string
  readonly psu: string
  readonly weight: number
  readonly sex: Sex
  readonly age: number
  /** `null` when the question went unanswered for this person. */
  readonly orientation: string | null
  readonly height: number | null
  readonly smoking: string | null
}

/** One CSV row: the keys are the CSV columns. */
export interface PnsRow {
  readonly medida: 'orientacao' | 'altura' | 'fumo'
  readonly sexo: Sex
  readonly idade: string
  readonly categoria: string
  readonly p: number
  readonly p_min: number
  readonly p_max: number
  /** Unweighted records in the denominator. */
  readonly n_registros: number
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

/** Y008, in dictionary order. */
export const ORIENTATIONS = [
  'heterossexual',
  'bissexual',
  'homossexual',
  'outra',
  'nao-sabe',
  'recusou',
] as const
/** P050: daily, less than daily, does not smoke. */
export const SMOKING = ['diario', 'ocasional', 'nao'] as const
export const MIN_HEIGHT = 140
export const MAX_HEIGHT = 200

const ageGroupOf = (age: number) =>
  PNS_AGE_GROUPS.find((g) => age >= g.min && age <= g.max)?.group

interface Question {
  readonly measure: PnsRow['medida']
  readonly categories: ReadonlyArray<string>
  readonly answered: (r: PnsRecord) => boolean
  readonly indicator: (r: PnsRecord, category: string) => boolean
}

const heights = Array.from(
  { length: MAX_HEIGHT - MIN_HEIGHT + 1 },
  (_, i) => `ate-${MIN_HEIGHT + i}`,
)

const QUESTIONS: ReadonlyArray<Question> = [
  {
    measure: 'orientacao',
    categories: ORIENTATIONS,
    answered: (r) => r.orientation !== null,
    indicator: (r, c) => r.orientation === c,
  },
  {
    measure: 'altura',
    categories: heights,
    answered: (r) => r.height !== null,
    indicator: (r, c) => (r.height ?? Infinity) <= Number(c.slice(4)),
  },
  {
    measure: 'fumo',
    categories: SMOKING,
    answered: (r) => r.smoking !== null,
    indicator: (r, c) => r.smoking === c,
  },
]

const Z95 = 1.96

/** The rows of the PNS file, ordered by measure, sex, age group and category. */
export function estimatePns(records: ReadonlyArray<PnsRecord>): PnsRow[] {
  const rows: PnsRow[] = []
  for (const question of QUESTIONS) {
    for (const sex of ['homem', 'mulher'] as const) {
      for (const { group } of PNS_AGE_GROUPS) {
        const domain = records.filter(
          (r) =>
            r.sex === sex &&
            ageGroupOf(r.age) === group &&
            question.answered(r),
        )
        if (domain.length === 0) continue
        for (const category of question.categories) {
          const estimate = proportion(domain, (r) =>
            question.indicator(r, category),
          )
          rows.push({
            medida: question.measure,
            sexo: sex,
            idade: group,
            categoria: category,
            ...estimate,
          })
        }
      }
    }
  }
  return rows
}

/** Its keys are the CSV columns of a `PnsRow`. */
export interface Proportion {
  readonly p: number
  readonly p_min: number
  readonly p_max: number
  readonly n_registros: number
}

/** The weighted proportion of `y` in the domain, with the 95% interval. */
export function proportion(
  domain: ReadonlyArray<PnsRecord>,
  y: (r: PnsRecord) => boolean,
): Proportion {
  const total = domain.reduce((s, r) => s + r.weight, 0)
  const yes = domain.reduce((s, r) => s + (y(r) ? r.weight : 0), 0)
  const p = yes / total
  const error = Z95 * Math.sqrt(variance(domain, total, p, y))
  return {
    p,
    p_min: Math.max(0, p - error),
    p_max: Math.min(1, p + error),
    n_registros: domain.length,
  }
}

/**
 * Variance of the ratio p = Σwy / Σw by linearization: the residual
 * z = w(y − p)/Σw summed per PSU, and the variance between PSUs within each
 * stratum. A stratum with a single PSU in the domain does not contribute.
 */
function variance(
  domain: ReadonlyArray<PnsRecord>,
  total: number,
  p: number,
  y: (r: PnsRecord) => boolean,
): number {
  const byStratum = new Map<string, Map<string, number>>()
  for (const r of domain) {
    const psus = byStratum.get(r.stratum) ?? new Map<string, number>()
    byStratum.set(r.stratum, psus)
    const z = (r.weight * ((y(r) ? 1 : 0) - p)) / total
    psus.set(r.psu, (psus.get(r.psu) ?? 0) + z)
  }
  let v = 0
  for (const psus of byStratum.values()) {
    const n = psus.size
    if (n < 2) continue
    const zs = [...psus.values()]
    const mean = zs.reduce((s, z) => s + z, 0) / n
    v += (n / (n - 1)) * zs.reduce((s, z) => s + (z - mean) ** 2, 0)
  }
  return v
}

/** Positions from `input_PNS_2019.sas` (start column, length), 1-based. */
const POSITIONS = {
  V0024: [3, 7],
  UPA_PNS: [10, 9],
  C006: [108, 1],
  C008: [117, 3],
  M001: [527, 1],
  P00404: [617, 3],
  P050: [711, 1],
  Y008: [1304, 1],
  V00291: [1426, 14],
} as const

const field = (line: string, name: keyof typeof POSITIONS) => {
  const [start, length] = POSITIONS[name]
  return line.slice(start - 1, start - 1 + length).trim()
}

const ORIENTATION_CODES: Readonly<Record<string, string>> = Object.fromEntries(
  ORIENTATIONS.map((o, i) => [String(i + 1), o]),
)
const SMOKING_CODES: Readonly<Record<string, string>> = {
  '1': 'diario',
  '2': 'ocasional',
  '3': 'nao',
}

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
  const height = Number(field(line, 'P00404'))
  return {
    stratum: field(line, 'V0024'),
    psu: field(line, 'UPA_PNS'),
    weight,
    sex,
    age,
    orientation: ORIENTATION_CODES[field(line, 'Y008')] ?? null,
    height: height > 0 && height < 999 ? height : null,
    smoking: SMOKING_CODES[field(line, 'P050')] ?? null,
  }
}

const PNS_COLUMNS = [
  'medida',
  'sexo',
  'idade',
  'categoria',
  'p',
  'p_min',
  'p_max',
  'n_registros',
] as const

export function pnsToCsv(rows: ReadonlyArray<PnsRow>): string {
  const out = [PNS_COLUMNS.join(',')]
  for (const l of rows)
    out.push(
      [
        l.medida,
        l.sexo,
        l.idade,
        l.categoria,
        l.p.toFixed(5),
        l.p_min.toFixed(5),
        l.p_max.toFixed(5),
        l.n_registros,
      ].join(','),
    )
  return out.join('\n') + '\n'
}
