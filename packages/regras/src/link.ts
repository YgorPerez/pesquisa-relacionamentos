// O estado das calculadoras no link (ADR 0001, #14; stories 62–67). "Copiar
// link" escreve o Perfil e a conta (Grupo possível) ou o topo 3 e o desfecho
// (Prioridades) na query, com a versão do formato em `v`. Quem abre o link
// recebe esse estado no lugar do salvo.
//
// O formato já circula em links velhos: mudar uma chave quebra quem recebeu.
// Por isso cada versão tem o seu leitor, e uma versão nova acrescenta outro
// sem apagar os de antes. A opção de não ser contado (#35) nunca entra aqui.
import { lerPerfil, type GeneroDoPerfil, type Perfil } from './perfil.ts'
import { formatarFaixa } from './numeros.ts'
import {
  alertaDoTopo3,
  lerPrioridades,
  NOME_DO_DESFECHO,
  type CaracteristicaComEvidencia,
  type EstadoDasPrioridades,
} from './prioridades.ts'
import {
  ALTURA_MAXIMA,
  ALTURA_MINIMA,
  IDADE_PROCURADA_MAXIMA,
  IDADE_PROCURADA_MINIMA,
  lerRequisitos,
  REQUISITOS_PADRAO,
  valorDoRequisito,
  type Faixa,
  type Requisitos,
} from './requisitos.ts'

export const CALCULADORAS_COM_LINK = ['grupo-possivel', 'prioridades'] as const
export type CalculadoraComLink = (typeof CALCULADORAS_COM_LINK)[number]

export type EstadoDoLink =
  | {
      readonly calculadora: 'grupo-possivel'
      readonly perfil: Perfil | null
      /** `null`: quem mandou nunca mexeu nos Requisitos (ou deixou todos no padrão). */
      readonly requisitos: Requisitos | null
    }
  | {
      readonly calculadora: 'prioridades'
      /** Só o gênero do Perfil: a conta usa para a nota de viés, e o resto não vai. */
      readonly genero: GeneroDoPerfil | null
      readonly prioridades: EstadoDasPrioridades
    }

/** A versão que `queryDoLink` escreve. */
export const VERSAO_DO_LINK = 1

type Parametros = ReadonlyMap<string, string>

// --- query crua ----------------------------------------------------------------
// Sem `URLSearchParams`: o pacote não tem DOM nem os tipos do node.

/** As chaves e valores da query; `null` se ela não se decodifica. O `+` fica
 * `+` (nenhum valor tem espaço, e a renda "5+" pode chegar sem escape). */
function decodificar(query: string): Parametros | null {
  const parametros = new Map<string, string>()
  for (const par of query.replace(/^\?/, '').split('&')) {
    if (par === '') continue
    const i = par.indexOf('=')
    const [chave, valor] = i < 0 ? [par, ''] : [par.slice(0, i), par.slice(i + 1)]
    try {
      const nome = decodeURIComponent(chave)
      if (!parametros.has(nome)) parametros.set(nome, decodeURIComponent(valor))
    } catch {
      return null
    }
  }
  return parametros
}

/** Escapa cada valor, menos a vírgula das listas, que fica legível. */
const codificar = (pares: ReadonlyArray<readonly [string, string]>): string =>
  pares.map(([chave, valor]) => `${chave}=${encodeURIComponent(valor).replace(/%2C/g, ',')}`).join('&')

const faixaEscrita = ({ min, max }: Faixa) => `${min}-${max}`

function faixaLida(texto: string | undefined): Faixa | null {
  const m = texto?.match(/^(\d{1,3})-(\d{1,3})$/)
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null
}

const lista = (texto: string | undefined): string[] => (texto ? texto.split(',') : [])

// --- versão 1 ------------------------------------------------------------------
// v=1&genero=homem&procura=mulheres&idade=30
//   Grupo possível: &idades=25-35&uf=SP&municipio=3550308&companheiro=nao
//     &escolaridade=superior&renda=2-5&cor=preta,parda&religiao=catolica
//     &sem-filhos=sim&altura=160-200&nao-fuma=sim (só o que sai do padrão)
//   Prioridades: só o gênero do Perfil, &topo=renda,sexo,calma&desfecho=satisfacao

const CHAVES_DOS_REQUISITOS_V1 = [
  'idades', 'uf', 'municipio', 'companheiro', 'escolaridade', 'renda', 'cor', 'religiao', 'sem-filhos', 'altura',
  'nao-fuma',
] as const

function escreverV1(estado: EstadoDoLink): Array<readonly [string, string]> {
  const pares: Array<readonly [string, string]> = [['v', String(VERSAO_DO_LINK)]]
  if (estado.calculadora === 'prioridades') {
    if (estado.genero) pares.push(['genero', estado.genero])
    const { topo3, desfecho } = estado.prioridades
    if (topo3.length > 0) pares.push(['topo', topo3.join(',')])
    pares.push(['desfecho', desfecho])
    return pares
  }

  const p = estado.perfil
  if (p?.genero) pares.push(['genero', p.genero])
  if (p?.procura) pares.push(['procura', p.procura])
  if (p?.idade !== undefined) pares.push(['idade', String(p.idade)])
  const r = estado.requisitos
  if (!r) return pares
  const padrao = REQUISITOS_PADRAO
  if (r.idade) pares.push(['idades', faixaEscrita(r.idade)])
  if (r.lugar) {
    pares.push(['uf', r.lugar.uf])
    if (r.lugar.municipio) pares.push(['municipio', r.lugar.municipio])
  }
  if (r.companheiro !== padrao.companheiro) pares.push(['companheiro', r.companheiro ? 'sim' : 'nao'])
  if (r.escolaridade) pares.push(['escolaridade', r.escolaridade])
  if (r.renda) pares.push(['renda', r.renda])
  if (r.cores.length > 0) pares.push(['cor', r.cores.join(',')])
  if (r.religioes.length > 0) pares.push(['religiao', r.religioes.join(',')])
  if (r.semFilhos) pares.push(['sem-filhos', 'sim'])
  if (r.altura.min > ALTURA_MINIMA || r.altura.max < ALTURA_MAXIMA) pares.push(['altura', faixaEscrita(r.altura)])
  if (r.naoFuma) pares.push(['nao-fuma', 'sim'])
  return pares
}

function lerV1(calculadora: CalculadoraComLink, q: Parametros, ids?: ReadonlyArray<string>): EstadoDoLink {
  if (calculadora === 'prioridades') {
    // Os links de antes levavam `procura` e `idade` também: ficam de fora.
    const genero = lerPerfil({ genero: q.get('genero') })?.genero ?? null
    const prioridades = lerPrioridades({ topo3: lista(q.get('topo')), desfecho: q.get('desfecho') }, ids)!
    return { calculadora, genero, prioridades }
  }

  const perfil = lerPerfil({ genero: q.get('genero'), procura: q.get('procura'), idade: q.get('idade') })

  if (!CHAVES_DOS_REQUISITOS_V1.some((chave) => q.has(chave))) return { calculadora, perfil, requisitos: null }
  const uf = q.get('uf')
  const requisitos = lerRequisitos({
    idade: faixaLida(q.get('idades')),
    lugar: uf ? { uf, municipio: q.get('municipio') } : null,
    companheiro: q.get('companheiro') === 'nao' ? false : REQUISITOS_PADRAO.companheiro,
    escolaridade: q.get('escolaridade'),
    renda: q.get('renda'),
    cores: lista(q.get('cor')),
    religioes: lista(q.get('religiao')),
    semFilhos: q.get('sem-filhos') === 'sim',
    altura: faixaLida(q.get('altura')),
    naoFuma: q.get('nao-fuma') === 'sim',
  })
  return { calculadora, perfil, requisitos }
}

/** Um leitor por versão do formato. Uma versão nova entra aqui, e as velhas ficam. */
const LEITORES: Readonly<Record<string, typeof lerV1>> = {
  '1': lerV1,
}

// --- a frase do que o link revela (story 63) -------------------------------------

const GENERO_NA_FRASE: Readonly<Record<NonNullable<Perfil['genero']>, string>> = {
  homem: 'homem',
  mulher: 'mulher',
  outro: 'outro gênero',
}

const PROCURA_NA_FRASE: Readonly<Record<NonNullable<Perfil['procura']>, string>> = {
  homens: 'homens',
  mulheres: 'mulheres',
  ambos: 'homens e mulheres',
}

const ESCOLARIDADE_NA_FRASE: Readonly<Record<NonNullable<Requisitos['escolaridade']>, string>> = {
  fundamental: 'ensino fundamental',
  medio: 'ensino médio',
  superior: 'ensino superior',
}

const emLista = (itens: ReadonlyArray<string>): string =>
  itens.length < 2 ? (itens[0] ?? '') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`

/** "de 25 a 35", "de 40 anos ou mais"; vazio se a faixa é qualquer idade. */
function idadesNaFrase(idade: Faixa | null): string {
  if (!idade || (idade.min <= IDADE_PROCURADA_MINIMA && idade.max >= IDADE_PROCURADA_MAXIMA)) return ''
  return idade.max >= IDADE_PROCURADA_MAXIMA ? `de ${idade.min} anos ou mais` : `de ${idade.min} a ${idade.max}`
}

function perfilNaFrase(perfil: Perfil | null): string[] {
  return [
    perfil?.genero ? GENERO_NA_FRASE[perfil.genero] : '',
    perfil?.idade !== undefined ? String(perfil.idade) : '',
  ].filter(Boolean)
}

export interface OpcoesDaFrase {
  /** O nome do município do link, que só os dados do Grupo possível sabem. */
  readonly municipio?: string
  /** O nome de cada característica de Prioridades, pela id. */
  readonly nomes?: Readonly<Record<string, string>>
}

/** "Este link mostra: homem, 30, procura mulheres de 25 a 35, ensino superior,
 * em SP.": tudo o que a query leva, em português, para o visitante decidir se
 * compartilha. */
export function fraseDoLink(estado: EstadoDoLink, opcoes: OpcoesDaFrase = {}): string {
  if (estado.calculadora === 'prioridades') {
    const partes = estado.genero ? [GENERO_NA_FRASE[estado.genero]] : []
    const { topo3, desfecho } = estado.prioridades
    const nomes = topo3.map((id) => (opcoes.nomes?.[id] ?? id).toLowerCase())
    partes.push(nomes.length ? `topo 3 ${emLista(nomes)}` : 'nenhuma característica escolhida')
    return `Este link mostra: ${partes.join(', ')}, em ${NOME_DO_DESFECHO[desfecho].toLowerCase()}.`
  }

  const { perfil } = estado
  const partes = perfilNaFrase(perfil)
  const r = estado.requisitos
  const idades = idadesNaFrase(r?.idade ?? null)
  if (perfil?.procura || idades)
    partes.push(['procura', perfil?.procura ? PROCURA_NA_FRASE[perfil.procura] : 'pessoas', idades].filter(Boolean).join(' '))
  if (r) {
    partes.push(...outrosRequisitos(perfil, r))
    if (r.lugar) partes.push(lugarNaFrase(r, opcoes.municipio))
  }
  if (partes.length === 0) return 'Este link mostra só a conta do Brasil inteiro, sem nada seu.'
  return `Este link mostra: ${partes.join(', ')}.`
}

/** Os Requisitos fora do padrão, menos a idade e o lugar, que a frase diz à parte. */
function outrosRequisitos(perfil: Perfil | null, r: Requisitos): string[] {
  const valor = (k: Parameters<typeof valorDoRequisito>[0]) => valorDoRequisito(k, perfil, r)
  return [
    r.companheiro !== REQUISITOS_PADRAO.companheiro && valor('companheiro'),
    r.escolaridade && ESCOLARIDADE_NA_FRASE[r.escolaridade],
    r.renda && valor('renda'),
    r.cores.length > 0 && valor('cor'),
    r.religioes.length > 0 && valor('religiao'),
    r.semFilhos && perfil?.procura !== 'homens' && valor('filhos'),
    (r.altura.min > ALTURA_MINIMA || r.altura.max < ALTURA_MAXIMA) && valor('altura'),
    r.naoFuma && valor('fumo'),
  ].filter((x): x is string => typeof x === 'string')
}

const lugarNaFrase = (r: Requisitos, municipio: string | undefined): string =>
  !r.lugar ? 'no Brasil' : r.lugar.municipio && municipio ? `em ${municipio} (${r.lugar.uf})` : `em ${r.lugar.uf}`

// --- a prévia nas redes (story 66) -----------------------------------------------
// O Open Graph da calculadora aberta com estado. Diz o resultado e quem se
// procura, nunca o gênero nem a idade de quem compartilhou (ADR 0001). Nem a
// orientação, que entrega o gênero, nem a faixa de idade tirada do Perfil
// (a idade dele ±5), que entrega a idade.

export interface Previa {
  readonly titulo: string
  readonly descricao: string
}

const maiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** O que a prévia precisa da conta (`Estimativa` encaixa). */
export interface ContaDaPrevia {
  readonly alvo: 'homens' | 'mulheres' | 'pessoas'
  readonly resultado: { readonly min: number; readonly max: number }
}

/** "Entre 120 mil e 180 mil mulheres de 25 a 35 em SP". */
export function previaDoGrupo(
  estado: Extract<EstadoDoLink, { calculadora: 'grupo-possivel' }>,
  conta: ContaDaPrevia,
  opcoes: Pick<OpcoesDaFrase, 'municipio'> = {},
): Previa {
  const r = estado.requisitos ?? REQUISITOS_PADRAO
  const escolhida = idadesNaFrase(r.idade)
  const doPerfil = !r.idade && estado.perfil?.idade !== undefined
  const titulo = [
    formatarFaixa(conta.resultado.min, conta.resultado.max),
    conta.alvo,
    escolhida,
    `${lugarNaFrase(r, opcoes.municipio)}${doPerfil ? ', na idade procurada' : ''}`,
  ]
    .filter(Boolean)
    .join(' ')
  // Sem o Perfil: `filhos` depende só de quem se procura, que o título já diz.
  const outros = outrosRequisitos({ procura: estado.perfil?.procura }, r)
  const descricao = [
    'Pela conta do Grupo possível, com o Censo 2022 e a PNS 2019.',
    outros.length > 0 && `Também pediu: ${outros.join(', ')}.`,
    'Faça a sua conta.',
  ]
    .filter(Boolean)
    .join(' ')
  return { titulo: maiuscula(titulo), descricao }
}

/** "Topo 3: química sexual e renda", com o alerta; `null` sem nada escolhido. */
export function previaDePrioridades(
  caracteristicas: ReadonlyArray<CaracteristicaComEvidencia>,
  prioridades: EstadoDasPrioridades,
): Previa | null {
  const { topo3, desfecho } = prioridades
  const nomes = topo3.flatMap((id) => caracteristicas.filter((c) => c.id === id).map((c) => c.nome.toLowerCase()))
  if (nomes.length === 0) return null
  return {
    titulo: `Topo 3: ${emLista(nomes)}`,
    descricao:
      alertaDoTopo3(caracteristicas, topo3, desfecho) ??
      `Para ${NOME_DO_DESFECHO[desfecho].toLowerCase()}, a evidência não põe nenhuma delas em "quase nada" ou "não sabemos".`,
  }
}

// --- interface -----------------------------------------------------------------

/** A query do link, sem o `?`: "v=1&genero=homem&…". */
export const queryDoLink = (estado: EstadoDoLink): string => codificar(escreverV1(estado))

/** A query é de um link de calculadora (tem `v`), válida ou não. A página
 * limpa esta da barra; outra query (de campanha, digamos) fica. */
export const ehLink = (query: string): boolean => /(^|[?&])v=/.test(query)

/** O estado que o link leva; `null` se a query não é de link, não se
 * decodifica ou tem uma versão que este código não conhece. Um valor
 * inválido sozinho cai fora e o resto vale. `ids`, quando dada, limita o
 * topo 3 às características que existem nos dados. */
export function lerLink(
  calculadora: CalculadoraComLink,
  query: string,
  ids?: ReadonlyArray<string>,
): EstadoDoLink | null {
  const q = decodificar(query)
  const ler = q && LEITORES[q.get('v') ?? '']
  return ler ? ler(calculadora, q, ids) : null
}
