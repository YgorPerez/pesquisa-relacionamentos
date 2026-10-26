import { describe, expect, it } from 'vite-plus/test'
import { andList, orList } from './lists.ts'

describe('lists in a sentence', () => {
  it('joins with commas and "e" before the last', () => {
    expect(andList([])).toBe('')
    expect(andList(['renda'])).toBe('renda')
    expect(andList(['renda', 'sexo'])).toBe('renda e sexo')
    expect(andList(['renda', 'sexo', 'calma'])).toBe('renda, sexo e calma')
  })

  it('or with "ou"', () => {
    expect(orList(['preta', 'parda', 'branca'])).toBe('preta, parda ou branca')
  })
})
