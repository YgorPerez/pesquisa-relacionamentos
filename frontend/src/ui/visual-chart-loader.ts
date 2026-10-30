// When the chart library reaches the browser (#470, ADR 0042). The page
// arrives with every chart's complete SVG from the server, and its first
// JavaScript does not carry the library: the plot (`visual-chart-plot.tsx`
// with the library) is its own chunk, fetched the first time a chart comes
// near the screen or is touched (`wantPlot`). Until then React leaves the
// server's SVG in place, inside a Suspense boundary that has not hydrated
// yet. The Guide's JS stays within ADR 0033's budget.
import { lazy } from 'react'

type PlotModule = typeof import('./visual-chart-plot')

let loaded: PlotModule | undefined
const loadPlot = () =>
  import('./visual-chart-plot').then((plot) => {
    loaded = plot
    return plot
  })

/** The server loads the plot before its first request (`server.ts`), so
 * `LazyPlot` resolves at once there and the SVG goes in the HTML, never a
 * fallback streamed later. */
export const preloadPlot = (): Promise<void> => loadPlot().then(() => undefined)

let want = () => {}
const wanted = new Promise<void>((resolve) => {
  want = resolve
})

/** Asks for the library: a chart is near the screen or was touched. Only
 * the first call fetches. */
export const wantPlot = () => want()

/** A thenable already resolved, which `lazy` reads without suspending. */
const ready = (plot: PlotModule): Promise<PlotModule> =>
  ({
    then: (done: (value: PlotModule) => unknown) => done(plot),
  }) as unknown as Promise<PlotModule>

export const LazyPlot = lazy(() =>
  loaded
    ? ready(loaded)
    : import.meta.env.SSR
      ? loadPlot()
      : wanted.then(loadPlot),
)
