// "Vale para você" (#5, #16): whether what a study covered includes the
// profile. Nothing disappears because of the rule; it only says where the
// yellow badge goes and where the empty ring with "Não há dado deste estudo
// para o seu Perfil." goes.
import { isProfileEmpty, type Profile } from './profile.ts'

/** The side someone seeking both may have data for, in the profile's
 * values. */
type Side = 'homens' | 'mulheres'

/** What the sample covered, in the shape of a fact sheet's `covers` and of
 * the findings' and tips' `applies_to`. A missing key means the study did not
 * split by it. The values are the content's, in English; the profile's stay
 * in Portuguese because the link carries them. */
export interface Coverage {
  readonly genders?: ReadonlyArray<'man' | 'woman'>
  readonly seeks?: ReadonlyArray<'men' | 'women'>
  readonly ages?: { readonly min: number; readonly max: number }
  readonly couple?: 'different-sex' | 'same-sex'
}

const COVERAGE_GENDER = { homem: 'man', mulher: 'woman' } as const
const COVERAGE_SIDE = { homens: 'men', mulheres: 'women' } as const

/** `null`: without a profile, there is nothing to decide. `only`: someone
 * seeking both, and only one side has data (the badge says which). */
export type Verdict =
  | { readonly covered: false }
  | { readonly covered: true; readonly only?: Side }

/** The profile's sides this `covers` includes; empty if it does not include
 * the profile. */
function coveredSides(
  profile: Profile,
  coverage: Coverage,
): ReadonlyArray<Side | undefined> {
  const { gender, seeks, age } = profile
  if (
    age !== undefined &&
    coverage.ages &&
    (age < coverage.ages.min || age > coverage.ages.max)
  )
    return []
  // "outro" only matches what did not split by gender; the couple's pair
  // splits too.
  if (gender === 'outro' && (coverage.genders || coverage.couple)) return []
  if (
    (gender === 'homem' || gender === 'mulher') &&
    coverage.genders &&
    !coverage.genders.includes(COVERAGE_GENDER[gender])
  )
    return []

  const sides: ReadonlyArray<Side | undefined> =
    seeks === undefined
      ? [undefined]
      : seeks === 'ambos'
        ? ['homens', 'mulheres']
        : [seeks]
  return sides.filter((side) => {
    if (side === undefined) return true
    if (coverage.seeks && !coverage.seeks.includes(COVERAGE_SIDE[side]))
      return false
    if (coverage.couple && (gender === 'homem' || gender === 'mulher')) {
      const sameSex = (gender === 'homem') === (side === 'homens')
      return sameSex === (coverage.couple === 'same-sex')
    }
    return true
  })
}

/** Whether a finding or tip applies to the profile: one of the `covers` (one
 * per cited fact sheet, or the scope's `applies_to`) covering it is enough. */
export function appliesToYou(
  profile: Profile | null,
  coverages: ReadonlyArray<Coverage>,
): Verdict | null {
  if (!profile || isProfileEmpty(profile)) return null
  const sides = new Set(
    coverages.flatMap((coverage) => coveredSides(profile, coverage)),
  )
  if (sides.size === 0) return { covered: false }
  if (profile.seeks === 'ambos' && sides.size === 1) {
    const [only] = sides
    if (only) return { covered: true, only }
  }
  return { covered: true }
}
