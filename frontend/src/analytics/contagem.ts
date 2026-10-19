// A contagem de uso (#21, #35; ADR 0001): visitas por caminho e os eventos
// `ajudou/…`, `ficha/…` e `calculadora/…`. Nenhum leva o Perfil, nem se ele
// foi preenchido: quem chama só passa o nome do evento.
//
// Não conta quando o navegador pede (GPC ou Do Not Track) nem quando o
// visitante desliga a chave do rodapé ou da página de privacidade. Nesses
// casos o envio (`goatcounter.ts`) nem é importado. A preferência fica no
// localStorage e nada do link a lê, então abrir um link não a desfaz.
import { useEffect, useSyncExternalStore } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { armazenado, PREFIXO } from '#/estado/armazenado'
import { EVENTOS, type CalculadoraContada, type Evento } from './eventos'

const ENDPOINT = 'https://stats.temestudo.com/count'

/** O build do e2e conta também em localhost, onde os envios são
 * interceptados. Fora dele, o `vite dev` e o `pnpm start` locais não contam. */
const CONTA_EM_LOCALHOST = import.meta.env.VITE_CONTAR_EM_LOCALHOST === '1'

interface SinaisDoNavegador {
  readonly globalPrivacyControl?: boolean
  readonly doNotTrack?: string | null
}

/** GPC ligado ou DNT "1"/"yes" (o valor que navegadores antigos usavam). */
export function navegadorPedeParaNaoContar(navegador: SinaisDoNavegador): boolean {
  if (navegador.globalPrivacyControl === true) return true
  return navegador.doNotTrack === '1' || navegador.doNotTrack === 'yes'
}

/** `true` quando o visitante desligou a chave; nada salvo = conta. */
const naoContarSalvo = armazenado<true>('nao-contar', (bruto) => (bruto === true ? true : null))

export type EstadoDaContagem = 'conta' | 'desligada' | 'navegador'

function estadoAgora(): EstadoDaContagem {
  if (navegadorPedeParaNaoContar(navigator as SinaisDoNavegador)) return 'navegador'
  return naoContarSalvo.ler() ? 'desligada' : 'conta'
}

const local = () => /^(localhost|127\.|\[::1\])/.test(location.hostname)

function podeContar(): boolean {
  if (typeof window === 'undefined') return false
  if (local() && !CONTA_EM_LOCALHOST) return false
  return estadoAgora() === 'conta'
}

/** A chave: liga ou desliga a contagem neste navegador. */
export function gravarContagem(contar: boolean) {
  naoContarSalvo.gravar(contar ? null : true)
}

/** O estado da chave; `null` no servidor e na hidratação. */
export function useEstadoDaContagem(): EstadoDaContagem | null {
  return useSyncExternalStore(naoContarSalvo.assinar, estadoAgora, () => null)
}

let primeira = true

function mandar(caminho: string, evento: boolean) {
  if (!podeContar()) return
  const referencia = !evento && primeira ? document.referrer : undefined
  if (!evento) primeira = false
  void import('./goatcounter').then(({ enviar }) => {
    // A chave pode ter sido desligada enquanto o arquivo chegava.
    if (podeContar()) enviar(ENDPOINT, { caminho, evento, referencia })
  })
}

/** Um evento sem valores, de `EVENTOS` (`eventos.ts`). */
export const contarEvento = (evento: Evento) => mandar(evento, true)

/** O mesmo evento uma vez por visita (a sessão da aba). */
function contarUmaVezPorVisita(evento: Evento) {
  const chave = `${PREFIXO}contou:${evento}`
  try {
    if (sessionStorage.getItem(chave)) return
    sessionStorage.setItem(chave, '1')
  } catch {
    // Sem sessionStorage, conta a cada vez que a página pedir.
  }
  contarEvento(evento)
}

/** O visitante mexeu na calculadora: conta uma vez por visita. */
export const contarUsoDaCalculadora = (calculadora: CalculadoraContada) =>
  contarUmaVezPorVisita(EVENTOS.calculadora(calculadora))

/** Conta cada página que o router mostra, pelo caminho sem query. Na raiz.
 * Só a troca de caminho conta: religar a chave não manda a página em que se
 * está, e a contagem volta na próxima. */
export function useContarVisitas() {
  const caminho = useRouterState({ select: (s) => s.resolvedLocation?.pathname })
  useEffect(() => {
    if (caminho) mandar(caminho, false)
  }, [caminho])
}

/** No Guia: tocar numa Ficha (o título na lista ou um link no texto) conta
 * `ficha/<guia>/<ficha>`. O número de referência só circula a Ficha na
 * página, e não conta. */
export function useContarFichasAbertas(guia: string) {
  useEffect(() => {
    const aoClicar = (evento: MouseEvent) => {
      const link = (evento.target as Element | null)?.closest?.('main a[href^="/estudos/"]')
      const ficha = link?.getAttribute('href')?.match(/^\/estudos\/([a-z0-9-]+)$/)?.[1]
      if (ficha) contarEvento(EVENTOS.fichaAberta(guia, ficha))
    }
    document.addEventListener('click', aoClicar, true)
    return () => document.removeEventListener('click', aoClicar, true)
  }, [guia])
}
