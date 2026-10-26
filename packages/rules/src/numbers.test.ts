import { describe, expect, it } from 'vite-plus/test'
import {
  formatRange,
  rangeParts,
  formatGain,
  formatAmount,
  formatTimes,
} from './numbers.ts'

describe('formatAmount', () => {
  it('rounds to 2 digits and writes mil and milhões', () => {
    expect(formatAmount(746_284)).toBe('750 mil')
    expect(formatAmount(229_861)).toBe('230 mil')
    expect(formatAmount(1_234)).toBe('1,2 mil')
    expect(formatAmount(1_540_000)).toBe('1,5 milhão')
    expect(formatAmount(25_430_000)).toBe('25 milhões')
    expect(formatAmount(670)).toBe('670')
    expect(formatAmount(87.4)).toBe('87')
    expect(formatAmount(0.4)).toBe('menos de 1')
    expect(formatAmount(0)).toBe('ninguém')
  })
})

describe('formatRange', () => {
  it('the low end rounds down and the high end rounds up', () => {
    expect(formatRange(163_900, 196_100)).toBe('entre 160 mil e 200 mil')
    expect(formatRange(0, 3.2)).toBe('entre 0 e 4')
  })

  it('when both ends give the same number, it says "cerca de"', () => {
    expect(formatRange(1_200, 1_200)).toBe('cerca de 1,2 mil')
    expect(formatRange(1_201, 1_249)).toBe('entre 1,2 mil e 1,3 mil')
  })

  it('gives its parts apart, for whoever highlights the numbers', () => {
    expect(rangeParts(163_900, 196_100)).toEqual({
      before: 'entre',
      numbers: '160 mil e 200 mil',
    })
    expect(rangeParts(1_200, 1_200)).toEqual({
      before: 'cerca de',
      numbers: '1,2 mil',
    })
  })
})

describe('cost of releasing', () => {
  it('writes how many times the group grows and how much it gains', () => {
    expect(formatTimes(3.42)).toBe('×3,4')
    expect(formatTimes(12.6)).toBe('×13')
    expect(formatTimes(Infinity)).toBe('de ninguém para alguém')
    expect(formatGain(668)).toBe('+670')
    expect(formatGain(48_200)).toBe('+48 mil')
  })
})
