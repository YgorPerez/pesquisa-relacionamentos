// The possible group's requirements (#8, story 41): what the visitor asks of
// whoever they seek. It is the state kept in localStorage, which the B5 card
// (#32) reads and the link (#34) carries. Everything here serializes to JSON,
// so the keys and values stay in Portuguese: they are what browsers already
// stored.
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
  readonly uf: StateCode
  /** The 7-digit IBGE code; without it, the whole state. */
  readonly municipio?: string
}

export interface Requirements {
  /** `null` = the profile's age ±5, until the visitor changes it. */
  readonly idade: Range | null
  /** `null` = the whole of Brazil. */
  readonly lugar: Place | null
  /** "Não mora com companheiro(a)", on by default. */
  readonly companheiro: boolean
  /** The minimum; `null` = any. */
  readonly escolaridade: (typeof MIN_EDUCATIONS)[number] | null
  readonly renda: (typeof MIN_INCOMES)[number] | null
  /** None checked = any of them. */
  readonly cores: ReadonlyArray<Color>
  readonly religioes: ReadonlyArray<Religion>
  readonly semFilhos: boolean
  readonly altura: Range
  readonly naoFuma: boolean
}

export const DEFAULT_REQUIREMENTS: Requirements = {
  idade: null,
  lugar: null,
  companheiro: true,
  escolaridade: null,
  renda: null,
  cores: [],
  religioes: [],
  semFilhos: false,
  altura: { min: MIN_HEIGHT, max: MAX_HEIGHT },
  naoFuma: false,
}

/** What the profile's `procura` decides in the count, in one place. */
export interface Sought {
  /** The Census sex codes in the count: 0 man, 1 woman. */
  readonly sexes: ReadonlyArray<0 | 1>
  /** Who is sought, for the sentence. */
  readonly target: 'homens' | 'mulheres' | 'pessoas'
  /** "Sem filhos": the Census only asks women. */
  readonly children: 'vale' | 'so-mulheres' | 'sem-dado'
}

const MEN: Sought = { sexes: [0], target: 'homens', children: 'sem-dado' }
const WOMEN: Sought = { sexes: [1], target: 'mulheres', children: 'vale' }
const PEOPLE: Sought = {
  sexes: [0, 1],
  target: 'pessoas',
  children: 'so-mulheres',
}

/** Without saying who they seek, the count joins both, as with `ambos`. */
export const whoIsSought = (profile: Profile | null): Sought =>
  profile?.procura === 'homens'
    ? MEN
    : profile?.procura === 'mulheres'
      ? WOMEN
      : PEOPLE

/** The sought age: the chosen one, or the profile's ±5, or any. */
export function soughtAge(
  profile: Profile | null,
  requirements: Requirements,
): Range {
  if (requirements.idade) return requirements.idade
  if (profile?.idade === undefined)
    return { min: MIN_SOUGHT_AGE, max: MAX_SOUGHT_AGE }
  return {
    min: Math.max(MIN_SOUGHT_AGE, Math.min(MAX_SOUGHT_AGE, profile.idade - 5)),
    max: Math.min(MAX_SOUGHT_AGE, profile.idade + 5),
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
  const state = STATES.find((u) => u.abbr === raw.uf)
  if (!state) return null
  const municipality = raw.municipio
  return typeof municipality === 'string' &&
    /^\d{7}$/.test(municipality) &&
    municipality.startsWith(state.ibgeCode)
    ? { uf: state.abbr, municipio: municipality }
    : { uf: state.abbr }
}

/** The requirements the visitor can turn on and release (orientation comes
 * from the profile). */
export const REQUIREMENTS = [
  'idade',
  'lugar',
  'companheiro',
  'escolaridade',
  'renda',
  'cor',
  'religiao',
  'filhos',
  'altura',
  'fumo',
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
    idade: {
      idade: { min: MIN_SOUGHT_AGE, max: MAX_SOUGHT_AGE },
    },
    lugar: { lugar: null },
    companheiro: { companheiro: false },
    escolaridade: { escolaridade: null },
    renda: { renda: null },
    cor: { cores: [] },
    religiao: { religioes: [] },
    filhos: { semFilhos: false },
    altura: { altura: defaults.altura },
    fumo: { naoFuma: false },
  }
  return { ...requirements, ...released[requirement] }
}

export const REQUIREMENT_TITLE: Readonly<
  Record<VisitorRequirement | 'orientacao', string>
> = {
  idade: 'Idade',
  lugar: 'Onde',
  companheiro: 'Disponível',
  orientacao: 'Orientação',
  escolaridade: 'Escolaridade',
  renda: 'Renda',
  cor: 'Cor ou raça',
  religiao: 'Religião',
  filhos: 'Filhos',
  altura: 'Altura',
  fumo: 'Cigarro',
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
  requirement: VisitorRequirement | 'orientacao',
  profile: Profile | null,
  r: Requirements,
  municipality?: string,
): string {
  switch (requirement) {
    case 'idade': {
      const { min, max } = soughtAge(profile, r)
      if (min <= MIN_SOUGHT_AGE && max >= MAX_SOUGHT_AGE)
        return 'qualquer idade'
      return max >= MAX_SOUGHT_AGE
        ? `${min} anos ou mais`
        : `${min} a ${max} anos`
    }
    case 'lugar':
      if (!r.lugar) return 'Brasil inteiro'
      return r.lugar.municipio && municipality
        ? `${municipality} (${r.lugar.uf})`
        : stateName(r.lugar.uf)
    case 'companheiro':
      return r.companheiro
        ? 'não mora com companheiro(a)'
        : 'mora ou não com companheiro(a)'
    case 'orientacao':
      return profile?.genero === 'homem' || profile?.genero === 'mulher'
        ? `se interessa por ${profile.genero === 'homem' ? 'homens' : 'mulheres'}`
        : 'qualquer orientação'
    case 'escolaridade':
      return r.escolaridade
        ? `pelo menos ${EDUCATION_LABEL[r.escolaridade]}`
        : 'qualquer escolaridade'
    case 'renda':
      return r.renda ? INCOME_LABEL[r.renda] : 'qualquer renda'
    case 'cor':
      return r.cores.length
        ? `cor ${orList(r.cores.map((c) => COLOR_LABEL[c]))}`
        : 'qualquer cor ou raça'
    case 'religiao':
      return r.religioes.length
        ? `religião ${orList(r.religioes.map((c) => RELIGION_LABEL[c]))}`
        : 'qualquer religião'
    case 'filhos':
      if (whoIsSought(profile).children === 'sem-dado')
        return 'sem dado para homens'
      return r.semFilhos ? 'sem filhos' : 'com ou sem filhos'
    case 'altura': {
      const { min, max } = r.altura
      if (min <= MIN_HEIGHT && max >= MAX_HEIGHT) return 'qualquer altura'
      if (max >= MAX_HEIGHT) return `a partir de ${min} cm`
      if (min <= MIN_HEIGHT) return `até ${max} cm`
      return `${min} a ${max} cm`
    }
    case 'fumo':
      return r.naoFuma ? 'não fuma' : 'fuma ou não'
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
    idade: range(raw.idade, MIN_SOUGHT_AGE, MAX_SOUGHT_AGE),
    lugar: place(raw.lugar),
    companheiro:
      typeof raw.companheiro === 'boolean'
        ? raw.companheiro
        : defaults.companheiro,
    escolaridade: oneOf(MIN_EDUCATIONS, raw.escolaridade) ?? null,
    renda: oneOf(MIN_INCOMES, raw.renda) ?? null,
    cores: manyOf(COLORS, raw.cores),
    religioes: manyOf(RELIGIONS, raw.religioes),
    semFilhos: raw.semFilhos === true,
    altura: range(raw.altura, MIN_HEIGHT, MAX_HEIGHT) ?? defaults.altura,
    naoFuma: raw.naoFuma === true,
  }
}
