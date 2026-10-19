import { execFileSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test'
import { atrasoDoMain, ligar } from './preparar-worktree.ts'

const PASTA = mkdtempSync(join(tmpdir(), 'preparar-worktree-'))
afterAll(() => rmSync(PASTA, { recursive: true, force: true }))

// O git dos testes não lê a configuração da máquina: uma assinatura de commit
// ligada lá pediria chave a cada commit daqui.
const vazia = join(PASTA, 'gitconfig')
writeFileSync(vazia, '')
const ambienteDoGit = {
  ...process.env,
  GIT_CONFIG_GLOBAL: vazia,
  GIT_CONFIG_NOSYSTEM: '1',
}

function git(pasta: string, ...args: string[]) {
  return execFileSync(
    'git',
    ['-c', 'user.name=teste', '-c', 'user.email=teste@x', ...args],
    {
      cwd: pasta,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: ambienteDoGit,
    },
  ).trim()
}

function commitar(pasta: string, quantos: number) {
  for (let i = 0; i < quantos; i++)
    git(pasta, 'commit', '--allow-empty', '--quiet', '-m', `c${i}`)
}

describe('atrasoDoMain', () => {
  const origem = join(PASTA, 'origem')
  const clone = join(PASTA, 'clone')

  beforeAll(() => {
    mkdirSync(origem)
    git(origem, 'init', '--quiet', '-b', 'main')
    commitar(origem, 6)
    git(PASTA, 'clone', '--quiet', origem, clone)
  })

  it('em dia com o origin/main, não diz nada', () => {
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main')
    expect(atrasoDoMain(clone, ambienteDoGit)).toEqual([])
  })

  it('num commit velho, diz quantos atrás e como atualizar', () => {
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main~5')
    expect(atrasoDoMain(clone, ambienteDoGit)).toEqual([
      '5 commits atrás de origin/main. Para atualizar: git merge origin/main',
    ])
  })

  it('conta o que o fetch trouxe, e no singular quando é um', () => {
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main')
    commitar(origem, 1)
    expect(atrasoDoMain(clone, ambienteDoGit)).toEqual([
      '1 commit atrás de origin/main. Para atualizar: git merge origin/main',
    ])
  })

  it('sem rede, avisa e compara com o origin/main que já tinha', () => {
    git(clone, 'remote', 'set-url', 'origin', join(PASTA, 'nao-existe'))
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main~2')
    const [falha, atraso, ...resto] = atrasoDoMain(clone, ambienteDoGit)
    expect(falha).toMatch(
      /^o git fetch falhou \(.+\): comparo com o origin\/main que já estava aqui\.$/,
    )
    expect(atraso).toBe(
      '2 commits atrás de origin/main. Para atualizar: git merge origin/main',
    )
    expect(resto).toEqual([])
  })
})

describe('ligar', () => {
  let n = 0
  /** Um principal com `relativo` (pasta com um arquivo, ou arquivo) e um
   * worktree vazio. */
  function checkouts(relativo: string, tipo: 'pasta' | 'arquivo') {
    const principal = join(PASTA, `principal-${++n}`)
    const worktree = join(PASTA, `worktree-${n}`)
    const alvo =
      tipo === 'pasta'
        ? join(principal, relativo, 'motor')
        : join(principal, relativo)
    mkdirSync(dirname(alvo), { recursive: true })
    writeFileSync(alvo, 'do principal')
    mkdirSync(worktree)
    return { principal, worktree }
  }

  describe('uma pasta', () => {
    const RELATIVO = 'fontes/privado'
    const ler = (worktree: string) =>
      readFileSync(join(worktree, RELATIVO, 'motor'), 'utf8')

    it('liga a do principal, que acompanha o que muda lá', () => {
      const { principal, worktree } = checkouts(RELATIVO, 'pasta')
      expect(ligar(principal, worktree, RELATIVO)).toBe(
        `${RELATIVO}: link para ${join(principal, RELATIVO)}.`,
      )
      writeFileSync(join(principal, RELATIVO, 'motor'), 'novo')
      expect(ler(worktree)).toBe('novo')
      expect(ligar(principal, worktree, RELATIVO)).toBe(
        `${RELATIVO}: já é link para o principal.`,
      )
    })

    it('quando o sistema recusa o link, copia e diz que é cópia', () => {
      const { principal, worktree } = checkouts(RELATIVO, 'pasta')
      const recusa = () => {
        throw Object.assign(new Error('recusado'), { code: 'EPERM' })
      }
      expect(ligar(principal, worktree, RELATIVO, recusa)).toMatch(
        /recusou o link \(EPERM\), então é uma CÓPIA/,
      )
      expect(ler(worktree)).toBe('do principal')
      expect(lstatSync(join(worktree, RELATIVO)).isSymbolicLink()).toBe(false)
    })

    it('a que o worktree já tem fica como está', () => {
      const { principal, worktree } = checkouts(RELATIVO, 'pasta')
      mkdirSync(join(worktree, RELATIVO), { recursive: true })
      writeFileSync(join(worktree, RELATIVO, 'motor'), 'a minha')
      expect(ligar(principal, worktree, RELATIVO)).toBe(
        `${RELATIVO}: o worktree tem o seu. Fica.`,
      )
      expect(ler(worktree)).toBe('a minha')
    })

    it('refaz um link quebrado', () => {
      const { principal, worktree } = checkouts(RELATIVO, 'pasta')
      const sumiu = join(PASTA, `sumiu-${n}`)
      mkdirSync(join(sumiu, RELATIVO), { recursive: true })
      ligar(sumiu, worktree, RELATIVO)
      rmSync(sumiu, { recursive: true })
      expect(existsSync(join(worktree, RELATIVO))).toBe(false)
      expect(ligar(principal, worktree, RELATIVO)).toBe(
        `${RELATIVO}: link para ${join(principal, RELATIVO)}.`,
      )
      expect(ler(worktree)).toBe('do principal')
    })

    it('sem ela no principal, avisa e segue', () => {
      const { worktree } = checkouts(RELATIVO, 'pasta')
      const vazio = join(PASTA, `vazio-${n}`)
      mkdirSync(vazio)
      expect(ligar(vazio, worktree, RELATIVO)).toBe(
        `${RELATIVO}: o principal não tem. Pulado.`,
      )
      expect(existsSync(join(worktree, RELATIVO))).toBe(false)
    })
  })

  describe('um arquivo', () => {
    const RELATIVO = 'frontend/.env'

    it('liga o do principal', () => {
      const { principal, worktree } = checkouts(RELATIVO, 'arquivo')
      ligar(principal, worktree, RELATIVO)
      expect(lstatSync(join(worktree, RELATIVO)).isSymbolicLink()).toBe(true)
      expect(readFileSync(join(worktree, RELATIVO), 'utf8')).toBe(
        'do principal',
      )
    })

    it('uma cópia igual, de uma rodada anterior, vira link', () => {
      const { principal, worktree } = checkouts(RELATIVO, 'arquivo')
      mkdirSync(join(worktree, 'frontend'))
      writeFileSync(join(worktree, RELATIVO), 'do principal')
      expect(ligar(principal, worktree, RELATIVO)).toBe(
        `${RELATIVO}: link para ${join(principal, RELATIVO)}.`,
      )
      expect(lstatSync(join(worktree, RELATIVO)).isSymbolicLink()).toBe(true)
    })

    it('um diferente é do worktree, e fica', () => {
      const { principal, worktree } = checkouts(RELATIVO, 'arquivo')
      mkdirSync(join(worktree, 'frontend'))
      writeFileSync(join(worktree, RELATIVO), 'o meu')
      expect(ligar(principal, worktree, RELATIVO)).toBe(
        `${RELATIVO}: o worktree tem o seu. Fica.`,
      )
      expect(readFileSync(join(worktree, RELATIVO), 'utf8')).toBe('o meu')
    })
  })
})
