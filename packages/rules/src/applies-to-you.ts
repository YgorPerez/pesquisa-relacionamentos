// "Vale para você" (#5, #16): whether what a study covered includes the
// profile. Nothing disappears because of the rule; it only says where the
// yellow badge goes and where the empty ring with "Não há dado deste estudo
// para o seu Perfil." goes.
import { isProfileEmpty, type Profile } from './profile.ts'

type Side = 'homens' | 'mulheres'

/** What the sample covered, in the shape of a fact sheet's `cobre` and of the
 * findings' and tips' `vale_para`. A missing key means the study did not
 * split by it. */
export interface Coverage {
  readonly generos?: ReadonlyArray<'homem' | 'mulher'>
  readonly procura?: ReadonlyArray<Side>
  readonly idades?: { readonly min: number; readonly max: number }
  readonly casal?: 'hetero' | 'mesmo-sexo'
}

/** `null`: without a profile, there is nothing to decide. `only`: someone
 * seeking both, and only one side has data (the badge says which). */
export type Verdict =
  | { readonly covered: false }
  | { readonly covered: true; readonly only?: Side }

/** The profile's sides this `cobre` includes; empty if it does not include
 * the profile. */
function coveredSides(
  profile: Profile,
  coverage: Coverage,
): ReadonlyArray<Side | undefined> {
  const { gender, seeks, age } = profile
  if (
    age !== undefined &&
    coverage.idades &&
    (age < coverage.idades.min || age > coverage.idades.max)
  )
    return []
  // "outro" only matches what did not split by gender; the couple's pair
  // splits too.
  if (gender === 'outro' && (coverage.generos || coverage.casal)) return []
  if (
    (gender === 'homem' || gender === 'mulher') &&
    coverage.generos &&
    !coverage.generos.includes(gender)
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
    if (coverage.procura && !coverage.procura.includes(side)) return false
    if (coverage.casal && (gender === 'homem' || gender === 'mulher')) {
      const sameSex = (gender === 'homem') === (side === 'homens')
      return sameSex === (coverage.casal === 'mesmo-sexo')
    }
    return true
  })
}

/** Whether a finding or tip applies to the profile: one of the `cobre` (one
 * per cited fact sheet, or the scope's `vale_para`) covering it is enough. */
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
