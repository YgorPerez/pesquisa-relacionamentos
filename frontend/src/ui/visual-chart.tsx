import { lazy, memo, Suspense, useEffect, useRef, useState } from 'react'
import type { NumberView } from '#/content/visuals-view'
import { SourceRefs, VisualFrame } from './visual-frame'
import { CHART_COPY } from './visual-chart.copy'

export interface ChartRow {
  readonly id: string
  readonly label: string
  readonly value: number
  readonly number: NumberView
}

export interface ChartView {
  readonly kind: 'bars' | 'dots'
  readonly id: string
  readonly title: string
  readonly note: string | null
  readonly rows: ReadonlyArray<ChartRow>
}

type PlotModule = typeof import('./visual-chart-plot')
let loaded: PlotModule | undefined
const loadPlot = () =>
  import('./visual-chart-plot').then((m) => {
    loaded = m
    return m
  })
/** The server loads the library before its first render (`server.ts`), so the
 * lazy piece resolves at once there and the SVG goes in the HTML. */
export const preloadPlot = () => loadPlot().then(() => undefined)

let want: () => void = () => {}
const wanted = new Promise<void>((resolve) => {
  want = resolve
})

const Plot = lazy(() =>
  loaded
    ? { then: (done: (m: PlotModule) => void) => done(loaded!) }
    : import.meta.env.SSR
      ? loadPlot()
      : wanted.then(loadPlot),
) as PlotModule['default']

const Island = memo(function Island({
  visual,
  onSelect,
}: {
  visual: ChartView
  onSelect: (row: ChartRow | null) => void
}) {
  return (
    <Suspense fallback={null}>
      <Plot visual={visual} onSelect={onSelect} />
    </Suspense>
  )
})

export const VisualChart = memo(function VisualChart({
  visual,
}: {
  visual: ChartView
}) {
  const [selected, setSelected] = useState<ChartRow | null>(null)
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) want()
      },
      { rootMargin: '50% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <VisualFrame domId={visual.id} title={visual.title} note={visual.note}>
      <div
        ref={host}
        onPointerDown={() => want()}
        onFocus={() => want()}
      >
        <Island visual={visual} onSelect={setSelected} />
      </div>
      <ol className="m-0 list-none p-0">
        {visual.rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              className="min-h-toque w-full text-left font-label text-label"
              onClick={() => setSelected(row)}
            >
              {row.label}: {row.number.text}
            </button>
          </li>
        ))}
      </ol>
      {selected && (
        <div role="status" className="mt-xs text-nota">
          {selected.label}: {selected.number.text}
          {selected.number.own && (
            <p>
              {CHART_COPY.calculation(
                selected.number.own,
                selected.number.text,
              )}
            </p>
          )}
          <SourceRefs sources={selected.number.sources} />
          <button
            type="button"
            className="min-h-toque ml-sm"
            onClick={() => setSelected(null)}
          >
            {CHART_COPY.close}
          </button>
        </div>
      )}
    </VisualFrame>
  )
})
