// A Visual drawn by the chart library (#470, ADR 0042): the server sends its
// complete SVG, and the browser loads the library later to add the tap, the
// country filter and the Profile's "você" (`ui/visual-chart.tsx`). This
// view is what both sides draw from, plain data that crosses the server
// function as JSON.
//
// A bar comparison draws bars; a Study table whose numbers share one unit
// draws one dot per Study. A table that mixes units stays a table.
import type { Library, Visual } from '@tem-estudo/content'
import type { Coverage } from '@tem-estudo/rules/applies-to-you'
import { BRAZIL, countrySlug } from '@tem-estudo/rules/country'
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
  readonly kind: 'bars' | 'dots'
  /** The figure's id on the page. */
  readonly domId: string
  readonly title: string
  readonly note: string | null
  /** The value axis, from 0 to its last tick. */
  readonly ticks: ReadonlyArray<{
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

/** The Visuals the library draws, by `<topic>/<id>`. #471 moved one bar
 * comparison and one Study table; #472–#475 move the rest, and then the
 * rule becomes the kind alone. */
export const LIBRARY_VISUALS: ReadonlySet<string> = new Set([
  'onde-conhecer-pessoas/como-se-conheceram-1995-2017',
  'onde-conhecer-pessoas/fatia-online-por-estudo',
])

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

/** The chart of a Visual, or `null` when the library does not draw it (a
 * time line or a diagram, or a Study table of mixed units). */
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
    const points = visual.bars.map((bar, i): ChartPoint => {
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
    const points = visual.rows.flatMap((row, i): ChartPoint[] => {
      const study = cite(row.fact_sheet)
      if (!study) return []
      return [
        {
          key: `${i}`,
          // "Kowal et al. (2025)", without the Fact sheet's subtitle.
          label: study.title.replace(/:.*$/, ''),
          detail: row.measure,
          value: row.value,
          number: numberView(row, unit, cite),
          highlight: false,
          ...pointFacts(row, library, definitions),
        },
      ]
    })
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
  return null
}

/** The countries the charts carry, once each: Brazil first, then the
 * others in alphabetical order. The Guide's chips list these. */
export function chartCountries(
  charts: ReadonlyArray<ChartView>,
): ChartCountry[] {
  const found = new Map<string, ChartCountry>()
  for (const point of charts.flatMap((c) => c.points))
    if (point.country) found.set(point.country.slug, point.country)
  return [...found.values()].sort((a, b) =>
    a.slug === BRAZIL
      ? -1
      : b.slug === BRAZIL
        ? 1
        : a.name.localeCompare(b.name, 'pt-BR'),
  )
}
