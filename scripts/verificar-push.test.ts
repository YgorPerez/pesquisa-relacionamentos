// Cada teste num par de repositórios temporários, um remoto (`--bare`) e um
// clone: o hook busca do remoto como faria aqui. Os comandos que ele roda (a
// auditoria e o Vitest) passam por um `rodar` falso, que anota cada um.
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { semGitDoHook } from './registro-da-suite.ts'
import { escolherDestino, verificarPush } from './verificar-push.ts'

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

const ZERO = '0'.repeat(40)

/** Um remoto com a `main` e o `spec/9-x`, e um clone dele no ramo
 * `ticket/10-y`, tirado do spec. */
function repositorios() {
  const pasta = mkdtempSync(join(tmpdir(), 'verificar-push-'))
  temporarios.push(pasta)
  const remoto = join(pasta, 'remoto.git')
  const clone = join(pasta, 'clone')
  git(pasta, 'init', '-q', '--bare', '-b', 'main', remoto)
  git(pasta, 'clone', '-q', remoto, clone)
  git(clone, 'config', 'user.email', 'teste@local')
  git(clone, 'config', 'user.name', 'Teste')
  const commitar = (arquivo: string, texto = arquivo) => {
    mkdirSync(join(clone, dirname(arquivo)), { recursive: true })
    writeFileSync(join(clone, arquivo), texto)
    git(clone, 'add', '.')
    git(clone, 'commit', '-qm', arquivo)
    return git(clone, 'rev-parse', 'HEAD')
  }
  const main = commitar('README.md')
  git(clone, 'push', '-q', 'origin', 'HEAD:main')
  git(clone, 'switch', '-qc', 'spec/9-x')
  const spec = commitar('scripts/do-spec.ts')
  git(clone, 'push', '-q', 'origin', 'HEAD:spec/9-x')
  git(clone, 'switch', '-qc', 'ticket/10-y')
  return { clone, main, spec, commitar }
}

function rodarFalso(falhar: (comando: string[]) => boolean = () => false) {
  const rodados: { comando: string[]; pasta: string }[] = []
  return {
    rodados,
    rodar: (comando: string[], pasta: string) => {
      rodados.push({ comando, pasta })
      return falhar(comando) ? 1 : 0
    },
  }
}

const linha = (ref: string, sha: string, remoto = ZERO) =>
  `refs/heads/x ${sha} ${ref} ${remoto}\n`

describe('escolherDestino', () => {
  it('é o ramo do remoto de que o commit está mais perto', () => {
    expect(
      escolherDestino([
        { ref: 'origin/main', aFrente: 12 },
        { ref: 'origin/spec/23-mvp', aFrente: 2 },
        { ref: 'origin/spec/8-velho', aFrente: 40 },
      ]),
    ).toBe('origin/spec/23-mvp')
    expect(escolherDestino([])).toBeNull()
  })
})

describe('verificarPush', () => {
  it('um ramo de ticket roda a auditoria contra o spec e só o Vitest das pastas afetadas', () => {
    const { clone, spec, commitar } = repositorios()
    const sha = commitar('scripts/novo.ts')
    const { rodar, rodados } = rodarFalso()
    const ditos: string[] = []

    const { recusou } = verificarPush({
      raiz: clone,
      remoto: 'origin',
      entrada: linha('refs/heads/ticket/10-y', sha),
      rodar,
      dizer: (t) => ditos.push(t),
      env: {},
    })

    expect(recusou).toBe(false)
    expect(rodados.map((r) => r.comando.slice(0, 3).join(' '))).toEqual([
      'node .github/scripts/supressoes.ts --base',
      'pnpm exec vp',
    ])
    expect(rodados[0]?.comando).toContain(spec)
    expect(rodados[1]).toEqual({
      comando: [
        'pnpm',
        'exec',
        'vp',
        'test',
        'run',
        '--changed',
        spec,
        '--passWithNoTests',
      ],
      pasta: clone,
    })
    expect(ditos.join('\n')).toMatch(/origin\/spec\/9-x/)
  })

  it('o segundo push do ramo testa só o que veio depois do primeiro', () => {
    const { clone, commitar } = repositorios()
    const primeiro = commitar('scripts/a.ts')
    const segundo = commitar('frontend/src/ui/perfil.tsx')
    const { rodar, rodados } = rodarFalso()

    verificarPush({
      raiz: clone,
      remoto: 'origin',
      entrada: linha('refs/heads/ticket/10-y', segundo, primeiro),
      rodar,
      dizer: () => {},
      env: {},
    })

    const vitest = rodados.filter((r) => r.comando.includes('test'))
    expect(vitest.map((r) => r.pasta)).toEqual([join(clone, 'frontend')])
    expect(vitest[0]?.comando).toContain(primeiro)
  })

  it('só documentação não roda teste nenhum', () => {
    const { clone, commitar } = repositorios()
    const sha = commitar('docs/x.md')
    const { rodar, rodados } = rodarFalso()
    verificarPush({
      raiz: clone,
      remoto: 'origin',
      entrada: linha('refs/heads/ticket/10-y', sha),
      rodar,
      dizer: () => {},
      env: {},
    })
    expect(rodados).toHaveLength(1)
  })

  it('a auditoria ou um teste vermelho recusam o push', () => {
    const { clone, commitar } = repositorios()
    const sha = commitar('scripts/a.ts')
    for (const parte of ['supressoes', 'test']) {
      const { rodar } = rodarFalso((c) => c.join(' ').includes(parte))
      const { recusou } = verificarPush({
        raiz: clone,
        remoto: 'origin',
        entrada: linha('refs/heads/ticket/10-y', sha),
        rodar,
        dizer: () => {},
        env: {},
      })
      expect({ parte, recusou }).toEqual({ parte, recusou: true })
    }
  })

  it('SEM_TESTES com motivo pula os testes, não a auditoria; sem motivo, recusa', () => {
    const { clone, commitar } = repositorios()
    const sha = commitar('scripts/a.ts')
    const comMotivo = rodarFalso()
    expect(
      verificarPush({
        raiz: clone,
        remoto: 'origin',
        entrada: linha('refs/heads/ticket/10-y', sha),
        rodar: comMotivo.rodar,
        dizer: () => {},
        env: { SEM_TESTES: 'o usuário pediu o push agora' },
      }).recusou,
    ).toBe(false)
    expect(comMotivo.rodados).toHaveLength(1)

    expect(
      verificarPush({
        raiz: clone,
        remoto: 'origin',
        entrada: linha('refs/heads/ticket/10-y', sha),
        rodar: rodarFalso().rodar,
        dizer: () => {},
        env: { SEM_TESTES: '  ' },
      }).recusou,
    ).toBe(true)
  })

  it('apagar um ramo passa sem nada; apagar a main, não', () => {
    const { clone, main } = repositorios()
    const { rodar, rodados } = rodarFalso()
    const apagar = (ref: string) =>
      verificarPush({
        raiz: clone,
        remoto: 'origin',
        entrada: `(delete) ${ZERO} ${ref} ${main}\n`,
        rodar,
        dizer: () => {},
        env: {},
      }).recusou
    expect(apagar('refs/heads/ticket/10-y')).toBe(false)
    expect(apagar('refs/heads/main')).toBe(true)
    expect(rodados).toEqual([])
  })

  it('a main só anda para a frente', () => {
    const { clone, main, commitar } = repositorios()
    git(clone, 'switch', '-qc', 'outra', main)
    git(clone, 'reset', '-q', '--hard', `${main}`)
    // Um commit que não descende da main do remoto.
    git(clone, 'checkout', '-q', '--orphan', 'solta')
    const solto = commitar('scripts/solto.ts')
    const { rodar } = rodarFalso()
    const ditos: string[] = []
    expect(
      verificarPush({
        raiz: clone,
        remoto: 'origin',
        entrada: linha('refs/heads/main', solto, main),
        rodar,
        dizer: (t) => ditos.push(t),
        env: {},
      }).recusou,
    ).toBe(true)
    expect(ditos.join('\n')).toMatch(/não é ancestral/)
  })
})
