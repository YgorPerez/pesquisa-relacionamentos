// The visitor's Profile, saved in the browser and read by any page: the
// Guide, the Tip page and the calculators' cards and pages.
import { readProfile, type Profile } from '@tem-estudo/rules/profile'
import { renameKeys, stored, useStored } from './stored'

/** The Profile as saved before the code moved to English (ADR 0039). */
export const LEGACY_PROFILE = {
  key: 'perfil',
  migrate: (raw: unknown) =>
    renameKeys(raw, { genero: 'gender', procura: 'seeks', idade: 'age' }),
}

export const savedProfile = stored<Profile>(
  'profile',
  readProfile,
  LEGACY_PROFILE,
)

/** The saved Profile, or `null` (no Profile, on the server and during
 * hydration). */
export const useProfile = (): Profile | null => useStored(savedProfile)

/** Saves the Profile (through the same validation as the reader); `null`
 * deletes. */
export const saveProfile = (profile: Profile | null) =>
  savedProfile.write(profile && readProfile(profile))
