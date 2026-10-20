// The visitor's profile (GLOSSARY): their gender, who they seek and their age.
// All optional: someone who says nothing sees the whole guide with only the
// "Vale para:" notes. The link (#34) and calculator (#31, #33) modules read
// from here. The keys and values are what the browser stores and the link
// carries, so they stay in Portuguese.

/** The gender in the profile. `outro` does not exist in the fact sheets'
 * `cobre` (#5). */
export const PROFILE_GENDERS = ['homem', 'mulher', 'outro'] as const
export type ProfileGender = (typeof PROFILE_GENDERS)[number]

/** Who the visitor seeks. `ambos` does not exist in the fact sheets' `cobre`
 * (#5). */
export const PROFILE_SEEKS = ['homens', 'mulheres', 'ambos'] as const
export type ProfileSeeks = (typeof PROFILE_SEEKS)[number]

/** The site is for adults; above 120 is a typo. */
export const MIN_AGE = 18
export const MAX_AGE = 120

export interface Profile {
  readonly genero?: ProfileGender
  readonly procura?: ProfileSeeks
  readonly idade?: number
}

/** No gender, no one sought and no age: it is like having no profile. */
export const isProfileEmpty = (profile: Profile | null): boolean =>
  !profile ||
  (profile.genero === undefined &&
    profile.procura === undefined &&
    profile.idade === undefined)

const oneOf = <T extends string>(
  list: ReadonlyArray<T>,
  value: unknown,
): T | undefined => list.find((item) => item === value)

/** The age as the profile accepts it: whole, from 18 to 120. Otherwise
 * `undefined`. */
export function validAge(value: unknown): number | undefined {
  const num =
    typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  return typeof num === 'number' &&
    Number.isInteger(num) &&
    num >= MIN_AGE &&
    num <= MAX_AGE
    ? num
    : undefined
}

/** Reads a profile from an untrusted source (localStorage, link query): only
 * what is valid stays. Returns `null` if nothing is left. */
export function readProfile(value: unknown): Profile | null {
  if (typeof value !== 'object' || value === null) return null
  const raw = value as Record<string, unknown>
  const gender = oneOf(PROFILE_GENDERS, raw.genero)
  const seeks = oneOf(PROFILE_SEEKS, raw.procura)
  const age = validAge(raw.idade)
  const profile: Profile = {
    ...(gender && { genero: gender }),
    ...(seeks && { procura: seeks }),
    ...(age !== undefined && { idade: age }),
  }
  return isProfileEmpty(profile) ? null : profile
}

const GENDER_IN_WORDS: Record<ProfileGender, string> = {
  homem: 'homem',
  mulher: 'mulher',
  outro: 'outro gênero',
}

const SEEKS_IN_WORDS: Record<ProfileSeeks, string> = {
  homens: 'procura homens',
  mulheres: 'procura mulheres',
  ambos: 'procura homens e mulheres',
}

/** "homem, procura homens, 30 anos": the profile in one line, for "Seu
 * Perfil: …" and for the warning that no study covers it. */
export function describeProfile(profile: Profile): string {
  return [
    profile.genero && GENDER_IN_WORDS[profile.genero],
    profile.procura && SEEKS_IN_WORDS[profile.procura],
    profile.idade !== undefined && `${profile.idade} anos`,
  ]
    .filter(Boolean)
    .join(', ')
}
