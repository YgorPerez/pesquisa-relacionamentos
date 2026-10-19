import { describe, expect, it } from 'vite-plus/test'
import { coberturaDeLinhas, selos } from './badges.ts'

/** Um arquivo do `coverage-final.json`: um statement por linha dada, com
 * quantas vezes rodou. */
const arquivo = (...linhas: [number, number][]) => ({
  statementMap: Object.fromEntries(
    linhas.map(([linha], i) => [String(i), { start: { line: linha } }]),
  ),
  s: Object.fromEntries(linhas.map(([, vezes], i) => [String(i), vezes])),
})

describe('coberturaDeLinhas', () => {
  it('conta a linha coberta se algum statement dela rodou, e arredonda para baixo', () => {
    const cobertura = coberturaDeLinhas([
      {
        pasta: '/repo/frontend',
        arquivos: {
          '/repo/frontend/src/ui/a.tsx': arquivo([1, 1], [1, 0], [2, 0]),
          '/repo/frontend/src/ui/a.test.tsx': arquivo([1, 0]),
        },
      },
      {
        pasta: '/repo/packages/regras',
        arquivos: { '/repo/packages/regras/src/b.ts': arquivo([5, 3]) },
      },
    ])
    // 2 de 3 linhas: 66,6% sai 66.
    expect(cobertura).toBe(66)
  })
})

describe('selos', () => {
  it('desenha a nota da fallow, o score do doctor e a cobertura', () => {
    const { fallow, reactDoctor, cobertura, resumo } = selos({
      health: { health_score: { score: 92.4, grade: 'A' } },
      doctor: { summary: { score: 100, scoreLabel: 'Great' } },
      cobertura: 41,
    })
    expect(fallow).toContain('aria-label="fallow health: A (92)"')
    expect(fallow).toContain('#4c1')
    expect(reactDoctor).toContain('react doctor: 100 · Great')
    expect(cobertura).toContain('cobertura: 41%')
    // De 40 a 59, laranja.
    expect(cobertura).toContain('#fe7d37')
    expect(resumo).toBe('fallow: A (92) · react doctor: 100 · cobertura: 41%')
  })

  it('sem score do doctor, o selo diz isso em vez de inventar um número', () => {
    const { reactDoctor } = selos({
      health: { health_score: { score: 80, grade: 'B' } },
      doctor: { summary: { score: null, scoreLabel: '' } },
      cobertura: 90,
    })
    expect(reactDoctor).toContain('react doctor: sem score')
  })
})
