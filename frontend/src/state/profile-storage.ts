import { readProfile, type Profile } from '@tem-estudo/rules/profile'
import { renameKeys, stored } from './stored'

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
