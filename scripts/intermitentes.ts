// O teste intermitente, do `intermitentes.ts` do Festival dos Macacos: o que
// falha numa rodada e passa sozinho logo depois. Lá, com o load average entre
// 40 e 50, uma integração ficou vermelha duas vezes, cada uma num teste
// diferente e sem relação com o diff, que passavam rodados sozinhos. Aqui a
// máquina é a mesma.
//
// A `suite-do-pr.ts` passa cada passo do Vitest ou do Playwright que falhou
// por `repetirFalhas`: ela lê no log o arquivo de cada teste que falhou
// (`falhasDoLog`) e roda cada um de novo, sozinho, uma vez. Passou, o passo
// conta como verde e o manifesto da rodada anota o teste em `intermitentes`.
// Falhou de novo, o passo fica vermelho. Um log que não diz só "estes arquivos
// falharam" (um erro fora de um teste, a cobertura abaixo do limite, o passo
// pendurado, arquivos demais) não ganha a repetição: o defeito pode não estar
// num teste.
//
// O `integrar-main.ts` comenta cada intermitente do commit que publica na
// issue "Testes intermitentes", que ele abre se não houver (`avisarNaIssue`).
//
// Roda no `node` puro, sem `node_modules`.

import { readFileSync } from 'node:fs'
import { stripVTControlCharacters } from 'node:util'
import { abrirIssue, type Gh, issueAberta } from './issue-por-titulo.ts'

export type Intermitente = {
  passo: string
  /** O arquivo do Vitest ou a spec do Playwright, como o log o nomeia. */
  arquivo: string
  /** O `os.loadavg()` quando o passo falhou: 1, 5 e 15 min. */
  carga: number[]
  /** O log da repetição que passou. */
  log: string
}

/** Mais arquivos que isto falhando de uma vez não é um intermitente, e a
 * repetição de cada um só atrasaria o vermelho. */
export const MAXIMO_DE_REPETICOES = 5

export const TITULO = 'Testes intermitentes'

export type Falha = {
  /** A pasta onde o Vitest rodou, do `RUN` do log; `null` no Playwright, que
   * roda na do passo. */
  pasta: string | null
  arquivo: string
  /** O projeto do Vitest, o `|telas|` do log. */
  projeto?: string
}

const LIMITE = /passou de \d+ min sem acabar/
const RUN = /^\s*RUN\s+v\S+\s+(.+?)\s*$/
const FAIL = /^\s*FAIL\s+(?:\|([^|]+)\|\s+)?(\S+)/
const ARQUIVOS_FALHARAM = /Test Files\s+(\d+) failed/
const RESUMO_DO_VITEST = /^\s*Test Files\s/
const FORA_DO_VITEST = [
  /Unhandled (Errors?|Rejection)/,
  /^\s*Errors\s+\d+ errors?/,
]
const COBERTURA = /ERROR: Coverage for|does not meet .*threshold/i
/** O cabeçalho da lista do `list`: `  2 failed`; as linhas embaixo, cada uma
 * um teste, com ou sem o `[projeto] ›`. */
const FALHARAM_NO_PLAYWRIGHT = /^\s+\d+ failed\s*$/
const TESTE_DA_LISTA = /^\s{4}(?:\[[^\]]+\] › )?(\S+):\d+:\d+ ›/
const FORA_DO_PLAYWRIGHT = /not a part of any test/
const INTERROMPIDOS = /^\s+\d+ interrupted\s*$/

/** Os arquivos que o log diz que falharam, para rodar de novo, ou por que
 * não há o que repetir. */
export function falhasDoLog(
  texto: string,
  ferramenta: 'vitest' | 'playwright',
): { falhas: Falha[] } | { motivo: string } {
  const linhas = stripVTControlCharacters(texto).split(/\r?\n/)
  if (linhas.some((linha) => LIMITE.test(linha)))
    return { motivo: 'o passo passou do limite de tempo' }
  const achadas = new Map<string, Falha>()
  const achar = (falha: Falha) =>
    achadas.set(
      `${falha.pasta ?? ''}|${falha.projeto ?? ''}|${falha.arquivo}`,
      falha,
    )
  if (ferramenta === 'vitest') {
    if (linhas.some((linha) => FORA_DO_VITEST.some((p) => p.test(linha))))
      return { motivo: 'houve erro fora de um teste' }
    if (linhas.some((linha) => COBERTURA.test(linha)))
      return { motivo: 'a cobertura ficou abaixo do limite' }
    // Cada Vitest que começou acabou no resumo dele: um pacote que caiu antes
    // não diz quais testes não rodaram.
    const comecaram = linhas.filter((linha) => RUN.test(linha)).length
    const resumos = linhas.filter((linha) =>
      RESUMO_DO_VITEST.test(linha),
    ).length
    if (comecaram !== resumos)
      return {
        motivo: `${comecaram - resumos} Vitest acabaram sem o resumo`,
      }
    let pasta: string | null = null
    let noResumo = 0
    for (const linha of linhas) {
      const run = linha.match(RUN)
      if (run) pasta = run[1] ?? null
      const fail = linha.match(FAIL)
      if (fail?.[2])
        achar({
          pasta,
          arquivo: fail[2],
          ...(fail[1] ? { projeto: fail[1].trim() } : {}),
        })
      noResumo += Number(linha.match(ARQUIVOS_FALHARAM)?.[1] ?? 0)
    }
    if (achadas.size > 0 && noResumo !== achadas.size)
      return {
        motivo: `o log nomeia ${achadas.size} arquivos que falharam, e o resumo do Vitest conta ${noResumo}`,
      }
  } else {
    if (linhas.some((linha) => FORA_DO_PLAYWRIGHT.test(linha)))
      return { motivo: 'houve erro fora de um teste' }
    if (linhas.some((linha) => INTERROMPIDOS.test(linha)))
      return { motivo: 'o Playwright interrompeu testes' }
    let naLista = false
    for (const linha of linhas) {
      if (FALHARAM_NO_PLAYWRIGHT.test(linha)) {
        naLista = true
        continue
      }
      const daLista = naLista ? linha.match(TESTE_DA_LISTA) : null
      if (naLista && !daLista) naLista = false
      const arquivo = daLista?.[1]
      if (arquivo) achar({ pasta: null, arquivo })
    }
  }
  const falhas = [...achadas.values()]
  if (falhas.length === 0)
    return { motivo: 'o log não diz qual arquivo falhou' }
  if (falhas.length > MAXIMO_DE_REPETICOES)
    return {
      motivo: `${falhas.length} arquivos falharam, mais que os ${MAXIMO_DE_REPETICOES} de um intermitente`,
    }
  return { falhas }
}

/** Como um passo, ou a repetição de um arquivo dele, acabou. */
type Rodado = { log: string; passou: boolean }

/** O passo que falhou, depois da repetição: roda de novo cada arquivo que o
 * log dele diz que falhou (`falhasDoLog`), um por vez, sozinho, e para no
 * primeiro que falha outra vez. Todos verdes, o passo passa, com eles em
 * `intermitentes`; senão, volta como veio. `carga` é o load average de
 * quando ele falhou; `dizer`, o que vai ao terminal. */
export async function repetirFalhas<R extends Rodado>({
  passo,
  resultado,
  ferramenta,
  carga,
  rodarDeNovo,
  dizer = () => {},
}: {
  passo: string
  resultado: R
  ferramenta: 'vitest' | 'playwright'
  carga: number[]
  /** Roda só `falha`; `vez` conta de 1, para o nome do log. */
  rodarDeNovo: (falha: Falha, vez: number) => Promise<Rodado>
  dizer?: (texto: string) => void
}): Promise<R & { intermitentes?: Intermitente[] }> {
  if (resultado.passou) return resultado
  const achado = falhasDoLog(readFileSync(resultado.log, 'utf8'), ferramenta)
  if ('motivo' in achado) {
    dizer(`${passo} sem repetição: ${achado.motivo}`)
    return resultado
  }
  const intermitentes: Intermitente[] = []
  for (const [i, falha] of achado.falhas.entries()) {
    dizer(`${passo}: ${falha.arquivo} falhou; roda de novo, sozinho`)
    const repeticao = await rodarDeNovo(falha, i + 1)
    if (!repeticao.passou) {
      dizer(`${passo}: ${falha.arquivo} falhou de novo, em ${repeticao.log}`)
      return resultado
    }
    intermitentes.push({
      passo,
      arquivo: falha.arquivo,
      carga,
      log: repeticao.log,
    })
  }
  dizer(
    `ok     ${passo}, com ${intermitentes.length} intermitente(s): ${intermitentes.map(({ arquivo }) => arquivo).join(', ')}`,
  )
  return { ...resultado, passou: true, intermitentes }
}

/** O comentário na issue: cada teste, o passo, o commit e a carga. */
export function comentarioDosIntermitentes(
  sha: string,
  intermitentes: Intermitente[],
) {
  return [
    `Na integração de \`${sha.slice(0, 7)}\` (${sha}), falharam e passaram sozinhos na repetição:`,
    '',
    ...intermitentes.map(
      ({ passo, arquivo, carga }) =>
        `- \`${arquivo}\`, no \`${passo}\`, com o load average em ${carga.map((valor) => valor.toFixed(2)).join(', ')} (1, 5 e 15 min).`,
    ),
  ].join('\n')
}

const DESCRICAO = [
  'Cada comentário é um teste que falhou numa integração e passou rodado de novo, sozinho (`scripts/intermitentes.ts`).',
  'O manifesto da rodada o anota em `intermitentes`. Um teste que volta aqui várias vezes pede conserto.',
].join('\n\n')

/** Comenta os intermitentes do commit na issue aberta, abrindo-a se não há.
 * Devolve o erro, sem lançar: o aviso não segura a integração. */
export function avisarNaIssue(
  gh: Gh,
  sha: string,
  intermitentes: Intermitente[],
): { issue: number } | { erro: string } {
  try {
    const issue = issueAberta(gh, TITULO) ?? abrirIssue(gh, TITULO, DESCRICAO)
    gh(
      ['issue', 'comment', String(issue), '--body-file', '-'],
      comentarioDosIntermitentes(sha, intermitentes),
    )
    return { issue }
  } catch (erro) {
    return { erro: (erro as Error).message }
  }
}
