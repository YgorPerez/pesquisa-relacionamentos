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
import { andList } from './lists.ts'
import { formatRange, rangeParts } from './numbers.ts'
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
  TARGET_NAME,
  SENSITIVE_REQUIREMENTS,
  sensitiveLabel,
  sensitiveList,
  sensitiveOn,
  surveysOf,
  withoutSensitive,
  type SensitiveRequirement,
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

/** A Possible group link's state. */
type GroupLink = Extract<LinkState, { calculator: 'grupo-possivel' }>

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
//     &nao-obeso=sim&sem-depressao=sim&bissexual=sim&culto=sim (the
//     sensitive ones, only with consent: `sharedLink`)
//   Priorities: only the profile's gender, &topo=renda,sexo,calma&desfecho=satisfacao

/** Each sensitive Requirement's field and its query key. */
const SENSITIVE_KEYS = SENSITIVE_REQUIREMENTS.map((s) => [s.field, s.key] as const)

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
  'sem-pais',
  'trabalho',
  'casa-propria',
  'altura',
  'nao-fuma',
  'bebida',
  'exercicio',
  'saude-bucal',
  'nao-vape',
  'escritorio',
  ...SENSITIVE_KEYS.map(([, key]) => key),
]

function writeV1(state: LinkState): Array<readonly [string, string]> {
  const pairs: Array<readonly [string, string]> = [['v', String(LINK_VERSION)]]
  if (state.calculator === 'prioridades') {
    if (state.gender) pairs.push(['genero', state.gender])
    const { top3, outcome } = state.priorities
    if (top3.length > 0) pairs.push(['topo', top3.join(',')])
    pairs.push(['desfecho', outcome])
    return pairs
  }

  const p = state.profile
  if (p?.gender) pairs.push(['genero', p.gender])
  if (p?.seeks) pairs.push(['procura', p.seeks])
  if (p?.age !== undefined) pairs.push(['idade', String(p.age)])
  const r = state.requirements
  if (!r) return pairs
  const defaults = DEFAULT_REQUIREMENTS
  if (r.age) pairs.push(['idades', writeRange(r.age)])
  if (r.place) {
    pairs.push(['uf', r.place.state])
    if (r.place.municipality) pairs.push(['municipio', r.place.municipality])
  }
  if (r.noLiveInPartner !== defaults.noLiveInPartner)
    pairs.push(['companheiro', r.noLiveInPartner ? 'sim' : 'nao'])
  if (r.education) pairs.push(['escolaridade', r.education])
  if (r.income) pairs.push(['renda', r.income])
  if (r.colors.length > 0) pairs.push(['cor', r.colors.join(',')])
  if (r.religions.length > 0) pairs.push(['religiao', r.religions.join(',')])
  if (r.noChildren) pairs.push(['sem-filhos', 'sim'])
  if (r.notWithParents) pairs.push(['sem-pais', 'sim'])
  if (r.work) pairs.push(['trabalho', r.work])
  if (r.ownsHome) pairs.push(['casa-propria', 'sim'])
  if (r.height.min > MIN_HEIGHT || r.height.max < MAX_HEIGHT)
    pairs.push(['altura', writeRange(r.height)])
  if (r.nonSmoker) pairs.push(['nao-fuma', 'sim'])
  if (r.drinking.length > 0) pairs.push(['bebida', r.drinking.join(',')])
  if (r.exercises) pairs.push(['exercicio', 'sim'])
  if (r.goodTeeth) pairs.push(['saude-bucal', 'sim'])
  if (r.nonVaper) pairs.push(['nao-vape', 'sim'])
  if (r.office) pairs.push(['escritorio', 'sim'])
  for (const [field, key] of SENSITIVE_KEYS)
    if (r[field]) pairs.push([key, 'sim'])
  return pairs
}

function readV1(
  calculator: LinkCalculator,
  q: Params,
  ids?: ReadonlyArray<string>,
): LinkState {
  if (calculator === 'prioridades') {
    // Older links carried `procura` and `idade` too: they stay out.
    const gender = readProfile({ gender: q.get('genero') })?.gender ?? null
    const priorities = readPriorities(
      { top3: list(q.get('topo')), outcome: q.get('desfecho') },
      ids,
    )!
    return { calculator, gender, priorities }
  }

  const profile = readProfile({
    gender: q.get('genero'),
    seeks: q.get('procura'),
    age: q.get('idade'),
  })

  if (!REQUIREMENT_KEYS_V1.some((key) => q.has(key)))
    return { calculator, profile, requirements: null }
  const state = q.get('uf')
  const requirements = readRequirements({
    age: readRange(q.get('idades')),
    place: state ? { state, municipality: q.get('municipio') } : null,
    noLiveInPartner:
      q.get('companheiro') === 'nao'
        ? false
        : DEFAULT_REQUIREMENTS.noLiveInPartner,
    education: q.get('escolaridade'),
    income: q.get('renda'),
    colors: list(q.get('cor')),
    religions: list(q.get('religiao')),
    noChildren: q.get('sem-filhos') === 'sim',
    notWithParents: q.get('sem-pais') === 'sim',
    work: q.get('trabalho'),
    ownsHome: q.get('casa-propria') === 'sim',
    height: readRange(q.get('altura')),
    nonSmoker: q.get('nao-fuma') === 'sim',
    drinking: list(q.get('bebida')),
    exercises: q.get('exercicio') === 'sim',
    goodTeeth: q.get('saude-bucal') === 'sim',
    nonVaper: q.get('nao-vape') === 'sim',
    office: q.get('escritorio') === 'sim',
    ...Object.fromEntries(
      SENSITIVE_KEYS.map(([field, key]) => [field, q.get(key) === 'sim']),
    ),
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
  Record<NonNullable<Profile['gender']>, string>
> = {
  homem: 'homem',
  mulher: 'mulher',
  outro: 'outro gênero',
}

const SEEKS_IN_SENTENCE: Readonly<
  Record<NonNullable<Profile['seeks']>, string>
> = {
  homens: 'homens',
  mulheres: 'mulheres',
  ambos: 'homens e mulheres',
}

const EDUCATION_IN_SENTENCE: Readonly<
  Record<NonNullable<Requirements['education']>, string>
> = {
  fundamental: 'ensino fundamental',
  medio: 'ensino médio',
  superior: 'ensino superior',
}

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
    profile?.gender ? GENDER_IN_SENTENCE[profile.gender] : '',
    profile?.age !== undefined ? String(profile.age) : '',
  ].filter(Boolean)
}

export interface SentenceOptions {
  /** The name of the link's municipality, which only the possible group data
   * knows. */
  readonly municipality?: string
  /** The name of each priorities trait, by id. */
  readonly names?: Readonly<Record<string, string>>
  /** The sensitive Requirements on but left out of the link (`sharedLink`),
   * which the sentence names after what the link shows. */
  readonly leftOut?: ReadonlyArray<SensitiveRequirement>
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
    const { top3, outcome } = state.priorities
    const names = top3.map((id) => (options.names?.[id] ?? id).toLowerCase())
    parts.push(
      names.length
        ? `topo 3 ${andList(names)}`
        : 'nenhuma característica escolhida',
    )
    return `Este link mostra: ${parts.join(', ')}, em ${OUTCOME_NAME[outcome].toLowerCase()}.`
  }

  const { profile } = state
  const parts = profileInSentence(profile)
  const r = state.requirements
  const ages = agesInSentence(r?.age ?? null)
  if (profile?.seeks || ages)
    parts.push(
      [
        'procura',
        profile?.seeks ? SEEKS_IN_SENTENCE[profile.seeks] : 'pessoas',
        ages,
      ]
        .filter(Boolean)
        .join(' '),
    )
  if (r) {
    parts.push(...otherRequirements(profile, r))
    if (r.place) parts.push(placeInSentence(r, options.municipality))
  }
  const shows =
    parts.length === 0
      ? 'Este link mostra só a conta do Brasil inteiro, sem nada seu.'
      : `Este link mostra: ${parts.join(', ')}.`
  return [shows, leftOutInSentence(options.leftOut ?? [])]
    .filter(Boolean)
    .join(' ')
}

/** "Ficaram de fora 2 Requisitos sensíveis: IMC abaixo de 30 e bissexual." */
function leftOutInSentence(
  leftOut: ReadonlyArray<SensitiveRequirement>,
): string {
  if (leftOut.length === 0) return ''
  const names = sensitiveList(leftOut)
  return leftOut.length === 1
    ? `Ficou de fora 1 Requisito sensível: ${names}.`
    : `Ficaram de fora ${leftOut.length} Requisitos sensíveis: ${names}.`
}

/** The requirements off default, except age and place, which the sentence
 * says separately. */
function otherRequirements(profile: Profile | null, r: Requirements): string[] {
  const value = (k: Parameters<typeof requirementValue>[0]) =>
    requirementValue(k, profile, r)
  return [
    r.noLiveInPartner !== DEFAULT_REQUIREMENTS.noLiveInPartner &&
      value('partner'),
    r.education && EDUCATION_IN_SENTENCE[r.education],
    r.income && value('income'),
    r.colors.length > 0 && value('color'),
    r.religions.length > 0 && value('religion'),
    r.noChildren &&
      whoIsSought(profile).children !== 'no-data' &&
      value('children'),
    r.notWithParents && value('parents'),
    r.work && value('work'),
    r.ownsHome && value('home'),
    (r.height.min > MIN_HEIGHT || r.height.max < MAX_HEIGHT) && value('height'),
    r.nonSmoker && value('smoking'),
    r.drinking.length > 0 && value('drinking'),
    r.exercises && value('exercise'),
    r.goodTeeth && value('teeth'),
    r.nonVaper && value('vape'),
    r.office && value('office'),
    ...sensitiveOn(r).map(sensitiveLabel),
  ].filter((x): x is string => typeof x === 'string')
}

const placeInSentence = (
  r: Requirements,
  municipality: string | undefined,
): string =>
  !r.place
    ? 'no Brasil'
    : r.place.municipality && municipality
      ? `em ${municipality} (${r.place.state})`
      : `em ${r.place.state}`

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

/** What the preview and the share image say about the group, without the
 * sharer's gender or age: "mulheres de 25 a 35 em SP" and the other
 * Requirements. */
function soughtGroup(
  state: GroupLink,
  target: Sought['target'],
  municipality: string | undefined,
): { who: string; others: string[] } {
  const r = state.requirements ?? DEFAULT_REQUIREMENTS
  const fromProfile = !r.age && state.profile?.age !== undefined
  const who = [
    TARGET_NAME[target],
    agesInSentence(r.age),
    `${placeInSentence(r, municipality)}${fromProfile ? ', na idade procurada' : ''}`,
  ]
    .filter(Boolean)
    .join(' ')
  // Without the profile: `filhos` depends only on who is sought, which `who`
  // already says.
  return { who, others: otherRequirements({ seeks: state.profile?.seeks }, r) }
}

/** "Entre 120 mil e 180 mil mulheres de 25 a 35 em SP". */
export function groupPreview(
  state: GroupLink,
  count: PreviewCount,
  options: Pick<SentenceOptions, 'municipality'> = {},
): Preview {
  const { who, others } = soughtGroup(state, count.target, options.municipality)
  const title = `${formatRange(count.result.min, count.result.max)} ${who}`
  const surveys = surveysOf(state.requirements ?? DEFAULT_REQUIREMENTS, {
    article: true,
  })
  const description = [
    `Pela conta do Grupo possível, com ${andList(surveys)}.`,
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
  const { top3, outcome } = priorities
  const names = top3.flatMap((id) =>
    traits.filter((c) => c.id === id).map((c) => c.name.toLowerCase()),
  )
  if (names.length === 0) return null
  return {
    title: `Topo 3: ${andList(names)}`,
    description:
      top3Alert(traits, top3, outcome) ??
      `Para ${OUTCOME_NAME[outcome].toLowerCase()}, a evidência não põe nenhuma delas em "quase nada" ou "não sabemos".`,
  }
}

// --- the share image (#302) -----------------------------------------------------
// The image to post next to the link. It reads the link's own query, so it
// can only show what the link carries: a Requirement left out of the link
// stays out of the image too. Like the preview, never the sharer's gender
// or age. Nor a score or a pickiness label: just the count.

/** The share image's text: "Entre" + "120 mil e 180 mil" in pink, then
 * "mulheres de 25 a 35 em SP" and the other Requirements. */
export interface GroupImage {
  readonly before: 'Entre' | 'Cerca de'
  readonly numbers: string
  readonly unstable: boolean
  readonly who: string
  readonly also: ReadonlyArray<string>
  /** The surveys under the signature: "Censo 2022 e PNS 2019". */
  readonly sources: string
}

/** The image's text for the link `query` (without the `?`); `null` if the
 * query is not a Possible group link. `count` is the count of what the link
 * carries. */
export function groupImage(
  query: string,
  count: PreviewCount & { readonly result: { readonly unstable: boolean } },
  options: Pick<SentenceOptions, 'municipality'> = {},
): GroupImage | null {
  const state = readLink('grupo-possivel', query)
  if (state?.calculator !== 'grupo-possivel') return null
  const { who, others } = soughtGroup(state, count.target, options.municipality)
  const { before, numbers } = rangeParts(count.result.min, count.result.max)
  return {
    before: before === 'cerca de' ? 'Cerca de' : 'Entre',
    numbers,
    unstable: count.result.unstable,
    who,
    also: others,
    sources: andList(surveysOf(state.requirements ?? DEFAULT_REQUIREMENTS)),
  }
}

// --- interface ----------------------------------------------------------------

/**
 * The state "Copiar link" may carry. The sensitive Requirements (LGPD art.
 * 5º, II) go only with `consent`, which the visitor gives in a highlighted
 * box when sharing (art. 11, I); without it they come off, and `leftOut`
 * names them for the sentence. Everything that reads the query (the preview,
 * the share image) then shows only what went.
 */
export function sharedLink(
  state: GroupLink,
  consent: boolean,
): { state: GroupLink; leftOut: SensitiveRequirement[] } {
  const r = state.requirements
  const on = r ? sensitiveOn(r) : []
  if (!r || consent || on.length === 0) return { state, leftOut: [] }
  return {
    state: { ...state, requirements: withoutSensitive(r) },
    leftOut: on,
  }
}

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
