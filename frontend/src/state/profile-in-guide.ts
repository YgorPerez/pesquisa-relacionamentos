// The saved Profile applied to a Guide's view, by the package's rule.
import {
  profileInGuide,
  type ProfileInGuide,
} from '@tem-estudo/rules/profile-in-guide'
import type { Profile } from '@tem-estudo/rules/profile'
import { useMemo } from 'react'
import type { GuideView } from '#/content/guide-view'
import { useProfile } from './profile'

export function useProfileInGuide(guide: GuideView): {
  profile: Profile | null
  inGuide: ProfileInGuide | null
} {
  const profile = useProfile()
  const inGuide = useMemo(
    () =>
      profileInGuide(profile, {
        key: guide.keyCoverage,
        findings: guide.findings.map((a) => a.coverage),
        tips: guide.tips.map((d) => d.coverage),
      }),
    [profile, guide],
  )
  return { profile, inGuide }
}
