import { describe, expect, it } from 'vite-plus/test'
import { planoDaProva } from './prova-minima.ts'

const existe = (arquivo: string) => !arquivo.includes('apagado')
const plano = (arquivos: string[]) =>
  planoDaProva({ arquivos, base: 'abc1234', existe })
const nomes = (passos: ReturnType<typeof plano>) =>
  passos.map((p) => (p.pula ? `pula ${p.nome}` : p.nome))

describe('planoDaProva', () => {
  it('uma peça do app: os tipos e os testes do front, as pastas e o check do arquivo', () => {
    const passos = plano(['frontend/src/ui/perfil.tsx'])
    expect(nomes(passos)).toEqual([
      'tipos:frontend',
      'vitest:frontend',
      'pastas',
      'pecas',
      'check',
      'pula stories',
    ])
    expect(passos.find((p) => p.nome === 'vitest:frontend')).toMatchObject({
      pasta: 'frontend',
      comando: [
        'pnpm',
        'exec',
        'vp',
        'test',
        'run',
        '--changed',
        'abc1234',
        '--passWithNoTests',
      ],
    })
    expect(passos.find((p) => p.nome === 'check')?.comando).toEqual([
      'pnpm',
      'exec',
      'vp',
      'check',
      '--no-error-on-unmatched-pattern',
      'frontend/src/ui/perfil.tsx',
    ])
  })

  it('um pacote puro leva junto os tipos e os testes do app, que o importa', () => {
    expect(nomes(plano(['packages/regras/src/grupo-possivel.ts']))).toEqual(
      expect.arrayContaining([
        'tipos:@tem-estudo/regras',
        'tipos:frontend',
        'vitest:packages/regras',
        'vitest:frontend',
      ]),
    )
  })

  it('um script da raiz: os testes da raiz, sem tipos de pacote', () => {
    expect(nomes(plano(['scripts/afetados.ts']))).toEqual(['vitest:.', 'check'])
  })

  it('o arquivo apagado não vai para o check; o texto vai, pelo formato', () => {
    const passos = plano(['scripts/apagado.ts', 'AGENTS.md', 'scripts/x.ts'])
    expect(passos.find((p) => p.nome === 'check')?.comando.slice(5)).toEqual([
      'AGENTS.md',
      'scripts/x.ts',
    ])
  })

  it('só texto: só o check do texto', () => {
    expect(nomes(plano(['docs/agents/integracao.md']))).toEqual(['check'])
  })
})
