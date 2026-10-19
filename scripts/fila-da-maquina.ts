// A fila dos testes da máquina toda (ADR 0010, do ADR-0054 do Festival dos
// Macacos). Vários agentes rodam testes em worktrees diferentes ao mesmo
// tempo, e cada rodada dimensionaria os seus workers pelos núcleos como se
// estivesse sozinha. No Festival, com três suítes juntas, cada uma levou o
// quádruplo do tempo, e os testes com prazo estouraram.
//
// Pesada é a rodada sem filtro: a suíte do Vitest de um pacote, o `pnpm e2e`
// ou o `pnpm test:stories` inteiros. Elas rodam uma de cada vez, na ordem em
// que chegaram, e cada uma com o que pede. Leve é a filtrada (um arquivo, uma
// pasta, um `-t`, um `-g`): nunca espera e leva a sua parte do que as outras
// deixam, pelo menos um worker.
//
// Quem chama é a config de cada ferramenta (os `vite.config.ts` da raiz, do
// `frontend/` e dos pacotes, o `frontend/vitest.stories.config.ts` e o
// `frontend/playwright.config.ts`), e não o `package.json`: assim `pnpm test`,
// `vp test` e `pnpm exec playwright` passam todos por aqui. A fronteira sai dos
// argumentos que a ferramenta recebeu.
//
// Cada rodada é um arquivo em `<tmp>/fila-dos-testes-tem-estudo`, que todo
// worktree enxerga, com o PID do dono. A pasta não é a do Festival: uma suíte
// dele dura até 20 min, e a nossa inteira, segundos. O dono renova a data do
// arquivo a cada 30 s. Uma rodada cujo PID morreu, ou que ficou 5 min sem
// sinal (o PID pode ter ido para outro processo), conta como morta, e a
// próxima leitura apaga o arquivo. Nada aqui mata processo: só pergunta se o
// PID existe (`AGENTS.md`, "Quatro jeitos de se machucar", item 3).
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { randomUUID } from 'node:crypto'
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs'
import { availableParallelism, tmpdir } from 'node:os'
import { join } from 'node:path'
import { RAIZ } from './portas.ts'

export type Pedido = {
  /** O comando, para quem espera saber por quem espera. */
  nome: string
  pesada: boolean
  /** O máximo de workers que a rodada usaria sozinha. */
  maximo: number
  /** A rodada não aceita menos que o máximo: os workers vieram de um flag,
   * que vale mais que a config. */
  fixo?: boolean
}

export type Rodada = Pedido & {
  pid: number
  raiz: string
  estado: 'esperando' | 'rodando'
  /** Os workers que ela levou; zero enquanto espera. */
  workers: number
  /** Quando chegou, enquanto espera; quando entrou, depois. */
  inicio: number
}

export type Vez =
  | { entra: true; workers: number }
  | { entra: false; dona: Rodada }

const PASTA = join(tmpdir(), 'fila-dos-testes-tem-estudo')
const SINAL_MS = 30_000
const SEM_SINAL_MS = 5 * 60_000
const AVISO_MS = 60_000

/** A vez de `eu` entre as `outras` rodadas vivas, num orçamento de um worker
 * por núcleo. */
export function vez(eu: Rodada, outras: Rodada[], orcamento: number): Vez {
  const rodando = outras.filter((outra) => outra.estado === 'rodando')
  if (eu.pesada) {
    const naFrente =
      rodando.find((outra) => outra.pesada) ??
      outras
        .filter((outra) => outra.pesada && outra.estado === 'esperando')
        .filter((outra) => antes(outra, eu))
        .sort((a, b) => a.inicio - b.inicio)[0]
    if (naFrente) return { entra: false, dona: naFrente }
    // Com o que pede, mesmo com leves rodando: elas acabam logo, e uma
    // pesada que entrasse pequena ficaria pequena até o fim.
    return { entra: true, workers: eu.maximo }
  }
  if (eu.fixo) return { entra: true, workers: eu.maximo }
  const ocupados = rodando.reduce((soma, outra) => soma + outra.workers, 0)
  const parte = Math.floor(orcamento / (rodando.length + 1))
  return {
    entra: true,
    workers: Math.max(1, Math.min(eu.maximo, parte, orcamento - ocupados)),
  }
}

function antes(a: Rodada, b: Rodada) {
  return a.inicio < b.inicio || (a.inicio === b.inicio && a.pid < b.pid)
}

type Opcoes = {
  pasta?: string
  nucleos?: number
  intervaloMs?: number
  avisar?: (texto: string) => void
}

/** Registra a rodada e espera a vez dela. `sair` apaga o registro; a saída
 * do processo também. */
export async function entrar(
  pedido: Pedido,
  {
    pasta = PASTA,
    nucleos = availableParallelism(),
    intervaloMs = 2000,
    avisar = (texto) => console.error(`[fila] ${texto}`),
  }: Opcoes = {},
) {
  mkdirSync(pasta, { recursive: true })
  const arquivo = join(pasta, `${process.pid}-${randomUUID().slice(0, 8)}.json`)
  const eu: Rodada = {
    ...pedido,
    pid: process.pid,
    raiz: RAIZ,
    estado: 'esperando',
    workers: 0,
    inicio: Date.now(),
  }
  comTrava(pasta, () => writeFileSync(arquivo, JSON.stringify(eu)))

  const sinal = setInterval(() => {
    const agora = new Date()
    try {
      utimesSync(arquivo, agora, agora)
    } catch {
      // Outra rodada o achou morto e apagou; a próxima leitura dela decide.
    }
  }, SINAL_MS)
  sinal.unref()
  const sair = () => {
    clearInterval(sinal)
    process.off('exit', sair)
    rmSync(arquivo, { force: true })
  }
  process.on('exit', sair)

  const chegou = eu.inicio
  let avisou = 0
  for (;;) {
    const decisao = comTrava(pasta, () => {
      const decisao = vez(eu, vivas<Rodada>(pasta, arquivo), nucleos)
      if (decisao.entra) {
        Object.assign(eu, {
          estado: 'rodando',
          workers: decisao.workers,
          inicio: Date.now(),
        })
        writeFileSync(arquivo, JSON.stringify(eu))
      }
      return decisao
    })
    if (decisao.entra) {
      if (avisou)
        avisar(`a vez chegou depois de ${duracao(Date.now() - chegou)}.`)
      else if (decisao.workers < eu.maximo)
        avisar(
          `${decisao.workers} de ${eu.maximo} workers: a máquina roda outros testes.`,
        )
      return { workers: decisao.workers, sair }
    }
    if (Date.now() - avisou >= AVISO_MS) {
      avisou = Date.now()
      avisar(esperando(decisao.dona, avisou - chegou))
    }
    await new Promise((resolver) => setTimeout(resolver, intervaloMs))
  }
}

function esperando(dona: Rodada, esperou: number) {
  const ha = duracao(Date.now() - dona.inicio)
  const faz =
    dona.estado === 'rodando' ? `roda há ${ha}` : `espera há ${ha}, na frente`
  return `esperando a vez (há ${duracao(esperou)}): \`${dona.nome}\` em ${dona.raiz}, PID ${dona.pid}, ${faz}.`
}

function duracao(ms: number) {
  const segundos = Math.round(ms / 1000)
  return segundos < 60 ? `${segundos} s` : `${Math.round(segundos / 60)} min`
}

/** Os registros das outras na `pasta`, apagando os mortos: o PID não existe,
 * ou o arquivo ficou 5 min sem sinal. `aoTirar` sabe de cada um que saiu.
 * Só dentro da trava. O `integrar-main.ts` usa o mesmo para a trava dele. */
export function vivas<T extends { pid: number }>(
  pasta: string,
  meu: string,
  aoTirar?: (morta: T, motivo: { morto: boolean; semSinalMs: number }) => void,
) {
  const agora = Date.now()
  const lidas: T[] = []
  for (const nome of readdirSync(pasta)) {
    const arquivo = join(pasta, nome)
    if (!nome.endsWith('.json') || arquivo === meu) continue
    try {
      const semSinalMs = agora - statSync(arquivo).mtimeMs
      const rodada = JSON.parse(readFileSync(arquivo, 'utf8')) as T
      const morto = !existe(rodada.pid)
      if (morto || semSinalMs > SEM_SINAL_MS) {
        rmSync(arquivo, { force: true })
        aoTirar?.(rodada, { morto, semSinalMs })
      } else lidas.push(rodada)
    } catch {
      // Apagado entre o `readdir` e a leitura, ou ilegível: fora da conta.
    }
  }
  return lidas
}

/** O sinal 0 não chega ao processo: só diz se o PID existe. */
function existe(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch (erro) {
    return (erro as NodeJS.ErrnoException).code === 'EPERM'
  }
}

/** Uma trava de milissegundos em volta de cada leitura e escrita da pasta,
 * para duas pesadas não entrarem juntas. Criar uma pasta é atômico. */
export function comTrava<T>(pasta: string, fazer: () => T): T {
  const trava = join(pasta, '.trava')
  for (;;) {
    try {
      mkdirSync(trava)
      break
    } catch {
      try {
        // Um processo que morreu segurando a trava.
        if (Date.now() - statSync(trava).mtimeMs > 10_000)
          rmSync(trava, { recursive: true, force: true })
      } catch {
        // Solta entre o `mkdir` e o `stat`.
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10)
    }
  }
  try {
    return fazer()
  } finally {
    rmSync(trava, { recursive: true, force: true })
  }
}

let vaga: Promise<number | undefined> | undefined

/** O ponto de entrada das configs: entra uma vez por processo e devolve os
 * workers, ou `undefined` para a ferramenta decidir sozinha. Fora da fila: o
 * CI, que roda cada job numa máquina só dele, o que não é rodada (o modo
 * watch, o `--list`), e o que roda dentro de uma rodada que já entrou (os
 * workers do Playwright, que leem a config de novo), que herda
 * `FILA_DA_MAQUINA`. `FILA_DA_MAQUINA=fora` pula a fila de propósito. */
export function entrarNaFila(pedido: Pedido | undefined) {
  if (vaga) return vaga
  if (!pedido || process.env.CI || process.env.FILA_DA_MAQUINA)
    return Promise.resolve(undefined)
  vaga = entrar(pedido).then(({ workers }) => {
    process.env.FILA_DA_MAQUINA = 'dentro'
    return workers
  })
  return vaga
}

/** Os workers de uma rodada do Vitest, para o `maxWorkers` dos
 * `vite.config.ts`. Fora do Vitest (o `vp check`, o `vp dev` e o `vp build`
 * leem a mesma config), `undefined`, sem entrar na fila. */
export function workersDoVitest() {
  if (!process.env.VITEST) return Promise.resolve(undefined)
  return entrarNaFila(pedidoDoVitest(process.argv, availableParallelism()))
}

const SUBCOMANDOS_DO_VITEST = new Set([
  'run',
  'related',
  'watch',
  'dev',
  'bench',
  'list',
  'init',
])
const FILTROS_DO_VITEST = new Set([
  '-t',
  '--testNamePattern',
  '--project',
  '--changed',
  '--related',
  '--shard',
])
const COM_VALOR_NO_VITEST = new Set([
  '-t',
  '--testNamePattern',
  '--project',
  '--shard',
  '--maxWorkers',
  '--testTimeout',
  '--hookTimeout',
  '--reporter',
  '--outputFile',
  '-c',
  '--config',
  '-r',
  '--root',
  '--dir',
  '--pool',
  '--exclude',
  '--environment',
  '--mode',
  '--retry',
  '--bail',
])

/** O pedido de um `vitest` pelo `process.argv`, ou `undefined` para o que não
 * entra na fila. */
export function pedidoDoVitest(argv: string[], nucleos: number) {
  const args = argv.slice(2)
  const subcomando = SUBCOMANDOS_DO_VITEST.has(args[0] ?? '')
    ? args.shift()
    : undefined
  // Sem `run`, o Vitest fica olhando os arquivos quando tem um terminal.
  const olhando =
    subcomando === 'watch' ||
    subcomando === 'dev' ||
    args.includes('--watch') ||
    args.includes('-w') ||
    (subcomando === undefined && process.stdin.isTTY && !process.env.CI)
  if (
    olhando ||
    subcomando === 'list' ||
    subcomando === 'init' ||
    subcomando === 'bench'
  )
    return undefined
  const { filtrado, soltos } = lerArgumentos(
    args,
    FILTROS_DO_VITEST,
    COM_VALOR_NO_VITEST,
  )
  const pesada = !filtrado && soltos.length === 0
  const soArquivos =
    soltos.length > 0 && soltos.every((solto) => /\.test\.tsx?$/.test(solto))
  return {
    nome: ['vitest', subcomando, ...args]
      .filter(Boolean)
      .join(' ')
      .slice(0, 120),
    pesada,
    maximo: soArquivos ? soltos.length : Math.max(1, nucleos - 1),
  }
}

const FILTROS_DO_PLAYWRIGHT = new Set([
  '-g',
  '--grep',
  '--grep-invert',
  '--project',
  '--shard',
  '--last-failed',
  '--only-changed',
])
const COM_VALOR_NO_PLAYWRIGHT = new Set([
  '-c',
  '--config',
  '-g',
  '--grep',
  '--grep-invert',
  '--project',
  '-j',
  '--workers',
  '--reporter',
  '--retries',
  '--repeat-each',
  '--shard',
  '--timeout',
  '--max-failures',
  '--output',
  '--trace',
  '--global-timeout',
  '--tsconfig',
])

/** O pedido de um `playwright test`, com os `workers` que o e2e abre, cada um
 * com o seu Chrome. */
export function pedidoDoPlaywright(argv: string[], workers: number) {
  const [comando, ...args] = argv.slice(2)
  // `--ui-port` e `--ui-host` também abrem a UI, que fica aberta por horas.
  if (
    comando !== 'test' ||
    args.some((arg) => arg === '--list' || arg.startsWith('--ui'))
  )
    return undefined
  const { filtrado, soltos } = lerArgumentos(
    args,
    FILTROS_DO_PLAYWRIGHT,
    COM_VALOR_NO_PLAYWRIGHT,
  )
  // O `--workers` vale mais que a config, e quem o deu quer esse número: a
  // fila não o diminui.
  const doFlag = workersDoFlag(args)
  return {
    nome: ['playwright test', ...args].join(' ').slice(0, 120),
    pesada: !filtrado && soltos.length === 0,
    maximo: doFlag ?? workers,
    ...(doFlag === undefined ? {} : { fixo: true }),
  }
}

function workersDoFlag(args: string[]) {
  for (const [i, arg] of args.entries()) {
    const [flag, valor = args[i + 1]] = arg.split('=')
    if (flag === '--workers' || flag === '-j') {
      const workers = Number(valor)
      return Number.isInteger(workers) && workers > 0 ? workers : undefined
    }
  }
  return undefined
}

function lerArgumentos(
  args: string[],
  filtros: Set<string>,
  comValor: Set<string>,
) {
  let filtrado = false
  const soltos: string[] = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i] as string
    if (!arg.startsWith('-')) {
      soltos.push(arg)
      continue
    }
    const [flag] = arg.split('=')
    if (filtros.has(flag as string)) filtrado = true
    if (!arg.includes('=') && comValor.has(flag as string)) i++
  }
  return { filtrado, soltos }
}
