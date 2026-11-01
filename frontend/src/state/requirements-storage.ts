import {
  readRequirements,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import { renameKeys, stored } from './stored'

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
