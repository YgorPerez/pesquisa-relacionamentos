// The part of a chart that the library draws (#470): this module and the
// library are one chunk the browser fetches only when a chart comes near
// the screen (`visual-chart-loader.ts`). The server draws the same SVG, so
// the page reads without JS and the browser adopts what it got.
//
// The theme is DESIGN.md's: ink on paper, the exact scale, the label above
// each row and the value after its mark. Our own layer (`chart-overlay.ts`)
// adds the pink marker, Brazil's ring and the "você" tag.
import {
  barX,
  defineChart,
  dot,
  hexagon,
  text,
  type ChartFocusStrategy,
  type ChartMark,
} from '@tanstack/charts'
import { focusNearestY } from '@tanstack/charts/focus'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { renderChartSvg } from '@tanstack/charts/svg'
import { Chart } from '@tanstack/react-charts'
import { appliesToYou } from '@tem-estudo/rules/applies-to-you'
import type { Profile } from '@tem-estudo/rules/profile'
import { useCallback, useMemo } from 'react'
import type { ChartPoint, ChartView } from '#/content/chart-view'
import {
  overlayLayers,
  VALUE_DX,
  withOverlay,
  type OverlayMark,
} from './chart-overlay'

const INK = 'var(--color-tinta)'
const PAPER = 'var(--color-folha)'
const THEME = {
  foreground: INK,
  muted: 'var(--color-tinta-2)',
  grid: 'var(--color-tinta-2)',
  background: 'transparent',
  palette: [INK],
}
/** A row: the label line above, the mark below it. A dot row has the
 * Study's measure too, in up to two lines under its title. */
const LAYOUT = {
  bars: { row: 50, label: 15, measure: [] },
  dots: { row: 80, label: 42, measure: [28, 15] },
} as const
/** Letters per line of a measure, which fits a 350px phone. */
const MEASURE_LINE = 56
const DIMMED = 0.22
/** A dot's value starts past Brazil's ring (12px from the dot's center). */
const DOT_VALUE_DX = 16
/** Room for the value after the longest mark: at least a "100%", and more
 * for a value with a word unit ("7.804.840 pessoas"), at about 7.6px a
 * letter of the 14px bold value. */
const VALUE_ROOM = 56
const valueRoom = (rows: ReadonlyArray<Row>, dx: number) =>
  Math.max(
    VALUE_ROOM,
    ...rows.map((r) => Math.ceil(r.number.text.length * 7.6) + dx),
  )

/** A measure in lines of up to `MEASURE_LINE` letters, two at most; the
 * rest is in the tap detail and the list a screen reader reads. */
function measureLines(text: string | null): string[] {
  const lines: string[] = []
  for (const word of (text ?? '').split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1]
    if (last !== undefined && `${last} ${word}`.length <= MEASURE_LINE)
      lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  return lines.length > 2
    ? [lines[0] ?? '', `${(lines[1] ?? '').slice(0, MEASURE_LINE - 1)}…`]
    : lines
}
/** What the server lays out before the browser measures the column. */
const INITIAL_WIDTH = 350

interface Row extends ChartPoint {
  readonly dimmed: boolean
  readonly you: boolean
  readonly own: boolean
}

/** The point's state on the chart: the chosen country lights its points
 * and dims the others, on a chart that has it. */
function rowsOf(
  chart: ChartView,
  country: string | null,
  profile: Profile | null,
): Row[] {
  const lit =
    country !== null && chart.points.some((p) => p.country?.slug === country)
  return chart.points.map((p) => ({
    ...p,
    dimmed: lit && p.country?.slug !== country,
    you:
      p.covers.length > 0 && appliesToYou(profile, p.covers)?.covered === true,
    own: p.number.own !== null,
  }))
}

/** Only the bars and dots take the focus and the tap: the label, measure
 * and value texts of a row are its words, not points of their own. A tap
 * anywhere on a row reaches its mark. */
const onlyMarks = <P extends { markId: string }>(points: readonly P[]) =>
  points.filter((p) => p.markId.startsWith('marca'))
const MARK_FOCUS: ChartFocusStrategy<Row, number, string> = {
  resolve: (points, context) =>
    focusNearestY.resolve(onlyMarks(points), context),
  group: (points, context) => focusNearestY.group(onlyMarks(points), context),
  navigation: (points) => focusNearestY.navigation(onlyMarks(points)),
}

/** The marks of one kind, one per look: a definition's shape (dots only),
 * dimmed or not. */
function pointMarks(chart: ChartView, rows: Row[], hatch: string) {
  const marks: ChartMark<Row, number, string>[] = []
  for (const dimmed of [false, true]) {
    const some = rows.filter((r) => r.dimmed === dimmed)
    if (some.length === 0) continue
    const fillOpacity = dimmed ? DIMMED : 1
    if (chart.kind === 'bars') {
      marks.push(
        barX(some, {
          id: `marca-${dimmed ? 'apagada' : 'acesa'}`,
          x: 'value',
          y: 'key',
          key: 'key',
          maxThickness: 16,
          radius: 2,
          fill: (r) => (r.own ? `url(#${hatch})` : INK),
          stroke: (r) => (r.own ? INK : 'none'),
          fillOpacity,
        }),
      )
      continue
    }
    const shapes = chart.definitions.length > 0 ? chart.definitions.length : 1
    for (let shape = 0; shape < shapes; shape++) {
      const these = some.filter((r) => (r.definition ?? 0) === shape)
      if (these.length === 0) continue
      const options = {
        id: `marca-${dimmed ? 'apagada' : 'acesa'}-${shape}`,
        x: 'value',
        y: 'key',
        key: 'key',
        fillOpacity,
        strokeOpacity: fillOpacity,
        stroke: INK,
        strokeWidth: 2,
      } as const
      // Filled circle, filled hexagon, hollow circle, hollow hexagon.
      const hollow = shape >= 2
      marks.push(
        shape % 2 === 0
          ? dot(these, { ...options, r: 6, fill: hollow ? PAPER : INK })
          : hexagon(these, { ...options, r: 7, fill: hollow ? PAPER : INK }),
      )
    }
  }
  return marks
}

export default function VisualChartPlot({
  chart,
  country,
  profile,
  onSelect,
}: {
  chart: ChartView
  /** The `?pais=` country, already checked against the Guide's. */
  country: string | null
  profile: Profile | null
  onSelect: (point: ChartPoint | null) => void
}) {
  const hatch = `${chart.domId}-hachura`
  const rows = useMemo(
    () => rowsOf(chart, country, profile),
    [chart, country, profile],
  )
  const layout = LAYOUT[chart.kind]
  const valueDx = chart.kind === 'dots' ? DOT_VALUE_DX : VALUE_DX
  const definition = useMemo(() => {
    const ticks = chart.ticks
    const top = ticks[ticks.length - 1]?.value ?? 1
    const tone = (r: Row) => (r.dimmed ? 'var(--color-tinta-2)' : INK)
    // The texts' own copies of the rows: the focus ring marks every point
    // whose datum is the focused one, and it belongs on the mark only.
    const words = rows.map((r) => ({ ...r }))
    return defineChart({
      marks: [
        ...pointMarks(chart, rows, hatch),
        text(words, {
          id: 'rotulo',
          x: () => 0,
          y: 'key',
          // A key of its own: the focus ring marks only the bar or dot.
          key: (r) => `rotulo-${r.key}`,
          text: 'label',
          anchor: 'start',
          dy: -layout.label,
          fontSize: 13,
          fontWeight: chart.kind === 'dots' ? 700 : 400,
          fill: tone,
        }),
        ...layout.measure.map((dy, line) =>
          text(words, {
            id: `medida-${line}`,
            x: () => 0,
            y: 'key',
            key: (r) => `medida-${line}-${r.key}`,
            text: (r) => measureLines(r.detail)[line] ?? null,
            anchor: 'start',
            dy: -dy,
            fontSize: 12,
            fill: tone,
          }),
        ),
        text(words, {
          id: 'valor',
          x: 'value',
          y: 'key',
          key: (r) => `valor-${r.key}`,
          text: (r) => r.number.text,
          anchor: 'start',
          dx: valueDx,
          fontSize: 14,
          fontWeight: 700,
          fill: tone,
        }),
      ],
      scales: {
        x: {
          scale: scaleLinear().domain([0, top]),
          grid: { strokeOpacity: 0.25 },
          axis: {
            ticks: {
              values: ticks.map((t) => t.value),
              format: (value: number) =>
                ticks.find((t) => t.value === value)?.text ?? '',
            },
          },
        },
        y: {
          scale: scaleBand<string>()
            .domain(rows.map((r) => r.key))
            .paddingInner(0)
            .paddingOuter(0),
          axis: false,
        },
      },
      focus: MARK_FOCUS,
      // The sides are fixed: a long label must not squeeze the scale.
      margin: {
        top: layout.label - layout.row / 2 + 16,
        left: 12,
        right: valueRoom(rows, valueDx),
      },
      theme: THEME,
    })
  }, [chart, rows, hatch, layout, valueDx])

  const renderSvg = useCallback<typeof renderChartSvg>(
    (scene, options) => {
      const byKey = new Map(rows.map((r) => [r.key, r]))
      // Brazil's ring sets it apart; on a chart of Brazil only, it would
      // ring every point and set nothing apart.
      const ringBrazil = !rows.every((r) => r.brazil)
      const seen = new Set<string>()
      const marks: OverlayMark[] = []
      for (const point of scene.points) {
        const datum = point.datum as Row | undefined
        const found = datum && byKey.get(datum.key)
        if (!point.markId.startsWith('marca') || !found || seen.has(found.key))
          continue
        seen.add(found.key)
        marks.push({
          key: found.key,
          x: point.x,
          y: point.y,
          valueText: found.number.text,
          highlight: found.highlight,
          brazil: ringBrazil && found.brazil,
          you: found.you,
        })
      }
      const defs = rows.some((r) => r.own)
        ? `<defs><pattern id="${hatch}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="2.2"/></pattern></defs>`
        : ''
      return withOverlay(
        renderChartSvg(scene, options),
        overlayLayers(marks, {
          labelOffset: layout.label,
          right: scene.chart.x + scene.chart.width,
        }),
        defs,
      )
    },
    [rows, hatch, layout],
  )

  return (
    <Chart
      definition={definition}
      renderSvg={renderSvg}
      initialWidth={INITIAL_WIDTH}
      height={rows.length * layout.row + 40}
      ariaLabel={chart.title}
      idPrefix={chart.domId}
      className="font-body text-tinta"
      onSelect={(point) => onSelect(point?.datum ?? null)}
    />
  )
}
