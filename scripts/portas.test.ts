import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { blocoDoWorktree, portaDoCheckout, USOS } from './portas.ts'

const PASTA = mkdtempSync(join(tmpdir(), 'portas-'))
afterAll(() => rmSync(PASTA, { recursive: true, force: true }))

/** Um checkout falso: no principal o `.git` é pasta, num worktree é arquivo. */
function checkout(nome: string, tipo: 'principal' | 'worktree' | 'solto') {
  const raiz = join(PASTA, nome)
  mkdirSync(raiz, { recursive: true })
  if (tipo === 'principal') mkdirSync(join(raiz, '.git'))
  if (tipo === 'worktree')
    writeFileSync(join(raiz, '.git'), 'gitdir: /algum/lugar\n')
  return raiz
}

describe('portaDoCheckout', () => {
  it('o checkout principal fica nas portas de sempre', () => {
    const raiz = checkout('principal', 'principal')
    expect(USOS.map((uso) => portaDoCheckout(uso, raiz))).toEqual([
      4310, 4311, 4312, 6310, 6311,
    ])
  })

  it('uma cópia sem .git conta como principal', () => {
    expect(portaDoCheckout('dev', checkout('solto', 'solto'))).toBe(4310)
  })

  it('um worktree ganha um bloco só dele, fora das portas do principal e do Festival', () => {
    const raiz = checkout('wt-a', 'worktree')
    const portas = USOS.map((uso) => portaDoCheckout(uso, raiz))
    expect(new Set(portas).size).toBe(USOS.length)
    for (const porta of portas) {
      expect(porta).toBeGreaterThanOrEqual(40_100)
      expect(porta).toBeLessThan(48_100)
    }
    // As cinco portas são vizinhas, a partir da primeira do bloco.
    expect(portas[0]! % 10).toBe(0)
    expect(portas).toEqual(portas.map((_, i) => portas[0]! + i))
  })

  it('o mesmo caminho dá sempre as mesmas portas', () => {
    const raiz = checkout('wt-b', 'worktree')
    expect(portaDoCheckout('e2e', raiz)).toBe(portaDoCheckout('e2e', raiz))
    expect(portaDoCheckout('e2e', `${raiz}/`)).toBe(
      portaDoCheckout('e2e', raiz),
    )
  })

  it('dois worktrees caem em blocos diferentes', () => {
    // Caminhos fixos: com os do `mkdtemp`, o teste falharia 1 vez em 800.
    expect(blocoDoWorktree('/repo/.claude/worktrees/agent-a')).not.toBe(
      blocoDoWorktree('/repo/.claude/worktrees/agent-b'),
    )
  })

  it('a barra do Windows e a caixa da letra do disco não mudam o bloco', () => {
    expect(blocoDoWorktree('C:\\repo\\wt\\')).toBe(
      blocoDoWorktree('c:/repo/wt'),
    )
  })
})
