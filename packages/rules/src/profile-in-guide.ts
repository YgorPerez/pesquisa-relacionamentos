// The profile applied to a guide page (DESIGN.md, "Perfil: destacar sem
// esconder"): the verdict on each finding and tip, how many findings have
// data, whether the short answer's key number applies and, if not, which
// finding does.
import { isProfileEmpty, type Profile } from './profile.ts'
import { appliesToYou, type Coverage, type Verdict } from './applies-to-you.ts'

export interface GuideCoverages {
  /** The `covers` of the fact sheets cited next to the key number (`==…==`);
   * `null` if the short answer marked no number. */
  readonly key: ReadonlyArray<Coverage> | null
  /** One item per finding, in page order. */
  readonly findings: ReadonlyArray<ReadonlyArray<Coverage>>
  readonly tips: ReadonlyArray<ReadonlyArray<Coverage>>
}

export interface ProfileInGuide {
  readonly findings: ReadonlyArray<Verdict>
  readonly tips: ReadonlyArray<Verdict>
  /** How many findings have data for the profile. Zero turns on the warning
   * above the title. */
  readonly withData: number
  /** The "Para o seu Perfil: …" line. When the key number does not apply,
   * `finding` is the index of the first finding that does, or `null` if none
   * does. */
  readonly key:
    | { readonly applies: true }
    | { readonly applies: false; readonly finding: number | null }
    | null
}

export function profileInGuide(
  profile: Profile | null,
  guide: GuideCoverages,
): ProfileInGuide | null {
  if (isProfileEmpty(profile)) return null
  // With a profile, `appliesToYou` always decides.
  const verdict = (coverages: ReadonlyArray<Coverage>) =>
    appliesToYou(profile, coverages) as Verdict
  const findings = guide.findings.map(verdict)
  const first = findings.findIndex((v) => v.covered)
  return {
    findings,
    tips: guide.tips.map(verdict),
    withData: findings.filter((v) => v.covered).length,
    key:
      guide.key === null
        ? null
        : verdict(guide.key).covered
          ? { applies: true }
          : { applies: false, finding: first === -1 ? null : first },
  }
}
