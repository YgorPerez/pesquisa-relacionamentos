// What a chart's two filters keep lit (#501): the Guide's country (`?pais=`)
// and the chart's own legend. The frame says when the pair matches nothing,
// and the plot, a chunk of its own, dims by the same rules.
import type { ChartPoint } from '#/content/chart-point'

export const ofCountry = (point: ChartPoint, country: string | null) =>
  point.country?.slug === country

/** The point, or a point of its range, is the country's. */
export const reachesCountry = (point: ChartPoint, country: string | null) =>
  ofCountry(point, country) ||
  (point.range?.some((q) => ofCountry(q, country)) ?? false)

/** A country lights a chart only if the chart has it: the others stay as they
 * are. */
export const litByCountry = (
  points: ReadonlyArray<ChartPoint>,
  country: string | null,
) => country !== null && points.some((p) => reachesCountry(p, country))

/** The point answers to the legend's key: its part on stacked bars, its
 * definition's shape on the others. A range's points go by their row. */
export const ofLegend = (point: ChartPoint, legend: number | null) =>
  legend === null || (point.stack?.part ?? point.definition) === legend

/** Both filters are on and no point answers to both. */
export const matchesNothing = (
  points: ReadonlyArray<ChartPoint>,
  country: string | null,
  legend: number | null,
) =>
  legend !== null &&
  litByCountry(points, country) &&
  !points.some((p) => ofLegend(p, legend) && reachesCountry(p, country))
