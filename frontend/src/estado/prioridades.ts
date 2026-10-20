// O topo 3 e o desfecho de Prioridades, salvos no navegador e lidos pela
// página `/prioridades` e pelo cartão do Guia B1. O valor é JSON puro
// (`EstadoDasPrioridades`), o mesmo que o link do #34 vai levar.
import {
  INITIAL_OUTCOME,
  readPriorities,
  type PrioritiesState,
} from '@tem-estudo/rules/priorities'
import { armazenado, useArmazenado } from './armazenado'

const prioridadesSalvas = armazenado<PrioritiesState>('prioridades', (bruto) =>
  readPriorities(bruto),
)

const SEM_PRIORIDADES: PrioritiesState = {
  topo3: [],
  desfecho: INITIAL_OUTCOME,
}

/** O estado salvo, só com as características que existem nos dados. Antes de
 * hidratar (e no servidor), o estado vazio. */
export function usePrioridades(ids: ReadonlyArray<string>): PrioritiesState {
  const salvo = useArmazenado(prioridadesSalvas)
  return (salvo && readPriorities(salvo, ids)) ?? SEM_PRIORIDADES
}

/** Salva (passa pela mesma validação de quem lê); `null` apaga. */
export const gravarPrioridades = (estado: PrioritiesState | null) =>
  prioridadesSalvas.gravar(estado && readPriorities(estado))
