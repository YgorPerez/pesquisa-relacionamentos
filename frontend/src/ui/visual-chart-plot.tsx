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
  lineY,
  text,
  type ChartFocusStrategy,
  type ChartMark,
} from '@tanstack/charts'
import { focusNearestX, focusNearestY } from '@tanstack/charts/focus'
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
/** A row: the label above, the mark below it, each line's distance above
 * the mark in `label`. A bar's label longer than `LABEL_LINE` takes two
 * lines; a dot row has the Study's measure too, in up to two lines under
 * its title. */
const LAYOUT = {
  bars: { row: 50, label: [15], measure: [] },
  wrappedBars: { row: 66, label: [31, 15], measure: [] },
  dots: { row: 80, label: [42], measure: [28, 15] },
} as const
/** Letters per line of a bar's label (13px) and of a measure (12px), which
 * fit a 350px phone. */
const LABEL_LINE = 40
const MEASURE_LINE = 56
const DIMMED = 0.22
/** The value after the mark (14px, bold): room for the longest at the
 * right end, and never less than `VALUE_ROOM`. */
const VALUE_ROOM = 56
const VALUE_LETTER = 8.2
/** A dot's value starts past Brazil's ring (12px from the dot's center). */
const DOT_VALUE_DX = 16

/** A text in lines of up to `letters` letters, two at most; the rest is in
 * the tap detail and the list a screen reader reads. */
function lines(text: string | null, letters: number): string[] {
  const out: string[] = []
  for (const word of (text ?? '').split(/\s+/).filter(Boolean)) {
    const last = out[out.length - 1]
    if (last !== undefined && `${last} ${word}`.length <= letters)
      out[out.length - 1] = `${last} ${word}`
    else out.push(word)
  }
  return out.length > 2
    ? [out[0] ?? '', `${(out[1] ?? '').slice(0, letters - 1)}…`]
    : out
}

/** The label's lines: a dot's Study title is short and stays on one. */
const labelLines = (chart: ChartView, label: string) =>
  chart.kind === 'bars' ? lines(label, LABEL_LINE) : [label]

/** The right margin: the value after each mark fits on a 350px phone, the
 * narrowest plot, where a mark short of the top leaves part of the room
 * its value needs. "14,14 parceiros" after a mark near the top needs more
 * than "39%". */
function valueRoom(chart: ChartView, dx: number) {
  const top = chart.ticks[chart.ticks.length - 1]?.value || 1
  const plot = INITIAL_WIDTH - 12 - VALUE_ROOM
  return Math.max(
    VALUE_ROOM,
    ...chart.points.map((p) =>
      Math.ceil(
        dx +
          p.number.text.length * VALUE_LETTER -
          (1 - p.value / top) * plot,
      ),
    ),
  )
}

function layoutOf(chart: ChartView) {
  if (chart.kind === 'dots') return LAYOUT.dots
  return chart.points.some((p) => p.label.length > LABEL_LINE)
    ? LAYOUT.wrappedBars
    : LAYOUT.bars
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

/** Our layer's marks: where each bar or dot of a row landed in the scene. */
function overlayMarks(
  points: ReadonlyArray<{
    readonly markId: string
    readonly datum: unknown
    readonly x: number
    readonly y: number
  }>,
  rows: Row[],
  valueAbove?: number,
): OverlayMark[] {
  const byKey = new Map(rows.map((r) => [r.key, r]))
  const seen = new Set<string>()
  const marks: OverlayMark[] = []
  for (const point of points) {
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
      brazil: found.brazil,
      you: found.you,
      ...(valueAbove === undefined ? {} : { valueAbove }),
    })
  }
  return marks
}

interface PlotProps {
  chart: ChartView
  /** The `?pais=` country, already checked against the Guide's. */
  country: string | null
  profile: Profile | null
  onSelect: (point: ChartPoint | null) => void
}

/** A time line: one dot per number at its year, joined by a line when the
 * numbers share a unit, the value written above each dot and a tick per
 * year on the axis, the years with a number written. */
const LINE = {
  height: 220,
  /** Without a value scale, the dots sit on the year axis. */
  flatHeight: 110,
  /** How far the value's line sits above its dot, clear of Brazil's
   * ring. */
  valueAbove: 22,
  /** Room above the values for the "você" tag. */
  top: 48,
} as const

const LINE_FOCUS: ChartFocusStrategy<Row, number, number> = {
  resolve: (points, context) =>
    focusNearestX.resolve(onlyMarks(points), context),
  group: (points, context) => focusNearestX.group(onlyMarks(points), context),
  navigation: (points) => focusNearestX.navigation(onlyMarks(points)),
}

/** A time line's marks: the line, a dot per number in its definition's
 * shape, and the value above each dot. */
function lineMarks(chart: ChartView, rows: Row[]) {
  const scaled = chart.ticks.length > 0
  const y = (r: Row) => (scaled ? r.value : 0)
  const tone = (r: Row) => (r.dimmed ? 'var(--color-tinta-2)' : INK)
  // The value's own copies of the rows, as in `RowPlot`: the focus ring
  // belongs on the dot only.
  const words = rows.map((r) => ({ ...r }))
  const anyDimmed = rows.some((r) => r.dimmed)
  const shapes = chart.definitions.length > 0 ? chart.definitions.length : 1
  const marks: ChartMark<Row, number, number>[] = []
  if (scaled && rows.length > 1)
    marks.push(
      lineY(rows, {
        id: 'linha',
        x: 'year',
        y,
        stroke: INK,
        strokeWidth: 2,
        strokeOpacity: anyDimmed ? DIMMED : 1,
      }),
    )
  for (const dimmed of [false, true])
    for (let shape = 0; shape < shapes; shape++) {
      const these = rows.filter(
        (r) => r.dimmed === dimmed && (r.definition ?? 0) === shape,
      )
      if (these.length === 0) continue
      const opacity = dimmed ? DIMMED : 1
      const hollow = shape >= 2
      const options = {
        id: `marca-${dimmed ? 'apagada' : 'acesa'}-${shape}`,
        x: 'year',
        y,
        key: 'key',
        fillOpacity: opacity,
        strokeOpacity: opacity,
        stroke: INK,
        strokeWidth: 2,
      } as const
      marks.push(
        shape % 2 === 0
          ? dot(these, { ...options, r: 6, fill: hollow ? PAPER : INK })
          : hexagon(these, { ...options, r: 7, fill: hollow ? PAPER : INK }),
      )
    }
  marks.push(
    text(words, {
      id: 'valor',
      x: 'year',
      y,
      key: (r) => `valor-${r.key}`,
      text: (r) => r.number.text,
      anchor: 'middle',
      dy: -LINE.valueAbove,
      fontSize: 14,
      fontWeight: 700,
      fill: tone,
    }),
  )
  return marks
}

function LinePlot({ chart, country, profile, onSelect }: PlotProps) {
  const rows = useMemo(
    () => rowsOf(chart, country, profile),
    [chart, country, profile],
  )
  const scaled = chart.ticks.length > 0
  const definition = useMemo(() => {
    const top = chart.ticks[chart.ticks.length - 1]?.value ?? 1
    const years = chart.years ?? []
    const first = years[0]?.value ?? 0
    const last = years[years.length - 1]?.value ?? first
    return defineChart({
      marks: lineMarks(chart, rows),
      scales: {
        x: {
          // A margin of years on each side, so the values centered over
          // the first and last dots clear the value axis and the edge.
          scale: scaleLinear().domain([
            first - Math.max((last - first) * 0.12, 1),
            last + Math.max((last - first) * 0.12, 1),
          ]),
          axis: {
            ticks: {
              values: years.map((t) => t.value),
              format: (value: number) =>
                years.find((t) => t.value === value)?.text ?? '',
            },
            tickLabels: { thin: false },
          },
        },
        y: {
          scale: scaleLinear().domain([0, top]),
          grid: scaled ? { strokeOpacity: 0.25 } : false,
          axis: scaled
            ? {
                ticks: {
                  values: chart.ticks.map((t) => t.value),
                  format: (value: number) =>
                    chart.ticks.find((t) => t.value === value)?.text ?? '',
                },
              }
            : false,
        },
      },
      focus: LINE_FOCUS,
      margin: { top: LINE.top },
      theme: THEME,
    })
  }, [chart, rows, scaled])

  const renderSvg = useCallback<typeof renderChartSvg>(
    (scene, options) =>
      withOverlay(
        renderChartSvg(scene, options),
        overlayLayers(overlayMarks(scene.points, rows, LINE.valueAbove), {
          labelOffset: 0,
          right: scene.chart.x + scene.chart.width,
        }),
      ),
    [rows],
  )

  return (
    <Chart
      definition={definition}
      renderSvg={renderSvg}
      initialWidth={INITIAL_WIDTH}
      height={scaled ? LINE.height : LINE.flatHeight}
      ariaLabel={chart.title}
      idPrefix={chart.domId}
      className="font-body text-tinta"
      onSelect={(point) => onSelect(point?.datum ?? null)}
    />
  )
}

/** A time line draws a line over the years; bars and dots, one row per
 * point. */
export default function VisualChartPlot(props: PlotProps) {
  return props.chart.kind === 'line' ? (
    <LinePlot {...props} />
  ) : (
    <RowPlot {...props} />
  )
}

function RowPlot({ chart, country, profile, onSelect }: PlotProps) {
  const hatch = `${chart.domId}-hachura`
  const rows = useMemo(
    () => rowsOf(chart, country, profile),
    [chart, country, profile],
  )
  const layout = layoutOf(chart)
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
        ...layout.label.map((dy, line) =>
          text(words, {
            id: line === 0 ? 'rotulo' : `rotulo-${line}`,
            x: () => 0,
            y: 'key',
            // A key of its own: the focus ring marks only the bar or dot.
            key: (r) => `rotulo-${line}-${r.key}`,
            text: (r) => labelLines(chart, r.label)[line] ?? null,
            anchor: 'start',
            dy: -dy,
            fontSize: 13,
            fontWeight: chart.kind === 'dots' ? 700 : 400,
            fill: tone,
          }),
        ),
        ...layout.measure.map((dy, line) =>
          text(words, {
            id: `medida-${line}`,
            x: () => 0,
            y: 'key',
            key: (r) => `medida-${line}-${r.key}`,
            text: (r) => lines(r.detail, MEASURE_LINE)[line] ?? null,
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
        top: (layout.label[0] ?? 0) - layout.row / 2 + 16,
        left: 12,
        right: valueRoom(chart, valueDx),
      },
      theme: THEME,
    })
  }, [chart, rows, hatch, layout, valueDx])

  const renderSvg = useCallback<typeof renderChartSvg>(
    (scene, options) => {
      const marks = overlayMarks(scene.points, rows)
      const defs = rows.some((r) => r.own)
        ? `<defs><pattern id="${hatch}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="2.2"/></pattern></defs>`
        : ''
      return withOverlay(
        renderChartSvg(scene, options),
        overlayLayers(marks, {
          // The "você" tag goes on the label's line next to the mark.
          labelOffset: layout.label[layout.label.length - 1] ?? 0,
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
