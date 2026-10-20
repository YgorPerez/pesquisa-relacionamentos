// The visitor's profile (GLOSSARY): their gender, who they seek and their age.
// All optional: someone who says nothing sees the whole guide with only the
// "Vale para:" notes. The link (#34) and calculator (#31, #33) modules read
// from here. The values are what the link carries, so they stay in
// Portuguese (ADR 0039); the keys are the stored JSON's.

/** The gender in the profile. `outro` has no match in the fact sheets'
 * `covers` (#5). */
export const PROFILE_GENDERS = ['homem', 'mulher', 'outro'] as const
export type ProfileGender = (typeof PROFILE_GENDERS)[number]

/** Who the visitor seeks. `ambos` has no match in the fact sheets' `covers`
 * (#5). */
export const PROFILE_SEEKS = ['homens', 'mulheres', 'ambos'] as const
export type ProfileSeeks = (typeof PROFILE_SEEKS)[number]

/** The site is for adults; above 120 is a typo. */
export const MIN_AGE = 18
export const MAX_AGE = 120

export interface Profile {
  readonly gender?: ProfileGender
  readonly seeks?: ProfileSeeks
  readonly age?: number
}

/** No gender, no one sought and no age: it is like having no profile. */
export const isProfileEmpty = (profile: Profile | null): boolean =>
  !profile ||
  (profile.gender === undefined &&
    profile.seeks === undefined &&
    profile.age === undefined)

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
  const gender = oneOf(PROFILE_GENDERS, raw.gender)
  const seeks = oneOf(PROFILE_SEEKS, raw.seeks)
  const age = validAge(raw.age)
  const profile: Profile = {
    ...(gender && { gender }),
    ...(seeks && { seeks }),
    ...(age !== undefined && { age }),
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
    profile.gender && GENDER_IN_WORDS[profile.gender],
    profile.seeks && SEEKS_IN_WORDS[profile.seeks],
    profile.age !== undefined && `${profile.age} anos`,
  ]
    .filter(Boolean)
    .join(', ')
}
