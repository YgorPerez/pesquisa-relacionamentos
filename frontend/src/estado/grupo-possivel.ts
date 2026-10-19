// O Grupo possível no navegador: os Requisitos salvos e a conta.
//
// Os Requisitos ficam em `localStorage['tem-estudo:grupo-possivel']`, no
// formato `Requisitos` de `@tem-estudo/regras/requisitos` (JSON puro, lido
// por `lerRequisitos`). `null` quer dizer que o visitante nunca mexeu: o
// cartão do B5 (#32) mostra o número do Brasil, e o link (#34) leva só o
// Perfil. A conta roda aqui, sobre os pacotes por lugar que o build grava
// (`vite/grupo-possivel.ts`): nada do que o visitante pede sai do aparelho.
import { abrirPacote, type DadosDoLugar, type LugarDoPacote } from '@tem-estudo/regras/grupo-possivel-dados'
import { estimarGrupo, type Estimativa } from '@tem-estudo/regras/grupo-possivel'
import type { Perfil } from '@tem-estudo/regras/perfil'
import { lerRequisitos, REQUISITOS_PADRAO, type Requisitos } from '@tem-estudo/regras/requisitos'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import grupoPossivel from 'virtual:grupo-possivel'
import { armazenado, useArmazenado } from './armazenado'

export const requisitosSalvos = armazenado<Requisitos>('grupo-possivel', lerRequisitos)

/** Os Requisitos salvos; `null` se o visitante nunca mexeu (e no servidor). */
export const useRequisitosSalvos = (): Requisitos | null => useArmazenado(requisitosSalvos)

/** Salva os Requisitos (validados como quem lê); `null` apaga. */
export const gravarRequisitos = (requisitos: Requisitos | null) =>
  requisitosSalvos.gravar(requisitos && lerRequisitos(requisitos))

/** Os lugares com dados: o Brasil e as UFs que o build empacotou. */
export const LUGARES_COM_DADOS = grupoPossivel.lugares

/** A conta de quem não disse nada (Brasil, sem Perfil), já feita no build. */
export const ESTIMATIVA_DE_EXEMPLO: Estimativa = grupoPossivel.exemplo

// --- pacotes -----------------------------------------------------------------
// Um pedido por lugar, guardado: voltar a uma UF já baixada não pede de novo.

const abertos = new Map<LugarDoPacote, DadosDoLugar>()
const pedidos = new Map<LugarDoPacote, Promise<void>>()
const falhas = new Set<LugarDoPacote>()
const avisos = new Set<() => void>()
let versao = 0
const avisar = () => {
  versao++
  avisos.forEach((aviso) => aviso())
}

function pedir(lugar: LugarDoPacote) {
  if (abertos.has(lugar) || pedidos.has(lugar)) return
  falhas.delete(lugar)
  const pedido = fetch(`${grupoPossivel.base}/${lugar}.json`)
    .then((resposta) => {
      if (!resposta.ok) throw new Error(`pacote ${lugar}: ${resposta.status}`)
      return resposta.json()
    })
    .then((pacote) => {
      abertos.set(lugar, abrirPacote(pacote))
    })
    .catch(() => {
      falhas.add(lugar)
    })
    .finally(() => {
      pedidos.delete(lugar)
      avisar()
    })
  pedidos.set(lugar, pedido)
  avisar()
}

const assinar = (aviso: () => void) => {
  avisos.add(aviso)
  return () => avisos.delete(aviso)
}

export interface ContaNoNavegador {
  /** A estimativa dos Requisitos pedidos ou, enquanto os dados chegam, a última que deu para fazer. */
  readonly estimativa: Estimativa
  /** A estimativa ainda não é a dos Requisitos pedidos. */
  readonly carregando: boolean
  /** O pacote não chegou (sem rede?). `tentar` pede de novo. */
  readonly falhou: boolean
  readonly tentar: () => void
  /** Os dados da UF escolhida, para a lista de municípios. */
  readonly uf: DadosDoLugar | undefined
}

/** A conta do Perfil e dos Requisitos, refeita a cada mudança. */
export function useGrupoPossivel(perfil: Perfil | null, salvos: Requisitos | null): ContaNoNavegador {
  const requisitos = salvos ?? REQUISITOS_PADRAO
  const uf = requisitos.lugar?.uf
  const precisa: LugarDoPacote[] = uf ? ['BR', uf] : ['BR']
  useSyncExternalStore(assinar, () => versao, () => 0)

  // Quem nunca disse nada vê a conta feita no build, sem baixar nada.
  const deExemplo = perfil === null && salvos === null

  useEffect(() => {
    if (!deExemplo) for (const lugar of precisa) pedir(lugar)
  })

  const brasil = abertos.get('BR')
  const daUf = uf ? abertos.get(uf) : undefined
  const prontos = brasil && (!uf || daUf)
  const calculada = useMemo(() => {
    if (!prontos || deExemplo) return null
    const dados = { brasil, ...(daUf && { uf: daUf }) }
    try {
      return estimarGrupo({ perfil, requisitos }, dados)
    } catch {
      // Um município salvo que os dados de agora não têm: vale a UF inteira.
      const naUf = { ...requisitos, lugar: requisitos.lugar && { uf: requisitos.lugar.uf } }
      return estimarGrupo({ perfil, requisitos: naUf }, dados)
    }
  }, [prontos, deExemplo, perfil, requisitos, brasil, daUf])
  const ultima = useRef<Estimativa>(ESTIMATIVA_DE_EXEMPLO)
  if (calculada) ultima.current = calculada
  if (deExemplo) ultima.current = ESTIMATIVA_DE_EXEMPLO

  return {
    estimativa: ultima.current,
    carregando: !deExemplo && !calculada,
    falhou: precisa.some((lugar) => falhas.has(lugar)),
    tentar: () => precisa.forEach(pedir),
    uf: daUf,
  }
}
