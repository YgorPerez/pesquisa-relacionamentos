// O link recebido (#34, stories 64–65): a calculadora aberta com a query de
// "Copiar link" grava o estado do link no lugar do salvo e tira a query da
// barra, para a URL voltar a ficar limpa (story 68) e recarregar não aplicar
// o link de novo. Só a query de link (com `v`) sai; outra fica.
//
// Cada calculadora grava as partes dela (`gravarLink`). A opção de não ser
// contado (#35) não é parte de nenhuma.
import { useRouter } from '@tanstack/react-router'
import {
  isLink,
  readLink,
  type LinkCalculator,
  type LinkState,
} from '@tem-estudo/rules/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { gravarRequisitos } from './grupo-possivel'
import { gravarPerfil, perfilSalvo } from './perfil'
import { gravarPrioridades } from './prioridades'

/** Grava no aparelho, no lugar do salvo, o estado que veio no link. */
function gravarLink(estado: LinkState) {
  if (estado.calculator === 'grupo-possivel') {
    gravarPerfil(estado.profile)
    gravarRequisitos(estado.requirements)
    return
  }
  // O link das Prioridades leva só o gênero: quem se procura e a idade
  // salvos ficam.
  if (estado.gender)
    gravarPerfil({ ...perfilSalvo.ler(), genero: estado.gender })
  gravarPrioridades(estado.priorities)
}

/** O link aplicado nesta página. Ele nasce fora do React, da barra lida
 * depois de hidratar, e por isso é um store: o efeito o marca e o
 * `useSyncExternalStore` o lê, sem um `setState` dentro do efeito. */
function criarRecebido() {
  let recebido: LinkState | null = null
  const ouvintes = new Set<() => void>()
  return {
    ler: () => recebido,
    assinar: (ouvinte: () => void) => {
      ouvintes.add(ouvinte)
      return () => {
        ouvintes.delete(ouvinte)
      }
    },
    marcar: (estado: LinkState) => {
      recebido = estado
      for (const ouvinte of ouvintes) ouvinte()
    },
  }
}

/** Aplica o link da barra uma vez, depois de hidratar, e devolve o estado
 * que ele gravou (`null` sem link, ou com um link inválido), para a página
 * avisar. `ids` são as características que as Prioridades conhecem. */
export function useLinkRecebido(
  calculadora: LinkCalculator,
  ids?: ReadonlyArray<string>,
): LinkState | null {
  const router = useRouter()
  const [aplicado] = useState(criarRecebido)
  const recebido = useSyncExternalStore(
    aplicado.assinar,
    aplicado.ler,
    () => null,
  )
  const feito = useRef(false)

  useEffect(() => {
    if (feito.current) return
    feito.current = true
    const { pathname, search, hash } = window.location
    if (!isLink(search)) return
    const estado = readLink(calculadora, search, ids)
    if (estado?.calculator === calculadora) {
      gravarLink(estado)
      aplicado.marcar(estado)
    }
    router.history.replace(`${pathname}${hash}`)
  }, [calculadora, ids, router, aplicado])

  return recebido
}
