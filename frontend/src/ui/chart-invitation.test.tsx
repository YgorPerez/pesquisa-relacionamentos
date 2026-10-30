// What tells a reader a chart can be touched (#500): the label under every
// chart, in the words of the reader's device, and the one pulse of a visit.
// jsdom has no layout or media queries, so the device and the screen are
// stubbed; the pulse's look is checked in a real browser (skill `test-app`).
import { act, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vite-plus/test'
import type { ChartTable } from '#/content/chart-view'
import { CHART_INVITATION_COPY } from './chart-invitation.copy'
import { VisualChart } from './visual-chart'
import { VisualChartTable } from './visual-chart-table'
import { BARS, DOTS } from './visual-chart.example'
import { preloadPlot } from './visual-chart-loader'

beforeAll(async () => {
  vi.stubEnv('SSR', true)
  await preloadPlot()
})
afterAll(() => vi.unstubAllEnvs())
afterEach(() => vi.unstubAllGlobals())

const TABLE: ChartTable = {
  kind: 'table',
  domId: 'table-chart',
  title: 'Two Studies',
  note: null,
  rows: DOTS.points.map((point) => ({ point, context: 'Brasil · 2019' })),
}

/** The device: which media queries match. */
function device({ mouse = true, lessMotion = false } = {}) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduced-motion')
      ? lessMotion
      : query.includes('hover') && mouse,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

/** The screen: what `seen` puts in view, chart by chart. */
function screenWithObserver() {
  const observers: {
    element: Element
    report: (isIntersecting: boolean) => void
  }[] = []
  const report = (figure: Element, isIntersecting: boolean) => {
    act(() => {
      for (const o of observers)
        if (figure.contains(o.element)) o.report(isIntersecting)
    })
  }
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe(element: Element) {
        observers.push({
          element,
          report: (isIntersecting: boolean) =>
            this.callback(
              [{ isIntersecting } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            ),
        })
      }
      disconnect() {}
    },
  )
  return {
    seen: (figure: Element) => report(figure, true),
    left: (figure: Element) => report(figure, false),
  }
}

const pulse = (within: ParentNode = document) =>
  within.querySelector('[data-slot="chart-pulse"]')
const figureOf = (chart: { domId: string }) =>
  document.getElementById(chart.domId)!

it('says hover and click to a mouse, and tap to a finger', () => {
  device({ mouse: true })
  const { unmount } = render(
    <VisualChart chart={DOTS} country={null} profile={null} />,
  )
  expect(screen.getByText(CHART_INVITATION_COPY.mouse)).toBeVisible()
  expect(screen.queryByText(CHART_INVITATION_COPY.touch)).toBeNull()
  unmount()

  device({ mouse: false })
  render(<VisualChart chart={DOTS} country={null} profile={null} />)
  expect(screen.getByText(CHART_INVITATION_COPY.touch)).toBeVisible()
  expect(screen.queryByText(CHART_INVITATION_COPY.mouse)).toBeNull()
})

it('labels a Study table too', () => {
  device({ mouse: false })
  render(<VisualChartTable table={TABLE} country={null} profile={null} />)
  expect(screen.getByText(CHART_INVITATION_COPY.touch)).toBeVisible()
})

it('says nothing without JavaScript, where a tap opens nothing', () => {
  device()
  const served = renderToString(
    <VisualChart chart={DOTS} country={null} profile={null} />,
  )
  expect(served).not.toContain(CHART_INVITATION_COPY.mouse)
  expect(served).not.toContain(CHART_INVITATION_COPY.touch)
})

it('pulses only the first chart seen, and only once in a visit', async () => {
  device()
  const { seen } = screenWithObserver()
  const { unmount } = render(
    <>
      <VisualChart chart={BARS} country={null} profile={null} />
      <VisualChart chart={DOTS} country={null} profile={null} />
    </>,
  )
  expect(pulse()).toBeNull()

  seen(figureOf(DOTS))
  await waitFor(() => expect(pulse(figureOf(DOTS))).not.toBeNull())
  seen(figureOf(BARS))
  await act(() => preloadPlot())
  expect(pulse(figureOf(BARS))).toBeNull()
  unmount()

  // The next page of the same visit.
  render(<VisualChart chart={BARS} country={null} profile={null} />)
  seen(figureOf(BARS))
  await act(() => preloadPlot())
  expect(pulse()).toBeNull()
})

it('saves the pulse for the chart the reader stops at, not one scrolled past', async () => {
  device()
  const { seen, left } = screenWithObserver()
  render(
    <>
      <VisualChart chart={BARS} country={null} profile={null} />
      <VisualChart chart={DOTS} country={null} profile={null} />
    </>,
  )
  seen(figureOf(BARS))
  left(figureOf(BARS))
  seen(figureOf(DOTS))
  await waitFor(() => expect(pulse(figureOf(DOTS))).not.toBeNull())
  expect(pulse(figureOf(BARS))).toBeNull()
})

it('pulses a Study table when it is the first chart seen', async () => {
  device()
  const { seen } = screenWithObserver()
  render(<VisualChartTable table={TABLE} country={null} profile={null} />)
  seen(figureOf(TABLE))
  await waitFor(() => expect(pulse(figureOf(TABLE))).not.toBeNull())
})

it('does not pulse for a reader who asked for less motion, and keeps the label', async () => {
  device({ lessMotion: true, mouse: false })
  const { seen } = screenWithObserver()
  render(<VisualChart chart={DOTS} country={null} profile={null} />)
  seen(figureOf(DOTS))
  await act(() => preloadPlot())
  expect(pulse()).toBeNull()
  expect(screen.getByText(CHART_INVITATION_COPY.touch)).toBeVisible()
})
