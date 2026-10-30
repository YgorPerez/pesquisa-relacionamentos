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
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import type { ChartPoint, ChartView } from '#/content/chart-view'
import { cn } from '@/platform/cn'
import { Toggle, ToggleWords } from '@/ui/shadcn/toggle'
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
import { matchesNothing } from './chart-filters'
import { ChartHint, ChartPulse } from './chart-invitation'
import { INK } from './chart-tones'
import { DefinitionGlyph } from './definition-glyph'
import { partTone } from './stack-tones'
import { Plot, preloadPlot, wantPlot } from './visual-chart-loader'
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
  legend,
  onHover,
  onSelect,
}: {
  chart: ChartView
  country: string | null
  profile: Profile | null
  active: string | null
  legend: number | null
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
        legend={legend}
        onHover={onHover}
        onSelect={onSelect}
      />
    </Suspense>
  )
})

/** How far past its mark the card keeps clear: a row's value, the half of a
 * time line's value that sticks out, nothing over stacked bars' own. */
const WORDS_PAST_MARK = { bars: 66, dots: 66, line: 24, stacked: 0 } as const
/** A range's end has no value after it, only the next end's tick. */
const PAST_RANGE_END = 14

const pastMark = (chart: ChartView, point: ChartPoint) =>
  chart.points.some((p) => p.range?.some((q) => q.key === point.key))
    ? PAST_RANGE_END
    : WORDS_PAST_MARK[chart.kind]

/** Where the mark ends and the words after it, on the page, read when the
 * card is placed: the page scrolls under it. */
const markBox =
  (host: HTMLElement | null, { place }: ChartMarkAt, past: number) =>
  (): DOMRect => {
    const box = host?.querySelector('svg')?.getBoundingClientRect()
    const { x, y } = place()
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

/** The chart's own legend: which key is pressed and which the mouse is over.
 * It stays in the chart, not in the link (#497). */
function useLegend() {
  const [pressed, setPressed] = useState<number | null>(null)
  const [preview, setPreview] = useState<number | null>(null)
  return {
    pressed,
    preview,
    press: (key: number) => {
      setPressed(pressed === key ? null : key)
      // Under the pointer, a key let go would stay lit by the preview.
      setPreview(null)
    },
    setPreview,
  }
}
type LegendState = ReturnType<typeof useLegend>

/** A line of keys above the plot: the definitions' shapes, or the stacked
 * bars' parts. Each lights its marks on hover and on a press, once the page's
 * JS runs; before that, the plain words. */
function Legend({
  slot,
  label,
  lead,
  keys,
  legend,
  interactive,
}: {
  slot?: string
  label: string
  lead?: string
  keys: ReadonlyArray<{ readonly id: string; readonly content: ReactNode }>
  legend: LegendState
  interactive: boolean
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="mb-xs flex flex-wrap items-center gap-x-xs gap-y-1 text-nota leading-nota"
      data-slot={slot}
    >
      {lead && <p className="m-0 w-full text-tinta-2">{lead}</p>}
      {keys.map(({ id, content }, key) =>
        interactive ? (
          <Toggle
            key={id}
            pressed={legend.pressed === key}
            onPressedChange={() => legend.press(key)}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch') legend.setPreview(key)
            }}
            onPointerLeave={() => legend.setPreview(null)}
          >
            {content}
          </Toggle>
        ) : (
          <ToggleWords key={id}>{content}</ToggleWords>
        ),
      )}
    </div>
  )
}

const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

/** The keys over the plot: the definitions' shapes, the stacked bars' parts. */
function ChartKeys({
  chart,
  legend,
  interactive,
}: {
  chart: ChartView
  legend: LegendState
  interactive: boolean
}) {
  return (
    <>
      {chart.definitions.length > 0 && (
        <Legend
          label={CHART_COPY.legend}
          lead={CHART_COPY.legend}
          legend={legend}
          interactive={interactive}
          keys={chart.definitions.map((d, i) => ({
            id: d.id,
            content: (
              <>
                <DefinitionGlyph shape={i} /> {d.legend}
              </>
            ),
          }))}
        />
      )}
      {chart.segments && (
        <Legend
          slot="partes"
          label={CHART_COPY.parts}
          legend={legend}
          interactive={interactive}
          keys={chart.segments.map((segment, i, all) => ({
            id: segment,
            content: (
              <>
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
              </>
            ),
          }))}
        />
      )}
    </>
  )
}

/** Every exact value, for a screen reader: the SVG is an image to it. */
function ValueList({ chart }: { chart: ChartView }) {
  return (
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
  )
}

/** Asks for the library once `host` nears the screen, or as soon as a country
 * or a Profile was chosen. */
function useWantPlot(host: RefObject<HTMLElement | null>, chosen: boolean) {
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
  }, [host])
  useEffect(() => {
    if (chosen) wantPlot()
  }, [chosen])
}

/** A chart's marks and its card: what the plot reports and what the plot's
 * host listens to. */
function useChartMarks(chart: ChartView, host: RefObject<HTMLElement | null>) {
  const chartId = chart.domId
  const card = useChartCard(chartId)
  /** What moved last: a finger's move is not a hover, and the card tells a
   * keyboard how to pin. */
  const input = useRef<'mouse' | 'touch' | 'keyboard'>('mouse')

  const targetOf = useCallback(
    (mark: ChartMarkAt): CardTarget => ({
      chart: chartId,
      point: mark.point,
      anchor: markBox(host.current, mark, pastMark(chart, mark.point)),
      via: input.current === 'keyboard' ? 'keyboard' : 'pointer',
      refocus: mark.refocus,
    }),
    [chartId, chart, host],
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
  const onFocusCapture = (event: FocusEvent<HTMLElement>) => {
    // Ahead of the library's own listener, which shows the first mark.
    if (event.target.matches(':focus-visible')) input.current = 'keyboard'
  }
  return {
    card,
    onHover,
    onSelect,
    hostEvents: {
      onFocusCapture,
      onPointerMoveCapture: onPointer,
      onPointerDownCapture: onPointer,
      onKeyDownCapture: onKey,
    },
  }
}

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
  const host = useRef<HTMLDivElement>(null)
  const { card, onHover, onSelect, hostEvents } = useChartMarks(chart, host)
  const deferredCountry = useDeferredValue(country)
  const deferredProfile = useDeferredValue(profile)
  const interactive = useInteractive()
  const legend = useLegend()
  const deferredLegend = useDeferredValue(legend.preview ?? legend.pressed)
  // What the card points at may go dark or leave with the page. A preview
  // lasts as long as the mouse is on a key: a pinned card outlives it.
  const heldFilters = `${deferredCountry}|${legend.pressed}`
  useCloseCardOn(chart.domId, heldFilters)
  useWantPlot(
    host,
    country !== null ||
      profile !== null ||
      legend.pressed !== null ||
      legend.preview !== null,
  )

  return (
    <VisualFrame
      domId={chart.domId}
      title={chart.title}
      note={chart.note}
      ownLines={chart.ownLines}
      sources={chart.sources}
    >
      <ChartKeys chart={chart} legend={legend} interactive={interactive} />
      <div
        ref={host}
        data-slot="grafico"
        className={cn(
          'relative',
          // Only once a click can open something: without JS, a plain SVG.
          interactive &&
            (chart.kind === 'line' ? 'cursor-crosshair' : 'cursor-pointer'),
        )}
        onPointerEnter={wantPlot}
        onPointerDown={wantPlot}
        onFocus={wantPlot}
        {...hostEvents}
      >
        <Island
          chart={chart}
          country={deferredCountry}
          profile={deferredProfile}
          // A pinned card's row would hide what the mouse on a key previews.
          active={
            legend.preview === null ? (card.target?.point.key ?? null) : null
          }
          legend={deferredLegend}
          onHover={onHover}
          onSelect={onSelect}
        />
        <ChartPulse
          host={host}
          mark={`[data-ts-key="mark-${(chart.points.find((p) => p.highlight) ?? chart.points[0])?.key}"]`}
          ready={preloadPlot}
        />
      </div>
      <div role="status">
        {matchesNothing(chart.points, deferredCountry, deferredLegend) && (
          <p className="m-0 mt-xs text-nota leading-nota font-bold">
            {CHART_COPY.noMatch}
          </p>
        )}
      </div>
      {/* The SVG is an image to a screen reader: the exact values are
          here. */}
      {chart.kind === 'line' && <LineLabels points={chart.points} />}
      <ChartHint />
      <ValueList chart={chart} />
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
