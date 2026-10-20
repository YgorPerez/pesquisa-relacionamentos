// Priorities vs. evidence (#9, #19): the visitor picks, in order, the three
// traits that matter most to them, and the evidence puts each one on a level
// per outcome. There is no score or compatibility number: only the shelf each
// one falls on and a sentence when the top 3 falls on "quase nada" or "não
// sabemos". The state is the ordered top 3 and the outcome; it is stored in
// the browser and carried by the link. The outcome values are the link's and
// the priorities file's, so they stay in Portuguese.
import type { ProfileGender } from './profile.ts'

export const OUTCOMES = ['atracao', 'satisfacao', 'duracao'] as const
export type Outcome = (typeof OUTCOMES)[number]

export const OUTCOME_NAME: Record<Outcome, string> = {
  atracao: 'Atração',
  satisfacao: 'Satisfação',
  duracao: 'Duração',
}

/** The outcome of someone who has not chosen yet: it is where Joel 2020 comes
 * in. */
export const INITIAL_OUTCOME: Outcome = 'satisfacao'

/** What the evidence allows saying, in four levels. */
export const LEVELS = [3, 2, 1, 0] as const
export type Level = (typeof LEVELS)[number]

export const LEVEL_NAME: Record<Level, string> = {
  3: 'pesa',
  2: 'pesa pouco',
  1: 'quase nada',
  0: 'não sabemos',
}

export const TOP_SIZE = 3

/** The minimum the rule reads from a trait; the content package's one fits.
 * The keys are the priorities file's. */
export interface TraitWithEvidence {
  readonly id: string
  readonly nome: string
  readonly atracao: { readonly degrau: Level }
  readonly satisfacao: { readonly degrau: Level }
  readonly duracao: { readonly degrau: Level }
  /** The gap between what people state and what they choose, by gender. */
  readonly vies?: {
    readonly todos?: string
    readonly homem?: string
    readonly mulher?: string
  }
}

export interface PrioritiesState {
  /** The chosen ids, in order: the first is the one that matters most. */
  readonly top3: ReadonlyArray<string>
  readonly outcome: Outcome
}

export const level = (trait: TraitWithEvidence, outcome: Outcome): Level =>
  trait[outcome].degrau

/** Tapping a trait: it comes in with the next number; if it is already in, it
 * leaves and the others move up. With three, others do not come in (the
 * visitor swaps by removing one). */
export function toggleInTop3(
  top3: ReadonlyArray<string>,
  id: string,
): ReadonlyArray<string> {
  if (top3.includes(id)) return top3.filter((other) => other !== id)
  return top3.length >= TOP_SIZE ? top3 : [...top3, id]
}

export interface Shelf {
  readonly level: Level
  readonly name: string
  readonly ids: ReadonlyArray<string>
}

/** The outcome's four shelves, from "pesa" to "não sabemos". On each, the
 * chosen ones come first, in top 3 order, and the others in data order. */
export function shelves(
  traits: ReadonlyArray<TraitWithEvidence>,
  outcome: Outcome,
  top3: ReadonlyArray<string>,
): ReadonlyArray<Shelf> {
  const position = (id: string) => {
    const i = top3.indexOf(id)
    return i < 0 ? TOP_SIZE : i
  }
  return LEVELS.map((n) => ({
    level: n,
    name: LEVEL_NAME[n],
    ids: traits
      .filter((c) => level(c, outcome) === n)
      .map((c) => c.id)
      .sort((a, b) => position(a) - position(b)),
  }))
}

const asList = (names: ReadonlyArray<string>): string =>
  names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`

/** The alert sentence: what of the top 3 falls on "quase nada" or "não
 * sabemos" for the outcome. No number and no judgment; `null` when there is
 * nothing to say. */
export function top3Alert(
  traits: ReadonlyArray<TraitWithEvidence>,
  top3: ReadonlyArray<string>,
  outcome: Outcome,
): string | null {
  const chosen = top3.flatMap((id) => traits.filter((c) => c.id === id))
  const names = (n: Level) =>
    chosen
      .filter((c) => level(c, outcome) === n)
      .map((c) => c.nome.toLowerCase())
  const almostNothing = names(1)
  const noData = names(0)
  const parts = [
    almostNothing.length > 0 &&
      `${asList(almostNothing)} ${almostNothing.length > 1 ? 'pesam' : 'pesa'} quase nada`,
    noData.length > 0 && `para ${asList(noData)} não há boa evidência`,
  ].filter(Boolean)
  if (parts.length === 0) return null
  return `No seu topo 3, para ${OUTCOME_NAME[outcome].toLowerCase()}: ${parts.join('; ')}.`
}

/** The bias note that applies to the profile's gender. A single-gender one
 * does not show for someone who did not say their gender or said "outro". */
export function biasFor(
  trait: TraitWithEvidence,
  gender: ProfileGender | undefined,
): string | null {
  const bias = trait.vies
  if (!bias) return null
  if (gender === 'homem' || gender === 'mulher')
    return bias[gender] ?? bias.todos ?? null
  return bias.todos ?? null
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Reads the state from an untrusted source (localStorage, the #34 link
 * query): what is valid stays. `ids`, when given, limits the top 3 to the
 * traits that exist in the data. */
export function readPriorities(
  value: unknown,
  ids?: ReadonlyArray<string>,
): PrioritiesState | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null
  const raw = value as Record<string, unknown>
  const list = Array.isArray(raw.top3) ? raw.top3 : []
  const top3: string[] = []
  for (const id of list) {
    if (top3.length >= TOP_SIZE) break
    if (typeof id !== 'string' || !SLUG.test(id) || top3.includes(id)) continue
    if (ids && !ids.includes(id)) continue
    top3.push(id)
  }
  const outcome = OUTCOMES.find((d) => d === raw.outcome) ?? INITIAL_OUTCOME
  return { top3, outcome }
}
