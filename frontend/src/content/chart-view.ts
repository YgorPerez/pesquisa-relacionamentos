// A Visual drawn by the chart library (#470, ADR 0042): the server sends its
// complete SVG, and the browser loads the library later to add the tap, the
// country filter and the Profile's "você" (`ui/visual-chart.tsx`). This
// view is what both sides draw from, plain data that crosses the server
// function as JSON.
//
// A bar comparison draws bars; a Study table whose numbers share one unit
// draws one dot per Study. A table that mixes units stays a table
// (`ChartTable`) whose rows are the same points, so they take the tap and
// the country filter too. A time line draws a line over the years.
import type {
  FactSheet,
  Library,
  StudyTableVisual,
  Visual,
} from '@tem-estudo/content'
import type { Coverage } from '@tem-estudo/rules/applies-to-you'
import { BRAZIL, countrySlug } from '@tem-estudo/rules/country'
import { DESIGN_NAME } from '#/ui/badges.copy'
import { VISUAL_COPY } from '#/ui/visual.copy'
import {
  allSources,
  axisTicks,
  formatNumber,
  numberView,
  withUnit,
  type Cite,
  type NumberView,
  type SourceRef,
} from './visuals-view'

export interface ChartCountry {
  /** The `?pais=` value (`estados-unidos`). */
  readonly slug: string
  /** As the content writes it ("Estados Unidos"). */
  readonly name: string
}

export interface ChartPoint {
  readonly key: string
  /** The bar's label, or the Study's title on a dot row. */
  readonly label: string
  /** What the Study measured, on a dot row. */
  readonly detail: string | null
  readonly value: number
  readonly number: NumberView
  /** The point's own country, or its Fact sheet's when that has one only. */
  readonly country: ChartCountry | null
  readonly year: number | null
  /** The place of its definition in `ChartView.definitions`: its shape. */
  readonly definition: number | null
  /** The value the pink marker marks (`highlight` in the content). */
  readonly highlight: boolean
  /** Highlighted for everyone (#470). */
  readonly brazil: boolean
  /** Who the Fact sheets behind the number cover, for the "você" mark. */
  readonly covers: ReadonlyArray<Coverage>
}

export interface ChartView {
  readonly kind: 'bars' | 'dots' | 'line'
  /** The figure's id on the page. */
  readonly domId: string
  readonly title: string
  readonly note: string | null
  /** The value axis, from 0 to its last tick. A time line of mixed units
   * has none: its points sit on the year axis alone. */
  readonly ticks: ReadonlyArray<{
    readonly value: number
    readonly text: string
  }>
  /** A time line's year axis: a tick per year, the years of its points
   * written. */
  readonly years?: ReadonlyArray<{
    readonly value: number
    readonly text: string
  }>
  readonly points: ReadonlyArray<ChartPoint>
  readonly definitions: ReadonlyArray<{
    readonly id: string
    readonly legend: string
  }>
  /** The "conta nossa" lines under the chart. */
  readonly ownLines: ReadonlyArray<string>
  /** Every Fact sheet the chart cites, in the page's order. */
  readonly sources: ReadonlyArray<SourceRef>
}

/** A Study table whose numbers do not share a unit: still a table, one row
 * per Study, each row a point the tap opens. */
export interface ChartTable {
  readonly kind: 'table'
  readonly domId: string
  readonly title: string
  readonly note: string | null
  readonly rows: ReadonlyArray<{
    /** "Brasil · 2019 · 2.400 pessoas · transversal". */
    readonly context: string
    readonly point: ChartPoint
  }>
}

/** What a Guide draws through this module, in its React tree. */
export type GuideChart = ChartView | ChartTable

const country = (name: string): ChartCountry => ({
  slug: countrySlug(name),
  name,
})

interface Datum {
  readonly value: number
  readonly fact_sheet?: string | undefined
  readonly calculation?:
    | { readonly inputs: ReadonlyArray<{ readonly fact_sheet: string }> }
    | undefined
  readonly country?: string | undefined
  readonly year?: number | undefined
  readonly definition?: string | undefined
}

/** The parts of a point that come from its Fact sheets and its own fields. */
function pointFacts(
  datum: Datum,
  library: Library,
  definitions: ReadonlyArray<{ id: string }>,
) {
  const slugs = datum.calculation
    ? datum.calculation.inputs.map((i) => i.fact_sheet)
    : datum.fact_sheet
      ? [datum.fact_sheet]
      : []
  const factSheets = [...new Set(slugs)].flatMap((slug) => {
    const found = library.factSheets.find((f) => f.slug === slug)
    return found ? [found] : []
  })
  const only = factSheets.length === 1 ? factSheets[0]?.countries : undefined
  const name = datum.country ?? (only?.length === 1 ? (only[0] ?? null) : null)
  const where = name ? country(name) : null
  const index = definitions.findIndex((d) => d.id === datum.definition)
  return {
    country: where,
    brazil: where?.slug === BRAZIL,
    year: datum.year ?? null,
    definition: index >= 0 ? index : null,
    covers: factSheets.map((f) => f.covers as Coverage),
  }
}

const ticksOf = (largest: number, max: number | undefined, unit: string) => {
  const ticks = axisTicks(largest, max, unit)
  const last = ticks.length - 1
  return ticks.map((value, i) => ({
    value,
    text:
      unit === '%' || i === last ? withUnit(value, unit) : formatNumber(value),
  }))
}

/** Brazil's ring sets it apart from other countries. Most charts split one
 * country's survey: a ring on every Brazilian point would mark nothing, so
 * it stays only when the chart also has a point of another country. */
function ringApart(points: ChartPoint[]): ChartPoint[] {
  const apart = points.some((p) => p.country && !p.brazil)
  return apart ? points : points.map((p) => ({ ...p, brazil: false }))
}

/** A tick per year, one every five past 30 years; only the years of the
 * points are written, so the axis fits a phone. */
function yearTicks(years: ReadonlyArray<number>) {
  const first = Math.min(...years)
  const span = Math.max(...years) - first
  return Array.from({ length: span + 1 }, (_, i) => first + i)
    .filter((year) => span <= 30 || year % 5 === 0 || years.includes(year))
    .map((value) => ({
      value,
      text: years.includes(value) ? String(value) : '',
    }))
}

/** The chart of a Visual, or `null` when the library does not draw it (a
 * diagram, or a Study table of mixed units). */
export function chartView(
  visual: Visual,
  library: Library,
  cite: Cite,
  scope: string,
): ChartView | null {
  const common = {
    domId: `visual-${scope}-${visual.id}`,
    title: visual.title,
    note: visual.note ?? null,
  }
  if (visual.kind === 'bars') {
    const definitions = visual.definitions ?? []
    const all = visual.bars.map((bar, i): ChartPoint => {
      const number = numberView(bar, visual.unit, cite)
      return {
        key: `${i}`,
        label: bar.label,
        detail: null,
        value: bar.value,
        number,
        highlight: bar.label === visual.highlight,
        ...pointFacts(bar, library, definitions),
      }
    })
    const points = ringApart(all)
    return {
      kind: 'bars',
      ...common,
      ticks: ticksOf(
        Math.max(...visual.bars.map((b) => b.value)),
        visual.max,
        visual.unit,
      ),
      points,
      definitions: definitions.map(({ id, legend }) => ({ id, legend })),
      ownLines: points.flatMap((p) =>
        p.number.own
          ? [VISUAL_COPY.ownLine(p.label, p.number.own, p.number.text)]
          : [],
      ),
      sources: allSources(points.map((p) => p.number)),
    }
  }
  if (visual.kind === 'study-table') {
    const units = new Set(visual.rows.map((r) => r.unit))
    const [unit] = units
    if (units.size !== 1 || unit === undefined) return null
    const definitions = visual.definitions ?? []
    const points = ringApart(studyPoints(visual, library, cite))
    return {
      kind: 'dots',
      ...common,
      ticks: ticksOf(
        Math.max(...visual.rows.map((r) => r.value)),
        undefined,
        unit,
      ),
      points,
      definitions: definitions.map(({ id, legend }) => ({ id, legend })),
      ownLines: [],
      sources: allSources(points.map((p) => p.number)),
    }
  }
  if (visual.kind === 'timeline') {
    const units = new Set(visual.events.map((e) => e.unit))
    const [unit] = units
    const definitions = visual.definitions ?? []
    const points = ringApart(
      visual.events.map((event, i): ChartPoint => ({
        key: `${i}`,
        label: event.label,
        detail: null,
        value: event.value,
        number: numberView(event, event.unit, cite),
        highlight: event.year === visual.highlight,
        ...pointFacts(event, library, definitions),
      })),
    )
    return {
      kind: 'line',
      ...common,
      ticks:
        units.size === 1 && unit !== undefined
          ? ticksOf(
              Math.max(...visual.events.map((e) => e.value)),
              undefined,
              unit,
            )
          : [],
      years: yearTicks(visual.events.map((e) => e.year)),
      points,
      definitions: definitions.map(({ id, legend }) => ({ id, legend })),
      ownLines: points.flatMap((p) =>
        p.number.own
          ? [VISUAL_COPY.ownLine(String(p.year), p.number.own, p.number.text)]
          : [],
      ),
      sources: allSources(points.map((p) => p.number)),
    }
  }
  return null
}

/** One point per row of a Study table, each number in its own unit. */
function studyPoints(
  visual: StudyTableVisual,
  library: Library,
  cite: Cite,
): ChartPoint[] {
  const definitions = visual.definitions ?? []
  return visual.rows.flatMap((row, i): ChartPoint[] => {
    const study = cite(row.fact_sheet)
    if (!study) return []
    return [
      {
        key: `${i}`,
        // "Kowal et al. (2025)", without the Fact sheet's subtitle.
        label: study.title.replace(/:.*$/, ''),
        detail: row.measure,
        value: row.value,
        number: numberView(row, row.unit, cite),
        highlight: false,
        ...pointFacts(row, library, definitions),
      },
    ]
  })
}

const peopleFormat = new Intl.NumberFormat('pt-BR')

/** The Fact sheet's place, year, sample and design, short. */
function studyContext(factSheet: FactSheet | undefined): string {
  if (!factSheet) return ''
  const design = DESIGN_NAME[factSheet.design].replace(/ \(.*\)$/, '')
  return [
    factSheet.countries.length > 2
      ? VISUAL_COPY.countries(factSheet.countries.length)
      : factSheet.countries.join(', '),
    factSheet.period,
    factSheet.sample.n
      ? VISUAL_COPY.people(peopleFormat.format(factSheet.sample.n))
      : '',
    design,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** A Study table of mixed units as a table of points, or `null` when it is
 * not a Study table or `chartView` draws it as dots (one unit). */
export function chartTable(
  visual: Visual,
  library: Library,
  cite: Cite,
  scope: string,
): ChartTable | null {
  if (visual.kind !== 'study-table') return null
  if (new Set(visual.rows.map((r) => r.unit)).size === 1) return null
  return {
    kind: 'table',
    domId: `visual-${scope}-${visual.id}`,
    title: visual.title,
    note: visual.note ?? null,
    rows: studyPoints(visual, library, cite).map((point) => ({
      context: studyContext(
        library.factSheets.find(
          (f) => f.slug === visual.rows[Number(point.key)]?.fact_sheet,
        ),
      ),
      point,
    })),
  }
}

/** The points of a chart, or of a table's rows. */
export const pointsOf = (chart: GuideChart): ReadonlyArray<ChartPoint> =>
  chart.kind === 'table' ? chart.rows.map((r) => r.point) : chart.points

/** The countries the charts carry, once each: Brazil first, then the
 * others in alphabetical order. The Guide's chips list these. */
export function chartCountries(
  charts: ReadonlyArray<GuideChart>,
): ChartCountry[] {
  const found = new Map<string, ChartCountry>()
  for (const point of charts.flatMap(pointsOf))
    if (point.country) found.set(point.country.slug, point.country)
  return [...found.values()].sort((a, b) =>
    a.slug === BRAZIL
      ? -1
      : b.slug === BRAZIL
        ? 1
        : a.name.localeCompare(b.name, 'pt-BR'),
  )
}
