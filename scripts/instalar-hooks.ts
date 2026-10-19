// Liga os hooks de `.githooks/` no repositório do checkout em que roda, como
// o `instalar-hooks.ts` do Festival dos Macacos: `git config core.hooksPath
// .githooks`. O `preparar-worktree.ts` chama isto; à mão,
// `node scripts/instalar-hooks.ts` na raiz de um checkout.
//
// O `core.hooksPath` fica no `.git/config`, comum a todas as worktrees. O
// caminho é relativo, e o git o lê a partir da raiz de cada worktree: cada uma
// roda o `.githooks/` do seu ramo.
//
// O Claude Code, ao criar a worktree de um agente, troca o relativo pelo
// caminho absoluto do `.githooks/` do checkout principal. Esse caminho, ou o
// de qualquer outra worktree deste repositório, conta como instalado: o
// `.githooks/pre-push` passa a vez ao da worktree que faz o push.
//
// Pode rodar de novo quantas vezes quiser. Não troca nada que já exista: se o
// `core.hooksPath` aponta para outro lugar, ou se `.git/hooks/` tem um hook de
// alguém, avisa e para sem mexer, porque o `core.hooksPath` desligaria esse
// hook em silêncio.
//
// Roda no `node` puro, sem `node_modules`.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, realpathSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { semGitDoHook } from './registro-da-suite.ts'

const CAMINHO = '.githooks'

/** Instala, ou diz por que não. `ok` também quando já estava instalado. */
export function instalarHooks(pasta: string): { ok: boolean; texto: string } {
  const git = (...args: string[]) =>
    spawnSync('git', args, {
      cwd: pasta,
      encoding: 'utf8',
      env: semGitDoHook(),
    })
  const linha = (...args: string[]) => git(...args).stdout.trim()
  const raiz = linha('rev-parse', '--show-toplevel')
  if (!raiz || !existsSync(join(raiz, CAMINHO, 'pre-push')))
    return {
      ok: false,
      texto: `${pasta} não tem ${CAMINHO}/pre-push: nada a instalar.`,
    }

  const real = (caminho: string) => {
    const absoluto = resolve(caminho)
    return existsSync(absoluto) ? realpathSync(absoluto) : absoluto
  }
  /** `valor` é o `.githooks/` absoluto de uma das worktrees daqui. */
  const deUmaWorktreeDaqui = (valor: string) =>
    isAbsolute(valor) &&
    linha('worktree', 'list', '--porcelain')
      .split('\n')
      .filter((l) => l.startsWith('worktree '))
      .some(
        (l) => real(join(l.slice('worktree '.length), CAMINHO)) === real(valor),
      )

  const atual = git('config', '--show-scope', '--get', 'core.hooksPath')
  if (atual.status === 0) {
    const [escopo, valor = ''] = atual.stdout.trim().split(/\t/)
    if (escopo === 'local' && (valor === CAMINHO || deUmaWorktreeDaqui(valor)))
      return { ok: true, texto: `já instalado: core.hooksPath = ${valor}.` }
    return {
      ok: false,
      texto:
        `o core.hooksPath já vale "${valor}" (${escopo}), e trocá-lo desligaria os hooks de lá. ` +
        `Nada mudou. Para usar os deste repositório, rode \`git config --local core.hooksPath ${CAMINHO}\` você mesmo.`,
    }
  }

  const hooks = join(
    linha('rev-parse', '--path-format=absolute', '--git-common-dir'),
    'hooks',
  )
  const existentes = existsSync(hooks)
    ? readdirSync(hooks).filter((nome) => !nome.endsWith('.sample'))
    : []
  if (existentes.length > 0)
    return {
      ok: false,
      texto:
        `${hooks} tem ${existentes.join(', ')}, que o core.hooksPath desligaria. ` +
        `Nada mudou. Leve-os para ${CAMINHO}/ ou junte-os ao pre-push daqui, e rode isto de novo.`,
    }

  git('config', '--local', 'core.hooksPath', CAMINHO)
  return {
    ok: true,
    texto:
      `instalado: core.hooksPath = ${CAMINHO}, para todas as worktrees. ` +
      'O pre-push roda a auditoria e os testes afetados; `git push --no-verify` o pula.',
  }
}

if (import.meta.main) {
  const { ok, texto } = instalarHooks(process.cwd())
  ;(ok ? console.log : console.error)(`[hooks] ${texto}`)
  process.exit(ok ? 0 : 1)
}
