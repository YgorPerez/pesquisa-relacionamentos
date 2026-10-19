// O topo 3 e o desfecho de Prioridades, salvos no navegador e lidos pela
// página `/prioridades` e pelo cartão do Guia B1. O valor é JSON puro
// (`EstadoDasPrioridades`), o mesmo que o link do #34 vai levar.
import {
  DESFECHO_INICIAL,
  lerPrioridades,
  type EstadoDasPrioridades,
} from '@tem-estudo/regras/prioridades'
import { armazenado, useArmazenado } from './armazenado'

export const prioridadesSalvas = armazenado<EstadoDasPrioridades>('prioridades', (bruto) => lerPrioridades(bruto))

export const SEM_PRIORIDADES: EstadoDasPrioridades = { topo3: [], desfecho: DESFECHO_INICIAL }

/** O estado salvo, só com as características que existem nos dados. Antes de
 * hidratar (e no servidor), o estado vazio. */
export function usePrioridades(ids: ReadonlyArray<string>): EstadoDasPrioridades {
  const salvo = useArmazenado(prioridadesSalvas)
  return (salvo && lerPrioridades(salvo, ids)) ?? SEM_PRIORIDADES
}

/** Salva (passa pela mesma validação de quem lê); `null` apaga. */
export const gravarPrioridades = (estado: EstadoDasPrioridades | null) =>
  prioridadesSalvas.gravar(estado && lerPrioridades(estado))
