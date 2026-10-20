// Os pacotes do Grupo possível por lugar, que o build grava
// (`vite/grupo-possivel.ts`) e o navegador baixa. Um pedido por lugar,
// guardado: voltar a uma UF já baixada não pede de novo, e dois cartões que
// pedem o mesmo lugar dividem o pedido. A conta (`grupo-possivel.ts`) só lê
// daqui.
import {
  abrirPacote,
  type DadosDoLugar,
  type LugarDoPacote,
} from '@tem-estudo/rules/possible-group-data'
import { useSyncExternalStore } from 'react'
import grupoPossivel from 'virtual:grupo-possivel'

const abertos = new Map<LugarDoPacote, DadosDoLugar>()
const pedidos = new Map<LugarDoPacote, Promise<void>>()
const falhas = new Set<LugarDoPacote>()
const avisos = new Set<() => void>()
const avisar = () => {
  avisos.forEach((aviso) => aviso())
}

/** Pede o pacote do lugar, se ele ainda não chegou nem está a caminho. O que
 * falhou só se pede `deNovo` (o "Tentar de novo" da página): a página pede a
 * cada render, e sem rede cada falha pedia outra vez, sem parar, e o aviso
 * da falha piscava. */
export function pedirPacote(lugar: LugarDoPacote, deNovo = false) {
  if (abertos.has(lugar) || pedidos.has(lugar)) return
  if (falhas.has(lugar) && !deNovo) return
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
const assinar = (aviso: () => void) => {
  avisos.add(aviso)
  return () => avisos.delete(aviso)
}

/** Os dados do lugar, quando o pacote chega, e se o pedido falhou (sem
 * rede?). Lidos como snapshot do store, e não direto do `Map` no render: o
 * React Compiler guarda o que o render calcula, e só um valor que vem de
 * hook avisa que mudou. `undefined` não pede nada. */
export function usePacote(lugar: LugarDoPacote | undefined): {
  dados: DadosDoLugar | undefined
  falhou: boolean
} {
  const dados = useSyncExternalStore(
    assinar,
    () => (lugar ? abertos.get(lugar) : undefined),
    () => undefined,
  )
  const falhou = useSyncExternalStore(
    assinar,
    () => (lugar ? falhas.has(lugar) : false),
    () => false,
  )
  return { dados, falhou }
}
