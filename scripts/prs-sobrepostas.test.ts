import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { aviso, type PrAberto, sobrepostas } from './prs-sobrepostas.ts'

function pr(number: number, headRefName: string, ...paths: string[]): PrAberto {
  return {
    number,
    title: `PR ${number}`,
    headRefName,
    files: paths.map((path) => ({ path })),
  }
}

describe('sobrepostas', () => {
  it('lista o PR que mexe num arquivo deste branch, com os arquivos comuns', () => {
    const prs = [
      pr(1058, 'fix/sharp', 'backend/package.json', 'pnpm-lock.yaml'),
      pr(1007, 'chore/worktree', 'scripts/preparar-worktree.ts'),
    ]
    assert.deepEqual(
      sobrepostas(['pnpm-lock.yaml', 'pnpm-workspace.yaml'], prs, []),
      [{ numero: 1058, titulo: 'PR 1058', comuns: ['pnpm-lock.yaml'] }],
    )
  })

  it('deixa de fora o PR deste branch e o de baixo de um empilhado', () => {
    const prs = [
      pr(1060, 'chore/integra', 'AGENTS.md'),
      pr(1004, 'chore/auditoria', 'AGENTS.md'),
      pr(1016, 'chore/outra', 'AGENTS.md'),
    ]
    assert.deepEqual(
      sobrepostas(['AGENTS.md'], prs, ['chore/integra', 'chore/auditoria']).map(
        (p) => p.numero,
      ),
      [1016],
    )
  })

  it('sem arquivo em comum, nada', () => {
    assert.deepEqual(sobrepostas(['a.ts'], [pr(1, 'x', 'b.ts')], []), [])
  })
})

describe('aviso', () => {
  it('corta em cinco arquivos e diz quantos sobraram', () => {
    const comuns = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    assert.deepEqual(aviso([{ numero: 9, titulo: 'T', comuns }]), [
      '#9 T: a, b, c, d, e e mais 2',
    ])
  })
})
