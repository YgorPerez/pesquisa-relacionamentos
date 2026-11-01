// The visitor's Profile, saved in the browser and read by any page: the
// Guide, the Tip page and the calculators' cards and pages.
import { readProfile, type Profile } from '@tem-estudo/rules/profile'
import { useStored } from './stored'
import { savedProfile } from './profile-storage'
export { savedProfile, LEGACY_PROFILE } from './profile-storage'

/** The saved Profile, or `null` (no Profile, on the server and during
 * hydration). */
export const useProfile = (): Profile | null => useStored(savedProfile)

/** Saves the Profile (through the same validation as the reader); `null`
 * deletes. */
export const saveProfile = (profile: Profile | null) =>
  savedProfile.write(profile && readProfile(profile))
