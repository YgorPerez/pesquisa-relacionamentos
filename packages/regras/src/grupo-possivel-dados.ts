// Os dados do Grupo possível (#36) no caminho até o navegador.
//
// O CSV do Censo tem 31 MB, mas é o Brasil inteiro em 490 mil células. O
// build corta em um pacote por lugar: o do Brasil (as UFs somadas, ~44 mil
// células) e um por UF, com os municípios dela. O navegador baixa o do Brasil
// e, se o visitante escolher uma UF, o dela. Cada pacote leva junto as idades
// simples do SIDRA 9514 e as probabilidades da PNS, que são pequenas.
//
// Lado do build: `lerBaseDoGrupo` (os CSV) → `pacoteDoLugar` (JSON).
// Lado do navegador: `abrirPacote` (JSON → colunas tipadas para a conta).
import {
  CORES,
  ESCOLARIDADES,
  RELIGIOES,
  RENDAS,
  UFS,
  type Uf,
} from './requisitos.ts'

export const SEXOS = ['homem', 'mulher'] as const
export type Sexo = (typeof SEXOS)[number]

/** Os grupos de idade do microdado, de 5 anos, a partir de 15. */
export const GRUPOS_DE_IDADE = [
  '15-19',
  '20-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50-54',
  '55-59',
  '60-64',
  '65-69',
  '70-74',
  '75-79',
  '80+',
] as const

/** Idades simples do SIDRA 9514: 15 a 99 e "100+" (posição 85). */
export const IDADES_SIMPLES = 86

/** Uma linha do CSV da PNS: [p, p_min, p_max], pela chave `medida|sexo|faixa|categoria`. */
export type Pns = Readonly<Record<string, readonly [number, number, number]>>

export interface Municipio {
  readonly codigo: string
  readonly nome: string
  readonly uf: Uf
  /** SIDRA 10185: pessoas por sexo × grupo × união, na ordem de `indiceConjugal`. */
  readonly pessoas: ReadonlyArray<number>
}

/** A posição de sexo × grupo × união (1 = vive em união) nas tabelas por célula. */
export const indiceConjugal = (sexo: number, grupo: number, uniao: number) =>
  (sexo * GRUPOS_DE_IDADE.length + grupo) * 2 + uniao
export const CELULAS_CONJUGAIS = SEXOS.length * GRUPOS_DE_IDADE.length * 2

interface LinhaDoCenso {
  readonly uf: string
  /** Código da célula (ver `codificar`). */
  readonly codigo: number
  readonly peso: number
  readonly registros: number
}

/** Pessoas por idade simples, para homens e mulheres. */
export interface Idades {
  readonly homem: ReadonlyArray<number>
  readonly mulher: ReadonlyArray<number>
}

export interface BaseDoGrupo {
  readonly censo: ReadonlyArray<LinhaDoCenso>
  readonly idades: ReadonlyMap<string, Idades>
  readonly municipios: ReadonlyArray<Municipio>
  readonly pns: Pns
}

// --- código da célula ------------------------------------------------------
// Cada dimensão vira um índice; "sem dado" é 0 e o valor i da lista é i + 1.
// Sexo, grupo e união não têm "sem dado".
const RAIOS = [
  2,
  GRUPOS_DE_IDADE.length,
  2,
  ESCOLARIDADES.length + 1,
  RENDAS.length + 1,
  CORES.length + 1,
  RELIGIOES.length + 1,
  3,
] as const

function codificar(partes: ReadonlyArray<number>): number {
  let codigo = 0
  for (let i = 0; i < RAIOS.length; i++)
    codigo = codigo * RAIOS[i]! + partes[i]!
  return codigo
}

function decodificar(codigo: number, saida: number[]): void {
  for (let i = RAIOS.length - 1; i >= 0; i--) {
    saida[i] = codigo % RAIOS[i]!
    codigo = Math.floor(codigo / RAIOS[i]!)
  }
}

// --- leitura dos CSV -------------------------------------------------------

function linhasCsv(texto: string): { cabecalho: string[]; linhas: string[][] } {
  const [primeira = '', ...resto] = texto
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
  return {
    cabecalho: primeira.split(','),
    linhas: resto.map((l) => l.split(',')),
  }
}

function indiceOuErro(
  lista: ReadonlyArray<string>,
  valor: string | undefined,
  nome: string,
): number {
  const i = lista.indexOf(valor ?? '')
  if (i < 0) throw new Error(`${nome} desconhecido no CSV: "${valor}"`)
  return i
}

/** "" é sem dado (0); um valor da lista é a posição + 1. */
function indiceOpcional(
  lista: ReadonlyArray<string>,
  valor: string | undefined,
  nome: string,
): number {
  return valor === '' || valor === undefined
    ? 0
    : indiceOuErro(lista, valor, nome) + 1
}

function lerCenso(texto: string): LinhaDoCenso[] {
  const { cabecalho, linhas } = linhasCsv(texto)
  const col = (nome: string) => indiceOuErro(cabecalho, nome, 'coluna')
  const c = {
    sexo: col('sexo'),
    idade: col('idade'),
    uf: col('uf'),
    uniao: col('uniao'),
    escolaridade: col('escolaridade'),
    renda: col('renda'),
    cor: col('cor'),
    religiao: col('religiao'),
    filhos: col('filhos'),
    peso: col('peso'),
    n: col('n_registros'),
  }
  return linhas.map((l) => ({
    uf: l[c.uf] ?? '',
    codigo: codificar([
      indiceOuErro(SEXOS, l[c.sexo], 'sexo'),
      indiceOuErro(GRUPOS_DE_IDADE, l[c.idade], 'grupo de idade'),
      indiceOuErro(['nao', 'sim'], l[c.uniao], 'união'),
      indiceOpcional(ESCOLARIDADES, l[c.escolaridade], 'escolaridade'),
      indiceOpcional(RENDAS, l[c.renda], 'renda'),
      indiceOpcional(CORES, l[c.cor], 'cor'),
      indiceOpcional(RELIGIOES, l[c.religiao], 'religião'),
      indiceOpcional(['nao', 'sim'], l[c.filhos], 'filhos'),
    ]),
    peso: Number(l[c.peso]),
    registros: Number(l[c.n]),
  }))
}

function lerIdades(texto: string): Map<string, Idades> {
  const { linhas } = linhasCsv(texto)
  const porLocal = new Map<string, { homem: number[]; mulher: number[] }>()
  for (const [local = '', sexo = '', idade = '', pessoas = '0'] of linhas) {
    const atual = porLocal.get(local) ?? {
      homem: Array(IDADES_SIMPLES).fill(0),
      mulher: Array(IDADES_SIMPLES).fill(0),
    }
    porLocal.set(local, atual)
    const posicao = idade === '100+' ? IDADES_SIMPLES - 1 : Number(idade) - 15
    atual[SEXOS[indiceOuErro(SEXOS, sexo, 'sexo')]!][posicao] = Number(pessoas)
  }
  return porLocal
}

function lerMunicipios(texto: string): Municipio[] {
  const { cabecalho, linhas } = linhasCsv(texto)
  const posicoes = cabecalho.map((nome) => {
    const [sexo, grupo, uniao] = nome.split('_')
    const s = SEXOS.indexOf(sexo as Sexo)
    const g = GRUPOS_DE_IDADE.indexOf(grupo as (typeof GRUPOS_DE_IDADE)[number])
    const u = ['nao', 'sim'].indexOf(uniao ?? '')
    return s < 0 || g < 0 || u < 0 ? -1 : indiceConjugal(s, g, u)
  })
  return linhas.map((l) => {
    const pessoas = Array<number>(CELULAS_CONJUGAIS).fill(0)
    l.forEach((valor, i) => {
      const p = posicoes[i]!
      if (p >= 0) pessoas[p] = Number(valor)
    })
    const uf = UFS.find((u) => u.sigla === l[2])
    if (!uf) throw new Error(`UF desconhecida no CSV de municípios: "${l[2]}"`)
    return { codigo: l[0] ?? '', nome: l[1] ?? '', uf: uf.sigla, pessoas }
  })
}

function lerPns(texto: string): Pns {
  const { linhas } = linhasCsv(texto)
  return Object.fromEntries(
    linhas.map(([medida, sexo, faixa, categoria, p, min, max]) => [
      `${medida}|${sexo}|${faixa}|${categoria}`,
      [Number(p), Number(min), Number(max)] as const,
    ]),
  )
}

/** Os arquivos de `dados/grupo-possivel/`, como texto. */
export interface ArquivosDoGrupo {
  /** `censo-2022.csv` */
  readonly censo: string
  /** `sidra-9514-idade.csv` */
  readonly idades: string
  /** `sidra-10185-municipios.csv` */
  readonly municipios: string
  /** `pns-2019.csv` */
  readonly pns: string
}

export function lerBaseDoGrupo(arquivos: ArquivosDoGrupo): BaseDoGrupo {
  return {
    censo: lerCenso(arquivos.censo),
    idades: lerIdades(arquivos.idades),
    municipios: lerMunicipios(arquivos.municipios),
    pns: lerPns(arquivos.pns),
  }
}

// --- pacote ----------------------------------------------------------------

export type LugarDoPacote = 'BR' | Uf

/** O que o navegador baixa para um lugar. Só números e textos, em colunas. */
export interface Pacote {
  readonly versao: 1
  readonly lugar: LugarDoPacote
  readonly celulas: ReadonlyArray<number>
  readonly pesos: ReadonlyArray<number>
  readonly registros: ReadonlyArray<number>
  readonly idades: Idades
  /** `[código, nome, ...pessoas]` de cada município da UF. */
  readonly municipios: ReadonlyArray<ReadonlyArray<string | number>>
  readonly pns: Pns
}

/** O pacote de um lugar: no Brasil, as células das UFs somadas. O peso vai
 * arredondado à pessoa, que é o que a conta mostra. */
export function pacoteDoLugar(base: BaseDoGrupo, lugar: LugarDoPacote): Pacote {
  const somas = new Map<number, { peso: number; registros: number }>()
  for (const linha of base.censo) {
    if (lugar !== 'BR' && linha.uf !== lugar) continue
    const atual = somas.get(linha.codigo) ?? { peso: 0, registros: 0 }
    atual.peso += linha.peso
    atual.registros += linha.registros
    somas.set(linha.codigo, atual)
  }
  const codigos = [...somas.keys()].sort((a, b) => a - b)
  const idades = base.idades.get(lugar)
  if (!idades) throw new Error(`sem idades simples do SIDRA 9514 para ${lugar}`)
  return {
    versao: 1,
    lugar,
    celulas: codigos,
    pesos: codigos.map((c) => Math.round(somas.get(c)!.peso)),
    registros: codigos.map((c) => somas.get(c)!.registros),
    idades,
    municipios:
      lugar === 'BR'
        ? []
        : base.municipios
            .filter((m) => m.uf === lugar)
            .map((m) => [m.codigo, m.nome, ...m.pessoas]),
    pns: base.pns,
  }
}

/** Um lugar aberto para a conta: uma coluna tipada por dimensão. */
export interface DadosDoLugar {
  readonly lugar: LugarDoPacote
  readonly tamanho: number
  readonly sexo: Uint8Array
  readonly grupo: Uint8Array
  readonly uniao: Uint8Array
  /** 0 = sem dado; i + 1 = posição i da lista (ESCOLARIDADES, RENDAS…). */
  readonly escolaridade: Uint8Array
  readonly renda: Uint8Array
  readonly cor: Uint8Array
  readonly religiao: Uint8Array
  /** 0 = sem dado (homens), 1 = não tem, 2 = tem. */
  readonly filhos: Uint8Array
  readonly peso: Float64Array
  readonly registros: Float64Array
  readonly idades: Idades
  readonly municipios: ReadonlyMap<string, Municipio>
  readonly pns: Pns
}

/** O pacote da versão que este código lê. */
function ehPacote(valor: unknown): valor is Pacote {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'versao' in valor &&
    valor.versao === 1 &&
    'celulas' in valor &&
    Array.isArray(valor.celulas)
  )
}

/** Abre um pacote (que veio da rede ou do disco, como JSON: confere o
 * formato antes). */
export function abrirPacote(pacote: unknown): DadosDoLugar {
  if (!ehPacote(pacote))
    throw new Error('pacote do Grupo possível em formato desconhecido')
  const n = pacote.celulas.length
  const colunas = Array.from({ length: RAIOS.length }, () => new Uint8Array(n))
  const partes: number[] = []
  for (let i = 0; i < n; i++) {
    decodificar(pacote.celulas[i]!, partes)
    for (let d = 0; d < RAIOS.length; d++) colunas[d]![i] = partes[d]!
  }
  const [sexo, grupo, uniao, escolaridade, renda, cor, religiao, filhos] =
    colunas as [
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
      Uint8Array,
    ]
  const uf = pacote.lugar === 'BR' ? undefined : pacote.lugar
  return {
    lugar: pacote.lugar,
    tamanho: n,
    sexo,
    grupo,
    uniao,
    escolaridade,
    renda,
    cor,
    religiao,
    filhos,
    peso: Float64Array.from(pacote.pesos),
    registros: Float64Array.from(pacote.registros),
    idades: pacote.idades,
    municipios: new Map(
      uf
        ? pacote.municipios.map(([codigo, nome, ...pessoas]) => [
            String(codigo),
            {
              codigo: String(codigo),
              nome: String(nome),
              uf,
              pessoas: pessoas.map(Number),
            },
          ])
        : [],
    ),
    pns: pacote.pns,
  }
}
