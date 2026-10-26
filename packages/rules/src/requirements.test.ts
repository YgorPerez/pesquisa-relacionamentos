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
    expect(DEFAULT_REQUIREMENTS.noLiveInPartner).toBe(true)
  })

  it('accepts valid requirements and comes back equal after going through JSON', () => {
    const r: Requirements = {
      age: { min: 25, max: 35 },
      place: { state: 'SP', municipality: '3550308' },
      noLiveInPartner: false,
      education: 'superior',
      income: '2-5',
      colors: ['preta', 'parda'],
      religions: ['sem-religiao'],
      noChildren: true,
      notWithParents: true,
      work: 'trabalha',
      ownsHome: true,
      height: { min: 160, max: 200 },
      nonSmoker: true,
      drinking: ['semanal'],
      exercises: true,
      goodTeeth: true,
      nonVaper: true,
      office: true,
    }
    expect(readRequirements(JSON.parse(JSON.stringify(r)))).toEqual(r)
  })

  it('drops what is not valid and keeps the rest', () => {
    const r = readRequirements({
      age: { min: 40, max: 30 },
      place: { state: 'SP', municipality: '3304557' },
      education: 'doutorado',
      colors: ['preta', 'azul'],
      height: { min: 100, max: 180 },
      nonSmoker: 'sim',
    })
    expect(r.age).toBeNull()
    // Rio's municipality is not in SP: the state stays.
    expect(r.place).toEqual({ state: 'SP' })
    expect(r.education).toBeNull()
    expect(r.colors).toEqual(['preta'])
    expect(r.height).toEqual(DEFAULT_REQUIREMENTS.height)
    expect(r.nonSmoker).toBe(false)
  })
})

describe('requirementValue', () => {
  const r: Requirements = {
    ...DEFAULT_REQUIREMENTS,
    age: { min: 40, max: 80 },
    place: { state: 'SP', municipality: '3550308' },
    education: 'medio',
    colors: ['preta', 'parda', 'indigena'],
    height: { min: 140, max: 175 },
  }

  it('writes each requirement as in the sentence', () => {
    expect(requirementValue('age', null, r)).toBe('40 anos ou mais')
    expect(requirementValue('place', null, r, 'São Paulo')).toBe(
      'São Paulo (SP)',
    )
    expect(requirementValue('place', null, DEFAULT_REQUIREMENTS)).toBe(
      'Brasil inteiro',
    )
    expect(requirementValue('education', null, r)).toBe(
      'pelo menos médio completo',
    )
    expect(requirementValue('color', null, r)).toBe(
      'cor preta, parda ou indígena',
    )
    expect(requirementValue('height', null, r)).toBe('até 175 cm')
    expect(requirementValue('income', null, r)).toBe('qualquer renda')
  })

  it('"sem filhos" when seeking men says there is no data', () => {
    expect(
      requirementValue(
        'children',
        { seeks: 'homens' },
        { ...r, noChildren: true },
      ),
    ).toBe('sem dado para homens')
  })
})

describe('release', () => {
  it('sets only that requirement back to "any"', () => {
    const r: Requirements = {
      ...DEFAULT_REQUIREMENTS,
      colors: ['preta'],
      nonSmoker: true,
    }
    expect(release(r, 'color')).toEqual({ ...r, colors: [] })
    expect(release(r, 'age').age).toEqual({ min: 18, max: 80 })
  })
})

describe('soughtAge', () => {
  it("starts at the profile's age ±5, within 18 to 80", () => {
    expect(soughtAge({ age: 30 }, DEFAULT_REQUIREMENTS)).toEqual({
      min: 25,
      max: 35,
    })
    expect(soughtAge({ age: 20 }, DEFAULT_REQUIREMENTS)).toEqual({
      min: 18,
      max: 25,
    })
    expect(soughtAge({ age: 79 }, DEFAULT_REQUIREMENTS)).toEqual({
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
        { age: 30 },
        { ...DEFAULT_REQUIREMENTS, age: { min: 40, max: 50 } },
      ),
    ).toEqual({ min: 40, max: 50 })
  })
})

describe('whoIsSought', () => {
  it('seeking women: Census sex 1, "mulheres" and the children filter applies', () => {
    expect(whoIsSought({ seeks: 'mulheres' })).toEqual({
      sexes: [1],
      target: 'women',
      children: 'applies',
    })
  })

  it('seeking men: sex 0, "homens" and no children data', () => {
    expect(whoIsSought({ seeks: 'homens' })).toEqual({
      sexes: [0],
      target: 'men',
      children: 'no-data',
    })
  })

  it('seeking both, or not saying: both sexes, "pessoas" and children only for women', () => {
    const both = { sexes: [0, 1], target: 'people', children: 'women-only' }
    expect(whoIsSought({ seeks: 'ambos' })).toEqual(both)
    expect(whoIsSought({ gender: 'homem' })).toEqual(both)
    expect(whoIsSought(null)).toEqual(both)
  })
})
