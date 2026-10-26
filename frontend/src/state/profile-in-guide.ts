// The saved Profile applied to a Question of the Guide, by the package's rule.
import {
  profileInGuide,
  type ProfileInGuide,
} from '@tem-estudo/rules/profile-in-guide'
import type { Profile } from '@tem-estudo/rules/profile'
import { useMemo } from 'react'
import type { QuestionView } from '#/content/guide-view'
import { useProfile } from './profile'

export function useProfileInGuide(question: QuestionView): {
  profile: Profile | null
  inGuide: ProfileInGuide | null
} {
  const profile = useProfile()
  const inGuide = useMemo(
    () =>
      profileInGuide(profile, {
        key: question.keyCoverage,
        findings: question.findings.map((a) => a.coverage),
        tips: question.tips.map((d) => d.coverage),
      }),
    [profile, question],
  )
  return { profile, inGuide }
}
