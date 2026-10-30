import { barX, defineChart, dot } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { Chart } from '@tanstack/react-charts'
import { useMemo, useState } from 'react'
import type { NumberView } from '#/content/visuals-view'
import { SourceRefs, VisualFrame } from './visual-frame'

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

const THEME = {
  foreground: 'var(--color-tinta)',
  muted: 'var(--color-tinta-2)',
  grid: 'var(--color-tinta-2)',
  background: 'transparent',
  palette: ['var(--color-tinta)'],
}

/** The first two migrated charts exercise the library before the rollout. */
export function VisualChart({ visual }: { visual: ChartView }) {
  const [selected, setSelected] = useState<ChartRow | null>(null)
  const definition = useMemo(() => defineChart({
    marks: visual.kind === 'bars'
      ? [barX(visual.rows, { x: 'value', y: 'id', key: 'id', maxThickness: 18 })]
      : [dot(visual.rows, { x: 'value', y: 'id', key: 'id', r: 5 })],
    scales: {
      x: { scale: () => scaleLinear().domain([0, 100]), grid: true },
      y: { scale: () => scaleBand<string>().domain(visual.rows.map(row => row.id)).padding(0.3), axis: false },
    },
    theme: THEME,
  }), [visual])
  return <VisualFrame domId={visual.id} title={visual.title} note={visual.note}>
    <Chart definition={definition} initialWidth={350} height={visual.rows.length * 44 + 40}
      ariaLabel={visual.title} idPrefix={visual.id} className="font-body text-tinta"
      onSelect={point => setSelected(point?.datum ?? null)} />
    <ol className="m-0 list-none p-0">
      {visual.rows.map(row => <li key={row.id}>
        <button type="button" className="min-h-toque w-full text-left font-label text-label" onClick={() => setSelected(row)}>
          {row.label}: {row.number.text}
        </button>
      </li>)}
    </ol>
    {selected && <div role="status" className="mt-xs text-nota">
      {selected.label}: {selected.number.text}
      {selected.number.own && <p>Conta nossa: {selected.number.own} = {selected.number.text}</p>}
      <SourceRefs sources={selected.number.sources} />
      <button type="button" className="min-h-toque ml-sm" onClick={() => setSelected(null)}>Fechar detalhe</button>
    </div>}
  </VisualFrame>
}
