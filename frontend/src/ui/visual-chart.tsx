// A Visual drawn by the chart library (#470, ADR 0042): "SVG from the
// server, interaction on top". The server sends the figure with the
// library's complete SVG, so it reads without JS. The browser hydrates the
// frame at once but leaves the SVG alone until a chart nears the screen;
// then the library arrives (`visual-chart-loader.ts`) and adopts it. Hover
// or the keyboard's focus on a row shows its card, and a click, a tap or
// Enter pins it (`chart-card.ts`, `visual-detail.tsx`). The chosen country
// and the Profile reach the plot through `useDeferredValue`: a change before
// the library came is a transition, which keeps the server's SVG on screen
// instead of a fallback.
import type { Profile } from '@tem-estudo/rules/profile'
import {
  memo,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import type { ChartPoint, ChartView } from '#/content/chart-view'
import { cn } from '@/platform/cn'
import {
  closeCard,
  useCloseCardOn,
  enterCard,
  hoverCard,
  pinCard,
  useChartCard,
  useInteractive,
  type CardTarget,
  type ChartMarkAt,
} from './chart-card'
import { INK } from './chart-tones'
import { DefinitionGlyph } from './definition-glyph'
import { partTone } from './stack-tones'
import { Plot, wantPlot } from './visual-chart-loader'
import { CHART_COPY } from './visual-chart.copy'
import { ChartCard } from './visual-detail'
import { VisualFrame } from './visual-frame'

/** The plot's Suspense boundary, memoized: a render of the frame must not
 * reach a boundary that has not hydrated yet. The card reaches it only once
 * the plot is there, since only the plot starts one. */
const Island = memo(function Island({
  chart,
  country,
  profile,
  active,
  onHover,
  onSelect,
}: {
  chart: ChartView
  country: string | null
  profile: Profile | null
  active: string | null
  onHover: (mark: ChartMarkAt | null) => void
  onSelect: (mark: ChartMarkAt | null) => void
}) {
  return (
    <Suspense fallback={null}>
      <Plot
        chart={chart}
        country={country}
        profile={profile}
        active={active}
        onHover={onHover}
        onSelect={onSelect}
      />
    </Suspense>
  )
})

/** How far past its mark the card keeps clear: a row's value, the half of a
 * time line's value that sticks out, nothing over stacked bars' own. */
const WORDS_PAST_MARK = { bars: 66, dots: 66, line: 24, stacked: 0 } as const

/** Where the mark ends and the words after it, on the page, read when the
 * card is placed: the page scrolls under it. */
const markBox =
  (host: HTMLElement | null, { x, y }: ChartMarkAt, past: number) =>
  (): DOMRect => {
    const box = host?.querySelector('svg')?.getBoundingClientRect()
    return new DOMRect((box?.x ?? 0) + x, (box?.y ?? 0) + y - 8, past, 16)
  }

/** What a time line's numbers measure, which its plot does not write: one
 * line when every point measures the same thing, else each year's. The
 * list under it says it again, with the values, to a screen reader. */
function LineLabels({ points }: { points: ReadonlyArray<ChartPoint> }) {
  const labels = new Set(points.map((p) => p.label))
  const [only] = labels
  return (
    <div aria-hidden="true" className="mt-xs text-nota leading-nota">
      {labels.size === 1 ? (
        <p className="m-0">{only}</p>
      ) : (
        <ol className="m-0 list-none p-0">
          {points.map((p) => (
            <li key={p.key}>
              <strong>{p.year}</strong> · {p.label}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** A line of keys above the plot: the definitions' shapes, or the stacked
 * bars' parts. */
function Legend({ slot, children }: { slot?: string; children: ReactNode }) {
  return (
    <p
      className="m-0 mb-xs flex flex-wrap gap-x-sm gap-y-1 text-nota leading-nota"
      data-slot={slot}
    >
      {children}
    </p>
  )
}

const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

export function VisualChart({
  chart,
  country,
  profile,
}: {
  chart: ChartView
  /** The Guide's chosen country (`?pais=`), or `null`. */
  country: string | null
  profile: Profile | null
}) {
  const chartId = chart.domId
  const card = useChartCard(chartId)
  const host = useRef<HTMLDivElement>(null)
  /** What moved last: a finger's move is not a hover, and the card tells a
   * keyboard how to pin. */
  const input = useRef<'mouse' | 'touch' | 'keyboard'>('mouse')
  const deferredCountry = useDeferredValue(country)
  const deferredProfile = useDeferredValue(profile)
  const interactive = useInteractive()

  const targetOf = useCallback(
    (mark: ChartMarkAt): CardTarget => ({
      chart: chartId,
      point: mark.point,
      anchor: markBox(host.current, mark, WORDS_PAST_MARK[chart.kind]),
      via: input.current === 'keyboard' ? 'keyboard' : 'pointer',
    }),
    [chartId, chart.kind],
  )
  const onHover = useCallback(
    (mark: ChartMarkAt | null) => {
      if (input.current === 'touch') return
      if (mark) hoverCard(targetOf(mark))
      else hoverCard(null, chartId)
    },
    [chartId, targetOf],
  )
  const onSelect = useCallback(
    (mark: ChartMarkAt | null) => {
      if (mark) pinCard(targetOf(mark))
      else closeCard()
    },
    [targetOf],
  )
  const onPointer = (event: PointerEvent) => {
    input.current = event.pointerType === 'touch' ? 'touch' : 'mouse'
  }
  const onKey = (event: KeyboardEvent) => {
    input.current = 'keyboard'
    if (!card.pinned) return
    // The card follows the arrows, unpinned: only Enter pins.
    if (ARROWS.has(event.key)) closeCard()
    if (event.key === 'Tab' && !event.shiftKey && enterCard(chartId))
      event.preventDefault()
  }

  // What the card points at may go dark or leave with the page.
  useCloseCardOn(chartId, deferredCountry)
  useEffect(() => {
    const element = host.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      wantPlot()
      return
    }
    // Half a screen ahead, so the library is there when the chart is.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) wantPlot()
      },
      { rootMargin: '50% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    // A country or a Profile chosen before the chart came near.
    if (country !== null || profile !== null) wantPlot()
  }, [country, profile])

  return (
    <VisualFrame
      domId={chart.domId}
      title={chart.title}
      note={chart.note}
      ownLines={chart.ownLines}
      sources={chart.sources}
    >
      {chart.definitions.length > 0 && (
        <Legend>
          <span className="text-tinta-2">{CHART_COPY.legend}</span>
          {chart.definitions.map((d, i) => (
            <span key={d.id}>
              <DefinitionGlyph shape={i} /> {d.legend}
            </span>
          ))}
        </Legend>
      )}
      {chart.segments && (
        <Legend slot="partes">
          {chart.segments.map((segment, i, all) => (
            <span key={segment} className="inline-flex items-center gap-1">
              <svg width="14" height="14" aria-hidden="true">
                <rect
                  x="0.5"
                  y="0.5"
                  width="13"
                  height="13"
                  rx="2"
                  fill={INK}
                  fillOpacity={partTone(i, all.length).opacity}
                  stroke={INK}
                />
              </svg>
              {segment}
            </span>
          ))}
        </Legend>
      )}
      <div
        ref={host}
        data-slot="grafico"
        className={cn(
          // Only once a click can open something: without JS, a plain SVG.
          interactive &&
            (chart.kind === 'line' ? 'cursor-crosshair' : 'cursor-pointer'),
        )}
        onPointerEnter={wantPlot}
        onPointerDown={wantPlot}
        onFocus={wantPlot}
        onFocusCapture={(event) => {
          // Ahead of the library's own listener, which shows the first mark.
          if (event.target.matches(':focus-visible')) input.current = 'keyboard'
        }}
        onPointerMoveCapture={onPointer}
        onPointerDownCapture={onPointer}
        onKeyDownCapture={onKey}
      >
        <Island
          chart={chart}
          country={deferredCountry}
          profile={deferredProfile}
          active={card.target?.point.key ?? null}
          onHover={onHover}
          onSelect={onSelect}
        />
      </div>
      {/* The SVG is an image to a screen reader: the exact values are
          here. */}
      {chart.kind === 'line' && <LineLabels points={chart.points} />}
      {interactive && (
        <p className="m-0 mt-xs text-nota leading-nota text-tinta-2">
          {CHART_COPY.hint}
        </p>
      )}
      <ul className="sr-only">
        {chart.points.map((p) => (
          <li key={p.key}>
            {chart.kind === 'line' && `${p.year} · `}
            {p.label}
            {p.detail && `, ${p.detail}`}: {p.number.text}
            {p.range && (
              <ul>
                {p.range.map((q) => (
                  <li key={q.key}>
                    {q.label}: {q.number.text}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {/* The arrows' card, said aloud: the focus stays on the chart. */}
      <div aria-live="polite" className="sr-only">
        {card.target &&
          `${card.target.point.label}: ${card.target.point.number.text}`}
      </div>
      <ChartCard
        card={card}
        host={host}
        definitions={chart.definitions}
        profile={profile}
      />
    </VisualFrame>
  )
}
