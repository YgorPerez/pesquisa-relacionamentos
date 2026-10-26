// The PNAD Contínua probability that the possible group applies on top of the
// Census for the "trabalha em escritório" Requirement (#294): VD4011 groups 1
// to 4 (managers, professionals, technicians, administrative support), by sex
// × Census age group × education, with the 95% interval of the sample design.
//
// The public Census file has no occupation, so the count multiplies each
// Census cell by this probability in the same sex, age group and education.
// Two universes: everyone in the cell (`todos`) and the employed only
// (`ocupados`), the one to use once the count already requires a job.
//
// Weighted by V1028; the interval linearizes the ratio with stratum (Estrato)
// and PSU (UPA), as the PNS file does.

import type { Sex } from './pns.ts'
import { proportion } from './sample.ts'

export type Education = 'sem-fundamental' | 'fundamental' | 'medio' | 'superior'

export interface PnadRecord {
  readonly stratum: string
  readonly psu: string
  readonly weight: number
  readonly sex: Sex
  readonly age: number
  /** `null` when VD3004 is blank. */
  readonly education: Education | null
  /** VD4011 (1 to 11); `null` for whoever is not employed. */
  readonly occupation: number | null
}

/** One CSV row: the keys are the CSV columns. */
export interface PnadRow {
  readonly universo: 'todos' | 'ocupados'
  readonly sexo: Sex
  readonly idade: string
  /** `''` is every education together, for Census cells without one. */
  readonly escolaridade: Education | ''
  readonly p: number
  readonly p_min: number
  readonly p_max: number
  /** Unweighted records in the denominator. */
  readonly n_registros: number
}

/** VD4011 groups that count as office work (decided on 2026-10-26). */
export const OFFICE_GROUPS: ReadonlySet<number> = new Set([1, 2, 3, 4])

/** The Census age groups. The 15 to 19 one takes only ages 18 and 19, the
 * only ones the count uses. */
export const CENSUS_AGE_GROUPS = [
  { group: '15-19', min: 18, max: 19 },
  ...Array.from({ length: 12 }, (_, i) => {
    const min = 20 + 5 * i
    return { group: `${min}-${min + 4}`, min, max: min + 4 }
  }),
  { group: '80+', min: 80, max: Infinity },
] as const

const EDUCATIONS: ReadonlyArray<Education> = [
  'sem-fundamental',
  'fundamental',
  'medio',
  'superior',
]

/** Below this, an education row's interval is not worth much (the linearized
 * variance collapses with few PSUs): the row stays out and the count uses the
 * all-educations one of the same sex and age group. */
export const MIN_EDUCATION_RECORDS = 30

const isOffice = (r: PnadRecord) =>
  r.occupation !== null && OFFICE_GROUPS.has(r.occupation)

const UNIVERSES: ReadonlyArray<{
  readonly universe: PnadRow['universo']
  readonly in: (r: PnadRecord) => boolean
}> = [
  { universe: 'todos', in: () => true },
  { universe: 'ocupados', in: (r) => r.occupation !== null },
]

/** The rows of the PNAD file, ordered by universe, sex, age group and
 * education (all of them first). */
export function estimatePnad(records: ReadonlyArray<PnadRecord>): PnadRow[] {
  const rows: PnadRow[] = []
  for (const { universe, in: inUniverse } of UNIVERSES)
    for (const sex of ['homem', 'mulher'] as const)
      for (const { group, min, max } of CENSUS_AGE_GROUPS)
        for (const education of ['', ...EDUCATIONS] as const) {
          const domain = records.filter(
            (r) =>
              r.sex === sex &&
              r.age >= min &&
              r.age <= max &&
              (education === '' || r.education === education) &&
              inUniverse(r),
          )
          if (
            domain.length === 0 ||
            (education !== '' && domain.length < MIN_EDUCATION_RECORDS)
          )
            continue
          rows.push({
            universo: universe,
            sexo: sex,
            idade: group,
            escolaridade: education,
            ...proportion(domain, isOffice),
          })
        }
  return rows
}

/** Positions from `input_PNADC_trimestral.sas` (start column, length), 1-based. */
const POSITIONS = {
  UPA: [12, 9],
  Estrato: [21, 7],
  V1028: [50, 15],
  V2007: [95, 1],
  V2009: [104, 3],
  VD3004: [405, 1],
  VD4002: [410, 1],
  VD4011: [421, 2],
} as const

const field = (line: string, name: keyof typeof POSITIONS) => {
  const [start, length] = POSITIONS[name]
  return line.slice(start - 1, start - 1 + length).trim()
}

/** VD3004 grouped like the Census groups P0760 (`census.ts`). */
const EDUCATION: Readonly<Record<string, Education>> = {
  '1': 'sem-fundamental',
  '2': 'sem-fundamental',
  '3': 'fundamental',
  '4': 'fundamental',
  '5': 'medio',
  '6': 'medio',
  '7': 'superior',
}

/** VD4011 starts at 14. */
const MIN_AGE = 14

/** One line of `PNADC_<quarter>.txt` (fixed-width text). Returns `null` for
 * anyone under 14. */
export function readPnadRecord(line: string): PnadRecord | null {
  const age = Number(field(line, 'V2009'))
  if (!(age >= MIN_AGE)) return null
  const sexCode = field(line, 'V2007')
  const sex = sexCode === '1' ? 'homem' : sexCode === '2' ? 'mulher' : null
  const weight = Number(field(line, 'V1028'))
  if (!sex || !(weight > 0)) return null
  const occupation = Number(field(line, 'VD4011'))
  return {
    stratum: field(line, 'Estrato'),
    psu: field(line, 'UPA'),
    weight,
    sex,
    age,
    education: EDUCATION[field(line, 'VD3004')] ?? null,
    occupation:
      field(line, 'VD4002') === '1' && occupation >= 1 ? occupation : null,
  }
}

/** A value of SIDRA 5435 (variable 4090): employed people, in thousands, in
 * one VD4011 group (`0` is the total). */
export interface PublishedPnad {
  readonly group: number
  readonly thousands: number
}

/** The employed by occupational group, aged 14 or more, must give SIDRA 5435
 * to the published thousand. */
export function crossCheckPnad(
  records: ReadonlyArray<PnadRecord>,
  published: ReadonlyArray<PublishedPnad>,
): string[] {
  const failures: string[] = []
  for (const { group, thousands } of published) {
    const sum = records.reduce(
      (s, r) =>
        r.occupation !== null && (group === 0 || r.occupation === group)
          ? s + r.weight
          : s,
      0,
    )
    // SIDRA rounds to the thousand: the microdata must land within half of one.
    if (Math.abs(sum / 1000 - thousands) > 0.5 + 1e-9)
      failures.push(
        `PNAD group ${group}: the microdata gives ${(sum / 1000).toFixed(1)} thousand employed and SIDRA 5435 publishes ${thousands}`,
      )
  }
  return failures
}

const COLUMNS = [
  'universo',
  'sexo',
  'idade',
  'escolaridade',
  'p',
  'p_min',
  'p_max',
  'n_registros',
] as const

export function pnadToCsv(rows: ReadonlyArray<PnadRow>): string {
  const out = [COLUMNS.join(',')]
  for (const l of rows)
    out.push(
      [
        l.universo,
        l.sexo,
        l.idade,
        l.escolaridade,
        l.p.toFixed(5),
        l.p_min.toFixed(5),
        l.p_max.toFixed(5),
        l.n_registros,
      ].join(','),
    )
  return out.join('\n') + '\n'
}
