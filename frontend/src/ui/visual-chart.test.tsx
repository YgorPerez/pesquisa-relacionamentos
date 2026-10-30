// A chart drawn by the library reads without JS (#471): the server's HTML
// has the complete SVG, every mark and exact value, our own layer (pink
// marker, Brazil's ring, the "você" tag) and the country filter already
// applied. The tap is in the story (`visual-chart.stories.tsx`), in a real
// browser, where the library measures and listens.
import { renderToString } from 'react-dom/server'
import { afterAll, beforeAll, expect, it, vi } from 'vite-plus/test'
import { VisualChart } from './visual-chart'
import { BARS, DOTS, LINE, LINE_MIXED } from './visual-chart.example'
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

it("wraps a bar's long label in two lines that fit a phone, and leaves the rest to the tap and the list", () => {
  const long = (label: string) => ({ ...BARS.points[0]!, label })
  const bars = page(
    renderToString(
      <VisualChart
        chart={{
          ...BARS,
          points: [
            long(
              'Homens que se sentiram inseguros por receber poucas mensagens',
            ),
            {
              ...long(
                'Términos com piora média ou maior, no sofrimento ou na satisfação com a vida',
              ),
              key: '1',
            },
          ],
        }}
        country={null}
        profile={null}
      />,
    ),
  )
  const texts = [...bars.querySelectorAll('svg[role="img"] text')].map(
    (t) => t.textContent ?? '',
  )
  expect(texts).toContain('Homens que se sentiram inseguros por')
  expect(texts).toContain('receber poucas mensagens')
  expect(texts).toContain('Términos com piora média ou maior, no')
  expect(texts.filter((t) => t.startsWith('sofrimento ou'))).toEqual([
    'sofrimento ou na satisfação com a vida',
  ])
  expect(Math.max(...texts.map((t) => t.length))).toBeLessThanOrEqual(40)
  // The whole label is still read, in the list under the chart.
  expect(bars.body.textContent).toContain(
    'Términos com piora média ou maior, no sofrimento ou na satisfação com a vida',
  )
})

it('leaves room on the right for a long value with a word unit', () => {
  const people = (value: number) => ({
    value,
    number: {
      ...DOTS.points[0]!.number,
      text: `${value.toLocaleString('pt-BR')} pessoas`,
    },
  })
  const chart = {
    ...DOTS,
    ticks: [0, 2, 4, 6, 8].map((m) => ({
      value: m * 1_000_000,
      text: `${m}.000.000`,
    })),
    points: [
      { ...DOTS.points[0]!, ...people(7_804_840) },
      { ...DOTS.points[1]!, ...people(747_507) },
    ],
  }
  const svg = page(
    renderToString(<VisualChart chart={chart} country={null} profile={null} />),
  ).querySelector('svg[role="img"]')
  const width = Number(svg?.getAttribute('viewBox')?.split(' ')[2])
  const value = [...(svg?.querySelectorAll('text') ?? [])].find(
    (t) => t.textContent === '7.804.840 pessoas',
  )
  // 14px bold letters are 7px wide or a little more.
  expect(Number(value?.getAttribute('x')) + 17 * 7.5).toBeLessThanOrEqual(width)
})

// Whether a chart of Brazil only rings its points is `chartView`'s rule
// (#473), in `content/chart-view.test.ts`.
it("writes a dot's value clear of Brazil's ring", () => {
  const dots = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  const dot = dots.querySelector('svg[role="img"] circle')
  const value = [...dots.querySelectorAll('svg[role="img"] text')].find(
    (t) => t.textContent === '18%',
  )
  // The ring reaches 12px from the dot's center.
  expect(Number(value?.getAttribute('x'))).toBeGreaterThan(
    Number(dot?.getAttribute('cx')) + 12,
  )
})

it('serves a time line with each value over its year, a written year only where there is a number', () => {
  const line = page(
    renderToString(<VisualChart chart={LINE} country={null} profile={null} />),
  )
  const svg = line.querySelector('svg[role="img"]')
  expect(svg?.querySelectorAll('circle').length).toBe(3)
  const texts = [...(svg?.querySelectorAll('text') ?? [])].map(
    (t) => t.textContent,
  )
  for (const value of ['13,5%', '23,4%', '31,1%', '2004', '2014', '2024'])
    expect(texts).toContain(value)
  expect(texts).not.toContain('2005')
  // The pink marker on 2024, and Brazil ringed at every point.
  expect(line.querySelectorAll('[data-ts-key="marcador"]').length).toBe(1)
  expect(line.querySelectorAll('[data-ts-key="brasil"]').length).toBe(3)
  // What each point measured, with its year, for a screen reader and
  // without JS.
  expect(line.body.textContent).toContain(
    '2024 · Pelo menos um divorciado ou viúvo: 31,1%',
  )
})

it('dims the other country on a time line, and tags "você" where the Profile is covered', () => {
  const mixed = page(
    renderToString(
      <VisualChart chart={LINE_MIXED} country="eua" profile={null} />,
    ),
  )
  const fill = (text: string) =>
    [...mixed.querySelectorAll('svg[role="img"] text')]
      .find((t) => t.textContent === text)
      ?.getAttribute('fill')
  expect(fill('0,1 ponto')).not.toContain('tinta-2')
  expect(fill('18%')).toContain('tinta-2')

  const line = page(
    renderToString(
      <VisualChart
        chart={LINE}
        country={null}
        profile={{ gender: 'mulher' }}
      />,
    ),
  )
  expect(line.querySelectorAll('[data-ts-key="voce"]').length).toBe(3)
})

it('shows the definitions as a legend of shapes', () => {
  const dots = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  expect(dots.body.textContent).toContain('só sites e aplicativos')
  expect(dots.body.textContent).toContain('qualquer canal online')
})
