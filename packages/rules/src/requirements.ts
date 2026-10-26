// The possible group's requirements (#8, story 41): what the visitor asks of
// whoever they seek. It is the state kept in localStorage, which the B5 card
// (#32) reads and the link (#34) carries. Everything here serializes to JSON.
// The values of the closed lists (education, income, color, religion) are the
// link's, so they stay in Portuguese (ADR 0039).
import type { Profile } from './profile.ts'

/** The 27 states (UFs), with the IBGE code (the first two digits of a
 * municipality's code). */
export const STATES = [
  { abbr: 'AC', ibgeCode: '12', name: 'Acre' },
  { abbr: 'AL', ibgeCode: '27', name: 'Alagoas' },
  { abbr: 'AP', ibgeCode: '16', name: 'Amapá' },
  { abbr: 'AM', ibgeCode: '13', name: 'Amazonas' },
  { abbr: 'BA', ibgeCode: '29', name: 'Bahia' },
  { abbr: 'CE', ibgeCode: '23', name: 'Ceará' },
  { abbr: 'DF', ibgeCode: '53', name: 'Distrito Federal' },
  { abbr: 'ES', ibgeCode: '32', name: 'Espírito Santo' },
  { abbr: 'GO', ibgeCode: '52', name: 'Goiás' },
  { abbr: 'MA', ibgeCode: '21', name: 'Maranhão' },
  { abbr: 'MT', ibgeCode: '51', name: 'Mato Grosso' },
  { abbr: 'MS', ibgeCode: '50', name: 'Mato Grosso do Sul' },
  { abbr: 'MG', ibgeCode: '31', name: 'Minas Gerais' },
  { abbr: 'PA', ibgeCode: '15', name: 'Pará' },
  { abbr: 'PB', ibgeCode: '25', name: 'Paraíba' },
  { abbr: 'PR', ibgeCode: '41', name: 'Paraná' },
  { abbr: 'PE', ibgeCode: '26', name: 'Pernambuco' },
  { abbr: 'PI', ibgeCode: '22', name: 'Piauí' },
  { abbr: 'RJ', ibgeCode: '33', name: 'Rio de Janeiro' },
  { abbr: 'RN', ibgeCode: '24', name: 'Rio Grande do Norte' },
  { abbr: 'RS', ibgeCode: '43', name: 'Rio Grande do Sul' },
  { abbr: 'RO', ibgeCode: '11', name: 'Rondônia' },
  { abbr: 'RR', ibgeCode: '14', name: 'Roraima' },
  { abbr: 'SC', ibgeCode: '42', name: 'Santa Catarina' },
  { abbr: 'SP', ibgeCode: '35', name: 'São Paulo' },
  { abbr: 'SE', ibgeCode: '28', name: 'Sergipe' },
  { abbr: 'TO', ibgeCode: '17', name: 'Tocantins' },
] as const
export type StateCode = (typeof STATES)[number]['abbr']

/** The values of the #36 CSV, from lowest to highest when there is an order. */
export const EDUCATIONS = [
  'sem-fundamental',
  'fundamental',
  'medio',
  'superior',
] as const
export type Education = (typeof EDUCATIONS)[number]
export const INCOMES = ['sem-renda', 'ate-1', '1-2', '2-5', '5+'] as const
export type Income = (typeof INCOMES)[number]
export const COLORS = [
  'branca',
  'preta',
  'parda',
  'amarela',
  'indigena',
] as const
export type Color = (typeof COLORS)[number]
export const RELIGIONS = [
  'catolica',
  'evangelica',
  'espirita',
  'umbanda-candomble',
  'sem-religiao',
  'outra',
] as const
export type Religion = (typeof RELIGIONS)[number]

/** "Trabalha" (employed) and its variant "tem negócio próprio" (employer or
 * self-employed). */
export const WORKS = ['trabalha', 'negocio'] as const
export type Work = (typeof WORKS)[number]

/** The minimum education and income one can ask for (the lowest step is
 * "any"). */
export const MIN_EDUCATIONS = [
  'fundamental',
  'medio',
  'superior',
] as const satisfies ReadonlyArray<Education>
export const MIN_INCOMES = [
  'ate-1',
  '1-2',
  '2-5',
  '5+',
] as const satisfies ReadonlyArray<Income>

/** The sought age goes from 18 to 80, and 80 means "80 or more". */
export const MIN_SOUGHT_AGE = 18
export const MAX_SOUGHT_AGE = 80
/** Height goes from 140 to 200 cm; at the ends, no limit on that side. */
export const MIN_HEIGHT = 140
export const MAX_HEIGHT = 200

export interface Range {
  readonly min: number
  readonly max: number
}

export interface Place {
  readonly state: StateCode
  /** The 7-digit IBGE code; without it, the whole state. */
  readonly municipality?: string
}

export interface Requirements {
  /** `null` = the profile's age ±5, until the visitor changes it. */
  readonly age: Range | null
  /** `null` = the whole of Brazil. */
  readonly place: Place | null
  /** "Não mora com companheiro(a)", on by default. */
  readonly noLiveInPartner: boolean
  /** The minimum; `null` = any. */
  readonly education: (typeof MIN_EDUCATIONS)[number] | null
  readonly income: (typeof MIN_INCOMES)[number] | null
  /** None checked = any of them. */
  readonly colors: ReadonlyArray<Color>
  readonly religions: ReadonlyArray<Religion>
  readonly noChildren: boolean
  /** "Não mora com os pais": neither the mother, the father nor a
   * step-parent lives in the same household. */
  readonly notWithParents: boolean
  /** `null` = works or not. */
  readonly work: Work | null
  readonly height: Range
  readonly nonSmoker: boolean
}

export const DEFAULT_REQUIREMENTS: Requirements = {
  age: null,
  place: null,
  noLiveInPartner: true,
  education: null,
  income: null,
  colors: [],
  religions: [],
  noChildren: false,
  notWithParents: false,
  work: null,
  height: { min: MIN_HEIGHT, max: MAX_HEIGHT },
  nonSmoker: false,
}

/** Who is sought, as the count says it. */
export type Target = 'men' | 'women' | 'people'

/** The target in the sentence: "mulheres de 25 a 35 em SP". */
export const TARGET_NAME: Readonly<Record<Target, string>> = {
  men: 'homens',
  women: 'mulheres',
  people: 'pessoas',
}

/** "Sem filhos": it applies, it applies only to women (seeking both), or
 * there is no data (seeking men). The Census only asks women. */
export type ChildrenData = 'applies' | 'women-only' | 'no-data'

/** What the profile's `seeks` decides in the count, in one place. */
export interface Sought {
  /** The Census sex codes in the count: 0 man, 1 woman. */
  readonly sexes: ReadonlyArray<0 | 1>
  /** Who is sought, for the sentence. */
  readonly target: Target
  readonly children: ChildrenData
}

const MEN: Sought = { sexes: [0], target: 'men', children: 'no-data' }
const WOMEN: Sought = { sexes: [1], target: 'women', children: 'applies' }
const PEOPLE: Sought = {
  sexes: [0, 1],
  target: 'people',
  children: 'women-only',
}

/** Without saying who they seek, the count joins both, as with `ambos`. */
export const whoIsSought = (profile: Profile | null): Sought =>
  profile?.seeks === 'homens'
    ? MEN
    : profile?.seeks === 'mulheres'
      ? WOMEN
      : PEOPLE

/** The sought age: the chosen one, or the profile's ±5, or any. */
export function soughtAge(
  profile: Profile | null,
  requirements: Requirements,
): Range {
  if (requirements.age) return requirements.age
  if (profile?.age === undefined)
    return { min: MIN_SOUGHT_AGE, max: MAX_SOUGHT_AGE }
  return {
    min: Math.max(MIN_SOUGHT_AGE, Math.min(MAX_SOUGHT_AGE, profile.age - 5)),
    max: Math.min(MAX_SOUGHT_AGE, profile.age + 5),
  }
}

const oneOf = <T extends string>(
  list: ReadonlyArray<T>,
  value: unknown,
): T | undefined => list.find((item) => item === value)

const manyOf = <T extends string>(
  list: ReadonlyArray<T>,
  value: unknown,
): T[] =>
  Array.isArray(value) ? list.filter((item) => value.includes(item)) : []

function range(value: unknown, min: number, max: number): Range | null {
  if (typeof value !== 'object' || value === null) return null
  const { min: a, max: b } = value as Record<string, unknown>
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null
  const from = a as number
  const to = b as number
  return from >= min && to <= max && from <= to ? { min: from, max: to } : null
}

function place(value: unknown): Place | null {
  if (typeof value !== 'object' || value === null) return null
  const raw = value as Record<string, unknown>
  const state = STATES.find((u) => u.abbr === raw.state)
  if (!state) return null
  const municipality = raw.municipality
  return typeof municipality === 'string' &&
    /^\d{7}$/.test(municipality) &&
    municipality.startsWith(state.ibgeCode)
    ? { state: state.abbr, municipality }
    : { state: state.abbr }
}

/** The requirements the visitor can turn on and release (orientation comes
 * from the profile). */
export const REQUIREMENTS = [
  'age',
  'place',
  'partner',
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
export type VisitorRequirement = (typeof REQUIREMENTS)[number]

/** The requirements with that one back to the "any" default (the "soltar"
 * button). */
export function release(
  requirements: Requirements,
  requirement: VisitorRequirement,
): Requirements {
  const defaults = DEFAULT_REQUIREMENTS
  const released: Record<VisitorRequirement, Partial<Requirements>> = {
    age: {
      age: { min: MIN_SOUGHT_AGE, max: MAX_SOUGHT_AGE },
    },
    place: { place: null },
    partner: { noLiveInPartner: false },
    education: { education: null },
    income: { income: null },
    color: { colors: [] },
    religion: { religions: [] },
    children: { noChildren: false },
    parents: { notWithParents: false },
    work: { work: null },
    height: { height: defaults.height },
    smoking: { nonSmoker: false },
  }
  return { ...requirements, ...released[requirement] }
}

export const REQUIREMENT_TITLE: Readonly<
  Record<VisitorRequirement | 'orientation', string>
> = {
  age: 'Idade',
  place: 'Onde',
  partner: 'Disponível',
  orientation: 'Orientação',
  education: 'Escolaridade',
  income: 'Renda',
  color: 'Cor ou raça',
  religion: 'Religião',
  children: 'Filhos',
  parents: 'Pais',
  work: 'Trabalho',
  height: 'Altura',
  smoking: 'Cigarro',
}

export const EDUCATION_LABEL: Readonly<
  Record<(typeof MIN_EDUCATIONS)[number], string>
> = {
  fundamental: 'fundamental completo',
  medio: 'médio completo',
  superior: 'superior completo',
}

export const INCOME_LABEL: Readonly<
  Record<(typeof MIN_INCOMES)[number], string>
> = {
  'ate-1': 'tem alguma renda',
  '1-2': 'mais de 1 salário mínimo',
  '2-5': 'mais de 2 salários mínimos',
  '5+': 'mais de 5 salários mínimos',
}

export const WORK_LABEL: Readonly<Record<Work, string>> = {
  trabalha: 'trabalha',
  negocio: 'tem negócio próprio',
}

export const COLOR_LABEL: Readonly<Record<Color, string>> = {
  branca: 'branca',
  preta: 'preta',
  parda: 'parda',
  amarela: 'amarela',
  indigena: 'indígena',
}

export const RELIGION_LABEL: Readonly<Record<Religion, string>> = {
  catolica: 'católica',
  evangelica: 'evangélica',
  espirita: 'espírita',
  'umbanda-candomble': 'umbanda ou candomblé',
  'sem-religiao': 'sem religião',
  outra: 'outra',
}

const orList = (items: ReadonlyArray<string>) =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} ou ${items.at(-1)}`

export const stateName = (uf: StateCode): string =>
  STATES.find((u) => u.abbr === uf)?.name ?? uf

/** A requirement's value written as in the sentence: "25 a 35 anos", "pelo
 * menos superior completo", "qualquer religião". `municipality` is the name,
 * when there is one. */
export function requirementValue(
  requirement: VisitorRequirement | 'orientation',
  profile: Profile | null,
  r: Requirements,
  municipality?: string,
): string {
  switch (requirement) {
    case 'age': {
      const { min, max } = soughtAge(profile, r)
      if (min <= MIN_SOUGHT_AGE && max >= MAX_SOUGHT_AGE)
        return 'qualquer idade'
      return max >= MAX_SOUGHT_AGE
        ? `${min} anos ou mais`
        : `${min} a ${max} anos`
    }
    case 'place':
      if (!r.place) return 'Brasil inteiro'
      return r.place.municipality && municipality
        ? `${municipality} (${r.place.state})`
        : stateName(r.place.state)
    case 'partner':
      return r.noLiveInPartner
        ? 'não mora com companheiro(a)'
        : 'mora ou não com companheiro(a)'
    case 'orientation':
      return profile?.gender === 'homem' || profile?.gender === 'mulher'
        ? `se interessa por ${profile.gender === 'homem' ? 'homens' : 'mulheres'}`
        : 'qualquer orientação'
    case 'education':
      return r.education
        ? `pelo menos ${EDUCATION_LABEL[r.education]}`
        : 'qualquer escolaridade'
    case 'income':
      return r.income ? INCOME_LABEL[r.income] : 'qualquer renda'
    case 'color':
      return r.colors.length
        ? `cor ${orList(r.colors.map((c) => COLOR_LABEL[c]))}`
        : 'qualquer cor ou raça'
    case 'religion':
      return r.religions.length
        ? `religião ${orList(r.religions.map((c) => RELIGION_LABEL[c]))}`
        : 'qualquer religião'
    case 'children':
      if (whoIsSought(profile).children === 'no-data')
        return 'sem dado para homens'
      return r.noChildren ? 'sem filhos' : 'com ou sem filhos'
    case 'parents':
      return r.notWithParents
        ? 'não mora com os pais'
        : 'mora ou não com os pais'
    case 'work':
      return r.work ? WORK_LABEL[r.work] : 'trabalha ou não'
    case 'height': {
      const { min, max } = r.height
      if (min <= MIN_HEIGHT && max >= MAX_HEIGHT) return 'qualquer altura'
      if (max >= MAX_HEIGHT) return `a partir de ${min} cm`
      if (min <= MIN_HEIGHT) return `até ${max} cm`
      return `${min} a ${max} cm`
    }
    case 'smoking':
      return r.nonSmoker ? 'não fuma' : 'fuma ou não'
  }
}

/** Reads the requirements from an untrusted source (localStorage, link): what
 * is not valid goes back to the default. Never fails. */
export function readRequirements(value: unknown): Requirements {
  const raw = (
    typeof value === 'object' && value !== null ? value : {}
  ) as Record<string, unknown>
  const defaults = DEFAULT_REQUIREMENTS
  return {
    age: range(raw.age, MIN_SOUGHT_AGE, MAX_SOUGHT_AGE),
    place: place(raw.place),
    noLiveInPartner:
      typeof raw.noLiveInPartner === 'boolean'
        ? raw.noLiveInPartner
        : defaults.noLiveInPartner,
    education: oneOf(MIN_EDUCATIONS, raw.education) ?? null,
    income: oneOf(MIN_INCOMES, raw.income) ?? null,
    colors: manyOf(COLORS, raw.colors),
    religions: manyOf(RELIGIONS, raw.religions),
    noChildren: raw.noChildren === true,
    notWithParents: raw.notWithParents === true,
    work: oneOf(WORKS, raw.work) ?? null,
    height: range(raw.height, MIN_HEIGHT, MAX_HEIGHT) ?? defaults.height,
    nonSmoker: raw.nonSmoker === true,
  }
}
