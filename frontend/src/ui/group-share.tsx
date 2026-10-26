// The Possible group's "Compartilhar": the link, its sentence, the consent
// for the sensitive Requirements (`share-consent.tsx`) and the image
// (`share-image.tsx`). The link, the preview and the image read the same
// query, so a sensitive Requirement left out of the link stays out of all
// three, and out of the image's number too.
import {
  groupImage,
  linkQuery,
  linkSentence,
  sharedLink,
} from '@tem-estudo/rules/link'
import type { Estimate } from '@tem-estudo/rules/possible-group'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  DEFAULT_REQUIREMENTS,
  sensitiveOn,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import { useState } from 'react'
import { useSharedEstimate } from '#/state/possible-group'
import { Share } from './share'
import { COUNTING_NOTICE } from './share.copy'
import { SensitiveConsent } from './share-consent'
import { ShareImage } from './share-image'

export function GroupShare({
  profile,
  saved,
  estimate,
  municipality,
}: {
  profile: Profile | null
  saved: Requirements | null
  /** The count on the screen, of every Requirement on. */
  estimate: Estimate
  municipality: string | undefined
}) {
  const sensitive = sensitiveOn(saved ?? DEFAULT_REQUIREMENTS)
  // The consent covers the sensitive Requirements on when it was given: a new
  // one turned on afterwards asks again.
  const [consentFor, setConsentFor] = useState<string | null>(null)
  const consent = sensitive.length > 0 && consentFor === sensitive.join(',')
  const shared = sharedLink(
    { calculator: 'grupo-possivel', profile, requirements: saved },
    consent,
  )
  const query = linkQuery(shared.state)
  // The image reads the link itself, so it shows only what the link carries,
  // with the count of that: without the sensitive Requirements left out.
  const sharedEstimate = useSharedEstimate(
    profile,
    shared.state.requirements,
    shared.leftOut.length > 0,
  )
  const imageCount = shared.leftOut.length > 0 ? sharedEstimate : estimate
  const image = imageCount && groupImage(query, imageCount, { municipality })

  return (
    <Share
      query={query}
      sentence={linkSentence(shared.state, {
        municipality,
        leftOut: shared.leftOut,
      })}
      notice={COUNTING_NOTICE}
      consent={
        sensitive.length > 0 && (
          <SensitiveConsent
            sensitive={sensitive}
            checked={consent}
            onChange={(yes) => setConsentFor(yes ? sensitive.join(',') : null)}
          />
        )
      }
    >
      {image && <ShareImage image={image} />}
    </Share>
  )
}
