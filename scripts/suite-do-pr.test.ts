import { describe, expect, it } from 'vite-plus/test'
import { planoDoDiff } from './afetados.ts'
import { filasDaSuite } from './suite-do-pr.ts'

const BASE = 'abc1234'
const nomes = (filas: ReturnType<typeof filasDaSuite>) =>
  filas.map((fila) => fila.map((p) => (p.pula ? `pula ${p.nome}` : p.nome)))

describe('filasDaSuite', () => {
  it('a completa roda cada passo do pr.yml, com a cobertura, a fallow e o e2e inteiro', () => {
    const filas = filasDaSuite({ plano: null, base: BASE })
    expect(nomes(filas)).toEqual([
      ['check', 'pastas', 'pecas', 'testes', 'fallow', 'doctor'],
      ['tipos', 'supressoes'],
      ['stories'],
      ['build', 'storybook', 'e2e'],
    ])
    const passo = (nome: string) => filas.flat().find((p) => p.nome === nome)
    expect(passo('testes')?.comando).toBe('pnpm exec vp run -r test:coverage')
    expect(passo('e2e')?.comando).toBe('pnpm e2e')
    expect(passo('supressoes')?.comando).toContain(`--base ${BASE}`)
  })

  it('a do diff roda o Vitest só nas pastas afetadas e só as specs do termo', () => {
    const filas = filasDaSuite({
      plano: planoDoDiff(['frontend/src/ui/perfil.tsx']),
      base: BASE,
    })
    expect(nomes(filas)).toEqual([
      ['check', 'pastas', 'pecas', 'testes:frontend', 'fallow', 'doctor'],
      ['tipos', 'supressoes'],
      ['stories'],
      ['build', 'storybook', 'e2e'],
    ])
    const passo = (nome: string) => filas.flat().find((p) => p.nome === nome)
    expect(passo('testes:frontend')).toMatchObject({
      pasta: 'frontend',
      comando: `pnpm exec vp test run --changed ${BASE} --passWithNoTests`,
    })
    expect(passo('e2e')?.comando).toBe(
      'pnpm e2e accessibility.e2e.ts home.e2e.ts profile.e2e.ts',
    )
    // Sem a cobertura inteira, a fallow roda só o que não depende dela.
    expect(passo('fallow')?.comando).toBe(
      'pnpm exec fallow dead-code && pnpm exec fallow dupes',
    )
  })

  it('um script da raiz pula o site e as stories, e diz por quê', () => {
    const filas = filasDaSuite({
      plano: planoDoDiff(['scripts/afetados.ts']),
      base: BASE,
    })
    expect(nomes(filas)).toEqual([
      [
        'check',
        'pula pastas',
        'pula pecas',
        'testes:.',
        'pula fallow',
        'pula doctor',
      ],
      ['tipos', 'supressoes'],
      ['pula stories'],
      ['pula build', 'pula storybook', 'pula e2e'],
    ])
    expect(filas.flat().find((p) => p.nome === 'e2e')?.pula).toBe(
      'nenhuma spec percorre o que mudou',
    )
  })

  it('a falha de um teste roda de novo só o arquivo, na pasta em que ele rodou', () => {
    const filas = filasDaSuite({ plano: null, base: BASE })
    const testes = filas.flat().find((p) => p.nome === 'testes')
    expect(
      testes?.repetir?.comando({
        pasta: '/repo/frontend',
        arquivo: 'src/a.test.ts',
      }),
    ).toBe("pnpm exec vp test run 'src/a.test.ts'")
    const e2e = filas.flat().find((p) => p.nome === 'e2e')
    expect(
      e2e?.repetir?.comando({ pasta: null, arquivo: 'e2e/perfil.e2e.ts' }),
    ).toBe("pnpm exec playwright test 'e2e/perfil.e2e.ts' --retries=0")
  })
})
