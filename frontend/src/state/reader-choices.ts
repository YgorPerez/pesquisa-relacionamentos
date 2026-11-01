// The stores of what the reader chose: the Profile, the Requirements and the
// Priorities. Apart from their hooks, so sync reads them without the rest.
import {
  readPriorities,
  type PrioritiesState,
} from '@tem-estudo/rules/priorities'
import { readProfile, type Profile } from '@tem-estudo/rules/profile'
import {
  readRequirements,
  type Requirements,
} from '@tem-estudo/rules/requirements'
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

/** The Requirements as saved before the code moved to English (ADR 0039):
 * the same values under Portuguese keys. */
export const LEGACY_REQUIREMENTS = {
  key: 'grupo-possivel',
  migrate: (raw: unknown) => {
    const requirements = renameKeys(raw, {
      idade: 'age',
      lugar: 'place',
      companheiro: 'noLiveInPartner',
      escolaridade: 'education',
      renda: 'income',
      cores: 'colors',
      religioes: 'religions',
      semFilhos: 'noChildren',
      altura: 'height',
      naoFuma: 'nonSmoker',
    }) as Record<string, unknown>
    return {
      ...requirements,
      place: renameKeys(requirements.place, {
        uf: 'state',
        municipio: 'municipality',
      }),
    }
  },
}

export const savedRequirements = stored<Requirements>(
  'requirements',
  readRequirements,
  LEGACY_REQUIREMENTS,
)

/** The state as saved before the code moved to English (ADR 0039). */
export const LEGACY_PRIORITIES = {
  key: 'prioridades',
  migrate: (raw: unknown) =>
    renameKeys(raw, { topo3: 'top3', desfecho: 'outcome' }),
}

export const savedPriorities = stored<PrioritiesState>(
  'priorities',
  (raw) => readPriorities(raw),
  LEGACY_PRIORITIES,
)
