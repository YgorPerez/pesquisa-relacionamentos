// Os Requisitos do Grupo possível (#8, story 41): o que o visitante pede de
// quem procura. É o estado que fica no localStorage, que o cartão do B5 (#32)
// lê e que o link (#34) leva. Tudo aqui é serializável em JSON.
import type { Perfil } from './perfil.ts'

/** As 27 UFs, com o código do IBGE (os dois primeiros dígitos do município). */
export const UFS = [
  { sigla: 'AC', codigo: '12', nome: 'Acre' },
  { sigla: 'AL', codigo: '27', nome: 'Alagoas' },
  { sigla: 'AP', codigo: '16', nome: 'Amapá' },
  { sigla: 'AM', codigo: '13', nome: 'Amazonas' },
  { sigla: 'BA', codigo: '29', nome: 'Bahia' },
  { sigla: 'CE', codigo: '23', nome: 'Ceará' },
  { sigla: 'DF', codigo: '53', nome: 'Distrito Federal' },
  { sigla: 'ES', codigo: '32', nome: 'Espírito Santo' },
  { sigla: 'GO', codigo: '52', nome: 'Goiás' },
  { sigla: 'MA', codigo: '21', nome: 'Maranhão' },
  { sigla: 'MT', codigo: '51', nome: 'Mato Grosso' },
  { sigla: 'MS', codigo: '50', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', codigo: '31', nome: 'Minas Gerais' },
  { sigla: 'PA', codigo: '15', nome: 'Pará' },
  { sigla: 'PB', codigo: '25', nome: 'Paraíba' },
  { sigla: 'PR', codigo: '41', nome: 'Paraná' },
  { sigla: 'PE', codigo: '26', nome: 'Pernambuco' },
  { sigla: 'PI', codigo: '22', nome: 'Piauí' },
  { sigla: 'RJ', codigo: '33', nome: 'Rio de Janeiro' },
  { sigla: 'RN', codigo: '24', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', codigo: '43', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', codigo: '11', nome: 'Rondônia' },
  { sigla: 'RR', codigo: '14', nome: 'Roraima' },
  { sigla: 'SC', codigo: '42', nome: 'Santa Catarina' },
  { sigla: 'SP', codigo: '35', nome: 'São Paulo' },
  { sigla: 'SE', codigo: '28', nome: 'Sergipe' },
  { sigla: 'TO', codigo: '17', nome: 'Tocantins' },
] as const
export type Uf = (typeof UFS)[number]['sigla']

/** Os valores do CSV do #36, do menor ao maior quando há ordem. */
export const ESCOLARIDADES = ['sem-fundamental', 'fundamental', 'medio', 'superior'] as const
export type Escolaridade = (typeof ESCOLARIDADES)[number]
export const RENDAS = ['sem-renda', 'ate-1', '1-2', '2-5', '5+'] as const
export type Renda = (typeof RENDAS)[number]
export const CORES = ['branca', 'preta', 'parda', 'amarela', 'indigena'] as const
export type Cor = (typeof CORES)[number]
export const RELIGIOES = ['catolica', 'evangelica', 'espirita', 'umbanda-candomble', 'sem-religiao', 'outra'] as const
export type Religiao = (typeof RELIGIOES)[number]

/** A escolaridade e a renda mínimas que dá para pedir (o menor degrau é "qualquer"). */
export const ESCOLARIDADES_MINIMAS = ['fundamental', 'medio', 'superior'] as const satisfies ReadonlyArray<Escolaridade>
export const RENDAS_MINIMAS = ['ate-1', '1-2', '2-5', '5+'] as const satisfies ReadonlyArray<Renda>

/** A idade procurada vai de 18 a 80, e 80 quer dizer "80 ou mais". */
export const IDADE_PROCURADA_MINIMA = 18
export const IDADE_PROCURADA_MAXIMA = 80
/** A altura vai de 140 a 200 cm; nas pontas, sem limite daquele lado. */
export const ALTURA_MINIMA = 140
export const ALTURA_MAXIMA = 200

export interface Faixa {
  readonly min: number
  readonly max: number
}

export interface Lugar {
  readonly uf: Uf
  /** Código de 7 dígitos do IBGE; sem ele, a UF inteira. */
  readonly municipio?: string
}

export interface Requisitos {
  /** `null` = a idade do Perfil ±5, até o visitante mexer. */
  readonly idade: Faixa | null
  /** `null` = o Brasil inteiro. */
  readonly lugar: Lugar | null
  /** "Não mora com companheiro(a)", ligado por padrão. */
  readonly companheiro: boolean
  /** O mínimo; `null` = qualquer. */
  readonly escolaridade: (typeof ESCOLARIDADES_MINIMAS)[number] | null
  readonly renda: (typeof RENDAS_MINIMAS)[number] | null
  /** Nenhuma marcada = qualquer uma. */
  readonly cores: ReadonlyArray<Cor>
  readonly religioes: ReadonlyArray<Religiao>
  readonly semFilhos: boolean
  readonly altura: Faixa
  readonly naoFuma: boolean
}

export const REQUISITOS_PADRAO: Requisitos = {
  idade: null,
  lugar: null,
  companheiro: true,
  escolaridade: null,
  renda: null,
  cores: [],
  religioes: [],
  semFilhos: false,
  altura: { min: ALTURA_MINIMA, max: ALTURA_MAXIMA },
  naoFuma: false,
}

/** O que o `procura` do Perfil decide na conta, num lugar só. */
export interface QuemSeProcura {
  /** Os códigos de sexo do Censo na conta: 0 homem, 1 mulher. */
  readonly sexos: ReadonlyArray<0 | 1>
  /** Quem se procura, para a frase. */
  readonly alvo: 'homens' | 'mulheres' | 'pessoas'
  /** "Sem filhos": o Censo só pergunta às mulheres. */
  readonly filhos: 'vale' | 'so-mulheres' | 'sem-dado'
}

const HOMENS: QuemSeProcura = { sexos: [0], alvo: 'homens', filhos: 'sem-dado' }
const MULHERES: QuemSeProcura = { sexos: [1], alvo: 'mulheres', filhos: 'vale' }
const PESSOAS: QuemSeProcura = { sexos: [0, 1], alvo: 'pessoas', filhos: 'so-mulheres' }

/** Sem dizer quem procura, a conta junta os dois, como em `ambos`. */
export const quemSeProcura = (perfil: Perfil | null): QuemSeProcura =>
  perfil?.procura === 'homens' ? HOMENS : perfil?.procura === 'mulheres' ? MULHERES : PESSOAS

/** A idade procurada: a escolhida, ou a do Perfil ±5, ou qualquer uma. */
export function idadeProcurada(perfil: Perfil | null, requisitos: Requisitos): Faixa {
  if (requisitos.idade) return requisitos.idade
  if (perfil?.idade === undefined) return { min: IDADE_PROCURADA_MINIMA, max: IDADE_PROCURADA_MAXIMA }
  return {
    min: Math.max(IDADE_PROCURADA_MINIMA, Math.min(IDADE_PROCURADA_MAXIMA, perfil.idade - 5)),
    max: Math.min(IDADE_PROCURADA_MAXIMA, perfil.idade + 5),
  }
}

const umDe = <T extends string>(lista: ReadonlyArray<T>, valor: unknown): T | undefined =>
  lista.find((item) => item === valor)

const variosDe = <T extends string>(lista: ReadonlyArray<T>, valor: unknown): T[] =>
  Array.isArray(valor) ? lista.filter((item) => valor.includes(item)) : []

function faixa(valor: unknown, min: number, max: number): Faixa | null {
  if (typeof valor !== 'object' || valor === null) return null
  const { min: a, max: b } = valor as Record<string, unknown>
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null
  const de = a as number
  const ate = b as number
  return de >= min && ate <= max && de <= ate ? { min: de, max: ate } : null
}

function lugar(valor: unknown): Lugar | null {
  if (typeof valor !== 'object' || valor === null) return null
  const bruto = valor as Record<string, unknown>
  const uf = UFS.find((u) => u.sigla === bruto.uf)
  if (!uf) return null
  const municipio = bruto.municipio
  return typeof municipio === 'string' && /^\d{7}$/.test(municipio) && municipio.startsWith(uf.codigo)
    ? { uf: uf.sigla, municipio }
    : { uf: uf.sigla }
}

/** Os Requisitos que o visitante pode ligar e soltar (a orientação vem do Perfil). */
export const REQUISITOS = [
  'idade', 'lugar', 'companheiro', 'escolaridade', 'renda', 'cor', 'religiao', 'filhos', 'altura', 'fumo',
] as const
export type RequisitoDoVisitante = (typeof REQUISITOS)[number]

/** Os Requisitos com aquele de volta ao padrão "qualquer" (o botão "soltar"). */
export function soltar(requisitos: Requisitos, requisito: RequisitoDoVisitante): Requisitos {
  const p = REQUISITOS_PADRAO
  const solto: Record<RequisitoDoVisitante, Partial<Requisitos>> = {
    idade: { idade: { min: IDADE_PROCURADA_MINIMA, max: IDADE_PROCURADA_MAXIMA } },
    lugar: { lugar: null },
    companheiro: { companheiro: false },
    escolaridade: { escolaridade: null },
    renda: { renda: null },
    cor: { cores: [] },
    religiao: { religioes: [] },
    filhos: { semFilhos: false },
    altura: { altura: p.altura },
    fumo: { naoFuma: false },
  }
  return { ...requisitos, ...solto[requisito] }
}

export const TITULO_DO_REQUISITO: Readonly<Record<RequisitoDoVisitante | 'orientacao', string>> = {
  idade: 'Idade',
  lugar: 'Onde',
  companheiro: 'Disponível',
  orientacao: 'Orientação',
  escolaridade: 'Escolaridade',
  renda: 'Renda',
  cor: 'Cor ou raça',
  religiao: 'Religião',
  filhos: 'Filhos',
  altura: 'Altura',
  fumo: 'Cigarro',
}

export const ROTULO_DA_ESCOLARIDADE: Readonly<Record<(typeof ESCOLARIDADES_MINIMAS)[number], string>> = {
  fundamental: 'fundamental completo',
  medio: 'médio completo',
  superior: 'superior completo',
}

export const ROTULO_DA_RENDA: Readonly<Record<(typeof RENDAS_MINIMAS)[number], string>> = {
  'ate-1': 'tem alguma renda',
  '1-2': 'mais de 1 salário mínimo',
  '2-5': 'mais de 2 salários mínimos',
  '5+': 'mais de 5 salários mínimos',
}

export const ROTULO_DA_COR: Readonly<Record<Cor, string>> = {
  branca: 'branca',
  preta: 'preta',
  parda: 'parda',
  amarela: 'amarela',
  indigena: 'indígena',
}

export const ROTULO_DA_RELIGIAO: Readonly<Record<Religiao, string>> = {
  catolica: 'católica',
  evangelica: 'evangélica',
  espirita: 'espírita',
  'umbanda-candomble': 'umbanda ou candomblé',
  'sem-religiao': 'sem religião',
  outra: 'outra',
}

const ou = (itens: ReadonlyArray<string>) =>
  itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} ou ${itens.at(-1)}`

export const nomeDaUf = (uf: Uf): string => UFS.find((u) => u.sigla === uf)?.nome ?? uf

/** O valor de um Requisito escrito como na frase: "25 a 35 anos", "pelo menos
 * superior completo", "qualquer religião". `municipio` é o nome, quando há. */
export function valorDoRequisito(
  requisito: RequisitoDoVisitante | 'orientacao',
  perfil: Perfil | null,
  r: Requisitos,
  municipio?: string,
): string {
  switch (requisito) {
    case 'idade': {
      const { min, max } = idadeProcurada(perfil, r)
      if (min <= IDADE_PROCURADA_MINIMA && max >= IDADE_PROCURADA_MAXIMA) return 'qualquer idade'
      return max >= IDADE_PROCURADA_MAXIMA ? `${min} anos ou mais` : `${min} a ${max} anos`
    }
    case 'lugar':
      if (!r.lugar) return 'Brasil inteiro'
      return r.lugar.municipio && municipio ? `${municipio} (${r.lugar.uf})` : nomeDaUf(r.lugar.uf)
    case 'companheiro':
      return r.companheiro ? 'não mora com companheiro(a)' : 'mora ou não com companheiro(a)'
    case 'orientacao':
      return perfil?.genero === 'homem' || perfil?.genero === 'mulher'
        ? `se interessa por ${perfil.genero === 'homem' ? 'homens' : 'mulheres'}`
        : 'qualquer orientação'
    case 'escolaridade':
      return r.escolaridade ? `pelo menos ${ROTULO_DA_ESCOLARIDADE[r.escolaridade]}` : 'qualquer escolaridade'
    case 'renda':
      return r.renda ? ROTULO_DA_RENDA[r.renda] : 'qualquer renda'
    case 'cor':
      return r.cores.length ? `cor ${ou(r.cores.map((c) => ROTULO_DA_COR[c]))}` : 'qualquer cor ou raça'
    case 'religiao':
      return r.religioes.length ? `religião ${ou(r.religioes.map((c) => ROTULO_DA_RELIGIAO[c]))}` : 'qualquer religião'
    case 'filhos':
      if (quemSeProcura(perfil).filhos === 'sem-dado') return 'sem dado para homens'
      return r.semFilhos ? 'sem filhos' : 'com ou sem filhos'
    case 'altura': {
      const { min, max } = r.altura
      if (min <= ALTURA_MINIMA && max >= ALTURA_MAXIMA) return 'qualquer altura'
      if (max >= ALTURA_MAXIMA) return `a partir de ${min} cm`
      if (min <= ALTURA_MINIMA) return `até ${max} cm`
      return `${min} a ${max} cm`
    }
    case 'fumo':
      return r.naoFuma ? 'não fuma' : 'fuma ou não'
  }
}

/** Lê os Requisitos de fonte não confiável (localStorage, link): o que não for
 * válido volta ao padrão. Nunca falha. */
export function lerRequisitos(valor: unknown): Requisitos {
  const bruto = (typeof valor === 'object' && valor !== null ? valor : {}) as Record<string, unknown>
  const p = REQUISITOS_PADRAO
  return {
    idade: faixa(bruto.idade, IDADE_PROCURADA_MINIMA, IDADE_PROCURADA_MAXIMA),
    lugar: lugar(bruto.lugar),
    companheiro: typeof bruto.companheiro === 'boolean' ? bruto.companheiro : p.companheiro,
    escolaridade: umDe(ESCOLARIDADES_MINIMAS, bruto.escolaridade) ?? null,
    renda: umDe(RENDAS_MINIMAS, bruto.renda) ?? null,
    cores: variosDe(CORES, bruto.cores),
    religioes: variosDe(RELIGIOES, bruto.religioes),
    semFilhos: bruto.semFilhos === true,
    altura: faixa(bruto.altura, ALTURA_MINIMA, ALTURA_MAXIMA) ?? p.altura,
    naoFuma: bruto.naoFuma === true,
  }
}
