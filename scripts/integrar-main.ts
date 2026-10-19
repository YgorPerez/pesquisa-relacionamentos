// Integra ramos num destino e publica, como o `integrar-main.ts` do Festival
// dos Macacos (ADR 0021):
//
//   node scripts/integrar-main.ts [--destino <ramo>] <ramo...>
//   node scripts/integrar-main.ts --ensaio [--destino <ramo>] <ramo...>
//
// O destino padrão é a `main`; para juntar tickets num spec,
// `--destino spec/23-mvp`. Com o CI do PR de pé, um ticket entra pelo merge do
// PR dele (`docs/agents/integracao.md`). Isto é para juntar vários ramos de
// uma vez com uma suíte só, ou para quando o CI não roda.
//
// Roda numa worktree limpa, nunca no checkout principal nem na de um dos
// ramos que integra. Uma integração por repositório de cada vez: a vez é um
// arquivo em `<git-common-dir>/integrar-main.vez`, com o PID do dono. Dentro
// dela:
//
// 1. busca o `origin` e põe a worktree, destacada, no destino buscado;
// 2. faz merge de cada ramo (`origin/<ramo>`), na ordem dada, sem squash: os
//    commits dos ramos ficam. Num conflito, aborta o merge e para, com os
//    arquivos;
// 3. a auditoria das supressões contra o destino, o `antes-de-integrar.ts` e
//    a suíte do diff (`suite-do-pr.ts --base origin/<destino>`). O primeiro
//    vermelho para;
// 4. busca de novo. Se o destino andou durante a suíte, para sem publicar:
//    rode de novo. (O Festival faz merge da ponta sobre o destino novo e
//    roda outra vez; aqui as integrações são poucas, e parar é mais simples.)
// 5. `git push origin HEAD:<destino>`, sem force, pelo hook de push. Cada
//    teste que só passou na repetição vira um comentário na issue "Testes
//    intermitentes".
//
// Ao acabar, bem ou mal, a worktree volta para onde estava, e os ramos nunca
// mudam. A vez se solta ao acabar, num erro e num SIGINT ou SIGTERM; a de um
// dono que morreu (o PID não existe) é tomada sem matar nada.
//
// O `--ensaio` só diz o que a integração acharia: numa worktree temporária
// destacada no destino, faz merge de cada ramo e diz de cada um ok ou os
// arquivos em conflito. Não toma a vez, não roda a suíte, não faz push.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type Gh, ghEm } from './issue-por-titulo.ts'
import { avisarNaIssue, type Intermitente } from './intermitentes.ts'
import { RAIZ } from './portas.ts'
import { semGitDoHook } from './registro-da-suite.ts'

/** Roda um comando de `pasta` e devolve o status e a saída. */
export type Rodar = (
  comando: string[],
  pasta: string,
) => { status: number | null; saida: string }

export type ResultadoDoMerge = { ramo: string; conflitos: string[] | null }

/** O relatório do ensaio: ok ou os conflitos de cada ramo. */
export function relatorioDoEnsaio(resultados: readonly ResultadoDoMerge[]) {
  return resultados.map(({ ramo, conflitos }) =>
    conflitos === null
      ? `ok        ${ramo}`
      : `conflito  ${ramo}: ${conflitos.join(', ') || '(o git não disse quais arquivos)'}`,
  )
}

/** Se o PID ainda roda. Só pergunta: o sinal 0 não mata nada. */
function vivo(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch (erro) {
    return (erro as NodeJS.ErrnoException).code === 'EPERM'
  }
}

/** Toma a vez em `arquivo`, ou diz de quem ela é. A de um dono morto é
 * tomada. */
export function tomarAVez(
  arquivo: string,
  pid: number,
  estaVivo: (pid: number) => boolean = vivo,
): { tomou: true } | { tomou: false; dono: number } {
  if (existsSync(arquivo)) {
    const dono = Number(JSON.parse(readFileSync(arquivo, 'utf8')).pid)
    if (dono !== pid && estaVivo(dono)) return { tomou: false, dono }
  }
  writeFileSync(
    arquivo,
    JSON.stringify({ pid, inicio: new Date().toISOString() }),
  )
  return { tomou: true }
}

export function integrar({
  raiz,
  destino,
  ramos,
  ensaio = false,
  rodar,
  dizer,
  gh,
}: {
  raiz: string
  destino: string
  ramos: readonly string[]
  ensaio?: boolean
  rodar: Rodar
  dizer: (texto: string) => void
  gh: Gh
}): number {
  const git = (cwd: string, ...args: string[]) =>
    spawnSync('git', args, { cwd, encoding: 'utf8', env: semGitDoHook() })
  const linha = (cwd: string, ...args: string[]) =>
    git(cwd, ...args).stdout.trim()
  const comum = linha(
    raiz,
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir',
  )

  /** O merge de cada ramo em `cwd`, na ordem, até o primeiro conflito; com
   * `seguir`, aborta o que conflitou e vai ao próximo. */
  const mergear = (cwd: string, seguir: boolean) => {
    const resultados: ResultadoDoMerge[] = []
    for (const ramo of ramos) {
      const merge = git(
        cwd,
        'merge',
        '--no-ff',
        '--no-edit',
        '-m',
        `Merge do ramo '${ramo}' em ${destino}`,
        `origin/${ramo}`,
      )
      if (merge.status === 0) {
        resultados.push({ ramo, conflitos: null })
        continue
      }
      const conflitos = linha(cwd, 'diff', '--name-only', '--diff-filter=U')
        .split('\n')
        .filter(Boolean)
      git(cwd, 'merge', '--abort')
      resultados.push({ ramo, conflitos })
      if (!seguir) break
    }
    return resultados
  }

  if (git(raiz, 'fetch', '-q', 'origin').status !== 0) {
    dizer('o git fetch falhou: nada mudou.')
    return 1
  }
  for (const ramo of [destino, ...ramos])
    if (
      git(raiz, 'rev-parse', '--verify', '-q', `origin/${ramo}`).status !== 0
    ) {
      dizer(`origin/${ramo} não existe.`)
      return 1
    }

  if (ensaio) {
    const pasta = mkdtempSync(join(tmpdir(), 'integrar-ensaio-'))
    rmSync(pasta, { recursive: true })
    git(raiz, 'worktree', 'add', '-q', '--detach', pasta, `origin/${destino}`)
    try {
      const resultados = mergear(pasta, true)
      for (const texto of relatorioDoEnsaio(resultados)) dizer(texto)
      return resultados.some((r) => r.conflitos !== null) ? 1 : 0
    } finally {
      git(raiz, 'worktree', 'remove', '--force', pasta)
    }
  }

  const atual = linha(raiz, 'rev-parse', '--abbrev-ref', 'HEAD')
  if (linha(raiz, 'status', '--porcelain') !== '') {
    dizer('a worktree tem mudanças: integre numa limpa.')
    return 1
  }
  if (ramos.includes(atual) || atual === destino) {
    dizer(
      `a worktree está em ${atual}, que a integração mexeria: rode de outra.`,
    )
    return 1
  }
  if (join(raiz, '.git') === comum) {
    dizer('este é o checkout principal: rode de uma worktree só para isto.')
    return 1
  }
  const vez = join(comum, 'integrar-main.vez')
  const tomada = tomarAVez(vez, process.pid)
  if (!tomada.tomou) {
    dizer(`outra integração (PID ${tomada.dono}) tem a vez: espere ela acabar.`)
    return 1
  }
  const onde = atual === 'HEAD' ? linha(raiz, 'rev-parse', 'HEAD') : atual
  const voltar = () => {
    git(raiz, 'checkout', '-q', onde)
    rmSync(vez, { force: true })
  }
  const aoSinal = () => {
    voltar()
    process.exit(130)
  }
  process.once('SIGINT', aoSinal)
  process.once('SIGTERM', aoSinal)
  try {
    const base = linha(raiz, 'rev-parse', `origin/${destino}`)
    git(raiz, 'checkout', '-q', '--detach', base)
    const conflito = mergear(raiz, false).find((r) => r.conflitos !== null)
    if (conflito) {
      dizer(
        `conflito em ${conflito.ramo}: ${conflito.conflitos?.join(', ')}. Faça merge de origin/${destino} nele, resolva, e rode de novo.`,
      )
      return 1
    }
    dizer(
      `${ramos.join(', ')} sobre ${destino} (${base.slice(0, 7)}): ${linha(raiz, 'rev-parse', '--short', 'HEAD')}`,
    )

    const etapas: [string, string[]][] = [
      ['auditoria', ['node', '.github/scripts/supressoes.ts', '--base', base]],
      [
        'antes-de-integrar',
        ['node', 'scripts/antes-de-integrar.ts', '--base', base],
      ],
      ['suíte', ['node', 'scripts/suite-do-pr.ts', '--base', base]],
    ]
    let saidaDaSuite = ''
    for (const [nome, comando] of etapas) {
      const { status, saida } = rodar(comando, raiz)
      if (nome === 'suíte') saidaDaSuite = saida
      if (status !== 0) {
        dizer(
          `${nome} vermelha em ${linha(raiz, 'rev-parse', 'HEAD')}: nada publicado.`,
        )
        return 1
      }
    }

    git(raiz, 'fetch', '-q', 'origin')
    if (linha(raiz, 'rev-parse', `origin/${destino}`) !== base) {
      dizer(
        `origin/${destino} andou durante a suíte: nada publicado. Rode de novo.`,
      )
      return 1
    }
    const push = git(raiz, 'push', 'origin', `HEAD:${destino}`)
    if (push.status !== 0) {
      dizer(`o push recusou: ${push.stderr.trim()}`)
      return 1
    }
    const sha = linha(raiz, 'rev-parse', 'HEAD')
    dizer(`publicado: ${destino} = ${sha.slice(0, 7)}`)
    const intermitentes = intermitentesDaSuite(saidaDaSuite)
    if (intermitentes.length > 0) {
      const aviso = avisarNaIssue(gh, sha, intermitentes)
      dizer(
        'erro' in aviso
          ? `sem o aviso dos intermitentes: ${aviso.erro}`
          : `intermitentes em #${aviso.issue}`,
      )
    }
    return 0
  } finally {
    voltar()
  }
}

/** Os intermitentes que o manifesto da suíte anota, pela linha que diz onde
 * ele está. */
function intermitentesDaSuite(saida: string): Intermitente[] {
  const manifesto = saida.match(/^\[suite\] manifesto em (.+)$/m)?.[1]
  if (!manifesto || !existsSync(manifesto)) return []
  return JSON.parse(readFileSync(manifesto, 'utf8')).intermitentes ?? []
}

if (import.meta.main) {
  const argv = process.argv.slice(2)
  const i = argv.indexOf('--destino')
  const destino = i === -1 ? 'main' : argv[i + 1]
  const ramos = argv.filter(
    (a, j) => !a.startsWith('--') && (i === -1 || j !== i + 1),
  )
  if (!destino || ramos.length === 0) {
    console.error(
      'uso: node scripts/integrar-main.ts [--ensaio] [--destino <ramo>] <ramo...>',
    )
    process.exit(2)
  }
  process.exit(
    integrar({
      raiz: RAIZ,
      destino,
      ramos,
      ensaio: argv.includes('--ensaio'),
      rodar: (comando, pasta) => {
        const r = spawnSync(comando[0] as string, comando.slice(1), {
          cwd: pasta,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'inherit'],
          maxBuffer: 256 * 1024 * 1024,
        })
        process.stdout.write(r.stdout ?? '')
        return { status: r.status, saida: r.stdout ?? '' }
      },
      dizer: (texto) => console.log(`[integrar] ${texto}`),
      gh: ghEm(RAIZ),
    }),
  )
}
