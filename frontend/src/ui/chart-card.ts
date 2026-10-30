// The one card a Guide's charts can show (#499, ADR 0042): hover or the
// keyboard's focus shows it, a click, a tap or Enter pins it, and a pinned
// card holds until it is closed. It lives outside any one chart because one
// card is open at a time across the page, and a chart re-renders only when
// the card is its own.
import { useSyncExternalStore } from 'react'
import type { ChartPoint } from '#/content/chart-view'

export interface CardTarget {
  /** The chart's `domId`. */
  readonly chart: string
  readonly point: ChartPoint
  /** Where the card hangs, read each time it is placed. */
  readonly anchor: () => DOMRect
  /** Whose hover it is: the card says how to pin it. */
  readonly via: 'pointer' | 'keyboard'
}

export interface CardState {
  readonly target: CardTarget | null
  readonly pinned: boolean
}

const NONE: CardState = { target: null, pinned: false }
let state = NONE
const listeners = new Set<() => void>()

function set(next: CardState) {
  state = next
  for (const listener of listeners) listener()
}

const isSame = (a: CardTarget | null, b: CardTarget) =>
  a?.chart === b.chart && a.point.key === b.point.key

export const currentCard = () => state

/** Hover or the keyboard's focus reached a point, or left chart `from`. A
 * pinned card ignores both. */
export function hoverCard(target: CardTarget): void
export function hoverCard(target: null, from: string): void
export function hoverCard(target: CardTarget | null, from?: string) {
  if (state.pinned) return
  if (target) {
    if (!isSame(state.target, target)) set({ target, pinned: false })
  } else if (state.target?.chart === from) set(NONE)
}

/** Pins a card, replacing any other; the same mark again unpins it. The one
 * place a card gets pinned: count a pinned card here (#502). */
export function pinCard(target: CardTarget) {
  if (state.pinned && isSame(state.target, target)) set(NONE)
  else set({ target, pinned: true })
}

export function closeCard() {
  if (state !== NONE) set(NONE)
}

/** Closes the card if it is chart `chart`'s: the chart left the page, or
 * what it lights changed. */
export function closeCardOf(chart: string) {
  if (state.target?.chart === chart) set(NONE)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The card, when it is chart `chart`'s. */
export const useChartCard = (chart: string) =>
  useSyncExternalStore(
    subscribe,
    () => (state.target?.chart === chart ? state : NONE),
    () => NONE,
  )

/** The card's element id. */
export const cardId = (chart: string) => `${chart}-cartao`

/** Tab from the mark goes to the pinned card: it hangs from the page's end,
 * and the keyboard would not reach it otherwise. Gives back whether it did. */
export function enterCard(chart: string) {
  const first = document
    .getElementById(cardId(chart))
    ?.querySelector<HTMLElement>('a, button')
  first?.focus()
  return first !== undefined && first !== null
}

const stayPut = () => () => {}
/** True once the page's JavaScript runs, so a mark can take a click: false
 * on the server and while React hydrates, so both agree. */
export const useInteractive = () =>
  useSyncExternalStore(
    stayPut,
    () => true,
    () => false,
  )
