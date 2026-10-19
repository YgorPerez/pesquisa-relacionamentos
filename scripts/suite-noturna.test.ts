import { describe, expect, it } from 'vite-plus/test'
import type { Gh } from './issue-por-titulo.ts'
import { avisar, oQueFazer, resumoDaFalha } from './suite-noturna.ts'

describe('oQueFazer', () => {
  it('a noite vermelha abre a issue, ou comenta na que está aberta', () => {
    expect(oQueFazer(false, null)).toBe('abrir')
    expect(oQueFazer(false, 812)).toBe('comentar')
  })

  it('a noite verde fecha a issue aberta, e sem ela não faz nada', () => {
    expect(oQueFazer(true, 812)).toBe('fechar')
    expect(oQueFazer(true, null)).toBe('nada')
  })
})

const JOBS = {
  check: { result: 'success' },
  e2e: { result: 'failure' },
  stories: { result: 'cancelled' },
}

describe('resumoDaFalha', () => {
  it('diz o SHA, cada job que não passou, o link da rodada e o fim do log', () => {
    const corpo = resumoDaFalha({
      sha: 'abc1234',
      jobs: JOBS,
      url: 'https://github.com/x/y/actions/runs/1',
      log: 'linha 1\n  1 failed\n    e2e/perfil.e2e.ts:72:1 › o perfil',
    })
    expect(corpo).toMatch(/na `main` em abc1234/)
    expect(corpo).toMatch(/- `e2e`: failure/)
    expect(corpo).toMatch(/- `stories`: cancelled/)
    expect(corpo).not.toMatch(/`check`/)
    expect(corpo).toMatch(/actions\/runs\/1/)
    expect(corpo).toMatch(/perfil\.e2e\.ts:72:1/)
  })

  it('corta o log longo pelo começo, e guarda o fim', () => {
    const corpo = resumoDaFalha({
      sha: 'abc1234',
      jobs: JOBS,
      url: 'u',
      log: `${'x'.repeat(100_000)}\nA ÚLTIMA`,
    })
    expect(corpo.length).toBeLessThan(65_536)
    expect(corpo).toMatch(/A ÚLTIMA/)
  })
})

/** Um `gh` falso: anota cada chamada e responde pela `issue list`. */
function ghFalso(abertas: { number: number; title: string }[]) {
  const chamadas: string[][] = []
  const gh: Gh = (args) => {
    chamadas.push(args)
    if (args[1] === 'list') return JSON.stringify(abertas)
    if (args[1] === 'create') return 'https://github.com/x/y/issues/90'
    return ''
  }
  return { gh, chamadas }
}

describe('avisar', () => {
  const vermelha = { sha: 'abc1234', jobs: JOBS, url: 'u', log: '' }

  it('a primeira noite vermelha abre a issue com o rótulo bug', () => {
    const { gh, chamadas } = ghFalso([])
    expect(avisar(gh, vermelha)).toBe('abrir')
    expect(chamadas[1]).toEqual(
      expect.arrayContaining(['create', 'Suíte noturna vermelha', 'bug']),
    )
  })

  it('a verde fecha a aberta', () => {
    const { gh, chamadas } = ghFalso([
      { number: 7, title: 'Suíte noturna vermelha' },
    ])
    expect(
      avisar(gh, { ...vermelha, jobs: { check: { result: 'success' } } }),
    ).toBe('fechar')
    expect(chamadas[1]?.slice(0, 3)).toEqual(['issue', 'close', '7'])
  })
})
