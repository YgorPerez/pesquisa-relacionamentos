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
  link,
  text,
  tickX,
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
import type { ChartMarkAt } from './chart-card'
import {
  activeRow as activeRowLayer,
  lineWordsAbove,
  overlayLayers,
  withOverlay,
  yearGuide,
  type OverlayMark,
} from './chart-overlay'
import { LABEL, SMALL, VALUE, VALUE_DX } from './chart-text'
import { DIMMED, INK, MUTED, PAPER } from './chart-tones'
import { partTone } from './stack-tones'
import { CHART_COPY } from './visual-chart.copy'

const THEME = {
  foreground: INK,
  muted: MUTED,
  grid: MUTED,
  background: 'transparent',
  palette: [INK],
}
/** Letters per line of a bar's label (13px) and of a measure (12px), which
 * fit a 350px phone. */
const LABEL_LINE = 40
/** A row with a range (#472) draws its average on the row's line, like any
 * dot, and the range on a line of its own under it (`line`), so Brazil's
 * ring, a few points from the average on a phone, never covers its dot.
 * The countries' words go under the range (`words`), and the row grows by
 * `extra`, which keeps them as far from the next title as a plain row's
 * value is. */
const SPREAD = { line: 22, words: 46, extra: 46 } as const
/** A row plot's margins over and under its rows, together. */
const ROWS_MARGIN = 40
const MEASURE_LINE = 56
/** The value after the mark: room for the longest at the right end, and
 * never less than `VALUE_ROOM`. */
const VALUE_ROOM = 56

/** A row of each kind: the label above, the mark below it, each line's
 * distance above the mark in `label`. A bar's label longer than
 * `LABEL_LINE` takes two lines (`wrap`); a dot row has the Study's title in
 * bold and its measure in up to two lines under it, and its value starts
 * past Brazil's ring (12px from the dot's center). Stacked bars write their
 * values inside the parts, so `valueDx` is theirs only for the room. */
const LAYOUT = {
  bars: {
    row: 50,
    label: [15],
    measure: [],
    wrap: LABEL_LINE,
    bold: false,
    valueDx: VALUE_DX,
  },
  wrappedBars: {
    row: 66,
    label: [31, 15],
    measure: [],
    wrap: LABEL_LINE,
    bold: false,
    valueDx: VALUE_DX,
  },
  dots: {
    row: 80,
    label: [42],
    measure: [28, 15],
    wrap: null,
    bold: true,
    valueDx: 16,
  },
  stacked: {
    row: 60,
    label: [21],
    measure: [],
    wrap: null,
    bold: false,
    valueDx: VALUE_DX,
  },
} as const
type Layout = (typeof LAYOUT)[keyof typeof LAYOUT]

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
const labelLines = (layout: Layout, label: string) =>
  layout.wrap === null ? [label] : lines(label, layout.wrap)

/** How far a row's last label line runs, from the drawing's left edge:
 * the "você" tag shares that line. */
const labelEnd = (layout: Layout, label: string) =>
  LEFT +
  (labelLines(layout, label).at(-1)?.length ?? 0) *
    (layout.bold ? LABEL.boldLetter : LABEL.letter)

/** The right margin: the value after each mark fits on a 350px phone, the
 * narrowest plot, where a mark short of the top leaves part of the room
 * its value needs. "14,14 parceiros" after a mark near the top needs more
 * than "39%". */
function valueRoom(chart: ChartView, dx: number) {
  const top = chart.ticks[chart.ticks.length - 1]?.value || 1
  const plot = INITIAL_WIDTH - LEFT - VALUE_ROOM
  return Math.max(
    VALUE_ROOM,
    ...chart.points.map((p) =>
      Math.ceil(
        dx +
          writtenValue(p).length * VALUE.wideLetter -
          (1 - p.value / top) * plot,
      ),
    ),
  )
}

/** The value written after a row's mark: a row with a range gives its
 * average after the range. */
const writtenValue = (p: ChartPoint) =>
  p.range && p.range.length > 0
    ? CHART_COPY.rangeValue(p.number.text)
    : p.number.text

function layoutOf(chart: ChartView): Layout {
  if (chart.kind === 'dots') return LAYOUT.dots
  if (chart.kind === 'stacked') return LAYOUT.stacked
  return chart.points.some((p) => p.label.length > LABEL_LINE)
    ? LAYOUT.wrappedBars
    : LAYOUT.bars
}
/** The chart's host. A tap or click focuses the library's SVG (it takes
 * the keys), and the browser rings a focused SVG even when the focus came
 * from the pointer, which framed the plot in black after a tap and never
 * without JS. Only the keyboard's focus keeps the ring (`styles.css`). */
const HOST_CLASS =
  'font-body text-tinta [-webkit-tap-highlight-color:transparent] [&_svg:focus:not(:focus-visible)]:outline-none'

/** What the server lays out before the browser measures the column. */
const INITIAL_WIDTH = 350
/** The plot's left margin, where the labels start. */
const LEFT = 12

interface Row extends ChartPoint {
  readonly dimmed: boolean
  /** The row has the card. Its drawing reads this off the scene, so the
   * renderer stays one and keeps the SVG, and the focus in it. */
  readonly active: boolean
  readonly you: boolean
  readonly own: boolean
  /** The points of its range (#472), on its own line. */
  readonly spread: ReadonlyArray<SpreadRow>
}

/** A point of a row's range: a tick on the row's line (`at`). */
interface SpreadRow extends Row {
  readonly at: string
}

const of = (p: ChartPoint, country: string | null) =>
  p.country?.slug === country

/** The row point `key` belongs to: its own, its stacked bar's or, for a
 * point of a range, its Study's. */
const rowOfKey = (points: ReadonlyArray<ChartPoint>, key: string | null) =>
  key === null
    ? undefined
    : points.find((p) => p.key === key || p.range?.some((q) => q.key === key))

/** The point's state on the chart. The one place a mark is dimmed: the
 * chosen country lights its points and dims the others, on a chart that has
 * it, a row whose range has the country stays lit and so does that point of
 * its range; while a row has the card (`active`), only that row is lit. A
 * new reason to dim (the legend, #501) is one more condition here. */
function rowsOf(
  chart: ChartView,
  country: string | null,
  profile: Profile | null,
  active: string | null = null,
): Row[] {
  const lit =
    country !== null &&
    chart.points.some(
      (p) => of(p, country) || p.range?.some((q) => of(q, country)),
    )
  const activeRow = rowOfKey(chart.points, active)
  const inActive = (p: ChartPoint) =>
    activeRow !== undefined && bandOf(p) === bandOf(activeRow)
  // A time line has one line, no rows to dim: the guide says which year.
  const dimsRows = chart.kind !== 'line' && activeRow !== undefined
  const outOfActive = (p: ChartPoint) => dimsRows && !inActive(p)
  const base = (p: ChartPoint, dimmed: boolean) => ({
    ...p,
    dimmed,
    active: false,
    you:
      p.covers.length > 0 && appliesToYou(profile, p.covers)?.covered === true,
    own: p.number.own !== null,
  })
  return chart.points.map((p) => {
    const range = p.range ?? []
    const otherCountry =
      lit && !of(p, country) && !range.some((q) => of(q, country))
    return {
      ...base(p, dimsRows ? outOfActive(p) : otherCountry),
      active: inActive(p),
      spread: range.map((q) => ({
        ...base(q, outOfActive(p) || (lit && !of(q, country))),
        // The row's "você" tag is enough.
        you: false,
        spread: [],
        at: p.key,
      })),
    }
  })
}

/** The right end of a row's drawing: its mark, or its range's top. */
const end = (r: Row) => Math.max(r.value, ...r.spread.map((q) => q.value))

/** The words under a row with a range: each point's country (or label) and
 * value, in order. */
const spreadWords = (r: Row) =>
  r.spread.length === 0
    ? null
    : r.spread
        .map((q) => `${q.country?.name ?? q.label} ${q.number.text}`)
        .join(', ')

/** Where a dot chart's rows sit, from the plot's top: a row with a range is
 * `SPREAD.extra` taller than the others. */
function rowPlaces(rows: Row[], row: number) {
  const centers = new Map<string, number>()
  let height = 0
  for (const r of rows) {
    centers.set(bandOf(r), height + row / 2)
    height += row + (r.spread.length > 0 ? SPREAD.extra : 0)
  }
  return { center: (band: string) => centers.get(band) ?? 0, height }
}
type Places = ReturnType<typeof rowPlaces>

/** A row's range, on its own line under the row's dot: a line from its
 * smallest point to its largest, and a tick on each point, which takes the
 * tap like a dot. */
function rangeMarks(rows: Row[], places: Places) {
  const line = (band: string) => places.center(band) + SPREAD.line
  const ranged = rows.filter((r) => r.spread.length > 0)
  if (ranged.length === 0) return []
  const tickMarks = ranged
    .flatMap((r) => r.spread)
    .map((q) =>
      tickX([q], {
        id: `mark-range-${q.key}`,
        x: 'value',
        y: (t) => line(t.at),
        key: 'key',
        // A group each: on a row's line, the tap takes the nearest
        // tick or dot, not the first one drawn (`focusNearestY`).
        z: 'key',
        stroke: INK,
        strokeWidth: 2.5,
        strokeOpacity: q.dimmed ? DIMMED : 1,
        length: 16,
      }),
    )
  return [
    link(ranged, {
      id: 'range',
      x1: (r) => Math.min(...r.spread.map((q) => q.value)),
      x2: end,
      y1: (r) => line(r.key),
      y2: (r) => line(r.key),
      key: (r) => `range-${r.key}`,
      stroke: INK,
      strokeWidth: 2,
      strokeOpacity: (r) => (r.dimmed ? DIMMED : 1),
      lineCap: 'butt',
    }),
    ...tickMarks,
  ]
}

/** Only the bars and dots take the focus and the tap: the label, measure
 * and value texts of a row are its words, not points of their own. A tap
 * anywhere on a row reaches its mark. */
const onlyMarks = <P extends { markId: string }>(points: readonly P[]) =>
  points.filter((p) => p.markId.startsWith('mark'))
const MARK_FOCUS: ChartFocusStrategy<Row, number, RowY> = {
  resolve: (points, context) =>
    focusNearestY.resolve(onlyMarks(points), context),
  group: (points, context) => focusNearestY.group(onlyMarks(points), context),
  // Down the rows, as they read; a range's ticks from the left.
  navigation: (points) =>
    [...onlyMarks(points)].sort((a, b) => a.y - b.y || a.x - b.x),
}

/** Where a row sits on the y axis: its band, or on a dot chart its center
 * in pixels (`rowPlaces`). */
type RowY = string | number

/** The row a point sits on: its own, or its stacked bar's. */
const bandOf = (r: ChartPoint) => r.stack?.bar ?? r.key
const bands = (rows: ReadonlyArray<ChartPoint>) => [
  ...new Set(rows.map(bandOf)),
]

/** On stacked bars a tap falls inside a part: the nearest bar, then the
 * part whose right end is the first past the finger (the library places a
 * bar's point at that end). The keys go through the parts bar by bar. */
const STACK_FOCUS: ChartFocusStrategy<Row, number, RowY> = {
  resolve: (points, context) => {
    const marks = onlyMarks(points)
    const [near] = focusNearestY.resolve(marks, context)
    if (!near) return []
    const bar = marks
      .filter((p) => bandOf(p.datum) === bandOf(near.datum))
      .sort((a, b) => a.x - b.x)
    const hit = bar.find((p) => p.x >= context.x) ?? bar[bar.length - 1]
    return hit ? [hit] : []
  },
  group: (_, { point }) => [point],
  navigation: (points) =>
    [...onlyMarks(points)].sort((a, b) => a.y - b.y || a.x - b.x),
}

/** Values on parts thinner than this stay in the tap and the list: they
 * would not fit inside. */
const SMALLEST_WRITTEN_PART = 5

/** Stacked bars: one mark per part and look, then the bar's label above
 * it and each part's value inside it. */
function stackedMarks(
  chart: ChartView,
  rows: Row[],
  words: Row[],
  labelOffset: number,
) {
  const parts = chart.segments?.length ?? 1
  const start = (r: Row) => r.stack?.start ?? 0
  const marks: ChartMark<Row, number, RowY>[] = rows.map((r) => {
    const fade = r.dimmed ? DIMMED : 1
    return barX([r], {
      id: `mark-${r.key}`,
      x1: start,
      x2: (d) => start(d) + d.value,
      y: bandOf,
      key: 'key',
      maxThickness: 26,
      fill: INK,
      fillOpacity: partTone(r.stack?.part ?? 0, parts).opacity * fade,
      stroke: INK,
      strokeWidth: 1,
      strokeOpacity: fade,
    })
  })
  marks.push(...stackedTexts(words, labelOffset, parts))
  return marks
}

/** Stacked bars' words: the bar's label above it and each part's value
 * inside it. */
function stackedTexts(words: Row[], labelOffset: number, parts: number) {
  const start = (r: Row) => r.stack?.start ?? 0
  return [
    text(
      words.filter((r) => r.stack?.part === 0),
      {
        id: 'label',
        x: () => 0,
        y: bandOf,
        key: (r) => `label-${r.key}`,
        text: 'label',
        anchor: 'start',
        dy: -labelOffset,
        fontSize: LABEL.fontSize,
        fill: (r) => (r.dimmed ? MUTED : INK),
      },
    ),
    text(
      words.filter((r) => r.value >= SMALLEST_WRITTEN_PART),
      {
        id: 'value',
        x: (r) => start(r) + r.value / 2,
        y: bandOf,
        key: (r) => `value-${r.key}`,
        text: (r) => r.number.text,
        anchor: 'middle',
        fontSize: SMALL.fontSize,
        fontWeight: VALUE.fontWeight,
        fill: (r) =>
          r.dimmed ? INK : partTone(r.stack?.part ?? 0, parts).text,
      },
    ),
  ]
}

/** A row's mark. One mark per point, because a mark's opacity is one number,
 * and its id stays the same dimmed or lit: the library keys a point by its
 * mark's id, so a new id would lose the keyboard's place when the card moves
 * and the rows dim. */
function pointMarks(
  chart: ChartView,
  rows: Row[],
  hatch: string,
  y: (r: Row) => RowY,
) {
  return rows.map((row): ChartMark<Row, number, RowY> => {
    const fade = row.dimmed ? DIMMED : 1
    const id = `mark-${row.key}`
    if (chart.kind === 'bars')
      return barX([row], {
        id,
        x: 'value',
        y,
        key: 'key',
        maxThickness: 16,
        radius: 2,
        fill: row.own ? `url(#${hatch})` : INK,
        stroke: row.own ? INK : 'none',
        fillOpacity: fade,
      })
    const shape = row.definition ?? 0
    const options = {
      id,
      x: 'value',
      y,
      key: 'key',
      fillOpacity: fade,
      strokeOpacity: fade,
      stroke: INK,
      strokeWidth: 2,
    } as const
    // Filled circle, filled hexagon, hollow circle, hollow hexagon.
    const fill = shape >= 2 ? PAPER : INK
    return shape % 2 === 0
      ? dot([row], { ...options, r: 6, fill })
      : hexagon([row], { ...options, r: 7, fill })
  })
}

type ScenePoint = {
  readonly markId: string
  readonly datum: unknown
  readonly x: number
  readonly y: number
}

/** Where the words of a row run, for the "você" tag to keep clear of them:
 * its last label line, and the value after its mark (or after its range).
 * Stacked bars write their values inside the parts: none after them. */
function rowWords(
  points: ReadonlyArray<ScenePoint>,
  layout: Layout,
): (row: Row) => Pick<OverlayMark, 'labelEnd' | 'valueEnd'> {
  const right = new Map<string, number>()
  for (const point of points) {
    const datum = point.datum as Row | SpreadRow | undefined
    // A range's ticks are on their own line, under the row's (`SPREAD`).
    if (!datum || !point.markId.startsWith('mark') || 'at' in datum) continue
    const row = bandOf(datum)
    right.set(row, Math.max(right.get(row) ?? 0, point.x))
  }
  return (row) => ({
    labelEnd: labelEnd(layout, row.label),
    ...(layout === LAYOUT.stacked
      ? {}
      : {
          valueEnd:
            (right.get(bandOf(row)) ?? 0) +
            layout.valueDx +
            writtenValue(row).length * VALUE.wideLetter,
        }),
  })
}

/** Our layer's marks: where each bar or dot of a row landed in the scene. */
function overlayMarks(
  points: ReadonlyArray<ScenePoint>,
  { valueAbove, layout }: { valueAbove?: number; layout?: Layout } = {},
): OverlayMark[] {
  const words = layout && rowWords(points, layout)
  const seen = new Set<string>()
  const marks: OverlayMark[] = []
  for (const point of points) {
    // A range's ticks (#472) are marks of their own.
    const found = point.datum as Row | undefined
    // One ring or tag per row: a stacked bar's parts share theirs (#476).
    if (!point.markId.startsWith('mark') || !found || seen.has(bandOf(found)))
      continue
    seen.add(bandOf(found))
    marks.push({
      key: found.key,
      x: point.x,
      y: point.y,
      valueText: found.number.text,
      highlight: found.highlight,
      brazil: found.brazil,
      you: found.you,
      tick: point.markId.startsWith('mark-range'),
      ...(valueAbove === undefined ? {} : { valueAbove }),
      ...words?.(found),
    })
  }
  return marks
}

interface PlotProps {
  chart: ChartView
  /** The `?pais=` country, already checked against the Guide's. */
  country: string | null
  profile: Profile | null
  /** The key of the point that has the card (`chart-card.ts`). */
  active: string | null
  /** The pointer or the keyboard's focus reached a mark, or left. */
  onHover: (mark: ChartMarkAt | null) => void
  onSelect: (mark: ChartMarkAt | null) => void
}

/** The library's point as the card needs it: where the mark ends in the
 * drawing's pixels, which are the page's. */
const markAt = (
  point: { datum: Row; x: number; y: number } | null,
): ChartMarkAt | null => point && { point: point.datum, x: point.x, y: point.y }

/** A mark's row reaches any point of its height: the pointer finds the
 * nearest row, or the nearest year, wherever it is in the drawing. */
const ANYWHERE = Number.POSITIVE_INFINITY

/** A time line: one dot per number at its year, joined by a line when the
 * numbers share a unit, the value written above each dot and a tick per
 * year on the axis, the years with a number written. */
const LINE = {
  /** The plot's height, between its top line and the year axis. */
  plot: 150,
  /** Without a value scale, the dots sit on the year axis. */
  flatPlot: 40,
  /** Under the plot: the year axis and its words. */
  axis: 22,
  /** Over the plot, at least: half of the top tick's words. */
  minTop: 8,
  /** How far the value's line sits above its dot, clear of Brazil's
   * ring. */
  valueAbove: 22,
} as const

/** The room over a time line's plot: what its highest words need, and no
 * more (#470: no empty band under the title). A point whose Study may
 * cover a Profile keeps room for its "você" tag even without one, so the
 * plot stays put when a Profile is saved. */
function lineTop(chart: ChartView) {
  const scaled = chart.ticks.length > 0
  const top = chart.ticks[chart.ticks.length - 1]?.value || 1
  const plot = scaled ? LINE.plot : LINE.flatPlot
  return Math.ceil(
    Math.max(
      LINE.minTop,
      ...chart.points.map((p) => {
        const below = scaled ? (1 - p.value / top) * plot : plot
        return lineWordsAbove(LINE.valueAbove, p.covers.length > 0) - below
      }),
    ),
  )
}

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
  const tone = (r: Row) => (r.dimmed ? MUTED : INK)
  // The value's own copies of the rows, as in `RowPlot`: the focus ring
  // belongs on the dot only.
  const words = rows.map((r) => ({ ...r }))
  const anyDimmed = rows.some((r) => r.dimmed)
  const marks: ChartMark<Row, number, number>[] = []
  if (scaled && rows.length > 1)
    marks.push(
      lineY(rows, {
        id: 'line',
        x: 'year',
        y,
        stroke: INK,
        strokeWidth: 2,
        strokeOpacity: anyDimmed ? DIMMED : 1,
      }),
    )
  marks.push(...lineDots(rows, y))
  marks.push(
    text(words, {
      id: 'value',
      x: 'year',
      y,
      key: (r) => `value-${r.key}`,
      text: (r) => r.number.text,
      anchor: 'middle',
      dy: -LINE.valueAbove,
      fontSize: VALUE.fontSize,
      fontWeight: VALUE.fontWeight,
      fill: tone,
    }),
  )
  return marks
}

/** A time line's dots, one mark per point, as in `pointMarks`. */
function lineDots(rows: Row[], y: (r: Row) => number) {
  return rows.map((row): ChartMark<Row, number, number> => {
    const fade = row.dimmed ? DIMMED : 1
    const shape = row.definition ?? 0
    const options = {
      id: `mark-${row.key}`,
      x: 'year',
      y,
      key: 'key',
      fillOpacity: fade,
      strokeOpacity: fade,
      stroke: INK,
      strokeWidth: 2,
    } as const
    const fill = shape >= 2 ? PAPER : INK
    return shape % 2 === 0
      ? dot([row], { ...options, r: 6, fill })
      : hexagon([row], { ...options, r: 7, fill })
  })
}

/** A time line's x scale: the years, with a margin of years on each side,
 * so the values centered over the first and last dots clear the value axis
 * and the edge. */
function yearScale(years: NonNullable<ChartView['years']>) {
  const first = years[0]?.value ?? 0
  const last = years[years.length - 1]?.value ?? first
  const written = new Map(years.map((t) => [t.value, t.text]))
  return {
    scale: scaleLinear().domain([
      first - Math.max((last - first) * 0.12, 1),
      last + Math.max((last - first) * 0.12, 1),
    ]),
    axis: {
      ticks: {
        values: years.map((t) => t.value),
        format: (value: number) => written.get(value) ?? '',
      },
      tickLabels: { thin: false },
    },
  }
}

/** A time line's SVG with our layer: the tags above the values, inside the
 * plot. */
function lineSvg(
  scene: Parameters<typeof renderChartSvg>[0],
  options: Parameters<typeof renderChartSvg>[1],
) {
  const point = scene.points.find(
    (p) => p.markId.startsWith('mark') && (p.datum as Row | undefined)?.active,
  )
  return withOverlay(
    renderChartSvg(scene, options),
    overlayLayers(overlayMarks(scene.points, { valueAbove: LINE.valueAbove }), {
      labelOffset: 0,
      left: scene.chart.x,
      right: scene.chart.x + scene.chart.width,
    }),
    '',
    point
      ? yearGuide(
          point.x,
          point.y,
          scene.chart.y,
          scene.chart.y + scene.chart.height,
        )
      : '',
  )
}

function LinePlot({
  chart,
  country,
  profile,
  active,
  onHover,
  onSelect,
}: PlotProps) {
  const rows = useMemo(
    () => rowsOf(chart, country, profile, active),
    [chart, country, profile, active],
  )
  const scaled = chart.ticks.length > 0
  const above = lineTop(chart)
  const definition = useMemo(() => {
    const top = chart.ticks[chart.ticks.length - 1]?.value ?? 1
    return defineChart({
      marks: lineMarks(chart, rows),
      scales: {
        x: yearScale(chart.years ?? []),
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
      maxFocusDistance: ANYWHERE,
      // Both fixed, so the plot is exactly `LINE.plot` tall.
      margin: { top: above, bottom: LINE.axis },
      theme: THEME,
    })
  }, [chart, rows, scaled, above])

  return (
    <Chart
      definition={definition}
      renderSvg={lineSvg}
      initialWidth={INITIAL_WIDTH}
      height={above + (scaled ? LINE.plot : LINE.flatPlot) + LINE.axis}
      ariaLabel={chart.title}
      idPrefix={chart.domId}
      className={HOST_CLASS}
      onFocusChange={(point) => onHover(markAt(point))}
      onSelect={(point) => onSelect(markAt(point))}
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

/** How far the active row's verde-água reaches past its mark and its top
 * label line's baseline. */
const ACTIVE_ROW_PAD = { above: 11, below: 14 } as const

function RowPlot({
  chart,
  country,
  profile,
  active,
  onHover,
  onSelect,
}: PlotProps) {
  const hatch = `${chart.domId}-hatch`
  const rows = useMemo(
    () => rowsOf(chart, country, profile, active),
    [chart, country, profile, active],
  )
  const layout = layoutOf(chart)
  // A dot chart places its rows in pixels, so a row with a range can be
  // taller; bars keep the library's bands.
  const places = useMemo(
    () => (layout === LAYOUT.dots ? rowPlaces(rows, layout.row) : null),
    [rows, layout],
  )
  const definition = useMemo(() => {
    const ticks = chart.ticks
    const top = ticks[ticks.length - 1]?.value ?? 1
    const tone = (r: Row) => (r.dimmed ? MUTED : INK)
    const y = (r: Row): RowY => (places ? places.center(bandOf(r)) : bandOf(r))
    // The texts' own copies of the rows: the focus ring marks every point
    // whose datum is the focused one, and it belongs on the mark only.
    const words = rows.map((r) => ({ ...r }))
    const stacked = layout === LAYOUT.stacked
    const marginTop = (layout.label[0] ?? 0) - layout.row / 2 + 16
    // Stacked bars write their values inside the parts, not after the mark.
    const stackMarks = stacked
      ? stackedMarks(chart, rows, words, layout.label[0] ?? 0)
      : null
    return defineChart({
      marks: stackMarks ?? [
        ...(places ? rangeMarks(rows, places) : []),
        ...pointMarks(chart, rows, hatch, y),
        ...layout.label.map((dy, line) =>
          text(words, {
            id: line === 0 ? 'label' : `label-${line}`,
            x: () => 0,
            y,
            // A key of its own: the focus ring marks only the bar or dot.
            key: (r) => `label-${line}-${r.key}`,
            text: (r) => labelLines(layout, r.label)[line] ?? null,
            anchor: 'start',
            dy: -dy,
            fontSize: LABEL.fontSize,
            fontWeight: layout.bold ? 700 : 400,
            fill: tone,
          }),
        ),
        ...layout.measure.map((dy, line) =>
          text(words, {
            id: `measure-${line}`,
            x: () => 0,
            y,
            key: (r) => `measure-${line}-${r.key}`,
            text: (r) => lines(r.detail, MEASURE_LINE)[line] ?? null,
            anchor: 'start',
            dy: -dy,
            fontSize: SMALL.fontSize,
            fill: tone,
          }),
        ),
        ...(places
          ? [
              text(words, {
                id: 'range-words',
                x: () => 0,
                y,
                key: (r) => `range-words-${r.key}`,
                text: spreadWords,
                anchor: 'start',
                dy: SPREAD.words,
                fontSize: SMALL.fontSize,
                fill: tone,
              }),
            ]
          : []),
        text(words, {
          id: 'value',
          // After the dot, also on a row with a range: the range is on its
          // own line under it.
          x: 'value',
          y,
          key: (r) => `value-${r.key}`,
          text: writtenValue,
          anchor: 'start',
          dx: layout.valueDx,
          fontSize: VALUE.fontSize,
          fontWeight: VALUE.fontWeight,
          fill: tone,
        }),
      ],
      scales: {
        x: {
          scale: scaleLinear().domain([0, top]),
          // The parts' light washes would let the grid show through.
          grid: stacked ? false : { strokeOpacity: 0.25 },
          axis: {
            ticks: {
              values: ticks.map((t) => t.value),
              format: (value: number) =>
                ticks.find((t) => t.value === value)?.text ?? '',
            },
          },
        },
        y: {
          // Top down: a row's pixel center from the plot's top.
          scale: places
            ? scaleLinear().domain([places.height, 0])
            : scaleBand<string>()
                .domain(bands(rows))
                .paddingInner(0)
                .paddingOuter(0),
          axis: false,
        },
      },
      focus: stacked ? STACK_FOCUS : MARK_FOCUS,
      maxFocusDistance: ANYWHERE,
      // The sides are fixed: a long label must not squeeze the scale. On a
      // dot chart the bottom is too, so its pixels are the plot's.
      margin: {
        top: marginTop,
        left: LEFT,
        // Stacked bars end at 100%: room for that tick's text only.
        right: stacked ? 20 : valueRoom(chart, layout.valueDx),
        ...(places && { bottom: ROWS_MARGIN - marginTop }),
      },
      theme: THEME,
    })
  }, [chart, rows, hatch, layout, places])

  // One renderer for the chart's life: a new one replaces the whole SVG, and
  // the keyboard's focus with it. What changes comes through the scene.
  const renderSvg = useCallback<typeof renderChartSvg>(
    (scene, options) => {
      const marks = overlayMarks(scene.points, { layout })
      const datums = scene.points
        .filter((p) => p.markId.startsWith('mark'))
        .map((p) => ({ datum: p.datum as Row, y: p.y }))
      const defs = datums.some((d) => d.datum.own)
        ? `<defs><pattern id="${hatch}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="2.2"/></pattern></defs>`
        : ''
      const row = datums.find((d) => d.datum.active)
      const reach = (layout.label[0] ?? 0) + ACTIVE_ROW_PAD.above
      return withOverlay(
        renderChartSvg(scene, options),
        overlayLayers(marks, {
          // The "você" tag goes on the label's line, at the drawing's right
          // edge: past the plot, that line has no words.
          labelOffset: layout.label[layout.label.length - 1] ?? 0,
          left: scene.chart.x,
          right: scene.width,
        }),
        defs,
        row
          ? activeRowLayer(
              row.y - reach,
              reach +
                ACTIVE_ROW_PAD.below +
                (row.datum.spread.length > 0 ? SPREAD.extra : 0),
              scene.width,
            )
          : '',
      )
    },
    [hatch, layout],
  )

  return (
    <Chart
      definition={definition}
      renderSvg={renderSvg}
      initialWidth={INITIAL_WIDTH}
      height={(places?.height ?? bands(rows).length * layout.row) + ROWS_MARGIN}
      ariaLabel={chart.title}
      idPrefix={chart.domId}
      className={HOST_CLASS}
      onFocusChange={(point) => onHover(markAt(point))}
      onSelect={(point) => onSelect(markAt(point))}
    />
  )
}
