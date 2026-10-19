import { describe, expect, it } from 'vite-plus/test'
import { medir } from './tamanho-do-pr.ts'

const numstat = (...linhas: [number | '-', number | '-', string][]) =>
  linhas.map((l) => l.join('\t')).join('\n')

describe('medir', () => {
  it('soma o que mudou e dá a faixa', () => {
    const { tamanho, linhas, contados } = medir(
      numstat([20, 5, 'scripts/afetados.ts'], [3, 2, 'AGENTS.md']),
    )
    expect(tamanho.nome).toBe('tamanho:M')
    expect(linhas).toBe(30)
    expect(contados).toBe(2)
  })

  it('lockfile, árvore de rotas, selo, skill vendorizada e binário ficam de fora', () => {
    const { tamanho, linhas } = medir(
      numstat(
        [4, 0, 'scripts/portas.ts'],
        [900, 300, 'pnpm-lock.yaml'],
        [80, 10, 'frontend/src/routeTree.gen.ts'],
        [1, 1, 'docs/badges/fallow.svg'],
        [400, 0, '.agents/skills/tdd/SKILL.md'],
        ['-', '-', 'frontend/public/og.png'],
      ),
    )
    expect(linhas).toBe(4)
    expect(tamanho.nome).toBe('tamanho:PP')
  })

  it('num PR de código e teste, o teste não conta; num só de teste, conta', () => {
    const misto = medir(
      numstat(
        [10, 0, 'scripts/afetados.ts'],
        [600, 0, 'scripts/afetados.test.ts'],
        [200, 0, 'frontend/e2e/perfil.e2e.ts'],
      ),
    )
    expect(misto.linhas).toBe(10)
    expect(misto.testes).toBe(2)
    expect(
      medir(numstat([600, 0, 'scripts/afetados.test.ts'])).tamanho.nome,
    ).toBe('tamanho:GG')
  })

  it('mil linhas ou mais é XG', () => {
    expect(medir(numstat([1000, 0, 'scripts/x.ts'])).tamanho.nome).toBe(
      'tamanho:XG',
    )
  })
})
