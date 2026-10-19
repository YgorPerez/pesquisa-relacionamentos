// Prioridades vs. evidência (#9, #19): o visitante escolhe, na ordem, as três
// características que mais importam para ele, e a evidência põe cada uma num
// degrau por desfecho. Não há nota nem número de compatibilidade: só a
// prateleira em que cada uma cai e uma frase quando o topo 3 cai em "quase
// nada" ou "não sabemos". O estado é o topo 3 ordenado e o desfecho.
import type { GeneroDoPerfil } from './perfil.ts'

export const DESFECHOS = ['atracao', 'satisfacao', 'duracao'] as const
export type Desfecho = (typeof DESFECHOS)[number]

export const NOME_DO_DESFECHO: Record<Desfecho, string> = {
  atracao: 'Atração',
  satisfacao: 'Satisfação',
  duracao: 'Duração',
}

/** O desfecho de quem ainda não escolheu: é onde a Joel 2020 entra. */
export const DESFECHO_INICIAL: Desfecho = 'satisfacao'

/** O que a evidência permite dizer, em quatro degraus. */
export const DEGRAUS = [3, 2, 1, 0] as const
export type Degrau = (typeof DEGRAUS)[number]

export const NOME_DO_DEGRAU: Record<Degrau, string> = {
  3: 'pesa',
  2: 'pesa pouco',
  1: 'quase nada',
  0: 'não sabemos',
}

export const TAMANHO_DO_TOPO = 3

/** O mínimo que a regra lê de uma característica; a do pacote de conteúdo encaixa. */
export interface CaracteristicaComEvidencia {
  readonly id: string
  readonly nome: string
  readonly atracao: { readonly degrau: Degrau }
  readonly satisfacao: { readonly degrau: Degrau }
  readonly duracao: { readonly degrau: Degrau }
  /** A distância entre o que se declara e o que se escolhe, por gênero. */
  readonly vies?: { readonly todos?: string; readonly homem?: string; readonly mulher?: string }
}

export interface EstadoDasPrioridades {
  /** As ids escolhidas, na ordem: a primeira é a que mais importa. */
  readonly topo3: ReadonlyArray<string>
  readonly desfecho: Desfecho
}

export const degrau = (car: CaracteristicaComEvidencia, desfecho: Desfecho): Degrau => car[desfecho].degrau

/** Tocar numa característica: entra com o próximo número; se já está, sai e as
 * outras sobem. Com três, as outras não entram (o visitante troca tirando uma). */
export function alternarNoTopo3(topo3: ReadonlyArray<string>, id: string): ReadonlyArray<string> {
  if (topo3.includes(id)) return topo3.filter((outra) => outra !== id)
  return topo3.length >= TAMANHO_DO_TOPO ? topo3 : [...topo3, id]
}

export interface Prateleira {
  readonly degrau: Degrau
  readonly nome: string
  readonly ids: ReadonlyArray<string>
}

/** As quatro prateleiras do desfecho, de "pesa" a "não sabemos". Em cada uma,
 * as escolhidas vêm primeiro, na ordem do topo 3, e as outras na ordem dos dados. */
export function prateleiras(
  caracteristicas: ReadonlyArray<CaracteristicaComEvidencia>,
  desfecho: Desfecho,
  topo3: ReadonlyArray<string>,
): ReadonlyArray<Prateleira> {
  const posicao = (id: string) => {
    const i = topo3.indexOf(id)
    return i < 0 ? TAMANHO_DO_TOPO : i
  }
  return DEGRAUS.map((n) => ({
    degrau: n,
    nome: NOME_DO_DEGRAU[n],
    ids: caracteristicas
      .filter((c) => degrau(c, desfecho) === n)
      .map((c) => c.id)
      .sort((a, b) => posicao(a) - posicao(b)),
  }))
}

const emLista = (nomes: ReadonlyArray<string>): string =>
  nomes.length < 2 ? (nomes[0] ?? '') : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`

/** A frase do alerta: o que do topo 3 cai em "quase nada" ou em "não sabemos"
 * no desfecho. Sem número e sem julgamento; `null` quando não há o que dizer. */
export function alertaDoTopo3(
  caracteristicas: ReadonlyArray<CaracteristicaComEvidencia>,
  topo3: ReadonlyArray<string>,
  desfecho: Desfecho,
): string | null {
  const escolhidas = topo3.flatMap((id) => caracteristicas.filter((c) => c.id === id))
  const nomes = (n: Degrau) => escolhidas.filter((c) => degrau(c, desfecho) === n).map((c) => c.nome.toLowerCase())
  const quaseNada = nomes(1)
  const semDado = nomes(0)
  const partes = [
    quaseNada.length > 0 && `${emLista(quaseNada)} ${quaseNada.length > 1 ? 'pesam' : 'pesa'} quase nada`,
    semDado.length > 0 && `para ${emLista(semDado)} não há boa evidência`,
  ].filter(Boolean)
  if (partes.length === 0) return null
  return `No seu topo 3, para ${NOME_DO_DESFECHO[desfecho].toLowerCase()}: ${partes.join('; ')}.`
}

/** A nota de viés que vale para o gênero do Perfil. A de um gênero só não
 * aparece para quem não disse o gênero ou disse "outro". */
export function viesPara(car: CaracteristicaComEvidencia, genero: GeneroDoPerfil | undefined): string | null {
  const vies = car.vies
  if (!vies) return null
  if (genero === 'homem' || genero === 'mulher') return vies[genero] ?? vies.todos ?? null
  return vies.todos ?? null
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Lê o estado de fonte não confiável (localStorage, query do link do #34):
 * fica o que é válido. `ids`, quando dada, limita o topo 3 às características
 * que existem nos dados. */
export function lerPrioridades(valor: unknown, ids?: ReadonlyArray<string>): EstadoDasPrioridades | null {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return null
  const bruto = valor as Record<string, unknown>
  const lista = Array.isArray(bruto.topo3) ? bruto.topo3 : []
  const topo3: string[] = []
  for (const id of lista) {
    if (topo3.length >= TAMANHO_DO_TOPO) break
    if (typeof id !== 'string' || !SLUG.test(id) || topo3.includes(id)) continue
    if (ids && !ids.includes(id)) continue
    topo3.push(id)
  }
  const desfecho = DESFECHOS.find((d) => d === bruto.desfecho) ?? DESFECHO_INICIAL
  return { topo3, desfecho }
}
