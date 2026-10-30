// One point of a chart, on its own: the card and its store need this and not
// the whole view (`chart-view.ts`, which builds it).
import type { Coverage } from '@tem-estudo/rules/applies-to-you'
import type { NumberView } from './visuals-view'

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
  /** A dot row's spread across the places its Study pooled (#472): a line
   * from the smallest of these points to the largest, each one tappable,
   * with the row's year and definition. */
  readonly range?: ReadonlyArray<ChartPoint>
  /** On stacked bars, the part this point is: its bar's key, its place
   * in `ChartView.segments` and where it starts on the axis. */
  readonly stack?: {
    readonly bar: string
    readonly part: number
    readonly start: number
  }
}
