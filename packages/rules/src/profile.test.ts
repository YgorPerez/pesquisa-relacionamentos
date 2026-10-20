import { describe, expect, it } from 'vite-plus/test'
import { describeProfile, readProfile } from './profile.ts'

describe('readProfile', () => {
  it('accepts the full profile', () => {
    expect(readProfile({ gender: 'mulher', seeks: 'ambos', age: 24 })).toEqual({
      gender: 'mulher',
      seeks: 'ambos',
      age: 24,
    })
  })

  it('accepts the age as written in the form field', () => {
    expect(readProfile({ age: '31' })).toEqual({ age: 31 })
  })

  it('drops what is outside the lists and an age below 18 or broken', () => {
    expect(readProfile({ gender: 'gato', seeks: 'homens', age: 17 })).toEqual({
      seeks: 'homens',
    })
    expect(readProfile({ gender: 'homem', age: 30.5 })).toEqual({
      gender: 'homem',
    })
    expect(readProfile({ gender: 'homem', age: '' })).toEqual({
      gender: 'homem',
    })
  })

  it('returns null when nothing is left', () => {
    expect(readProfile({})).toBeNull()
    expect(readProfile({ gender: 'x', age: 9 })).toBeNull()
    expect(readProfile('homem')).toBeNull()
    expect(readProfile(null)).toBeNull()
  })
})

describe('describeProfile', () => {
  it('writes the profile in one line', () => {
    expect(describeProfile({ gender: 'homem', seeks: 'homens', age: 30 })).toBe(
      'homem, procura homens, 30 anos',
    )
    expect(describeProfile({ gender: 'outro', seeks: 'ambos' })).toBe(
      'outro gênero, procura homens e mulheres',
    )
    expect(describeProfile({ age: 45 })).toBe('45 anos')
  })
})
