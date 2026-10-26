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
// - The PNS ones (orientation, height, smoking) multiply the cell by the
//   probability in the same sex and age bracket, with its interval.
// - The range joins that interval with the Census sampling error, ±1.96/√n.
//
// The caveat texts are interface text, in Portuguese.
import {
  UNION_CELLS,
  AGE_GROUPS,
  SINGLE_AGES,
  unionIndex,
  SEXES,
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
  'height',
  'smoking',
] as const
export type RequirementId = (typeof REQUIREMENT_ORDER)[number]

/** Where each requirement comes from. */
export const REQUIREMENT_SOURCE: Readonly<
  Record<RequirementId, 'Censo' | 'PNS'>
> = {
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
  height: 'PNS',
  smoking: 'PNS',
}

/** Below this, the number carries "instável" (#8). */
export const RECORDS_FOR_STABLE = 50

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
    height: r.height.min > MIN_HEIGHT || r.height.max < MAX_HEIGHT,
    smoking: r.nonSmoker,
  }
  return REQUIREMENT_ORDER.filter((k) => isActive[k])
}

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

/** The PNS bracket each Census group falls in (15-19 goes to 18-24). */
const PNS_BRACKET = [
  '18-24',
  '18-24',
  '25-29',
  '30-34',
  '35-39',
  '40-49',
  '40-49',
  '50-59',
  '50-59',
  '60-69',
  '60-69',
  '70+',
  '70+',
  '70+',
] as const

/** [minimum, central, maximum]. */
type Interval = readonly [number, number, number]

function pnsRow(
  data: PlaceData,
  measure: string,
  sex: number,
  ageGroup: number,
  category: string,
): Interval {
  const row =
    data.pns[`${measure}|${SEXES[sex]}|${PNS_BRACKET[ageGroup]}|${category}`]
  if (!row)
    throw new Error(
      `the PNS has no ${measure} ${category} for ${SEXES[sex]} ${PNS_BRACKET[ageGroup]}`,
    )
  const [p, min, max] = row
  return [min, p, max]
}

/** P(the person is interested in the visitor's gender). Whoever did not know
 * or refused to answer is treated like those who answered; the interval sums
 * the categories' ones. */
function orientation(
  data: PlaceData,
  gender: 'homem' | 'mulher',
  sex: number,
  ageGroup: number,
): { p: Interval; noAnswer: number } {
  const sameSex = SEXES[sex] === gender
  const categories = sameSex
    ? ['homossexual', 'bissexual']
    : ['heterossexual', 'bissexual']
  const noAnswer =
    pnsRow(data, 'orientacao', sex, ageGroup, 'nao-sabe')[1] +
    pnsRow(data, 'orientacao', sex, ageGroup, 'recusou')[1]
  const sum = [0, 0, 0]
  for (const c of categories) {
    const row = pnsRow(data, 'orientacao', sex, ageGroup, c)
    for (let i = 0; i < 3; i++) sum[i]! += row[i]!
  }
  const r = 1 - noAnswer
  return {
    p: [sum[0]! / r, sum[1]! / r, Math.min(1, sum[2]! / r)],
    noAnswer,
  }
}

/** P(height in [min, max]) = F(max) − F(min − 1), with F the PNS cumulative. */
function height(
  data: PlaceData,
  sex: number,
  ageGroup: number,
  min: number,
  max: number,
): Interval {
  const cumulative = (cm: number): Interval =>
    pnsRow(data, 'altura', sex, ageGroup, `ate-${cm}`)
  const upTo: Interval = max >= MAX_HEIGHT ? [1, 1, 1] : cumulative(max)
  const below: Interval = min <= MIN_HEIGHT ? [0, 0, 0] : cumulative(min - 1)
  const central = Math.max(0, upTo[1] - below[1])
  return [
    Math.min(central, Math.max(0, upTo[0] - below[2])),
    central,
    Math.max(central, Math.min(1, upTo[2] - below[0])),
  ]
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

  // Everything that depends only on sex × age group (and union, in a
  // municipality) comes out before the loop.
  const age = active.has('age')
    ? soughtAge(profile, r)
    : { min: MIN_SOUGHT_AGE, max: MAX_SOUGHT_AGE }
  const { sexes } = whoIsSought(profile)
  const G = AGE_GROUPS.length
  const factor = new Float64Array(SEXES.length * G)
  const pns: Interval[] = []
  const noAnswer = new Float64Array(SEXES.length * G)
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
      let p: [number, number, number] = [1, 1, 1]
      const times = (q: Interval) =>
        (p = [p[0] * q[0], p[1] * q[1], p[2] * q[2]])
      if (factor[i]! > 0) {
        if (
          active.has('orientation') &&
          (profile?.gender === 'homem' || profile?.gender === 'mulher')
        ) {
          const o = orientation(ofPlace, profile.gender, s, g)
          times(o.p)
          noAnswer[i] = o.noAnswer
        }
        if (active.has('height'))
          times(height(ofPlace, s, g, r.height.min, r.height.max))
        if (active.has('smoking')) times(pnsRow(ofPlace, 'fumo', s, g, 'nao'))
      }
      pns[i] = p
    }
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
  const singleSex = sexes.length === 1 ? sexes[0] : -1

  let min = 0
  let central = 0
  let max = 0
  let records = 0
  let noAnswerSum = 0
  let weightSum = 0
  const d = ofPlace
  for (let i = 0; i < d.size; i++) {
    const s = d.sex[i]!
    if (singleSex >= 0 && s !== singleSex) continue
    if (partner && d.union[i] === 1) continue
    if (d.education[i]! < education) continue
    if (d.income[i]! < income) continue
    if (colors && !colors.has(d.color[i]!)) continue
    if (religions && !religions.has(d.religion[i]!)) continue
    if (noChildren && d.children[i] === 2) continue
    if (notWithParents && d.parents[i] !== 1) continue
    if (d.work[i]! < work) continue
    const sg = s * G + d.ageGroup[i]!
    let f = factor[sg]!
    if (municipality)
      f *= municipality[unionIndex(s, d.ageGroup[i]!, d.union[i]!)]!
    if (f === 0) continue
    const w = d.weight[i]! * f
    const p = pns[sg]!
    min += w * p[0]
    central += w * p[1]
    max += w * p[2]
    records += d.records[i]! * f
    noAnswerSum += w * noAnswer[sg]!
    weightSum += w
  }
  const error = 1.96 / Math.sqrt(Math.max(records, 1))
  return {
    min: min * Math.max(0, 1 - error),
    central,
    max: max * (1 + error),
    records,
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
    active.some((k) => REQUIREMENT_SOURCE[k] === 'PNS') && {
      id: 'independence',
      strong: false,
      text: 'Os Requisitos da PNS entram supondo que, dentro do mesmo sexo e idade, não dependem dos do Censo.',
    },
    {
      id: 'source',
      strong: false,
      text: 'Censo de julho de 2022 e PNS 2019. Fonte: IBGE.',
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

  const { noAnswer: _, ...result } = current
  const { noAnswer: __, ...fromBase } = base
  const sought = whoIsSought(input.profile)
  return {
    target: sought.target,
    active,
    result: {
      ...result,
      unstable: current.records < RECORDS_FOR_STABLE,
    },
    base: fromBase,
    costs,
    funnel,
    naive,
    caveats: caveats(input, active, current),
    children: sought.children,
  }
}
