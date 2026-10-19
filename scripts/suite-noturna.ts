// O aviso da suíte noturna, como o `suite-noturna.ts` do Festival dos Macacos.
// A suíte inteira roda toda noite na `main`, no `suite-noturna.yml`, que chama
// os jobs do `pr.yml`: é ela que diz se a `main` está verde depois dos merges
// do dia, e pega o que o plano do diff de cada PR deixou passar.
//
// A noite vermelha abre uma issue, "Suíte noturna vermelha", com o SHA, os jobs
// que não passaram, o link da rodada e o fim do log. A noite vermelha seguinte
// comenta na mesma, e a primeira verde a fecha.
//
// O último job do workflow roda:
//   node scripts/suite-noturna.ts --sha <sha> --jobs '<needs em JSON>' \
//     --url <rodada> [--log <arquivo com o fim do log>]
//
// O Festival roda a suíte numa worktree da máquina, pelo Agendador de Tarefas
// do Windows; aqui o Actions do repositório público roda de graça, e a máquina
// fica para os agentes (ADR 0022).
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { abrirIssue, type Gh, ghEm, issueAberta } from './issue-por-titulo.ts'
import { RAIZ } from './portas.ts'

export const TITULO = 'Suíte noturna vermelha'

/** O GitHub recusa corpo acima de 65.536 caracteres. */
const MAXIMO_DO_CORPO = 60_000

export type Passo = 'abrir' | 'comentar' | 'fechar' | 'nada'

/** O que fazer com a issue, pela rodada e pela issue que já está aberta. */
export function oQueFazer(passou: boolean, aberta: number | null): Passo {
  if (passou) return aberta === null ? 'nada' : 'fechar'
  return aberta === null ? 'abrir' : 'comentar'
}

/** O `needs` do workflow: o resultado de cada job. */
type Jobs = Record<string, { result: string }>

type Rodada = { sha: string; jobs: Jobs; url: string; log: string }

const vermelhos = (jobs: Jobs) =>
  Object.entries(jobs).filter(([, { result }]) => result !== 'success')

export function resumoDaFalha({ sha, jobs, url, log }: Rodada): string {
  const cortado =
    log.length > MAXIMO_DO_CORPO ? `…\n${log.slice(-MAXIMO_DO_CORPO)}` : log
  return [
    `A suíte inteira falhou na \`main\` em ${sha}.`,
    '',
    ...vermelhos(jobs).map(([nome, { result }]) => `- \`${nome}\`: ${result}`),
    '',
    `A rodada: ${url}. Para ver de novo na máquina: \`node scripts/suite-do-pr.ts --completa\`.`,
    ...(cortado.trim() ? ['', 'O fim do log:', '', '```', cortado, '```'] : []),
  ].join('\n')
}

/** Abre, comenta ou fecha a issue pela rodada, e diz o que fez. */
export function avisar(gh: Gh, rodada: Rodada): Passo {
  const passou = vermelhos(rodada.jobs).length === 0
  const aberta = issueAberta(gh, TITULO)
  const passo = oQueFazer(passou, aberta)
  if (passo === 'abrir') abrirIssue(gh, TITULO, resumoDaFalha(rodada), ['bug'])
  if (passo === 'comentar')
    gh(
      ['issue', 'comment', String(aberta), '--body-file', '-'],
      resumoDaFalha(rodada),
    )
  if (passo === 'fechar')
    gh([
      'issue',
      'close',
      String(aberta),
      '--comment',
      `A suíte inteira passou na \`main\` em ${rodada.sha}: ${rodada.url}.`,
    ])
  return passo
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      sha: { type: 'string' },
      jobs: { type: 'string' },
      url: { type: 'string' },
      log: { type: 'string' },
    },
  })
  const rodada = {
    sha: values.sha ?? '?',
    jobs: JSON.parse(values.jobs ?? '{}') as Jobs,
    url: values.url ?? '',
    log: values.log ? readFileSync(values.log, 'utf8') : '',
  }
  const passo = avisar(ghEm(RAIZ), rodada)
  console.log(`[noturna] ${rodada.sha}: ${passo}`)
}
