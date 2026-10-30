// A chart drawn by the library reads without JS (#471): the server's HTML
// has the complete SVG, every mark and exact value, our own layer (pink
// marker, Brazil's ring, the "você" tag) and the country filter already
// applied. The tap is in the story (`visual-chart.stories.tsx`), in a real
// browser, where the library measures and listens.
import { renderToString } from 'react-dom/server'
import { afterAll, beforeAll, expect, it, vi } from 'vite-plus/test'
import { VisualChart } from './visual-chart'
import { BARS, DOTS, RANGE } from './visual-chart.example'
import { preloadPlot } from './visual-chart-loader'

// Rendered as the server renders: with the plot already loaded.
beforeAll(async () => {
  vi.stubEnv('SSR', true)
  await preloadPlot()
})
afterAll(() => vi.unstubAllEnvs())

const page = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html')

it('serves every bar and dot with its exact value before JavaScript', () => {
  const bars = page(
    renderToString(<VisualChart chart={BARS} country={null} profile={null} />),
  )
  expect(
    bars.querySelectorAll('svg[role="img"] rect[data-ts-key]').length,
  ).toBeGreaterThanOrEqual(2)
  const barText = bars.querySelector('svg[role="img"]')?.textContent ?? ''
  expect(barText).toContain('39%')
  expect(barText).toContain('61%')
  expect(barText).toContain('Online, 2017')

  const dots = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  const svg = dots.querySelector('svg[role="img"]')
  expect(svg?.querySelectorAll('circle').length).toBe(2)
  expect(svg?.querySelectorAll('path[d*="L"]').length).toBeGreaterThan(0)
  for (const value of ['18%', '39%', '9%'])
    expect(svg?.textContent).toContain(value)
})

it('marks the key value in pink and rings Brazil, for everyone', () => {
  const bars = page(
    renderToString(<VisualChart chart={BARS} country={null} profile={null} />),
  )
  expect(bars.querySelectorAll('[data-ts-key="marcador"]').length).toBe(1)
  const dots = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  expect(dots.querySelectorAll('[data-ts-key="brasil"]').length).toBe(1)
  expect(dots.querySelector('[data-ts-key="voce"]')).toBeNull()
})

it('lights the chosen country and dims the others', () => {
  const dots = page(
    renderToString(<VisualChart chart={DOTS} country="eua" profile={null} />),
  )
  const values = [...dots.querySelectorAll('svg[role="img"] text')].filter(
    (t) => (t.textContent ?? '').endsWith('%') && t.textContent !== '0%',
  )
  const dimmed = (text: string) =>
    values
      .find((t) => t.textContent === text)
      ?.getAttribute('fill')
      ?.includes('tinta-2')
  expect(dimmed('39%')).toBe(false)
  expect(dimmed('18%')).toBe(true)
  expect(dimmed('9%')).toBe(true)
})

it('tags "você" on the Studies that cover the Profile', () => {
  const dots = page(
    renderToString(
      <VisualChart chart={DOTS} country={null} profile={{ age: 30 }} />,
    ),
  )
  // Silva covers 18–35 and Rosenfeld 26–65; Bergström did not split.
  expect(dots.querySelectorAll('[data-ts-key="voce"]').length).toBe(2)
  const young = page(
    renderToString(
      <VisualChart chart={DOTS} country={null} profile={{ age: 20 }} />,
    ),
  )
  expect(young.querySelectorAll('[data-ts-key="voce"]').length).toBe(1)
})

it("draws a Study's spread across countries, with Brazil ringed inside it", () => {
  const html = page(
    renderToString(<VisualChart chart={RANGE} country={null} profile={null} />),
  )
  const svg = html.querySelector('svg[role="img"]')
  // Each end and Brazil, named with their values under the row.
  for (const words of ['Gana 7%', 'Brasil 19,3%', 'Polônia 33%'])
    expect(svg?.textContent).toContain(words)
  expect(svg?.textContent).toContain('média 16%')
  expect(html.querySelectorAll('[data-ts-key="brasil"]').length).toBe(1)
  // A screen reader hears every point of the spread too.
  expect(html.querySelector('ul.sr-only')?.textContent).toContain(
    'Polônia: 33%',
  )
})

it("lights a Study whose spread has the chosen country, and dims the spread's other countries", () => {
  const html = page(
    renderToString(<VisualChart chart={RANGE} country="gana" profile={null} />),
  )
  const texts = [...html.querySelectorAll('svg[role="img"] text')]
  const dimmed = (words: string) =>
    texts
      .find((t) => t.textContent?.includes(words))
      ?.getAttribute('fill')
      ?.includes('tinta-2')
  expect(dimmed('média 16%')).toBe(false)
  expect(dimmed('39%')).toBe(true)
  // The ticks: Ghana's lit, Brazil's and Poland's dimmed.
  const ticks = [
    ...html.querySelectorAll('svg[role="img"] [data-ts-key^="marca-faixa"]'),
  ]
  expect(ticks.length).toBeGreaterThan(0)
  const opacities = [...html.querySelectorAll('svg[role="img"] line')]
    .map((l) => l.getAttribute('stroke-opacity'))
    .filter((o) => o === '0.22')
  expect(opacities.length).toBe(2)
})

it('shows the definitions as a legend of shapes', () => {
  const dots = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  expect(dots.body.textContent).toContain('só sites e aplicativos')
  expect(dots.body.textContent).toContain('qualquer canal online')
})
