// Cada teste num remoto temporário (`--bare`), um clone e uma worktree dele:
// nada escreve no `.git` daqui. A suíte, a auditoria e o `antes-de-integrar`
// passam por um `rodar` falso.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import {
  integrar,
  relatorioDoEnsaio,
  type Rodar,
  tomarAVez,
} from './integrar-main.ts'
import { semGitDoHook } from './registro-da-suite.ts'

const temporarios: string[] = []
afterEach(() => {
  for (const pasta of temporarios.splice(0))
    rmSync(pasta, { recursive: true, force: true })
})

function git(cwd: string, ...args: string[]) {
  const r = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: semGitDoHook(),
  })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
  return r.stdout.trim()
}

/** O remoto com a `main` e dois ramos de ticket, `ticket/a` e `ticket/b`, e
 * uma worktree destacada para integrar. Com `conflito`, os dois mudam a mesma
 * linha. */
function repositorios({ conflito = false } = {}) {
  const pasta = mkdtempSync(join(tmpdir(), 'integrar-'))
  temporarios.push(pasta)
  const remoto = join(pasta, 'remoto.git')
  const clone = join(pasta, 'clone')
  git(pasta, 'init', '-q', '--bare', '-b', 'main', remoto)
  git(pasta, 'clone', '-q', remoto, clone)
  git(clone, 'config', 'user.email', 'teste@local')
  git(clone, 'config', 'user.name', 'Teste')
  const commitar = (arquivo: string, texto: string) => {
    writeFileSync(join(clone, arquivo), texto)
    git(clone, 'add', '.')
    git(clone, 'commit', '-qm', `${arquivo}: ${texto}`)
  }
  commitar('comum.txt', 'base')
  git(clone, 'push', '-q', 'origin', 'HEAD:main')
  for (const ramo of ['a', 'b']) {
    git(clone, 'switch', '-qc', `ticket/${ramo}`, 'main')
    commitar(conflito ? 'comum.txt' : `${ramo}.txt`, ramo)
    git(clone, 'push', '-q', 'origin', `HEAD:ticket/${ramo}`)
  }
  git(clone, 'switch', '-q', 'main')
  const worktree = join(pasta, 'integrar')
  git(clone, 'worktree', 'add', '-q', '--detach', worktree, 'main')
  return { remoto, clone, worktree }
}

function rodarFalso(vermelho?: string) {
  const rodados: string[] = []
  const rodar: Rodar = (comando) => {
    const texto = comando.join(' ')
    rodados.push(texto)
    return { status: vermelho && texto.includes(vermelho) ? 1 : 0, saida: '' }
  }
  return { rodar, rodados }
}

const semGh = () => {
  throw new Error('o gh não roda nos testes')
}

describe('integrar', () => {
  it('faz merge dos ramos, roda a auditoria, o antes e a suíte, e publica', () => {
    const { remoto, worktree } = repositorios()
    const antes = git(worktree, 'rev-parse', 'HEAD')
    const { rodar, rodados } = rodarFalso()
    const ditos: string[] = []

    const status = integrar({
      raiz: worktree,
      destino: 'main',
      ramos: ['ticket/a', 'ticket/b'],
      rodar,
      dizer: (t) => ditos.push(t),
      gh: semGh,
    })

    expect({ status, ditos }).toMatchObject({ status: 0 })
    expect(rodados.map((r) => r.split(' ')[1])).toEqual([
      '.github/scripts/supressoes.ts',
      'scripts/antes-de-integrar.ts',
      'scripts/suite-do-pr.ts',
    ])
    const main = git(remoto, 'log', '--format=%s', 'main')
    expect(main).toMatch(/Merge do ramo 'ticket\/a'/)
    expect(main).toMatch(/Merge do ramo 'ticket\/b'/)
    // A worktree volta para onde estava.
    expect(git(worktree, 'rev-parse', 'HEAD')).toBe(antes)
  })

  it('a suíte vermelha não publica nada', () => {
    const { remoto, worktree } = repositorios()
    const main = git(remoto, 'rev-parse', 'main')
    const status = integrar({
      raiz: worktree,
      destino: 'main',
      ramos: ['ticket/a'],
      rodar: rodarFalso('suite-do-pr').rodar,
      dizer: () => {},
      gh: semGh,
    })
    expect(status).toBe(1)
    expect(git(remoto, 'rev-parse', 'main')).toBe(main)
  })

  it('no conflito, para com os arquivos e não roda a suíte', () => {
    const { worktree } = repositorios({ conflito: true })
    const { rodar, rodados } = rodarFalso()
    const ditos: string[] = []
    expect(
      integrar({
        raiz: worktree,
        destino: 'main',
        ramos: ['ticket/a', 'ticket/b'],
        rodar,
        dizer: (t) => ditos.push(t),
        gh: semGh,
      }),
    ).toBe(1)
    expect(ditos.join('\n')).toMatch(/conflito em ticket\/b: comum\.txt/)
    expect(rodados).toEqual([])
    expect(git(worktree, 'status', '--porcelain')).toBe('')
  })

  it('o ensaio diz ok ou os conflitos de cada ramo, sem publicar', () => {
    const { remoto, clone } = repositorios({ conflito: true })
    const main = git(remoto, 'rev-parse', 'main')
    const ditos: string[] = []
    expect(
      integrar({
        raiz: clone,
        destino: 'main',
        ramos: ['ticket/a', 'ticket/b'],
        ensaio: true,
        rodar: rodarFalso().rodar,
        dizer: (t) => ditos.push(t),
        gh: semGh,
      }),
    ).toBe(1)
    expect(ditos).toEqual([
      'ok        ticket/a',
      'conflito  ticket/b: comum.txt',
    ])
    expect(git(remoto, 'rev-parse', 'main')).toBe(main)
  })

  it('recusa o checkout principal e o ramo inexistente', () => {
    const { clone, worktree } = repositorios()
    const ditos: string[] = []
    const tentar = (raiz: string, ramos: string[]) =>
      integrar({
        raiz,
        destino: 'main',
        ramos,
        rodar: rodarFalso().rodar,
        dizer: (t) => ditos.push(t),
        gh: semGh,
      })
    expect(tentar(clone, ['ticket/a'])).toBe(1)
    expect(tentar(worktree, ['ticket/nao-existe'])).toBe(1)
    expect(ditos.join('\n')).toMatch(/main|principal/)
    expect(ditos.join('\n')).toMatch(/origin\/ticket\/nao-existe não existe/)
  })
})

describe('tomarAVez', () => {
  it('toma a vez livre ou a de um dono morto, e recusa a de um vivo', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'vez-'))
    temporarios.push(pasta)
    const arquivo = join(pasta, 'vez')
    expect(tomarAVez(arquivo, 10, () => true)).toEqual({ tomou: true })
    expect(tomarAVez(arquivo, 20, () => true)).toEqual({
      tomou: false,
      dono: 10,
    })
    expect(tomarAVez(arquivo, 20, () => false)).toEqual({ tomou: true })
  })
})

describe('relatorioDoEnsaio', () => {
  it('uma linha por ramo', () => {
    expect(
      relatorioDoEnsaio([
        { ramo: 'a', conflitos: null },
        { ramo: 'b', conflitos: [] },
      ]),
    ).toEqual(['ok        a', 'conflito  b: (o git não disse quais arquivos)'])
  })
})
