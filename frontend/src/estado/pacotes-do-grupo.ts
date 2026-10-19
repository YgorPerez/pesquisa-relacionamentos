// Os pacotes do Grupo possível por lugar, que o build grava
// (`vite/grupo-possivel.ts`) e o navegador baixa. Um pedido por lugar,
// guardado: voltar a uma UF já baixada não pede de novo, e dois cartões que
// pedem o mesmo lugar dividem o pedido. A conta (`grupo-possivel.ts`) só lê
// daqui.
import {
  abrirPacote,
  type DadosDoLugar,
  type LugarDoPacote,
} from '@tem-estudo/regras/grupo-possivel-dados'
import { useSyncExternalStore } from 'react'
import grupoPossivel from 'virtual:grupo-possivel'

const abertos = new Map<LugarDoPacote, DadosDoLugar>()
const pedidos = new Map<LugarDoPacote, Promise<void>>()
const falhas = new Set<LugarDoPacote>()
const avisos = new Set<() => void>()
let versao = 0
const avisar = () => {
  versao++
  avisos.forEach((aviso) => aviso())
}

/** Pede o pacote do lugar, se ele ainda não chegou nem está a caminho. */
export function pedirPacote(lugar: LugarDoPacote) {
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

/** Os dados do lugar, se o pacote já chegou. */
export const pacoteAberto = (lugar: LugarDoPacote) => abertos.get(lugar)

/** O pacote do lugar não chegou (sem rede?). */
export const pacoteFalhou = (lugar: LugarDoPacote) => falhas.has(lugar)

const assinar = (aviso: () => void) => {
  avisos.add(aviso)
  return () => avisos.delete(aviso)
}

/** Desenha de novo quando um pacote chega ou falha. */
export function useMudancaDosPacotes() {
  useSyncExternalStore(
    assinar,
    () => versao,
    () => 0,
  )
}
