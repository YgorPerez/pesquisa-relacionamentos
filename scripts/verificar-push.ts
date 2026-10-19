// O que o `.githooks/pre-push` roda, como o `verificar-push.ts` do Festival dos
// Macacos (ADR 0020). O git passa o remoto nos argumentos e, no stdin, uma
// linha por ref que o push atualiza: `<ref local> <sha local> <ref remota>
// <sha remoto>`. Tudo aqui vem dessas linhas, nunca do HEAD.
//
// - Apagar um ramo passa sem nada. Apagar a `main`, não.
// - Toda outra ref passa pela auditoria das supressões
//   (`.github/scripts/supressoes.ts`) contra o ramo de destino: o do remoto de
//   que o commit está mais perto, a `main` ou um `spec/*`.
// - E pelos testes do Vitest só das pastas que o push afeta (`afetados.ts`),
//   com `--changed`: no primeiro push do ramo, desde o merge-base com o
//   destino; nos seguintes, desde o que o remoto já tinha. Sem e2e, sem
//   stories e sem suíte inteira: esses são do CI do PR.
// - A `main` só anda para a frente.
// - `SEM_TESTES="<motivo>" git push ...` pula os testes, não a auditoria. O
//   motivo vai para `<git-common-dir>/push-sem-testes.log`.
//
// Um hook é do cliente: `git push --no-verify` o pula, e o servidor não
// confere nada disto. Ele segura o engano, não quem quer passar.
//
// Roda no `node` puro, sem `node_modules`.

import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { planoDoDiff } from './afetados.ts'
import { semGitDoHook } from './registro-da-suite.ts'

const MAIN = 'refs/heads/main'
const ZERO = /^0+$/

/** O ramo do remoto de que o commit está mais perto: o de menos commits entre
 * o merge-base e ele. Um ticket sai de um `spec/*`, e um spec da `main`. */
export function escolherDestino(
  candidatos: readonly { ref: string; aFrente: number }[],
): string | null {
  return [...candidatos].sort((a, b) => a.aFrente - b.aFrente)[0]?.ref ?? null
}

export type Rodar = (
  comando: string[],
  pasta: string,
  env?: NodeJS.ProcessEnv,
) => number | null

export function verificarPush({
  raiz,
  remoto,
  entrada,
  rodar,
  dizer,
  env,
}: {
  raiz: string
  remoto: string
  entrada: string
  rodar: Rodar
  dizer: (texto: string) => void
  env: NodeJS.ProcessEnv
}) {
  const git = (...args: string[]) =>
    spawnSync('git', args, { cwd: raiz, encoding: 'utf8', env: semGitDoHook() })
  const linha = (...args: string[]) => git(...args).stdout.trim()
  const semTestes = env.SEM_TESTES?.trim()
  let buscou = false
  let recusou = false

  /** Busca a `main` e os `spec/*` do remoto, uma vez por push. */
  const buscar = () => {
    if (buscou) return
    buscou = true
    const busca = git(
      'fetch',
      '--quiet',
      '--no-tags',
      remoto,
      `+refs/heads/main:refs/remotes/${remoto}/main`,
      `+refs/heads/spec/*:refs/remotes/${remoto}/spec/*`,
    )
    if (busca.status !== 0)
      dizer(`não deu para buscar de ${remoto}: ${busca.stderr.trim()}`)
  }

  const destinoDe = (sha: string, ref: string) => {
    if (ref === MAIN) return `${remoto}/main`
    const proprio = `${remoto}/${ref.replace(/^refs\/heads\//, '')}`
    const candidatos = linha(
      'for-each-ref',
      '--format=%(refname:short)',
      `refs/remotes/${remoto}/main`,
      `refs/remotes/${remoto}/spec/`,
    )
      .split('\n')
      .filter((r) => r && r !== proprio)
      .flatMap((r) => {
        const base = linha('merge-base', r, sha)
        if (!base) return []
        return [
          {
            ref: r,
            aFrente: Number(linha('rev-list', '--count', `${base}..${sha}`)),
          },
        ]
      })
    return escolherDestino(candidatos)
  }

  for (const texto of entrada.split(/\r?\n/).filter((l) => l.trim())) {
    const [, sha = '', ref = '', doRemoto = ''] = texto.trim().split(/\s+/)
    if (ZERO.test(sha)) {
      if (ref === MAIN) {
        dizer('apagar a main não passa.')
        recusou = true
      } else dizer(`${ref}: apagar não pede nada.`)
      continue
    }
    buscar()
    const destino = destinoDe(sha, ref)
    if (destino === null) {
      dizer(`${ref}: não achei a main nem um spec/* em ${remoto}; recuso.`)
      recusou = true
      continue
    }
    const shaDoDestino = linha('rev-parse', destino)
    dizer(`${ref} ← ${sha.slice(0, 7)}: destino ${destino}`)

    if (
      rodar(
        [
          'node',
          '.github/scripts/supressoes.ts',
          '--base',
          shaDoDestino,
          '--alvo',
          sha,
        ],
        raiz,
      ) !== 0
    ) {
      dizer(`${ref}: a auditoria das supressões recusou ${sha.slice(0, 7)}.`)
      recusou = true
    }

    if (
      ref === MAIN &&
      git('merge-base', '--is-ancestor', shaDoDestino, sha).status !== 0
    ) {
      dizer(
        `main: a de ${remoto} (${shaDoDestino.slice(0, 7)}) não é ancestral de ${sha.slice(0, 7)}. A main não aceita force.`,
      )
      recusou = true
    }

    // Desde o que o remoto já tinha deste ramo, se é ancestral; senão, desde
    // o merge-base com o destino.
    const jaTinha =
      !ZERO.test(doRemoto) &&
      git('merge-base', '--is-ancestor', doRemoto, sha).status === 0
    const base = jaTinha ? doRemoto : linha('merge-base', shaDoDestino, sha)
    const arquivos = linha('diff', '--name-only', '--no-renames', base, sha)
      .split('\n')
      .filter(Boolean)
    const { pacotes, completo } = planoDoDiff(arquivos)
    if (pacotes.length === 0) {
      dizer(`${ref}: nada a testar desde ${base.slice(0, 7)}.`)
      continue
    }
    if (semTestes !== undefined) {
      if (semTestes === '') {
        dizer('o SEM_TESTES pede o motivo: SEM_TESTES="<motivo>" git push ...')
        recusou = true
        continue
      }
      const comum = linha(
        'rev-parse',
        '--path-format=absolute',
        '--git-common-dir',
      )
      appendFileSync(
        join(comum, 'push-sem-testes.log'),
        `${new Date().toISOString()} ${sha} ${semTestes}\n`,
      )
      dizer(`${ref}: sem os testes: ${semTestes}`)
      continue
    }
    dizer(
      `${ref}: o Vitest com --changed ${base.slice(0, 7)} em ${pacotes.join(', ')}` +
        (completo ? ` (todas as pastas: ${completo})` : ''),
    )
    for (const pasta of pacotes) {
      const status = rodar(
        [
          'pnpm',
          'exec',
          'vp',
          'test',
          'run',
          '--changed',
          base,
          '--passWithNoTests',
        ],
        join(raiz, pasta),
      )
      if (status !== 0) {
        dizer(`${ref}: os testes de ${pasta} falharam.`)
        recusou = true
      }
    }
  }
  if (recusou)
    dizer(
      'Push recusado. Para mandar sem os testes, diga o motivo: `SEM_TESTES="<motivo>" git push ...`; a auditoria continua. ' +
        '`git push --no-verify` pula o hook inteiro: não o use para passar por cima do que está acima (docs/agents/integracao.md).',
    )
  return { recusou }
}

if (import.meta.main) {
  const { recusou } = verificarPush({
    raiz: process.cwd(),
    remoto: process.argv[2] ?? 'origin',
    entrada: readFileSync(0, 'utf8'),
    rodar: (comando, pasta) =>
      spawnSync(comando[0] as string, comando.slice(1), {
        cwd: pasta,
        env: semGitDoHook(),
        // A saída vai para o stderr: o stdout do hook é do git.
        stdio: ['ignore', 2, 2],
        shell: process.platform === 'win32',
      }).status,
    dizer: (texto) => console.error(`[pre-push] ${texto}`),
    env: process.env,
  })
  process.exit(recusou ? 1 : 0)
}
