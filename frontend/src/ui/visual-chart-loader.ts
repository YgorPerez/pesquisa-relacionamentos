// When the chart library reaches the browser (#470, ADR 0042). The page
// arrives with every chart's complete SVG from the server, and its first
// JavaScript does not carry the library: the plot (`visual-chart-plot.tsx`
// with the library) is its own chunk, fetched the first time a chart comes
// near the screen or is touched (`wantPlot`). Until then React leaves the
// server's SVG in place, inside a Suspense boundary that has not hydrated
// yet. So the library's chunk is not part of the page's initial load (the
// Guide's JS budget is #484).
import { createElement, lazy, type ComponentProps } from 'react'

type PlotModule = typeof import('./visual-chart-plot')

let loaded: PlotModule | undefined
const loadPlot = () =>
  import('./visual-chart-plot').then((plot) => {
    loaded = plot
    return plot
  })

/** The server loads the plot before its first request (`server.ts`), so
 * the SVG goes in the HTML, never a fallback streamed later. */
export const preloadPlot = (): Promise<void> => loadPlot().then(() => undefined)

let want = () => {}
const wanted = new Promise<void>((resolve) => {
  want = resolve
})

/** Asks for the library: a chart is near the screen or was touched. Only
 * the first call fetches. */
export const wantPlot = () => want()

/** The browser's plot: the same component, once the library arrived. */
const LazyPlot = lazy(() => wanted.then(loadPlot))

/** The plot inside the chart's Suspense boundary. The server renders the
 * one it preloaded, so nothing suspends there; the browser always goes
 * through `LazyPlot`, so the element type never changes between renders. */
export function Plot(props: ComponentProps<PlotModule['default']>) {
  const server = import.meta.env.SSR ? loaded?.default : undefined
  return createElement(server ?? LazyPlot, props)
}
