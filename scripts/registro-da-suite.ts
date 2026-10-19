// O registro de cada rodada da `suite-do-pr.ts`, como o `registro-da-suite.ts`
// do Festival dos Macacos. Cada rodada ganha uma pasta só dela,
// `<logs>/<sha>/<uuid>`, com os logs dos passos e um `manifesto.json`: o HEAD,
// a árvore, se estava limpa no começo e no fim, a base, se foi a completa, o
// começo, o fim, o resultado de cada passo e os intermitentes. A rodada
// seguinte não apaga a anterior: lá, uma suíte apagava os logs da outra.
//
// O Festival também grava, da rodada inteira verde, um certificado que o hook
// de push cobra na `main`. Aqui o portão da `main` é o CI do PR (ADR 0016), e
// o registro só guarda o que rodou.
//
// Roda no `node` puro, sem `node_modules`.

import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Intermitente } from './intermitentes.ts'

export type ResultadoPasso = {
  nome: string
  log: string
  passou: boolean
  /** Os testes que falharam e passaram na repetição: com eles, o passo conta
   * como verde. */
  intermitentes?: Intermitente[]
}
export type EstadoGit = { sha: string; arvore: string; limpa: boolean }
export type Rodada = {
  id: string
  raiz: string
  pasta: string
  base: string
  completa: boolean
  /** Os passos que a rodada roda. */
  passos: string[]
  /** Os que ela pula de propósito, com o motivo. */
  pulados: Record<string, string>
  inicio: string
  estadoInicio: EstadoGit
}

/** O git sem as variáveis que um hook herda: dentro do `pre-push`, o
 * `GIT_DIR` apontaria todo `git` para o repositório de quem faz o push. */
export function semGitDoHook(env: NodeJS.ProcessEnv = process.env) {
  return Object.fromEntries(
    Object.entries(env).filter(([nome]) => !nome.startsWith('GIT_')),
  )
}

function git(raiz: string, ...args: string[]) {
  const resultado = spawnSync('git', args, {
    cwd: raiz,
    encoding: 'utf8',
    env: semGitDoHook(),
  })
  if (resultado.status !== 0)
    throw new Error(`git ${args.join(' ')}: ${resultado.stderr.trim()}`)
  return resultado.stdout.trim()
}

function estadoGit(raiz: string): EstadoGit {
  return {
    sha: git(raiz, 'rev-parse', 'HEAD'),
    arvore: git(raiz, 'rev-parse', 'HEAD^{tree}'),
    limpa: git(raiz, 'status', '--porcelain', '--untracked-files=all') === '',
  }
}

const gravarJson = (arquivo: string, dado: unknown) =>
  writeFileSync(arquivo, `${JSON.stringify(dado, null, 2)}\n`)

/** Abre a rodada: a foto do git no começo e a pasta dos logs. Chame depois da
 * vez na fila da máquina, para a foto ser a do que vai rodar. */
export function iniciarRodada(opcoes: {
  raiz: string
  base: string
  completa: boolean
  passos: string[]
  pulados?: Record<string, string>
  diretorioLogs: string
}): Rodada {
  const estadoInicio = estadoGit(opcoes.raiz)
  const id = randomUUID()
  const pasta = join(opcoes.diretorioLogs, estadoInicio.sha, id)
  mkdirSync(pasta, { recursive: true })
  const rodada: Rodada = {
    id,
    raiz: opcoes.raiz,
    pasta,
    base: opcoes.base,
    completa: opcoes.completa,
    passos: [...opcoes.passos],
    pulados: { ...opcoes.pulados },
    inicio: new Date().toISOString(),
    estadoInicio,
  }
  gravarJson(join(pasta, 'manifesto.json'), { ...rodada, passou: null })
  return rodada
}

/** Fecha a rodada: a foto do fim e o manifesto. `passou` só se ela acabou
 * sem interrupção, com cada passo planejado rodado e verde. */
export function concluirRodada(
  rodada: Rodada,
  resultados: ResultadoPasso[],
  { interrompida = false } = {},
) {
  const estadoFim = estadoGit(rodada.raiz)
  const passou =
    !interrompida &&
    resultados.every((resultado) => resultado.passou) &&
    rodada.passos.every((nome) =>
      resultados.some((feito) => feito.nome === nome),
    )
  const manifesto = join(rodada.pasta, 'manifesto.json')
  gravarJson(manifesto, {
    ...rodada,
    fim: new Date().toISOString(),
    estadoFim,
    // A árvore que mudou no meio não é a que os passos testaram.
    mesmaArvore:
      estadoFim.arvore === rodada.estadoInicio.arvore &&
      estadoFim.limpa === rodada.estadoInicio.limpa,
    resultados,
    intermitentes: resultados.flatMap((r) => r.intermitentes ?? []),
    passou,
    interrompida,
  })
  return { passou, manifesto }
}

/** A linha que nomeia um teste que falhou: o `×` e o `FAIL` do Vitest, o `✘`
 * e o `1) … ›` do Playwright. */
const TESTE_QUE_FALHOU = [/(^|\s)(FAIL|×|✗|✖|✘)\s/, /^\s*\d+\) .+›/]
/** A linha de um erro: `AssertionError`, `TypeError`, `Error:`, o `error TS`
 * do `tsc` e o `×` do Oxlint. */
const ERRO = [/\b[A-Z]\w*Error\b/, /\berror TS\d+/, /^\s*×\s/]
/** A tabela de cobertura, que o `--coverage` imprime depois de tudo. */
const CABECALHO_DA_COBERTURA = /Coverage (report|summary)/
const SEPARADOR_DA_COBERTURA = /^\s*(-+(?:\|-+)+\|?|=+)\s*$/

/** As linhas sem o bloco de cobertura: do cabeçalho ou de um separador até o
 * último separador da tabela. */
function semCobertura(linhas: string[]) {
  const separador = (linha: string) => SEPARADOR_DA_COBERTURA.test(linha)
  const ficam: string[] = []
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i] as string
    if (!CABECALHO_DA_COBERTURA.test(linha) && !separador(linha)) {
      ficam.push(linha)
      continue
    }
    let fim = i
    for (let j = i + 1; j < linhas.length; j++) {
      const seguinte = linhas[j] as string
      if (separador(seguinte)) fim = j
      else if (!/[|:]/.test(seguinte)) break
    }
    i = fim
  }
  return ficam
}

/** O que um log de passo diz da falha: os testes que falharam, o primeiro erro
 * e as últimas linhas sem a tabela de cobertura. */
export function resumoDoLog(texto: string) {
  const linhas = texto.trimEnd().split(/\r?\n/)
  const testes = [
    ...new Set(
      linhas
        .filter((linha) =>
          TESTE_QUE_FALHOU.some((padrao) => padrao.test(linha)),
        )
        .map((linha) => linha.trim()),
    ),
  ].slice(0, 10)
  const primeiroErro = linhas.findIndex((linha) =>
    ERRO.some((padrao) => padrao.test(linha)),
  )
  const fim = semCobertura(linhas).slice(-25)
  return [
    ...(testes.length > 0 ? ['testes que falharam:', ...testes, ''] : []),
    ...(primeiroErro === -1
      ? []
      : [
          'primeiro erro:',
          ...linhas.slice(primeiroErro, primeiroErro + 4),
          '',
        ]),
    'fim do log, sem a cobertura:',
    ...fim,
  ].join('\n')
}
