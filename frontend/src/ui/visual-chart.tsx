// A Visual drawn by the chart library (#470, ADR 0042): "SVG from the
// server, interaction on top". The server sends the figure with the
// library's complete SVG, so it reads without JS. The browser hydrates the
// frame at once but leaves the SVG alone until a chart nears the screen;
// then the library arrives (`visual-chart-loader.ts`) and adopts it, and a
// tap, a click or Enter on a mark opens the exact value below
// (`visual-detail.tsx`). The chosen country and the Profile reach the plot
// through `useDeferredValue`: a change before the library came is a
// transition, which keeps the server's SVG on screen instead of a
// fallback.
import { appliesToYou } from '@tem-estudo/rules/applies-to-you'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  memo,
  Suspense,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ChartPoint, ChartView } from '#/content/chart-view'
import { DefinitionGlyph } from './definition-glyph'
import { partTone } from './stack-tones'
import { Plot, wantPlot } from './visual-chart-loader'
import { CHART_COPY } from './visual-chart.copy'
import { VisualDetail } from './visual-detail'
import { VisualFrame } from './visual-frame'

/** The plot's Suspense boundary, memoized: a render of the frame (a tap)
 * must not reach a boundary that has not hydrated yet. */
const Island = memo(function Island({
  chart,
  country,
  profile,
  onSelect,
}: {
  chart: ChartView
  country: string | null
  profile: Profile | null
  onSelect: (point: ChartPoint | null) => void
}) {
  return (
    <Suspense fallback={null}>
      <Plot
        chart={chart}
        country={country}
        profile={profile}
        onSelect={onSelect}
      />
    </Suspense>
  )
})

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
  const [selected, setSelected] = useState<ChartPoint | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const deferredCountry = useDeferredValue(country)
  const deferredProfile = useDeferredValue(profile)
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
        <p className="m-0 mb-xs flex flex-wrap gap-x-sm gap-y-1 text-nota leading-nota">
          <span className="text-tinta-2">{CHART_COPY.legend}</span>
          {chart.definitions.map((d, i) => (
            <span key={d.id}>
              <DefinitionGlyph shape={i} /> {d.legend}
            </span>
          ))}
        </p>
      )}
      {chart.segments && (
        <p
          className="m-0 mb-xs flex flex-wrap gap-x-sm gap-y-1 text-nota leading-nota"
          data-slot="partes"
        >
          {chart.segments.map((segment, i, all) => (
            <span key={segment} className="inline-flex items-center gap-1">
              <svg width="14" height="14" aria-hidden="true">
                <rect
                  x="0.5"
                  y="0.5"
                  width="13"
                  height="13"
                  rx="2"
                  fill="var(--color-tinta)"
                  fillOpacity={partTone(i, all.length).opacity}
                  stroke="var(--color-tinta)"
                />
              </svg>
              {segment}
            </span>
          ))}
        </p>
      )}
      <div
        ref={host}
        data-slot="grafico"
        onPointerDown={wantPlot}
        onFocus={wantPlot}
      >
        <Island
          chart={chart}
          country={deferredCountry}
          profile={deferredProfile}
          onSelect={setSelected}
        />
      </div>
      {/* The SVG is an image to a screen reader: the exact values are
          here. */}
      {chart.kind === 'line' && <LineLabels points={chart.points} />}
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
      <div aria-live="polite">
        {selected && (
          <VisualDetail
            point={selected}
            definitions={chart.definitions}
            you={appliesToYou(profile, selected.covers)?.covered === true}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </VisualFrame>
  )
}
