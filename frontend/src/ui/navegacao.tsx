// A navegação do Guia (#16, #28): a referência que circula a Ficha e o
// "voltar ao texto", o "Voltar para <Pergunta>" de quem veio de outro Guia e
// o ponto da leitura (rolagem e seções abertas) guardado no histórico.
import { useRouter, useRouterState } from '@tanstack/react-router'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { laco } from './laco'

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** A Pergunta do Guia de onde a navegação veio. */
    de?: string
    /** Onde o leitor estava quando saiu desta entrada do histórico. */
    ponto?: { scroll: number; abertas: ReadonlyArray<string> }
  }
}

const PREFIXO_DA_ANCORA = '#ficha-'

export interface FichaCirculada {
  readonly slug: string
  /** Muda a cada toque, para o laço ser desenhado de novo. */
  readonly vez: number
}

/** Liga os números de referência da página às Fichas citadas. Tocar um
 * número circula a Ficha; `voltarAoTexto` devolve o leitor ao número. O link
 * `#ficha-<slug>` continua valendo sem JavaScript. */
export function useReferencias(pagina: string) {
  const [circulada, setCirculada] = useState<FichaCirculada | null>(null)
  const origem = useRef<HTMLElement | null>(null)
  // Outra página começa sem Ficha circulada. Trocado durante o render, e não
  // num efeito, para a página nova não pintar uma vez com o laço da velha.
  // O `origem` velho não precisa sair: só um toque novo mostra o "voltar ao
  // texto", e o toque grava o dele.
  const [paginaVista, setPaginaVista] = useState(pagina)
  if (paginaVista !== pagina) {
    setPaginaVista(pagina)
    setCirculada(null)
  }

  useEffect(() => {
    const tocar = (evento: MouseEvent) => {
      if (evento.defaultPrevented || evento.button !== 0) return
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey)
        return
      const ref = (evento.target as Element | null)?.closest?.('main a.ref')
      const href = ref?.getAttribute('href')
      if (!(ref instanceof HTMLElement) || !href?.startsWith(PREFIXO_DA_ANCORA))
        return
      evento.preventDefault()
      origem.current = ref
      const slug = href.slice(PREFIXO_DA_ANCORA.length)
      setCirculada((antes) => ({ slug, vez: (antes?.vez ?? 0) + 1 }))
    }
    document.addEventListener('click', tocar)
    return () => document.removeEventListener('click', tocar)
  }, [])

  const voltarAoTexto = useCallback(() => {
    setCirculada(null)
    const ref = origem.current
    if (!ref?.isConnected) return
    ref.scrollIntoView({ block: 'center', behavior: rolagem() })
    ref.focus({ preventScroll: true })
  }, [])

  return { circulada, voltarAoTexto }
}

const rolagem = (): ScrollBehavior =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

/** O laço e a seta curta em volta da Ficha. Montado dentro do `li` da Ficha:
 * mede o tamanho real dela, redesenha o laço, rola até ela e põe o foco. */
export function LacoDaFicha() {
  const svg = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const desenho = svg.current
    const ficha = desenho?.parentElement
    if (!desenho || !ficha) return
    const largura = ficha.offsetWidth + 20
    const altura = ficha.offsetHeight + 20
    desenho.setAttribute('viewBox', `0 0 ${largura} ${altura}`)
    desenho.querySelector('path')?.setAttribute('d', laco(largura, altura))
    ficha.scrollIntoView({ block: 'center', behavior: rolagem() })
    ficha.focus({ preventScroll: true })
  }, [])

  return (
    <>
      <svg ref={svg} className="laco" aria-hidden="true">
        <path pathLength={1} />
      </svg>
      <svg
        className="seta-laco"
        width="34"
        height="34"
        viewBox="0 0 34 34"
        aria-hidden="true"
      >
        <path pathLength={1} d="M3 3c4 12 10 20 22 26M25 29l-9 1M25 29l-2-9" />
      </svg>
    </>
  )
}

function salvarPonto() {
  const abertas = [...document.querySelectorAll('main details[open][id]')].map(
    (d) => d.id,
  )
  window.history.replaceState(
    { ...window.history.state, ponto: { scroll: scrollY, abertas } },
    '',
  )
}

/** Guarda na entrada do histórico a rolagem e as seções abertas antes de
 * sair da página, e as devolve quando o leitor volta a ela. */
export function usePontoNoHistorico() {
  // A entrada já carregada e desenhada, não a que está carregando.
  const entrada = useRouterState({
    select: (s) => s.resolvedLocation?.state.__TSR_key,
  })

  useEffect(() => {
    const sair = (evento: MouseEvent) => {
      if (
        evento.button !== 0 ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.altKey
      )
        return
      const link = (evento.target as Element | null)?.closest?.('a[href]')
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank')
        return
      const destino = new URL(link.href)
      if (
        destino.origin !== location.origin ||
        destino.pathname === location.pathname
      )
        return
      salvarPonto()
    }
    // Na captura: antes de o router empilhar a página nova.
    document.addEventListener('click', sair, true)
    return () => document.removeEventListener('click', sair, true)
  }, [])

  useLayoutEffect(() => {
    // Só a entrada que o router já desenhou: a barra pode estar numa que
    // ainda carrega.
    if (window.history.state?.__TSR_key !== entrada) return
    const ponto = window.history.state?.ponto as
      | { scroll: number; abertas: string[] }
      | undefined
    if (!ponto) return
    for (const id of ponto.abertas) {
      const secao = document.getElementById(id)
      if (secao instanceof HTMLDetailsElement) secao.open = true
    }
    // Depois da restauração do router, que mede a página com as seções fechadas.
    const quadro = requestAnimationFrame(() =>
      window.scrollTo({ top: ponto.scroll, behavior: 'instant' }),
    )
    return () => cancelAnimationFrame(quadro)
  }, [entrada])
}

const SetaVoltar = () => (
  <svg
    width="22"
    height="14"
    viewBox="0 0 22 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 7.4C14 6.6 8 7.2 2.6 7M7 2.4 2.4 7.1 7.2 11.6" />
  </svg>
)

/** Estar no navegador não muda depois de hidratar: ninguém a avisar. */
const semAvisos = () => () => {}

/** "Voltar para <Pergunta>", quando a página veio de outro Guia. Faz o mesmo
 * que o voltar do navegador. */
export function VoltarParaGuia() {
  const router = useRouter()
  const de = useRouterState({ select: (s) => s.location.state.de })
  // O servidor não conhece o histórico: o botão só aparece depois da hidratação.
  // A hidratação lê o `false` do servidor, e o render seguinte o `true`.
  const noNavegador = useSyncExternalStore(
    semAvisos,
    () => true,
    () => false,
  )
  if (!noNavegador || !de) return null

  return (
    <button
      type="button"
      className="voltar voltar-guia"
      onClick={() => {
        salvarPonto()
        router.history.back()
      }}
    >
      <SetaVoltar />
      Voltar para {de}
    </button>
  )
}
