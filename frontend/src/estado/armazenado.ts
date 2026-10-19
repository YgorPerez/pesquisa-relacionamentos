// Estado que fica só no navegador (spec, "Estado no link"; story 68): o
// Perfil, e depois os Requisitos, o topo 3 e o desfecho das calculadoras.
// Cada parte tem a sua chave no localStorage e um leitor que valida o que
// achar lá, porque o armazenamento pode ter lixo de outra versão.
//
// No servidor, e na hidratação, o valor é sempre `null`: a página sai igual
// para todo mundo e o navegador aplica o estado salvo logo depois.
import { useSyncExternalStore } from 'react'

export interface Armazenado<T> {
  /** O valor salvo, já validado; `null` se não há nada (ou no servidor). */
  readonly ler: () => T | null
  /** Salva e avisa quem usa; `null` apaga. */
  readonly gravar: (valor: T | null) => void
  readonly assinar: (aviso: () => void) => () => void
}

/** O começo de toda chave do site no localStorage e no sessionStorage. */
export const PREFIXO = 'tem-estudo:'

function armazenamento(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    // Navegador com o armazenamento bloqueado: o site funciona sem salvar.
    return null
  }
}

/** Uma parte do estado local, em `tem-estudo:<chave>`. `validar` recebe o JSON
 * cru e devolve o valor ou `null`. */
export function armazenado<T>(chave: string, validar: (bruto: unknown) => T | null): Armazenado<T> {
  const nome = PREFIXO + chave
  const avisos = new Set<() => void>()
  // O `useSyncExternalStore` compara por referência: guarde o último lido.
  let cru: string | null | undefined
  let valor: T | null = null

  const ler = (): T | null => {
    let atual: string | null = null
    try {
      atual = armazenamento()?.getItem(nome) ?? null
    } catch {
      atual = null
    }
    if (atual !== cru) {
      cru = atual
      try {
        valor = atual === null ? null : validar(JSON.parse(atual))
      } catch {
        valor = null
      }
    }
    return valor
  }

  const avisar = () => avisos.forEach((aviso) => aviso())

  const gravar = (novo: T | null) => {
    try {
      const local = armazenamento()
      if (novo === null) local?.removeItem(nome)
      else local?.setItem(nome, JSON.stringify(novo))
    } catch {
      // Sem espaço ou bloqueado: o valor some ao recarregar, e só.
    }
    avisar()
  }

  // Outra aba mudou a mesma chave.
  const aoMudarEmOutraAba = (evento: StorageEvent) => {
    if (evento.key === nome || evento.key === null) avisar()
  }

  const assinar = (aviso: () => void) => {
    avisos.add(aviso)
    if (avisos.size === 1) window.addEventListener('storage', aoMudarEmOutraAba)
    return () => {
      avisos.delete(aviso)
      if (avisos.size === 0) window.removeEventListener('storage', aoMudarEmOutraAba)
    }
  }

  return { ler, gravar, assinar }
}

/** O valor salvo num componente React; `null` no servidor e na hidratação. */
export function useArmazenado<T>(parte: Armazenado<T>): T | null {
  return useSyncExternalStore(parte.assinar, parte.ler, () => null)
}
