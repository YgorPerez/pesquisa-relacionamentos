// The calculators' state in the link (ADR 0001, #14; stories 62–67). "Copiar
// link" writes the profile and the count (possible group) or the top 3 and
// the outcome (priorities) in the query, with the format version in `v`.
// Whoever opens the link gets that state instead of the stored one.
//
// The format already circulates in old links: changing a key breaks whoever
// received one. That is why each version has its reader, and a new version
// adds another without deleting the old ones. The query keys and values stay
// in Portuguese (ADR 0039). The opt-out of being counted (#35) never goes
// here.
import { readProfile, type ProfileGender, type Profile } from './profile.ts'
import { formatRange } from './numbers.ts'
import {
  top3Alert,
  readPriorities,
  OUTCOME_NAME,
  type TraitWithEvidence,
  type PrioritiesState,
} from './priorities.ts'
import {
  MAX_HEIGHT,
  MIN_HEIGHT,
  MAX_SOUGHT_AGE,
  MIN_SOUGHT_AGE,
  readRequirements,
  whoIsSought,
  DEFAULT_REQUIREMENTS,
  requirementValue,
  type Range,
  type Sought,
  type Requirements,
} from './requirements.ts'

export const LINK_CALCULATORS = ['grupo-possivel', 'prioridades'] as const
export type LinkCalculator = (typeof LINK_CALCULATORS)[number]

export type LinkState =
  | {
      readonly calculator: 'grupo-possivel'
      readonly profile: Profile | null
      /** `null`: the sender never touched the requirements (or left them all
       * at the default). */
      readonly requirements: Requirements | null
    }
  | {
      readonly calculator: 'prioridades'
      /** Only the profile's gender: the count uses it for the bias note, and
       * the rest does not go. */
      readonly gender: ProfileGender | null
      readonly priorities: PrioritiesState
    }

/** The version `linkQuery` writes. */
export const LINK_VERSION = 1

type Params = ReadonlyMap<string, string>

// --- raw query ----------------------------------------------------------------
// No `URLSearchParams`: the package has no DOM and no node types.

/** The query's keys and values; `null` if it does not decode. A `+` stays `+`
 * (no value has a space, and the income "5+" can arrive unescaped). */
function decode(query: string): Params | null {
  const params = new Map<string, string>()
  for (const pair of query.replace(/^\?/, '').split('&')) {
    if (pair === '') continue
    const i = pair.indexOf('=')
    const [key, value] =
      i < 0 ? [pair, ''] : [pair.slice(0, i), pair.slice(i + 1)]
    try {
      const name = decodeURIComponent(key)
      if (!params.has(name)) params.set(name, decodeURIComponent(value))
    } catch {
      return null
    }
  }
  return params
}

/** Escapes each value, except the lists' comma, which stays readable. */
const encode = (pairs: ReadonlyArray<readonly [string, string]>): string =>
  pairs
    .map(
      ([key, value]) =>
        `${key}=${encodeURIComponent(value).replace(/%2C/g, ',')}`,
    )
    .join('&')

const writeRange = ({ min, max }: Range) => `${min}-${max}`

function readRange(text: string | undefined): Range | null {
  const m = text?.match(/^(\d{1,3})-(\d{1,3})$/)
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null
}

const list = (text: string | undefined): string[] =>
  text ? text.split(',') : []

// --- version 1 ----------------------------------------------------------------
// v=1&genero=homem&procura=mulheres&idade=30
//   Possible group: &idades=25-35&uf=SP&municipio=3550308&companheiro=nao
//     &escolaridade=superior&renda=2-5&cor=preta,parda&religiao=catolica
//     &sem-filhos=sim&altura=160-200&nao-fuma=sim (only what is off default)
//   Priorities: only the profile's gender, &topo=renda,sexo,calma&desfecho=satisfacao

const REQUIREMENT_KEYS_V1 = [
  'idades',
  'uf',
  'municipio',
  'companheiro',
  'escolaridade',
  'renda',
  'cor',
  'religiao',
  'sem-filhos',
  'altura',
  'nao-fuma',
] as const

function writeV1(state: LinkState): Array<readonly [string, string]> {
  const pairs: Array<readonly [string, string]> = [['v', String(LINK_VERSION)]]
  if (state.calculator === 'prioridades') {
    if (state.gender) pairs.push(['genero', state.gender])
    const { topo3: top3, desfecho: outcome } = state.priorities
    if (top3.length > 0) pairs.push(['topo', top3.join(',')])
    pairs.push(['desfecho', outcome])
    return pairs
  }

  const p = state.profile
  if (p?.genero) pairs.push(['genero', p.genero])
  if (p?.procura) pairs.push(['procura', p.procura])
  if (p?.idade !== undefined) pairs.push(['idade', String(p.idade)])
  const r = state.requirements
  if (!r) return pairs
  const defaults = DEFAULT_REQUIREMENTS
  if (r.idade) pairs.push(['idades', writeRange(r.idade)])
  if (r.lugar) {
    pairs.push(['uf', r.lugar.uf])
    if (r.lugar.municipio) pairs.push(['municipio', r.lugar.municipio])
  }
  if (r.companheiro !== defaults.companheiro)
    pairs.push(['companheiro', r.companheiro ? 'sim' : 'nao'])
  if (r.escolaridade) pairs.push(['escolaridade', r.escolaridade])
  if (r.renda) pairs.push(['renda', r.renda])
  if (r.cores.length > 0) pairs.push(['cor', r.cores.join(',')])
  if (r.religioes.length > 0) pairs.push(['religiao', r.religioes.join(',')])
  if (r.semFilhos) pairs.push(['sem-filhos', 'sim'])
  if (r.altura.min > MIN_HEIGHT || r.altura.max < MAX_HEIGHT)
    pairs.push(['altura', writeRange(r.altura)])
  if (r.naoFuma) pairs.push(['nao-fuma', 'sim'])
  return pairs
}

function readV1(
  calculator: LinkCalculator,
  q: Params,
  ids?: ReadonlyArray<string>,
): LinkState {
  if (calculator === 'prioridades') {
    // Older links carried `procura` and `idade` too: they stay out.
    const gender = readProfile({ genero: q.get('genero') })?.genero ?? null
    const priorities = readPriorities(
      { topo3: list(q.get('topo')), desfecho: q.get('desfecho') },
      ids,
    )!
    return { calculator, gender, priorities }
  }

  const profile = readProfile({
    genero: q.get('genero'),
    procura: q.get('procura'),
    idade: q.get('idade'),
  })

  if (!REQUIREMENT_KEYS_V1.some((key) => q.has(key)))
    return { calculator, profile, requirements: null }
  const uf = q.get('uf')
  const requirements = readRequirements({
    idade: readRange(q.get('idades')),
    lugar: uf ? { uf, municipio: q.get('municipio') } : null,
    companheiro:
      q.get('companheiro') === 'nao' ? false : DEFAULT_REQUIREMENTS.companheiro,
    escolaridade: q.get('escolaridade'),
    renda: q.get('renda'),
    cores: list(q.get('cor')),
    religioes: list(q.get('religiao')),
    semFilhos: q.get('sem-filhos') === 'sim',
    altura: readRange(q.get('altura')),
    naoFuma: q.get('nao-fuma') === 'sim',
  })
  return { calculator, profile, requirements }
}

/** One reader per format version. A new version comes in here, and the old
 * ones stay. */
const READERS: Readonly<Record<string, typeof readV1>> = {
  '1': readV1,
}

// --- the sentence of what the link reveals (story 63) --------------------------

const GENDER_IN_SENTENCE: Readonly<
  Record<NonNullable<Profile['genero']>, string>
> = {
  homem: 'homem',
  mulher: 'mulher',
  outro: 'outro gênero',
}

const SEEKS_IN_SENTENCE: Readonly<
  Record<NonNullable<Profile['procura']>, string>
> = {
  homens: 'homens',
  mulheres: 'mulheres',
  ambos: 'homens e mulheres',
}

const EDUCATION_IN_SENTENCE: Readonly<
  Record<NonNullable<Requirements['escolaridade']>, string>
> = {
  fundamental: 'ensino fundamental',
  medio: 'ensino médio',
  superior: 'ensino superior',
}

const asList = (items: ReadonlyArray<string>): string =>
  items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`

/** "de 25 a 35", "de 40 anos ou mais"; empty if the range is any age. */
function agesInSentence(age: Range | null): string {
  if (!age || (age.min <= MIN_SOUGHT_AGE && age.max >= MAX_SOUGHT_AGE))
    return ''
  return age.max >= MAX_SOUGHT_AGE
    ? `de ${age.min} anos ou mais`
    : `de ${age.min} a ${age.max}`
}

function profileInSentence(profile: Profile | null): string[] {
  return [
    profile?.genero ? GENDER_IN_SENTENCE[profile.genero] : '',
    profile?.idade !== undefined ? String(profile.idade) : '',
  ].filter(Boolean)
}

export interface SentenceOptions {
  /** The name of the link's municipality, which only the possible group data
   * knows. */
  readonly municipality?: string
  /** The name of each priorities trait, by id. */
  readonly names?: Readonly<Record<string, string>>
}

/** "Este link mostra: homem, 30, procura mulheres de 25 a 35, ensino superior,
 * em SP.": everything the query carries, in Portuguese, for the visitor to
 * decide whether to share. */
export function linkSentence(
  state: LinkState,
  options: SentenceOptions = {},
): string {
  if (state.calculator === 'prioridades') {
    const parts = state.gender ? [GENDER_IN_SENTENCE[state.gender]] : []
    const { topo3: top3, desfecho: outcome } = state.priorities
    const names = top3.map((id) => (options.names?.[id] ?? id).toLowerCase())
    parts.push(
      names.length
        ? `topo 3 ${asList(names)}`
        : 'nenhuma característica escolhida',
    )
    return `Este link mostra: ${parts.join(', ')}, em ${OUTCOME_NAME[outcome].toLowerCase()}.`
  }

  const { profile } = state
  const parts = profileInSentence(profile)
  const r = state.requirements
  const ages = agesInSentence(r?.idade ?? null)
  if (profile?.procura || ages)
    parts.push(
      [
        'procura',
        profile?.procura ? SEEKS_IN_SENTENCE[profile.procura] : 'pessoas',
        ages,
      ]
        .filter(Boolean)
        .join(' '),
    )
  if (r) {
    parts.push(...otherRequirements(profile, r))
    if (r.lugar) parts.push(placeInSentence(r, options.municipality))
  }
  if (parts.length === 0)
    return 'Este link mostra só a conta do Brasil inteiro, sem nada seu.'
  return `Este link mostra: ${parts.join(', ')}.`
}

/** The requirements off default, except age and place, which the sentence
 * says separately. */
function otherRequirements(profile: Profile | null, r: Requirements): string[] {
  const value = (k: Parameters<typeof requirementValue>[0]) =>
    requirementValue(k, profile, r)
  return [
    r.companheiro !== DEFAULT_REQUIREMENTS.companheiro && value('companheiro'),
    r.escolaridade && EDUCATION_IN_SENTENCE[r.escolaridade],
    r.renda && value('renda'),
    r.cores.length > 0 && value('cor'),
    r.religioes.length > 0 && value('religiao'),
    r.semFilhos &&
      whoIsSought(profile).children !== 'sem-dado' &&
      value('filhos'),
    (r.altura.min > MIN_HEIGHT || r.altura.max < MAX_HEIGHT) && value('altura'),
    r.naoFuma && value('fumo'),
  ].filter((x): x is string => typeof x === 'string')
}

const placeInSentence = (
  r: Requirements,
  municipality: string | undefined,
): string =>
  !r.lugar
    ? 'no Brasil'
    : r.lugar.municipio && municipality
      ? `em ${municipality} (${r.lugar.uf})`
      : `em ${r.lugar.uf}`

// --- the social preview (story 66) ----------------------------------------------
// The Open Graph of a calculator opened with state. It says the result and
// who is sought, never the gender or age of whoever shared (ADR 0001). Nor
// the orientation, which gives the gender away, nor the age range taken from
// the profile (their age ±5), which gives the age away.

export interface Preview {
  readonly title: string
  readonly description: string
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

/** What the preview needs from the count (`Estimate` fits). */
export interface PreviewCount {
  readonly target: Sought['target']
  readonly result: { readonly min: number; readonly max: number }
}

/** "Entre 120 mil e 180 mil mulheres de 25 a 35 em SP". */
export function groupPreview(
  state: Extract<LinkState, { calculator: 'grupo-possivel' }>,
  count: PreviewCount,
  options: Pick<SentenceOptions, 'municipality'> = {},
): Preview {
  const r = state.requirements ?? DEFAULT_REQUIREMENTS
  const chosen = agesInSentence(r.idade)
  const fromProfile = !r.idade && state.profile?.idade !== undefined
  const title = [
    formatRange(count.result.min, count.result.max),
    count.target,
    chosen,
    `${placeInSentence(r, options.municipality)}${fromProfile ? ', na idade procurada' : ''}`,
  ]
    .filter(Boolean)
    .join(' ')
  // Without the profile: `filhos` depends only on who is sought, which the
  // title already says.
  const others = otherRequirements({ procura: state.profile?.procura }, r)
  const description = [
    'Pela conta do Grupo possível, com o Censo 2022 e a PNS 2019.',
    others.length > 0 && `Também pediu: ${others.join(', ')}.`,
    'Faça a sua conta.',
  ]
    .filter(Boolean)
    .join(' ')
  return { title: capitalize(title), description }
}

/** "Topo 3: química sexual e renda", with the alert; `null` with nothing
 * chosen. */
export function prioritiesPreview(
  traits: ReadonlyArray<TraitWithEvidence>,
  priorities: PrioritiesState,
): Preview | null {
  const { topo3: top3, desfecho: outcome } = priorities
  const names = top3.flatMap((id) =>
    traits.filter((c) => c.id === id).map((c) => c.nome.toLowerCase()),
  )
  if (names.length === 0) return null
  return {
    title: `Topo 3: ${asList(names)}`,
    description:
      top3Alert(traits, top3, outcome) ??
      `Para ${OUTCOME_NAME[outcome].toLowerCase()}, a evidência não põe nenhuma delas em "quase nada" ou "não sabemos".`,
  }
}

// --- interface ----------------------------------------------------------------

/** The link's query, without the `?`: "v=1&genero=homem&…". */
export const linkQuery = (state: LinkState): string => encode(writeV1(state))

/** The query belongs to a calculator link (it has `v`), valid or not. The
 * page clears this one from the bar; any other query (a campaign's, say)
 * stays. */
export const isLink = (query: string): boolean => /(^|[?&])v=/.test(query)

/** The state the link carries; `null` if the query is not a link's, does not
 * decode or has a version this code does not know. A single invalid value
 * drops out and the rest holds. `ids`, when given, limits the top 3 to the
 * traits that exist in the data. */
export function readLink(
  calculator: LinkCalculator,
  query: string,
  ids?: ReadonlyArray<string>,
): LinkState | null {
  const q = decode(query)
  const read = q && READERS[q.get('v') ?? '']
  return read ? read(calculator, q, ids) : null
}
