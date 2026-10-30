import { describe, expect, it } from 'vite-plus/test'
import { countrySlug, readCountry } from './country.ts'

describe('a country in the link', () => {
  it('is written without accents or spaces', () => {
    expect(countrySlug('Brasil')).toBe('brasil')
    expect(countrySlug('Estados Unidos')).toBe('estados-unidos')
    expect(countrySlug('Polônia')).toBe('polonia')
    expect(countrySlug('África do Sul')).toBe('africa-do-sul')
  })

  it('is read only when the Guide has a chart with that country', () => {
    const guide = ['brasil', 'eua', 'reino-unido']
    expect(readCountry('reino-unido', guide)).toBe('reino-unido')
    expect(readCountry('Reino Unido', guide)).toBe('reino-unido')
    expect(readCountry('narnia', guide)).toBeNull()
    expect(readCountry(['eua'], guide)).toBeNull()
    expect(readCountry(undefined, guide)).toBeNull()
  })
})
