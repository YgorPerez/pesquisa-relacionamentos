import { describe, expect, it } from 'vite-plus/test'
import { formatarFaixa, formatarGanho, formatarQuantidade, formatarVezes } from './numeros.ts'

describe('formatarQuantidade', () => {
  it('arredonda a 2 algarismos e escreve mil e milhões', () => {
    expect(formatarQuantidade(746_284)).toBe('750 mil')
    expect(formatarQuantidade(229_861)).toBe('230 mil')
    expect(formatarQuantidade(1_234)).toBe('1,2 mil')
    expect(formatarQuantidade(1_540_000)).toBe('1,5 milhão')
    expect(formatarQuantidade(25_430_000)).toBe('25 milhões')
    expect(formatarQuantidade(670)).toBe('670')
    expect(formatarQuantidade(87.4)).toBe('87')
    expect(formatarQuantidade(0.4)).toBe('menos de 1')
    expect(formatarQuantidade(0)).toBe('ninguém')
  })
})

describe('formatarFaixa', () => {
  it('a ponta de baixo arredonda para baixo e a de cima para cima', () => {
    expect(formatarFaixa(163_900, 196_100)).toBe('entre 160 mil e 200 mil')
    expect(formatarFaixa(0, 3.2)).toBe('entre 0 e 4')
  })

  it('quando as duas pontas dão o mesmo número, diz "cerca de"', () => {
    expect(formatarFaixa(1_200, 1_200)).toBe('cerca de 1,2 mil')
    expect(formatarFaixa(1_201, 1_249)).toBe('entre 1,2 mil e 1,3 mil')
  })
})

describe('custo de soltar', () => {
  it('escreve quantas vezes o grupo cresce e quanto ganha', () => {
    expect(formatarVezes(3.42)).toBe('×3,4')
    expect(formatarVezes(12.6)).toBe('×13')
    expect(formatarVezes(Infinity)).toBe('de ninguém para alguém')
    expect(formatarGanho(668)).toBe('+670')
    expect(formatarGanho(48_200)).toBe('+48 mil')
  })
})
