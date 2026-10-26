// The usage count (#21, #35; ADR 0001): visits by path and the `helped/…`,
// `fact-sheet/…` and `calculator/…` events. None carries the Profile, nor
// whether it was filled in: the caller only passes the event name.
//
// It does not count when the browser asks (GPC or Do Not Track) nor when the
// visitor turns off the switch in the footer or on the privacy page. In those
// cases the sender (`goatcounter.ts`) is not even imported. The preference
// lives in localStorage and nothing in the link reads it, so opening a link
// does not undo it.
import { useEffect, useSyncExternalStore } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { PREFIX, stored } from '#/state/stored'
import { EVENTS, type AnalyticsEvent, type CountedCalculator } from './events'

const ENDPOINT = 'https://stats.temestudo.cloud/count'

/** The e2e build also counts on localhost, where the sends are intercepted.
 * Outside it, the local `vite dev` and `pnpm start` do not count. What
 * arrives here is `1` or `0`, already validated by the build
 * (`vite/environment.ts`); in the unit tests, which skip the build,
 * nothing. */
const COUNTS_ON_LOCALHOST = import.meta.env.VITE_COUNT_ON_LOCALHOST === '1'

interface BrowserSignals {
  readonly globalPrivacyControl?: boolean
  readonly doNotTrack?: string | null
}

/** GPC on, or DNT "1"/"yes" (the value old browsers used). */
export function browserAsksNotToCount(browser: BrowserSignals): boolean {
  if (browser.globalPrivacyControl === true) return true
  return browser.doNotTrack === '1' || browser.doNotTrack === 'yes'
}

/** `true` when the visitor turned the switch off; nothing saved = counts. */
const savedDoNotCount = stored<true>(
  'do-not-count',
  (raw) => (raw === true ? true : null),
  { key: 'nao-contar', migrate: (raw) => raw },
)

export type CountingState = 'counting' | 'off' | 'browser'

function currentState(): CountingState {
  if (browserAsksNotToCount(navigator as BrowserSignals)) return 'browser'
  return savedDoNotCount.read() ? 'off' : 'counting'
}

const local = () => /^(localhost|127\.|\[::1\])/.test(location.hostname)

function canCount(): boolean {
  if (typeof window === 'undefined') return false
  if (local() && !COUNTS_ON_LOCALHOST) return false
  return currentState() === 'counting'
}

/** The switch: turns the count on or off in this browser. */
export function saveCounting(count: boolean) {
  savedDoNotCount.write(count ? null : true)
}

/** The switch's state; `null` on the server and during hydration. */
export function useCountingState(): CountingState | null {
  return useSyncExternalStore(
    savedDoNotCount.subscribe,
    currentState,
    () => null,
  )
}

let first = true

function sendHit(path: string, event: boolean) {
  if (!canCount()) return
  const referrer = !event && first ? document.referrer : undefined
  if (!event) first = false
  void import('./goatcounter').then(({ send }) => {
    // The switch may have been turned off while the file was arriving.
    if (canCount()) send(ENDPOINT, { path, event, referrer })
  })
}

/** An event with no values, from `EVENTS` (`events.ts`). */
export const countEvent = (event: AnalyticsEvent) => sendHit(event, true)

/** The same event once per visit (the tab's session). */
function countOncePerVisit(event: AnalyticsEvent) {
  const key = `${PREFIX}counted:${event}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // Without sessionStorage, it counts every time the page asks.
  }
  countEvent(event)
}

/** The visitor used the calculator: counts once per visit. */
export const countCalculatorUse = (calculator: CountedCalculator) =>
  countOncePerVisit(EVENTS.calculator(calculator))

/** Counts each page the router shows, by the path without query. At the
 * root. Only a path change counts: turning the switch back on does not send
 * the current page, and the count resumes on the next one. */
export function useCountVisits() {
  const path = useRouterState({
    select: (s) => s.resolvedLocation?.pathname,
  })
  useEffect(() => {
    if (path) sendHit(path, false)
  }, [path])
}

/** In the Guide: tapping a Fact sheet (the title in the list or a link in the
 * text) counts `fact-sheet/<question>/<fact sheet>`, by the Question whose
 * section (`data-question`) holds the link, so the series of each Question's
 * old page goes on (ADR 0042). Outside a Question (the list at the end, the
 * Limitations) the key is the Topic. The reference number only circles the
 * Fact sheet on the page, and does not count. One listener for the page. */
export function useCountOpenedFactSheets(topic: string) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.(
        'main a[href^="/estudos/"]',
      )
      const factSheet = link
        ?.getAttribute('href')
        ?.match(/^\/estudos\/([a-z0-9-]+)$/)?.[1]
      if (!factSheet) return
      const question = link
        ?.closest('[data-question]')
        ?.getAttribute('data-question')
      countEvent(EVENTS.factSheetOpened(question ?? topic, factSheet))
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [topic])
}
