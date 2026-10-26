import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vite-plus/test'
import { readPriorities } from '@tem-estudo/rules/priorities'
import { readProfile } from '@tem-estudo/rules/profile'
import { readRequirements } from '@tem-estudo/rules/requirements'
import { LEGACY_REQUIREMENTS } from './possible-group'
import { LEGACY_PRIORITIES } from './priorities'
import { LEGACY_PROFILE } from './profile'
import { stored } from './stored'

vi.mock('virtual:possible-group', () => ({
  default: { base: '', places: [], example: {} },
}))

/** A localStorage in memory, with what an older version saved. */
function memoryStorage(initial: Record<string, unknown>) {
  const items = new Map(
    Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]),
  )
  return {
    items,
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => void items.set(k, v),
    removeItem: (k: string) => void items.delete(k),
  }
}

let local: ReturnType<typeof memoryStorage>
const useStorage = (initial: Record<string, unknown>) => {
  local = memoryStorage(initial)
  vi.stubGlobal('window', { localStorage: local })
}

beforeEach(() => useStorage({}))
afterEach(() => vi.unstubAllGlobals())

describe('the keys saved before the move to English (ADR 0039)', () => {
  test('a Profile under `perfil` comes back under `profile`, and the old key goes', () => {
    useStorage({
      'tem-estudo:perfil': { genero: 'mulher', procura: 'homens', idade: 31 },
    })
    const profile = stored('profile', readProfile, LEGACY_PROFILE)
    expect(profile.read()).toEqual({
      gender: 'mulher',
      seeks: 'homens',
      age: 31,
    })
    expect(local.items.has('tem-estudo:perfil')).toBe(false)
    expect(JSON.parse(local.getItem('tem-estudo:profile')!)).toEqual({
      gender: 'mulher',
      seeks: 'homens',
      age: 31,
    })
  })

  test('the Requirements under `grupo-possivel` keep every value', () => {
    useStorage({
      'tem-estudo:grupo-possivel': {
        idade: { min: 25, max: 35 },
        lugar: { uf: 'SP', municipio: '3550308' },
        companheiro: false,
        escolaridade: 'superior',
        renda: '2-5',
        cores: ['preta', 'parda'],
        religioes: ['catolica'],
        semFilhos: true,
        altura: { min: 160, max: 190 },
        naoFuma: true,
      },
    })
    const requirements = stored(
      'requirements',
      readRequirements,
      LEGACY_REQUIREMENTS,
    )
    expect(requirements.read()).toEqual({
      age: { min: 25, max: 35 },
      place: { state: 'SP', municipality: '3550308' },
      noLiveInPartner: false,
      education: 'superior',
      income: '2-5',
      colors: ['preta', 'parda'],
      religions: ['catolica'],
      noChildren: true,
      height: { min: 160, max: 190 },
      nonSmoker: true,
      // Office occupation and the PNS lifestyle Requirements came after the
      // move: an old save has them off.
      drinking: [],
      exercises: false,
      goodTeeth: false,
      nonVaper: false,
      office: false,
    })
    expect(local.items.has('tem-estudo:grupo-possivel')).toBe(false)
  })

  test('the Priorities under `prioridades` keep the top 3 and the outcome', () => {
    useStorage({
      'tem-estudo:prioridades': {
        topo3: ['renda', 'sexo'],
        desfecho: 'duracao',
      },
    })
    const priorities = stored(
      'priorities',
      (raw) => readPriorities(raw),
      LEGACY_PRIORITIES,
    )
    expect(priorities.read()).toEqual({
      top3: ['renda', 'sexo'],
      outcome: 'duracao',
    })
    expect(local.items.has('tem-estudo:prioridades')).toBe(false)
  })

  test('a value already under the new key wins, and the old one still goes', () => {
    useStorage({
      'tem-estudo:perfil': { genero: 'homem' },
      'tem-estudo:profile': { gender: 'mulher' },
    })
    const profile = stored('profile', readProfile, LEGACY_PROFILE)
    expect(profile.read()).toEqual({ gender: 'mulher' })
    expect(local.items.has('tem-estudo:perfil')).toBe(false)
  })

  test('junk under the old key is dropped without breaking the read', () => {
    useStorage({})
    local.items.set('tem-estudo:perfil', '{not json')
    const profile = stored('profile', readProfile, LEGACY_PROFILE)
    expect(profile.read()).toBeNull()
    expect(local.items.has('tem-estudo:perfil')).toBe(false)
  })
})
