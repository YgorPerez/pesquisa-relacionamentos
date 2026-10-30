// A chart drawn by the library reads without JS (#471): the server's HTML
// has the complete SVG, every mark and exact value, our own layer (pink
// marker, Brazil's ring, the "você" tag) and the country filter already
// applied. The tap is in the story (`visual-chart.stories.tsx`), in a real
// browser, where the library measures and listens.
import { renderToString } from 'react-dom/server'
import { afterAll, beforeAll, expect, it, vi } from 'vite-plus/test'
import { VisualChart } from './visual-chart'
import { BARS, DOTS, STACKED } from './visual-chart.example'
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

it('serves each part of a stacked bar with its value inside, and the parts as a legend', () => {
  const stacked = page(
    renderToString(
      <VisualChart chart={STACKED} country={null} profile={null} />,
    ),
  )
  const svg = stacked.querySelector('svg[role="img"]')
  expect(svg?.querySelectorAll('rect[data-ts-key]').length).toBe(8)
  const words = [...(svg?.querySelectorAll('text') ?? [])].map(
    (t) => t.textContent,
  )
  for (const value of ['27%', '26%', '20%', '52%', '15%', '7%'])
    expect(words).toContain(value)
  // One label per bar, not one per part.
  expect(words.filter((w) => w === 'Mulheres heterossexuais')).toHaveLength(1)
  const legend = stacked.querySelector('[data-slot="partes"]')
  expect(legend?.textContent).toContain('Contentes')
  expect(legend?.textContent).toContain('Muito arrependidos')
  // The list a screen reader reads names each part of each bar.
  expect(stacked.querySelector('ul.sr-only')?.textContent).toContain(
    'Homens heterossexuais, Muito arrependidos: 7%',
  )
})

it('tags "você" once, on the bar whose group is the Profile', () => {
  const woman = page(
    renderToString(
      <VisualChart
        chart={STACKED}
        country={null}
        profile={{ gender: 'mulher', seeks: 'homens' }}
      />,
    ),
  )
  expect(woman.querySelectorAll('[data-ts-key="voce"]').length).toBe(1)
  const none = page(
    renderToString(
      <VisualChart
        chart={STACKED}
        country={null}
        profile={{ gender: 'outro' }}
      />,
    ),
  )
  expect(none.querySelector('[data-ts-key="voce"]')).toBeNull()
})

it('shows the definitions as a legend of shapes', () => {
  const dots = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  expect(dots.body.textContent).toContain('só sites e aplicativos')
  expect(dots.body.textContent).toContain('qualquer canal online')
})
