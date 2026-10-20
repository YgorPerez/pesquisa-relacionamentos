import { describe, expect, it } from 'vite-plus/test'
import {
  soughtAge,
  readRequirements,
  whoIsSought,
  DEFAULT_REQUIREMENTS,
  release,
  requirementValue,
  type Requirements,
} from './requirements.ts'

describe('readRequirements', () => {
  it('returns the default for junk: "não mora com companheiro(a)" on and the rest released', () => {
    expect(readRequirements(null)).toEqual(DEFAULT_REQUIREMENTS)
    expect(readRequirements('x')).toEqual(DEFAULT_REQUIREMENTS)
    expect(DEFAULT_REQUIREMENTS.companheiro).toBe(true)
  })

  it('accepts valid requirements and comes back equal after going through JSON', () => {
    const r: Requirements = {
      idade: { min: 25, max: 35 },
      lugar: { uf: 'SP', municipio: '3550308' },
      companheiro: false,
      escolaridade: 'superior',
      renda: '2-5',
      cores: ['preta', 'parda'],
      religioes: ['sem-religiao'],
      semFilhos: true,
      altura: { min: 160, max: 200 },
      naoFuma: true,
    }
    expect(readRequirements(JSON.parse(JSON.stringify(r)))).toEqual(r)
  })

  it('drops what is not valid and keeps the rest', () => {
    const r = readRequirements({
      idade: { min: 40, max: 30 },
      lugar: { uf: 'SP', municipio: '3304557' },
      escolaridade: 'doutorado',
      cores: ['preta', 'azul'],
      altura: { min: 100, max: 180 },
      naoFuma: 'sim',
    })
    expect(r.idade).toBeNull()
    // Rio's municipality is not in SP: the state stays.
    expect(r.lugar).toEqual({ uf: 'SP' })
    expect(r.escolaridade).toBeNull()
    expect(r.cores).toEqual(['preta'])
    expect(r.altura).toEqual(DEFAULT_REQUIREMENTS.altura)
    expect(r.naoFuma).toBe(false)
  })
})

describe('requirementValue', () => {
  const r: Requirements = {
    ...DEFAULT_REQUIREMENTS,
    idade: { min: 40, max: 80 },
    lugar: { uf: 'SP', municipio: '3550308' },
    escolaridade: 'medio',
    cores: ['preta', 'parda', 'indigena'],
    altura: { min: 140, max: 175 },
  }

  it('writes each requirement as in the sentence', () => {
    expect(requirementValue('idade', null, r)).toBe('40 anos ou mais')
    expect(requirementValue('lugar', null, r, 'São Paulo')).toBe(
      'São Paulo (SP)',
    )
    expect(requirementValue('lugar', null, DEFAULT_REQUIREMENTS)).toBe(
      'Brasil inteiro',
    )
    expect(requirementValue('escolaridade', null, r)).toBe(
      'pelo menos médio completo',
    )
    expect(requirementValue('cor', null, r)).toBe(
      'cor preta, parda ou indígena',
    )
    expect(requirementValue('altura', null, r)).toBe('até 175 cm')
    expect(requirementValue('renda', null, r)).toBe('qualquer renda')
  })

  it('"sem filhos" when seeking men says there is no data', () => {
    expect(
      requirementValue(
        'filhos',
        { procura: 'homens' },
        { ...r, semFilhos: true },
      ),
    ).toBe('sem dado para homens')
  })
})

describe('release', () => {
  it('sets only that requirement back to "any"', () => {
    const r: Requirements = {
      ...DEFAULT_REQUIREMENTS,
      cores: ['preta'],
      naoFuma: true,
    }
    expect(release(r, 'cor')).toEqual({ ...r, cores: [] })
    expect(release(r, 'idade').idade).toEqual({ min: 18, max: 80 })
  })
})

describe('soughtAge', () => {
  it("starts at the profile's age ±5, within 18 to 80", () => {
    expect(soughtAge({ idade: 30 }, DEFAULT_REQUIREMENTS)).toEqual({
      min: 25,
      max: 35,
    })
    expect(soughtAge({ idade: 20 }, DEFAULT_REQUIREMENTS)).toEqual({
      min: 18,
      max: 25,
    })
    expect(soughtAge({ idade: 79 }, DEFAULT_REQUIREMENTS)).toEqual({
      min: 74,
      max: 80,
    })
  })

  it('without an age in the profile, any age; after a change, the chosen one', () => {
    expect(soughtAge(null, DEFAULT_REQUIREMENTS)).toEqual({
      min: 18,
      max: 80,
    })
    expect(
      soughtAge(
        { idade: 30 },
        { ...DEFAULT_REQUIREMENTS, idade: { min: 40, max: 50 } },
      ),
    ).toEqual({ min: 40, max: 50 })
  })
})

describe('whoIsSought', () => {
  it('seeking women: Census sex 1, "mulheres" and the children filter applies', () => {
    expect(whoIsSought({ procura: 'mulheres' })).toEqual({
      sexes: [1],
      target: 'mulheres',
      children: 'vale',
    })
  })

  it('seeking men: sex 0, "homens" and no children data', () => {
    expect(whoIsSought({ procura: 'homens' })).toEqual({
      sexes: [0],
      target: 'homens',
      children: 'sem-dado',
    })
  })

  it('seeking both, or not saying: both sexes, "pessoas" and children only for women', () => {
    const both = { sexes: [0, 1], target: 'pessoas', children: 'so-mulheres' }
    expect(whoIsSought({ procura: 'ambos' })).toEqual(both)
    expect(whoIsSought({ genero: 'homem' })).toEqual(both)
    expect(whoIsSought(null)).toEqual(both)
  })
})
