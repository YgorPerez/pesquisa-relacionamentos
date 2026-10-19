import { describe, expect, it } from 'vite-plus/test'
import { laco } from './laco'

const numeros = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

describe('laco', () => {
  it('estica o laço ao tamanho real da Ficha, sem deformar o traço', () => {
    const base = numeros(laco(100, 100))
    const largo = numeros(laco(400, 120))
    expect(largo).toHaveLength(base.length)
    largo.forEach((n, i) => {
      const escala = i % 2 === 0 ? 4 : 1.2
      expect(n).toBeCloseTo((base[i] ?? 0) * escala, 1)
    })
  })

  it('termina perto de onde começou, com o traço que se sobrepõe', () => {
    const ns = numeros(laco(300, 90))
    const [x0 = 0, y0 = 0] = ns
    const [xf = 0, yf = 0] = ns.slice(-2)
    expect(Math.abs(x0 - xf)).toBeLessThan(30)
    expect(Math.abs(y0 - yf)).toBeLessThan(10)
  })
})
