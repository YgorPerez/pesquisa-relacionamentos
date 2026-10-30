// What tells a reader a chart can be touched (#497, #500): under every chart a
// label with a tap icon, in the words of the reader's device, and on the first
// chart seen in a visit one pulse, around its key mark. Neither is on the
// server: without JS a tap opens nothing, so nothing says it does.
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react'
import { claimPulse } from '#/state/chart-pulse'
import { CHART_INVITATION_COPY } from './chart-invitation.copy'

const HAS_MOUSE = '(hover: hover)'
const LESS_MOTION = '(prefers-reduced-motion: reduce)'

/** jsdom has no `matchMedia`, and a phone is the site's first reader. */
const matches = (query: string) =>
  typeof matchMedia !== 'undefined' && matchMedia(query).matches

const onMouseChange = (notify: () => void) => {
  if (typeof matchMedia === 'undefined') return () => {}
  const query = matchMedia(HAS_MOUSE)
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

/** The label under a chart. `null` on the server and while React hydrates,
 * so both agree. */
export function ChartHint() {
  const mouse = useSyncExternalStore(
    onMouseChange,
    () => matches(HAS_MOUSE),
    () => null,
  )
  if (mouse === null) return null
  return (
    <p className="m-0 mt-xs flex w-fit items-center gap-1.5 rounded-pill bg-agua-fonte/30 py-0.5 pr-2.5 pl-2 text-nota leading-nota font-bold text-agua-tinta">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="flex-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <circle cx="8" cy="8" r="2.4" fill="currentColor" />
        <circle cx="8" cy="8" r="6.2" />
      </svg>
      {mouse ? CHART_INVITATION_COPY.mouse : CHART_INVITATION_COPY.touch}
    </p>
  )
}

/** A beat after the chart comes into view, so the eye has landed on it. */
const SETTLE_MS = 350
/** How far the ring starts outside the mark. */
const RING_PAD = 4
/** The middle of the screen: a chart taller than the screen still reaches
 * it, which a share of the chart's own height would not. */
const MIDDLE_OF_THE_SCREEN = '-25% 0px'

interface Box {
  readonly top: number
  readonly left: number
  readonly width: number
  readonly height: number
}

/** The ring's box over `host`: the first element matching `mark`, padded. */
function ringAround(host: HTMLElement, mark: string): Box | null {
  const target = host.querySelector(mark)?.getBoundingClientRect()
  if (!target) return null
  const origin = host.getBoundingClientRect()
  return {
    top: target.top - origin.top - RING_PAD,
    left: target.left - origin.left - RING_PAD,
    width: target.width + RING_PAD * 2,
    height: target.height + RING_PAD * 2,
  }
}

/** Says whenever `element` enters or leaves the middle of the screen, and
 * gives back how to stop. */
function watchMiddle(
  element: HTMLElement,
  onChange: (inView: boolean) => void,
) {
  const observer = new IntersectionObserver(
    (entries) => {
      const last = entries[entries.length - 1]
      if (last) onChange(last.isIntersecting)
    },
    { rootMargin: MIDDLE_OF_THE_SCREEN },
  )
  observer.observe(element)
  return () => observer.disconnect()
}

/** The pulse's ring, if this is the first chart seen. It sits over `host`,
 * which must be positioned, around the first element that matches `mark`, and
 * measures it once `ready` says the mark has its final place. Its animation
 * ends with no shadow, so the empty element it leaves shows nothing and takes
 * no pointer. */
export function ChartPulse({
  host,
  mark,
  ready,
}: {
  host: RefObject<HTMLElement | null>
  mark: string
  ready?: () => Promise<void>
}) {
  const [box, setBox] = useState<Box | null>(null)

  useEffect(() => {
    const element = host.current
    if (
      !element ||
      typeof IntersectionObserver === 'undefined' ||
      matches(LESS_MOTION)
    )
      return
    let timer: ReturnType<typeof setTimeout> | undefined
    let inView = false
    const stopWatching = watchMiddle(element, (now) => {
      inView = now
      clearTimeout(timer)
      if (!now) return
      void Promise.resolve(ready?.()).then(() => {
        if (!inView) return
        clearTimeout(timer)
        // Only a chart still there counts: a link or a smooth scroll runs
        // past the charts above its target.
        timer = setTimeout(() => {
          stopWatching()
          if (claimPulse()) setBox(ringAround(element, mark))
        }, SETTLE_MS)
      })
    })
    return () => {
      inView = false
      clearTimeout(timer)
      stopWatching()
    }
  }, [host, mark, ready])

  if (!box) return null
  return (
    <span
      aria-hidden="true"
      data-slot="chart-pulse"
      className="chart-pulse pointer-events-none absolute rounded-mao-2"
      style={box}
    />
  )
}
