import { describe, expect, it } from 'vite-plus/test'
import { describeProfile, readProfile } from './profile.ts'

describe('readProfile', () => {
  it('accepts the full profile', () => {
    expect(
      readProfile({ genero: 'mulher', procura: 'ambos', idade: 24 }),
    ).toEqual({
      genero: 'mulher',
      procura: 'ambos',
      idade: 24,
    })
  })

  it('accepts the age as written in the form field', () => {
    expect(readProfile({ idade: '31' })).toEqual({ idade: 31 })
  })

  it('drops what is outside the lists and an age below 18 or broken', () => {
    expect(
      readProfile({ genero: 'gato', procura: 'homens', idade: 17 }),
    ).toEqual({ procura: 'homens' })
    expect(readProfile({ genero: 'homem', idade: 30.5 })).toEqual({
      genero: 'homem',
    })
    expect(readProfile({ genero: 'homem', idade: '' })).toEqual({
      genero: 'homem',
    })
  })

  it('returns null when nothing is left', () => {
    expect(readProfile({})).toBeNull()
    expect(readProfile({ genero: 'x', idade: 9 })).toBeNull()
    expect(readProfile('homem')).toBeNull()
    expect(readProfile(null)).toBeNull()
  })
})

describe('describeProfile', () => {
  it('writes the profile in one line', () => {
    expect(
      describeProfile({ genero: 'homem', procura: 'homens', idade: 30 }),
    ).toBe('homem, procura homens, 30 anos')
    expect(describeProfile({ genero: 'outro', procura: 'ambos' })).toBe(
      'outro gênero, procura homens e mulheres',
    )
    expect(describeProfile({ idade: 45 })).toBe('45 anos')
  })
})
