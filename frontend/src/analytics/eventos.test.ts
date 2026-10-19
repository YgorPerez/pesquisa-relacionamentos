import { describe, expect, test } from 'vitest'
import { EVENTOS } from './eventos'

// Os nomes são o que aparece no painel do GoatCounter (#21): mudar um quebra
// a série que já está lá.
describe('EVENTOS', () => {
  test('cada evento sai com o nome que o painel conhece', () => {
    expect(EVENTOS.ajudouSim('onde-os-casais-se-conhecem')).toBe('ajudou/sim/onde-os-casais-se-conhecem')
    expect(EVENTOS.ajudouNao('nao-confio', 'app-ou-presencial')).toBe('ajudou/nao/nao-confio/app-ou-presencial')
    expect(EVENTOS.fichaAberta('app-ou-presencial', 'rosenfeld-2019')).toBe('ficha/app-ou-presencial/rosenfeld-2019')
    expect(EVENTOS.calculadora('grupo-possivel')).toBe('calculadora/grupo-possivel')
    expect(EVENTOS.calculadora('prioridades')).toBe('calculadora/prioridades')
  })
})
