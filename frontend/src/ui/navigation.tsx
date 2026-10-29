// The Guide's navigation (#16, #28): the reference that circles the Fact
// sheet and the "voltar ao texto", the "Voltar para <Guia>" for whoever
// came from another Guide, and the reading point (scroll and open sections)
// kept in the history.
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { cn } from '@/platform/cn'
import { Button } from '@/ui/shadcn/button'
import { scrollBehavior } from './loop'
import { TERM_LINK } from './term-popover'

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** The title of the Guide the navigation came from. */
    from?: string
    /** The reader came to a Glossário entry from a text (#358): the page
     * circles it and offers "voltar ao texto". */
    fromText?: boolean
    /** Where the reader was when they left this history entry. */
    readingPoint?: { scroll: number; open: ReadonlyArray<string> }
  }
}

const ANCHOR_PREFIX = '#ficha-'

export interface CircledFactSheet {
  readonly slug: string
  /** Changes on each tap, so the loop is drawn again. */
  readonly tapCount: number
}

/** Links the page's reference numbers to the cited Fact sheets. Tapping a
 * number circles the Fact sheet; `backToText` takes the reader back to the
 * number. The `#ficha-<slug>` link still works without JavaScript. */
export function useReferences(page: string) {
  const [circled, setCircled] = useState<CircledFactSheet | null>(null)
  const origin = useRef<HTMLElement | null>(null)
  // Another page starts with no circled Fact sheet. Swapped during render,
  // and not in an effect, so the new page does not paint once with the old
  // one's loop. The old `origin` need not go: only a new tap shows the
  // "voltar ao texto", and the tap records its own.
  const [seenPage, setSeenPage] = useState(page)
  if (seenPage !== page) {
    setSeenPage(page)
    setCircled(null)
  }

  useEffect(() => {
    const onTap = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      const ref = (event.target as Element | null)?.closest?.('main a.ref')
      const href = ref?.getAttribute('href')
      if (!(ref instanceof HTMLElement) || !href?.startsWith(ANCHOR_PREFIX))
        return
      event.preventDefault()
      origin.current = ref
      const slug = href.slice(ANCHOR_PREFIX.length)
      setCircled((before) => ({ slug, tapCount: (before?.tapCount ?? 0) + 1 }))
    }
    document.addEventListener('click', onTap)
    return () => document.removeEventListener('click', onTap)
  }, [])

  const backToText = useCallback(() => {
    setCircled(null)
    const ref = origin.current
    if (!ref?.isConnected) return
    ref.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
    ref.focus({ preventScroll: true })
  }, [])

  return { circled, backToText }
}

function saveReadingPoint() {
  const open = [...document.querySelectorAll('main details[open][id]')].map(
    (d) => d.id,
  )
  window.history.replaceState(
    { ...window.history.state, readingPoint: { scroll: scrollY, open } },
    '',
  )
}

/** Keeps the scroll and the open sections in the history entry before
 * leaving the page, and restores them when the reader comes back to it. */
export function useReadingPointInHistory() {
  // The entry already loaded and drawn, not the one loading.
  const entry = useRouterState({
    select: (s) => s.resolvedLocation?.state.__TSR_key,
  })

  useEffect(() => {
    const onLeave = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const link = (event.target as Element | null)?.closest?.('a[href]')
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank')
        return
      // A Verbete opens its popover and stays on the page. Saving would
      // rewrite the history entry, and the router, which hears every
      // `replaceState`, would load again and scroll to the URL's hash (#466).
      if (link.matches(TERM_LINK)) return
      const target = new URL(link.href)
      if (
        target.origin !== location.origin ||
        target.pathname === location.pathname
      )
        return
      saveReadingPoint()
    }
    // In the capture phase: before the router pushes the new page.
    document.addEventListener('click', onLeave, true)
    return () => document.removeEventListener('click', onLeave, true)
  }, [])

  useLayoutEffect(() => {
    // Only the entry the router already drew: the bar may be on one that is
    // still loading.
    if (window.history.state?.__TSR_key !== entry) return
    const point = window.history.state?.readingPoint as
      | { scroll: number; open: string[] }
      | undefined
    if (!point) return
    for (const id of point.open) {
      const section = document.getElementById(id)
      if (section instanceof HTMLDetailsElement) section.open = true
    }
    // After the router's restoration, which measures the page with the
    // sections closed.
    const frame = requestAnimationFrame(() =>
      window.scrollTo({ top: point.scroll, behavior: 'instant' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [entry])
}

const BackArrow = () => (
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

/** The little arrow of the DESIGN.md fold, which turns when the fold opens.
 * `className` says what opens it: `group-data-panel-open:rotate-90` in a
 * Base UI `Collapsible`, `group-open:rotate-90` in a `<details>`. */
export const FoldArrow = ({ className }: { className: string }) => (
  <svg
    className={cn(
      'flex-none transition-transform duration-250 ease-sai motion-reduce:transition-none',
      className,
    )}
    width="14"
    height="16"
    viewBox="0 0 14 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 2.5l6.5 5.6L4 13.6" />
  </svg>
)

/** The hand-drawn arrow of a link that goes on: "Ler o Guia", "Abrir o
 * Tema". */
export const ForwardArrow = () => (
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
    <path d="M2 7.4C8 6.6 14 7.2 19.4 7M15 2.4l4.6 4.7-4.8 4.5" />
  </svg>
)

/** "Todos os estudos", "Todas as Dicas": back to the list. */
export function BackLink({
  to,
  children,
}: {
  to: '/estudos' | '/dicas'
  children: ReactNode
}) {
  return (
    <Button
      variant="back"
      nativeButton={false}
      render={<Link to={to} />}
      data-slot="voltar"
    >
      <BackArrow />
      {children}
    </Button>
  )
}

/** Being in the browser does not change after hydration: no one to
 * notify. */
const noSubscribers = () => () => {}

/** `false` on the server and during hydration, `true` on the next render:
 * for a piece that only the browser can draw. */
export const useInBrowser = () =>
  useSyncExternalStore(
    noSubscribers,
    () => true,
    () => false,
  )

/** "Voltar para <Guia>", when the page came from another Guide. Does the
 * same as the browser's back. */
export function BackToGuide() {
  const router = useRouter()
  const from = useRouterState({ select: (s) => s.location.state.from })
  // The server does not know the history: the button only shows after
  // hydration. Hydration reads the server's `false`, and the next render the
  // `true`.
  const inBrowser = useInBrowser()
  if (!inBrowser || !from) return null

  return (
    <Button
      variant="back"
      data-slot="voltar"
      onClick={() => {
        saveReadingPoint()
        router.history.back()
      }}
    >
      <BackArrow />
      Voltar para {from}
    </Button>
  )
}
