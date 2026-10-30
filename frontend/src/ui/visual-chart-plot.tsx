import { barX, defineChart, dot } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { Chart } from '@tanstack/react-charts'
import { useMemo } from 'react'
import type { ChartRow, ChartView } from './visual-chart'

const THEME = {
  foreground: 'var(--color-tinta)',
  muted: 'var(--color-tinta-2)',
  grid: 'var(--color-tinta-2)',
  background: 'transparent',
  palette: ['var(--color-tinta)'],
}

export default function VisualChartPlot({
  visual,
  onSelect,
}: {
  visual: ChartView
  onSelect: (row: ChartRow | null) => void
}) {
  const definition = useMemo(
    () =>
      defineChart({
        marks:
          visual.kind === 'bars'
            ? [
                barX(visual.rows, {
                  x: 'value',
                  y: 'id',
                  key: 'id',
                  maxThickness: 18,
                }),
              ]
            : [dot(visual.rows, { x: 'value', y: 'id', key: 'id', r: 5 })],
        scales: {
          x: { scale: () => scaleLinear().domain([0, 100]), grid: true },
          y: {
            scale: () =>
              scaleBand<string>()
                .domain(visual.rows.map((row) => row.id))
                .padding(0.3),
            axis: false,
          },
        },
        theme: THEME,
      }),
    [visual],
  )
  return (
    <Chart
      definition={definition}
      initialWidth={350}
      height={visual.rows.length * 44 + 40}
      ariaLabel={visual.title}
      idPrefix={visual.id}
      className="font-body text-tinta"
      onSelect={(point) => onSelect(point?.datum ?? null)}
    />
  )
}
