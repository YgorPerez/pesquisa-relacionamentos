// Priorities vs. evidence (#9, #19): the visitor picks, in order, the three
// traits that matter most to them, and the evidence puts each one on a level
// per outcome. There is no score or compatibility number: only the shelf each
// one falls on and a sentence when the top 3 falls on "quase nada" or "não
// sabemos". The state is the ordered top 3 and the outcome; it is stored in
// the browser and carried by the link. The outcome values are the link's, so
// they stay in Portuguese; the priorities file keys each outcome in English
// (`OUTCOME_KEY`).
import { andList } from './lists.ts'
import type { ProfileGender } from './profile.ts'

export const OUTCOMES = ['atracao', 'satisfacao', 'duracao'] as const
export type Outcome = (typeof OUTCOMES)[number]

/** The priorities file's key for each outcome (#70). */
export const OUTCOME_KEY = {
  atracao: 'attraction',
  satisfacao: 'satisfaction',
  duracao: 'duration',
} as const satisfies Record<Outcome, string>

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

/** The word for a share of explained variance, read from the top of its
 * measured range, so the page never says "quase nada" over a range that is
 * not. The cut points are Cohen's (1988) small, medium and large R²: 2%, 13%
 * and 26%. */
export function shareWord(range: {
  readonly min: number
  readonly max: number
}): string {
  if (range.max < 2) return 'quase nada'
  if (range.max < 13) return 'pouco'
  if (range.max < 26) return 'uma parte'
  return 'muito'
}

/** The minimum the rule reads from a trait; the content package's one fits.
 * The keys are the priorities file's. */
export interface TraitWithEvidence {
  readonly id: string
  readonly name: string
  readonly attraction: { readonly level: Level }
  readonly satisfaction: { readonly level: Level }
  readonly duration: { readonly level: Level }
  /** The gap between what people state and what they choose, by gender. */
  readonly bias?: {
    readonly all?: string
    readonly man?: string
    readonly woman?: string
  }
}

export interface PrioritiesState {
  /** The chosen ids, in order: the first is the one that matters most. */
  readonly top3: ReadonlyArray<string>
  readonly outcome: Outcome
}

export const level = (trait: TraitWithEvidence, outcome: Outcome): Level =>
  trait[OUTCOME_KEY[outcome]].level

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
      .map((c) => c.name.toLowerCase())
  const almostNothing = names(1)
  const noData = names(0)
  const parts = [
    almostNothing.length > 0 &&
      `${andList(almostNothing)} ${almostNothing.length > 1 ? 'pesam' : 'pesa'} quase nada`,
    noData.length > 0 && `para ${andList(noData)} não há boa evidência`,
  ].filter(Boolean)
  if (parts.length === 0) return null
  return `No seu topo 3, para ${OUTCOME_NAME[outcome].toLowerCase()}: ${parts.join('; ')}.`
}

/** The priorities file's bias key for each gender with one (#70). */
const BIAS_KEY = { homem: 'man', mulher: 'woman' } as const

/** The bias note that applies to the profile's gender. A single-gender one
 * does not show for someone who did not say their gender or said "outro". */
export function biasFor(
  trait: TraitWithEvidence,
  gender: ProfileGender | undefined,
): string | null {
  const bias = trait.bias
  if (!bias) return null
  if (gender === 'homem' || gender === 'mulher')
    return bias[BIAS_KEY[gender]] ?? bias.all ?? null
  return bias.all ?? null
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
