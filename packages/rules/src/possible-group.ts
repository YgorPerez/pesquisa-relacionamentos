// The possible group estimate (#8, stories 39–52): how many people in Brazil
// match the sought profile and the requirements.
//
// - The Census requirements (age, union, education, income, color, religion,
//   children) cross the microdata cells: only the weight of the matching ones
//   counts.
// - The exact age comes out of the 5-year group through the fraction of the
//   SIDRA 9514 single ages in the place.
// - In a municipality, each state cell is scaled by the municipality's
//   population in the same sex × age group × union combination (SIDRA 10185).
// - The PNS ones (orientation, height, smoking, drinking, BMI…) are crossed with
//   each other on the PNS microdata: their joint share in the same sex and
//   age bracket (the PNS block, `pnsBlocks`) multiplies the cell, with its
//   interval.
// - The PNAD one (office occupation, #294) multiplies each cell by the
//   probability in its sex, age group and education, with its interval.
// - The range joins that interval with the Census sampling error, ±1.96/√n.
// - Apart, the independence range (#301) gives the least and the most the
//   PNS block and the Census Requirements could overlap.
//
// The caveat texts are interface text, in Portuguese.
import {
  UNION_CELLS,
  AGE_GROUPS,
  SINGLE_AGES,
  unionIndex,
  SEXES,
  PNS_BRACKETS,
  type Pns,
  type Sex,
  type PlaceData,
  type AgesBySex,
} from './possible-group-data.ts'
import type { Profile } from './profile.ts'
import {
  MAX_HEIGHT,
  MIN_HEIGHT,
  COLORS,
  EDUCATIONS,
  soughtAge,
  MAX_SOUGHT_AGE,
  MIN_SOUGHT_AGE,
  whoIsSought,
  RELIGIONS,
  INCOMES,
  type Sought,
  type Requirements,
} from './requirements.ts'

/** The requirements in funnel order. Orientation has no control: it comes
 * from the profile. */
export const REQUIREMENT_ORDER = [
  'age',
  'place',
  'partner',
  'orientation',
  'education',
  'income',
  'color',
  'religion',
  'children',
  'parents',
  'work',
  'home',
  'height',
  'smoking',
  'drinking',
  'exercise',
  'teeth',
  'vape',
  'office',
  'obesity',
  'depression',
  'bisexual',
  'worship',
] as const
export type RequirementId = (typeof REQUIREMENT_ORDER)[number]

/** Where each requirement comes from. */
export const REQUIREMENT_SOURCE: Readonly<
  Record<RequirementId, 'Censo' | 'PNS' | 'PNAD'>
> = {
  office: 'PNAD',
  age: 'Censo',
  place: 'Censo',
  partner: 'Censo',
  orientation: 'PNS',
  education: 'Censo',
  income: 'Censo',
  color: 'Censo',
  religion: 'Censo',
  children: 'Censo',
  parents: 'Censo',
  work: 'Censo',
  home: 'Censo',
  height: 'PNS',
  smoking: 'PNS',
  drinking: 'PNS',
  exercise: 'PNS',
  teeth: 'PNS',
  vape: 'PNS',
  obesity: 'PNS',
  depression: 'PNS',
  bisexual: 'PNS',
  worship: 'PNS',
}

/** Below this, the number carries "instável" (#8). It holds for the Census
 * records behind the count and, apart, for the PNS records that pass the PNS
 * Requirements (#287). */
export const RECORDS_FOR_STABLE = 50

/** Whether the count leans on too few records, from the Census or the PNS. */
const isUnstable = (count: Count) =>
  count.records < RECORDS_FOR_STABLE ||
  (count.pnsRecords !== null && count.pnsRecords < RECORDS_FOR_STABLE)

export interface CountData {
  /** Brazil's pack, always: the base and the cost of releasing the place
   * come from it. */
  readonly brazil: PlaceData
  /** The chosen state's pack, when there is a place. */
  readonly state?: PlaceData
}

export interface CountInput {
  readonly profile: Profile | null
  readonly requirements: Requirements
}

export interface Count {
  /** People, unrounded. */
  readonly min: number
  readonly central: number
  readonly max: number
  /** Sample records behind the number (split by age and municipality). */
  readonly records: number
  /** PNS records that pass every PNS Requirement, summed over the PNS
   * brackets the group reaches; `null` with no PNS Requirement. */
  readonly pnsRecords: number | null
}

export interface Cost {
  readonly requirement: RequirementId
  /** The group without this requirement, with the others kept. */
  readonly without: number
  readonly gain: number
  /** `without / current`; `Infinity` when the current group is zero and
   * releasing gives someone. */
  readonly times: number
}

export interface Caveat {
  readonly id: string
  readonly text: string
  /** A strong warning: it shows next to the number, not only in "De onde vem
   * a incerteza". */
  readonly strong: boolean
}

export interface Estimate {
  /** Who is sought, for the sentence (`TARGET_NAME`). */
  readonly target: Sought['target']
  /** The requirements that enter the count, in funnel order. */
  readonly active: ReadonlyArray<RequirementId>
  readonly result: Count & { readonly unstable: boolean }
  /** Adults (18+) of the sought gender in Brazil, before any requirement. */
  readonly base: Count
  /** From the one that weighs most to the one that weighs least. Without
   * orientation, which cannot be released. */
  readonly costs: ReadonlyArray<Cost>
  /** Cut by cut, in `REQUIREMENT_ORDER`. */
  readonly funnel: ReadonlyArray<{
    readonly requirement: RequirementId
    readonly central: number
  }>
  /** The count by multiplication: the base times the fraction each
   * requirement leaves on its own. */
  readonly naive: number
  /** The independence range (#301): the least and the most the group could
   * be if the PNS block overlapped the Census Requirements in any other way.
   * `null` when the count assumes no independence. */
  readonly independence: Range | null
  readonly caveats: ReadonlyArray<Caveat>
  /** "Sem filhos": applies, only to women (seeking both) or no data (seeking
   * men). */
  readonly children: Sought['children']
}

// --- parts of the count -------------------------------------------------------

/** The requirements that change the count. */
export function activeRequirements({
  profile,
  requirements: r,
}: CountInput): RequirementId[] {
  const age = soughtAge(profile, r)
  const isActive: Record<RequirementId, boolean> = {
    age: age.min > MIN_SOUGHT_AGE || age.max < MAX_SOUGHT_AGE,
    place: r.place !== null,
    partner: r.noLiveInPartner,
    orientation: profile?.gender === 'homem' || profile?.gender === 'mulher',
    education: r.education !== null,
    income: r.income !== null,
    color: r.colors.length > 0,
    religion: r.religions.length > 0,
    children: r.noChildren && whoIsSought(profile).children !== 'no-data',
    parents: r.notWithParents,
    work: r.work !== null,
    home: r.ownsHome,
    height: r.height.min > MIN_HEIGHT || r.height.max < MAX_HEIGHT,
    smoking: r.nonSmoker,
    drinking: r.drinking.length > 0,
    exercise: r.exercises,
    teeth: r.goodTeeth,
    vape: r.nonVaper,
    office: r.office,
    obesity: r.notObese,
    depression: r.noDepressionSymptoms,
    bisexual: r.bisexual,
    worship: r.weeklyWorship,
  }
  return REQUIREMENT_ORDER.filter((k) => isActive[k])
}

/** The Requirements that read what only the detail packs carry
 * (`packForPlace`): the Census detail dimensions and the PNS columns in
 * `DETAIL_PNS_COLUMNS`. */
const DETAIL_REQUIREMENTS: ReadonlySet<RequirementId> = new Set<RequirementId>([
  'parents',
  'work',
  'home',
  'obesity',
  'depression',
  'worship',
])

/** The count needs the detail packs: a Requirement reads parents, work,
 * home, BMI, depression symptoms or religious attendance. */
export const needsDetail = (input: CountInput): boolean =>
  activeRequirements(input).some((k) => DETAIL_REQUIREMENTS.has(k))

const firstAge = (ageGroup: number) => 15 + 5 * ageGroup
const lastAge = (ageGroup: number) =>
  ageGroup === AGE_GROUPS.length - 1
    ? 15 + SINGLE_AGES - 1
    : firstAge(ageGroup) + 4

/** The part of the age group that falls in [min, max], by single ages.
 * max = 80 is "80 or more". */
function ageFraction(
  ages: ReadonlyArray<number>,
  ageGroup: number,
  min: number,
  max: number,
): number {
  const a = firstAge(ageGroup)
  const b = lastAge(ageGroup)
  const from = Math.max(a, min)
  const to = Math.min(b, max >= MAX_SOUGHT_AGE ? Infinity : max)
  if (to < from) return 0
  let inside = 0
  let all = 0
  for (let age = a; age <= b; age++) {
    const people = ages[age - 15] ?? 0
    all += people
    if (age >= from && age <= to) inside += people
  }
  return all > 0 ? inside / all : (to - from + 1) / (b - a + 1)
}

// --- the PNS block -----------------------------------------------------------
// The PNS Requirements are crossed on the same person (#287): within each
// sex × PNS bracket, the share of the PNS cells that pass every active PNS
// filter, among those that answered all of them. Only that block multiplies
// the Census cell.

/** The position in `PNS_BRACKETS` of each Census group (15-19 goes to
 * 18-24). */
const PNS_BRACKET_OF_GROUP = [0, 0, 1, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7] as const

/** [minimum, central, maximum]. */
export type Interval = readonly [number, number, number]
const NO_CUT: Interval = [1, 1, 1]

/**
 * A PNS Requirement read on one person's answer to one PNS variable (a column
 * of `pns-2019.csv`). `true` passes, `false` does not, and `null` takes the
 * person out of the denominator, as someone who did not answer. A person
 * with no answer to the variable is always out.
 */
export interface PnsFilter {
  readonly variable: string
  readonly test: (value: string, sex: Sex) => boolean | null
}

/**
 * The PNS filter of each PNS Requirement. A new PNS Requirement is its column
 * in `scripts/possible-group/pns.ts`, its id in `REQUIREMENT_ORDER` with
 * source 'PNS', its line in `activeRequirements` and its filter here: the
 * crossing, the interval and the "instável" come for free.
 */
const PNS_FILTERS: {
  readonly [K in RequirementId]?: (input: CountInput) => PnsFilter
} = {
  // Whoever did not know or refused to answer is treated like those who
  // answered.
  orientation: ({ profile }) => ({
    variable: 'orientacao',
    test: (value, sex) =>
      value === 'nao-sabe' || value === 'recusou'
        ? null
        : value === 'bissexual' ||
          value === (sex === profile?.gender ? 'homossexual' : 'heterossexual'),
  }),
  // The CSV gives the centimeters; 139 is "below 140" and 201, "above 200".
  height: ({ requirements: { height } }) => {
    const min = height.min <= MIN_HEIGHT ? -Infinity : height.min
    const max = height.max >= MAX_HEIGHT ? Infinity : height.max
    return {
      variable: 'altura',
      test: (value) => Number(value) >= min && Number(value) <= max,
    }
  },
  smoking: () => ({ variable: 'fumo', test: (value) => value === 'nao' }),
  drinking: ({ requirements: { drinking } }) => ({
    variable: 'bebida',
    test: (value) => drinking.some((d) => d === value),
  }),
  exercise: () => ({ variable: 'exercicio', test: (value) => value === 'sim' }),
  teeth: () => ({ variable: 'saude_bucal', test: (value) => value === 'boa' }),
  vape: () => ({
    variable: 'cigarro_eletronico',
    test: (value) => value === 'nao',
  }),
  obesity: () => ({ variable: 'obesidade', test: (value) => value === 'nao' }),
  depression: () => ({
    variable: 'depressao',
    test: (value) => value === 'nao',
  }),
  // Like the orientation, whoever did not know or refused is out.
  bisexual: () => ({
    variable: 'orientacao',
    test: (value) =>
      value === 'nao-sabe' || value === 'recusou'
        ? null
        : value === 'bissexual',
  }),
  worship: () => ({
    variable: 'culto',
    test: (value) => value === 'semanal',
  }),
}

export interface PnsBlock {
  /** The share that passes, with the 95% interval. */
  readonly p: Interval
  /** PNS records that pass every filter. */
  readonly records: number
  /** PNS records that answered every filter (the denominator). */
  readonly answered: number
}

const Z95 = 1.96

/** The Wilson score interval for a proportion over `n` effective records,
 * which stays inside [0, 1] and does not collapse to a point when `p` is 0. */
function wilson(p: number, n: number): Interval {
  const z2 = Z95 * Z95
  const d = 1 + z2 / n
  const center = (p + z2 / (2 * n)) / d
  const half = (Z95 * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / d
  return [Math.max(0, center - half), p, Math.min(1, center + half)]
}

/**
 * The PNS block of each sex × PNS bracket, in `sex * PNS_BRACKETS.length +
 * bracket` order; `null` where no PNS record answered every filter. The
 * interval is Wilson's on the records divided by the design effect of the
 * sex × bracket (the PNS cells carry no stratum or PSU).
 */
export function pnsBlocks(
  pns: Pns,
  filters: ReadonlyArray<PnsFilter>,
): Array<PnsBlock | null> {
  // Each filter's verdict per sex and level, so the loop only reads arrays.
  const verdicts = filters.map(({ variable, test }) => {
    const column = pns.variables[variable]
    if (!column) throw new Error(`the PNS has no variable ${variable}`)
    return {
      codes: column.codes,
      bySex: SEXES.map((sex) => [
        null,
        ...column.levels.map((level) => test(level, sex)),
      ]),
    }
  })
  const B = PNS_BRACKETS.length
  const size = SEXES.length * B
  const yes = new Float64Array(size)
  const all = new Float64Array(size)
  const yesRecords = new Float64Array(size)
  const allRecords = new Float64Array(size)
  cells: for (let i = 0; i < pns.weight.length; i++) {
    const s = pns.sex[i]!
    let passes = true
    for (const { codes, bySex } of verdicts) {
      const verdict = bySex[s]![codes[i]!]
      if (verdict === null || verdict === undefined) continue cells
      if (!verdict) passes = false
    }
    const k = s * B + pns.bracket[i]!
    all[k]! += pns.weight[i]!
    allRecords[k]! += pns.records[i]!
    if (passes) {
      yes[k]! += pns.weight[i]!
      yesRecords[k]! += pns.records[i]!
    }
  }
  return Array.from({ length: size }, (_, k) => {
    if (!(all[k]! > 0)) return null
    const effective = allRecords[k]! / Math.max(1, pns.designEffect[k] ?? 1)
    return {
      p: wilson(yes[k]! / all[k]!, effective),
      records: yesRecords[k]!,
      answered: allRecords[k]!,
    }
  })
}

/** The PNS filters of the active PNS Requirements. */
function pnsFilters(
  input: CountInput,
  active: ReadonlySet<RequirementId>,
): PnsFilter[] {
  return REQUIREMENT_ORDER.flatMap((k) => {
    const filter = active.has(k) ? PNS_FILTERS[k] : undefined
    return filter ? [filter(input)] : []
  })
}

/** Who did not know or refused to say their orientation. */
const NO_ORIENTATION: PnsFilter = {
  variable: 'orientacao',
  test: (value) => value === 'nao-sabe' || value === 'recusou',
}

/** P(office occupation) in the cell's sex, Census age group and education
 * (`EDUCATIONS` position + 1, 0 = no data). A cell without education, or
 * with one the file left out for having few records, takes the row of every
 * education together. The universe is everyone (`todos`) or, when "trabalha"
 * already kept only the employed, the employed (`ocupados`): with `todos` the
 * job would be counted twice. */
function office(
  data: PlaceData,
  universe: 'todos' | 'ocupados',
  sex: number,
  ageGroup: number,
  education: number,
): Interval {
  const key = (e: string) =>
    `${universe}|${SEXES[sex]}|${AGE_GROUPS[ageGroup]}|${e}`
  const row =
    (education > 0 ? data.pnad[key(EDUCATIONS[education - 1]!)] : undefined) ??
    data.pnad[key('')]
  if (!row)
    throw new Error(
      `the PNAD has no office occupation for ${SEXES[sex]} ${AGE_GROUPS[ageGroup]}`,
    )
  const [p, min, max] = row
  return [min, p, max]
}

function unionSum(data: PlaceData): Float64Array {
  const sum = new Float64Array(UNION_CELLS)
  for (let i = 0; i < data.size; i++)
    sum[unionIndex(data.sex[i]!, data.ageGroup[i]!, data.union[i]!)]! +=
      data.weight[i]!
  return sum
}

interface Tally extends Count {
  /** Weighted mean of who did not answer the orientation, when it enters. */
  readonly noAnswer: number
  readonly independence: Range | null
}

export interface Range {
  readonly min: number
  readonly max: number
}

/** The Fréchet–Hoeffding bounds of two groups of `a` and `b` people among
 * `n`: they overlap in at least max(0, a + b − n) and at most min(a, b). */
const overlap = (a: number, b: number, n: number) =>
  [Math.max(0, a + b - n), Math.min(a, b)] as const

/**
 * The independence range (#301): how many the group could have if the shares
 * from other surveys overlapped the Census Requirements in any way, instead
 * of independently. It takes the central shares: it measures the assumption,
 * not the sampling error, which stays in `min` and `max`.
 *
 * Each share is bounded on its own key, where the survey measured it. The
 * PNAD office share (#294) goes by sex × age group × education: in each
 * education, of N_e people in the share's universe (everyone, or the
 * employed with "trabalha"), A_e pass the Census Requirements and Q_e = q_e
 * × N_e work in an office; the pair overlaps in [L_e, U_e] = `overlap(A_e,
 * Q_e, N_e)`. The PNS block goes by sex and age: with L and U the sums over
 * the educations, N everyone and P = p × N, the group is in [max(0, L + P −
 * N), min(U, P)]. The age groups add up.
 *
 * `null` when there is no assumption to measure: no share from another
 * survey, or the Census cuts no one inside its keys.
 */
function independenceRange(
  everyone: Float64Array,
  officeUniverse: Float64Array,
  censusOnly: Float64Array,
  pns: ReadonlyArray<PnsBlock | null>,
  officeByCell: ReadonlyArray<Interval> | null,
  central: number,
): Range | null {
  const E = EDUCATIONS.length + 1
  let min = 0
  let max = 0
  for (let sg = 0; sg < everyone.length / E; sg++) {
    let n = 0
    let low = 0
    let high = 0
    for (let cell = sg * E; cell < (sg + 1) * E; cell++) {
      const q = officeByCell?.[cell]?.[1] ?? 1
      const [l, u] = overlap(
        censusOnly[cell]!,
        q * officeUniverse[cell]!,
        officeUniverse[cell]!,
      )
      n += everyone[cell]!
      low += l
      high += u
    }
    const p = (pns[sg]?.p[1] ?? 1) * n
    min += Math.max(0, low + p - n)
    max += Math.min(high, p)
  }
  return max - min > 1e-9 * Math.max(1, central) ? { min, max } : null
}

function tally(
  input: CountInput,
  data: CountData,
  active: ReadonlySet<RequirementId>,
): Tally {
  const { profile, requirements: r } = input
  const ofPlace = active.has('place') ? data.state : data.brazil
  if (!ofPlace || (active.has('place') && ofPlace.place !== r.place?.state))
    throw new Error(`missing the data for ${r.place?.state} for the count`)
  if (!ofPlace.detail && [...active].some((k) => DETAIL_REQUIREMENTS.has(k)))
    throw new Error(
      `the count of ${[...active].join(', ')} needs the detail pack for ${ofPlace.place}`,
    )

  // Everything that depends only on sex × age group (and union, in a
  // municipality) comes out before the loop.
  const age = active.has('age')
    ? soughtAge(profile, r)
    : { min: MIN_SOUGHT_AGE, max: MAX_SOUGHT_AGE }
  const { sexes } = whoIsSought(profile)
  const G = AGE_GROUPS.length
  const B = PNS_BRACKETS.length
  const factor = new Float64Array(SEXES.length * G)
  const filters = pnsFilters(input, active)
  const pnsData = data.brazil.pns
  if (filters.length > 0 && !pnsData)
    throw new Error("Brazil's pack has no PNS cells for the count")
  const blocks =
    pnsData && filters.length > 0 ? pnsBlocks(pnsData, filters) : []
  const noOrientation =
    pnsData && active.has('orientation')
      ? pnsBlocks(pnsData, [NO_ORIENTATION])
      : []
  const pns: Array<PnsBlock | null> = []
  for (const s of sexes) {
    const ages = (ofPlace.ages as AgesBySex)[SEXES[s]!]
    for (let g = 0; g < G; g++) {
      const i = s * G + g
      factor[i] = ageFraction(
        ages,
        g,
        Math.max(MIN_SOUGHT_AGE, age.min),
        age.max,
      )
      pns[i] = null
      if (factor[i]! > 0 && filters.length > 0) {
        const block = blocks[s * B + PNS_BRACKET_OF_GROUP[g]!]
        if (!block)
          throw new Error(
            `the PNS has no records for ${SEXES[s]} ${PNS_BRACKETS[PNS_BRACKET_OF_GROUP[g]!]}`,
          )
        pns[i] = block
      }
    }
  }
  const noAnswer = (s: number, g: number) =>
    noOrientation[s * B + PNS_BRACKET_OF_GROUP[g]!]?.p[1] ?? 0
  /** The PNS brackets the group reaches, for the records behind the block. */
  const reached = new Set<number>()

  // Office occupation also depends on the cell's education: one interval
  // per sex × age group × education.
  const E = EDUCATIONS.length + 1
  let officeByCell: Interval[] | null = null
  if (active.has('office')) {
    const universe = active.has('work') ? 'ocupados' : 'todos'
    officeByCell = []
    for (const s of sexes)
      for (let g = 0; g < G; g++)
        if (factor[s * G + g]! > 0)
          for (let e = 0; e < E; e++)
            officeByCell[(s * G + g) * E + e] = office(
              ofPlace,
              universe,
              s,
              g,
              e,
            )
  }

  let municipality: Float64Array | null = null
  if (active.has('place') && r.place?.municipality) {
    const m = ofPlace.municipalities.get(r.place.municipality)
    if (!m)
      throw new Error(
        `municipality ${r.place.municipality} is outside the data for ${r.place.state}`,
      )
    const ofState = unionSum(ofPlace)
    municipality = new Float64Array(UNION_CELLS)
    for (let k = 0; k < UNION_CELLS; k++)
      municipality[k] = ofState[k]! > 0 ? (m.people[k] ?? 0) / ofState[k]! : 0
  }

  const position = (list: ReadonlyArray<string>, value: string) =>
    list.indexOf(value) + 1
  const education =
    active.has('education') && r.education
      ? position(EDUCATIONS, r.education)
      : 0
  const income =
    active.has('income') && r.income ? position(INCOMES, r.income) : 0
  const colors = active.has('color')
    ? new Set(r.colors.map((c) => position(COLORS, c)))
    : null
  const religions = active.has('religion')
    ? new Set(r.religions.map((c) => position(RELIGIONS, c)))
    : null
  const partner = active.has('partner')
  const noChildren = active.has('children')
  const notWithParents = active.has('parents')
  // The `work` column: 1 employed, 2 in their own business.
  const work = !active.has('work') ? 0 : r.work === 'negocio' ? 2 : 1
  const ownsHome = active.has('home')
  const singleSex = sexes.length === 1 ? sexes[0] : -1

  let min = 0
  let central = 0
  let max = 0
  let records = 0
  let noAnswerSum = 0
  let weightSum = 0
  // Everyone of the sex × age group in the place, and those the Census
  // Requirements leave, for the independence range.
  // By sex × age group × education, the key of the office share.
  const everyone = new Float64Array(SEXES.length * G * E)
  const censusOnly = new Float64Array(SEXES.length * G * E)
  // The office share's universe in each cell: everyone, or the employed when
  // "trabalha" made the share come from `ocupados`.
  const officeOfEmployed = active.has('work')
  const officeUniverse = officeOfEmployed
    ? new Float64Array(SEXES.length * G * E)
    : everyone
  const d = ofPlace
  for (let i = 0; i < d.size; i++) {
    const s = d.sex[i]!
    if (singleSex >= 0 && s !== singleSex) continue
    const sg = s * G + d.ageGroup[i]!
    let f = factor[sg]!
    if (municipality)
      f *= municipality[unionIndex(s, d.ageGroup[i]!, d.union[i]!)]!
    if (f === 0) continue
    const w = d.weight[i]! * f
    const cell = sg * E + d.education[i]!
    everyone[cell]! += w
    if (officeOfEmployed && d.work[i]! >= 1) officeUniverse[cell]! += w
    if (partner && d.union[i] === 1) continue
    if (d.education[i]! < education) continue
    if (d.income[i]! < income) continue
    if (colors && !colors.has(d.color[i]!)) continue
    if (religions && !religions.has(d.religion[i]!)) continue
    if (noChildren && d.children[i] === 2) continue
    if (notWithParents && d.parents[i] !== 1) continue
    if (d.work[i]! < work) continue
    if (ownsHome && d.home[i] !== 2) continue
    censusOnly[cell]! += w
    const block = pns[sg]
    const p = block ? block.p : NO_CUT
    const o = officeByCell?.[cell] ?? NO_CUT
    min += w * p[0] * o[0]
    central += w * p[1] * o[1]
    max += w * p[2] * o[2]
    records += d.records[i]! * f
    noAnswerSum += w * noAnswer(s, d.ageGroup[i]!)
    weightSum += w
    if (block) reached.add(s * B + PNS_BRACKET_OF_GROUP[d.ageGroup[i]!]!)
  }
  const error = Z95 / Math.sqrt(Math.max(records, 1))
  return {
    independence: independenceRange(
      everyone,
      officeUniverse,
      censusOnly,
      pns,
      officeByCell,
      central,
    ),
    min: min * Math.max(0, 1 - error),
    central,
    max: max * (1 + error),
    records,
    pnsRecords:
      filters.length > 0
        ? [...reached].reduce((sum, k) => sum + blocks[k]!.records, 0)
        : null,
    noAnswer: weightSum > 0 ? noAnswerSum / weightSum : 0,
  }
}

// --- caveats -----------------------------------------------------------------

const percent = (x: number) =>
  (x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })

function caveats(
  input: CountInput,
  active: ReadonlyArray<RequirementId>,
  result: Tally,
): Caveat[] {
  const { profile, requirements } = input
  const has = (k: RequirementId) => active.includes(k)
  const list: Array<Caveat | false> = [
    result.records < RECORDS_FOR_STABLE && {
      id: 'unstable',
      strong: true,
      text: `Estimativa instável: a conta se apoia em só ${Math.round(result.records)} registros da amostra do Censo.`,
    },
    result.pnsRecords !== null &&
      result.pnsRecords < RECORDS_FOR_STABLE && {
        id: 'unstable-pns',
        strong: true,
        text: `Estimativa instável: os Requisitos da PNS se apoiam em só ${Math.round(result.pnsRecords)} registros da PNS 2019.`,
      },
    profile?.gender === 'outro' && {
      id: 'other-gender',
      strong: true,
      text: 'O IBGE registra só o sexo e não pergunta identidade de gênero, então não dá para estimar quem se interessa por você. O número conta todas as pessoas do gênero procurado: é um teto.',
    },
    !profile?.gender && {
      id: 'no-gender',
      strong: true,
      text: 'Sem o seu gênero no Perfil, não dá para descontar quem não se interessa por você. O número conta todas as pessoas do gênero procurado: é um teto.',
    },
    !profile?.seeks && {
      id: 'no-seeks',
      strong: true,
      text: 'Sem dizer quem você procura, a conta junta homens e mulheres.',
    },
    has('children') &&
      whoIsSought(profile).children === 'women-only' && {
        id: 'children-women-only',
        strong: true,
        text: 'O Censo só pergunta filhos às mulheres: "sem filhos" vale para elas, e os homens entram com ou sem filhos.',
      },
    has('partner') && {
      id: 'partner',
      strong: false,
      text: '"Não mora com companheiro(a)" inclui quem namora: nenhuma pesquisa oficial pergunta sobre namoro.',
    },
    has('parents') && {
      id: 'parents',
      strong: false,
      text: '"Não mora com os pais" tira quem mora no mesmo domicílio que a mãe, o pai, a madrasta ou o padrasto, inclusive quando são eles que moram na casa da pessoa.',
    },
    has('work') && {
      id: 'work',
      strong: false,
      text:
        requirements.work === 'negocio'
          ? '"Tem negócio próprio" junta empregadores e quem trabalha por conta própria, na última semana de julho de 2022. O Censo não diz se é em tempo integral.'
          : '"Trabalha" é quem tinha trabalho na última semana de julho de 2022, com ou sem carteira e em negócio próprio ou não. O Censo não diz se é em tempo integral.',
    },
    has('home') && {
      id: 'home',
      strong: false,
      text: 'O Censo pergunta se a casa é de algum morador, não de quem. A conta só dá a casa como da pessoa quando ela é a responsável pelo domicílio ou o cônjuge: quem mora na casa própria dos pais não entra.',
    },
    has('orientation') && {
      id: 'orientation',
      strong: false,
      text: `A orientação vem da PNS 2019, uma estatística experimental do IBGE. No grupo procurado, ${percent(result.noAnswer)}% não souberam ou não quiseram responder; a conta os trata como quem respondeu.`,
    },
    has('age') && {
      id: 'age',
      strong: false,
      text: 'O microdado público traz a idade em grupos de 5 anos; a idade exata vem da proporção do SIDRA 9514.',
    },
    has('place') &&
      !!requirements.place?.municipality && {
        id: 'municipality',
        strong: false,
        text: 'No município, a composição do estado é aplicada à população da cidade por sexo, idade e união (SIDRA 10185). Os outros Requisitos do Censo seguem os do estado.',
      },
    has('income') && {
      id: 'income',
      strong: false,
      text: 'A renda é a de julho de 2022, em salários mínimos da época (R$ 1.212).',
    },
    has('height') && {
      id: 'height',
      strong: false,
      text: 'A altura é autodeclarada na PNS 2019.',
    },
    has('drinking') && {
      id: 'drinking',
      strong: false,
      text: 'A frequência com que bebe é autodeclarada na PNS 2019, e o consumo de álcool costuma ser subdeclarado: quem bebe toda semana aparece menos do que é.',
    },
    has('exercise') && {
      id: 'exercise',
      strong: false,
      text: 'O exercício é autodeclarado na PNS 2019: dias por semana vezes a duração de costume, no esporte ou atividade principal. 150 minutos por semana é a recomendação da OMS; como faz o IBGE, um minuto de atividade vigorosa (corrida, futebol, ginástica aeróbica) vale dois.',
    },
    has('teeth') && {
      id: 'teeth',
      strong: false,
      text: 'A saúde bucal é a autoavaliação da PNS 2019 ("boa" ou "muito boa"), não um exame de dentista.',
    },
    has('vape') && {
      id: 'vape',
      strong: false,
      text: 'O cigarro eletrônico vem da PNS 2019, quando menos de 1% dos adultos o usava. O uso cresceu depois, então o número tende a sair alto. Quem usava era tão pouco na amostra (poucas dezenas de registros por sexo e idade) que a parte descontada é imprecisa.',
    },
    has('obesity') && {
      id: 'obesity',
      strong: false,
      text: 'O IMC sai do peso e da altura autodeclarados na PNS 2019. Quem informa o próprio peso costuma dizer menos do que pesa, então a pesquisa acha menos gente com IMC de 30 ou mais, e o grupo sai maior do que é.',
    },
    has('depression') && {
      id: 'depression',
      strong: false,
      text: 'Os sintomas de depressão vêm do PHQ-9 da PNS 2019: nove perguntas sobre as 2 últimas semanas. Ele mostra como a pessoa estava naquele período, não um traço dela, e não é diagnóstico.',
    },
    has('bisexual') && {
      id: 'bisexual',
      strong: false,
      text: 'A orientação vem da PNS 2019, uma estatística experimental do IBGE. Pouca gente se declara bissexual na amostra, então a conta se apoia em poucos registros e o número oscila muito.',
    },
    has('worship') && {
      id: 'worship',
      strong: false,
      // #299: it may combine with the Census religion, with this caveat.
      text: has('religion')
        ? 'A frequência à religião vem da PNS 2019, que não pergunta qual é a religião. Com uma religião marcada, a conta supõe que a parcela que vai toda semana é a mesma em todas as religiões, o que a PNS não deixa conferir.'
        : 'A frequência à religião vem da PNS 2019, que não pergunta qual é a religião: conta quem vai a cultos ou atividades da própria religião, ou de outra, pelo menos uma vez por semana.',
    },
    has('office') && {
      id: 'office',
      strong: false,
      text: `Escritório são os quatro primeiros grupos de ocupação da PNAD Contínua: diretores e gerentes, profissionais das ciências e intelectuais (como médicos, professores e engenheiros), técnicos de nível médio e apoio administrativo. A chance vem do 3º trimestre de 2022, por sexo, idade e escolaridade${has('work') ? ', entre quem trabalha' : ''}; a conta supõe que, dentro disso, ela não depende de renda, cor, religião ou união.`,
    },
    active.some((k) => REQUIREMENT_SOURCE[k] === 'PNS') && {
      id: 'independence',
      strong: false,
      // What the PNS block assumes about the Census is the independence
      // range's paragraph, next to the ranges (#301).
      text: 'Os Requisitos da PNS são cruzados entre si, na mesma pessoa.',
    },
    {
      id: 'source',
      strong: false,
      text: has('office')
        ? 'Censo de julho de 2022, PNS 2019 e PNAD Contínua do 3º trimestre de 2022. Fonte: IBGE.'
        : 'Censo de julho de 2022 e PNS 2019. Fonte: IBGE.',
    },
  ]
  return list.filter((r): r is Caveat => r !== false)
}

// --- the estimate ------------------------------------------------------------

export function estimateGroup(input: CountInput, data: CountData): Estimate {
  const active = activeRequirements(input)
  const countWith = (list: ReadonlyArray<RequirementId>) =>
    tally(input, data, new Set(list))
  const current = countWith(active)
  const base = countWith([])

  const funnel = active.map((requirement, i) => ({
    requirement,
    central: countWith(active.slice(0, i + 1)).central,
  }))

  const costs = active
    .filter((k) => k !== 'orientation')
    .map((requirement): Cost => {
      const without = countWith(active.filter((k) => k !== requirement)).central
      const times =
        current.central > 0
          ? without / current.central
          : without > 0
            ? Infinity
            : 1
      return { requirement, without, gain: without - current.central, times }
    })
    .sort((a, b) => b.times - a.times)

  const naive =
    base.central > 0
      ? active.reduce(
          (v, k) => v * (countWith([k]).central / base.central),
          base.central,
        )
      : 0

  const { noAnswer: _, independence, ...result } = current
  const { noAnswer: __, independence: ___, ...fromBase } = base
  const sought = whoIsSought(input.profile)
  return {
    target: sought.target,
    active,
    result: {
      ...result,
      unstable: isUnstable(current),
    },
    base: fromBase,
    costs,
    funnel,
    naive,
    independence,
    caveats: caveats(input, active, current),
    children: sought.children,
  }
}
