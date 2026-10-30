// A chart drawn by the library reads without JS (#471): the server's HTML
// has the complete SVG, every mark and exact value, our own layer (pink
// marker, Brazil's ring, the "você" tag) and the country filter already
// applied. The tap is in the story (`visual-chart.stories.tsx`), in a real
// browser, where the library measures and listens.
import { render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterAll, beforeAll, expect, it, vi } from 'vite-plus/test'
import { VisualChart } from './visual-chart'
import { CHART_COPY } from './visual-chart.copy'
import {
  BARS,
  DOTS,
  LINE,
  LINE_MIXED,
  RANGE,
  STACKED,
} from './visual-chart.example'
import { preloadPlot } from './visual-chart-loader'

// Rendered as the server renders: with the plot already loaded.
beforeAll(async () => {
  vi.stubEnv('SSR', true)
  await preloadPlot()
})
afterAll(() => vi.unstubAllEnvs())

const page = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html')

/** The list of every value a screen reader reads under the chart, on a
 * chart without a time line's labels (the parsed page has no styles to
 * tell what is hidden). */
const valueList = (html: Document) =>
  within(html.body).getAllByRole('list', { hidden: true })[0]!

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
  expect(bars.querySelectorAll('[data-ts-key="marker"]').length).toBe(1)
  const dots = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  expect(dots.querySelectorAll('[data-ts-key="brazil"]').length).toBe(1)
  expect(dots.querySelector('[data-ts-key="you"]')).toBeNull()
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
  expect(dots.querySelectorAll('[data-ts-key="you"]').length).toBe(2)
  const young = page(
    renderToString(
      <VisualChart chart={DOTS} country={null} profile={{ age: 20 }} />,
    ),
  )
  expect(young.querySelectorAll('[data-ts-key="you"]').length).toBe(1)
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
  expect(line.querySelectorAll('[data-ts-key="marker"]').length).toBe(1)
  expect(line.querySelectorAll('[data-ts-key="brazil"]').length).toBe(3)
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
  expect(line.querySelectorAll('[data-ts-key="you"]').length).toBe(3)
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
  expect(html.querySelectorAll('[data-ts-key="brazil"]').length).toBe(1)
  // A screen reader hears every point of the spread too.
  expect(valueList(html).textContent).toContain('Polônia: 33%')
})

it("keeps a Study's average clear of Brazil's ring, and its countries' words a row's gap from the next title", () => {
  const next = { ...RANGE.points[0]!, key: '2', label: 'Lampard (2020)' }
  const html = page(
    renderToString(
      <VisualChart
        chart={{ ...RANGE, points: [...RANGE.points, next] }}
        country={null}
        profile={null}
      />,
    ),
  )
  const svg = html.querySelector('svg[role="img"]')!
  const texts = [...svg.querySelectorAll('text')]
  const y = (words: string) =>
    Number(texts.find((t) => t.textContent?.includes(words))?.getAttribute('y'))
  const dot = (value: string) =>
    Number(
      [...svg.querySelectorAll('circle')]
        .find((c) => Math.abs(Number(c.getAttribute('cx')) - x(value)) < 1)
        ?.getAttribute('cy'),
    )
  // A value's words start 16px after its dot's center.
  const x = (value: string) =>
    Number(
      texts.find((t) => t.textContent?.endsWith(value))?.getAttribute('x'),
    ) - 16
  // The ring's path starts 2px over its center and reaches 14px above it.
  const ring = svg.querySelector('[data-ts-key="brazil"]')?.getAttribute('d')
  const ringCenter = Number(/^M[\d.]+ ([\d.]+)/.exec(ring ?? '')?.[1]) + 2
  // The average's dot (6px, its stroke 1px more) ends before the ring
  // starts.
  expect(ringCenter - 14).toBeGreaterThan(dot('média 16%') + 7)
  // Under a plain row, its value's line is this far from the next title.
  const gap = y('Kowal et al. (2025)') - dot('39%')
  expect(y('Lampard (2020)') - y('Gana 7%')).toBeGreaterThanOrEqual(gap)
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
    ...html.querySelectorAll('svg[role="img"] [data-ts-key^="mark-range"]'),
  ]
  expect(ticks.length).toBeGreaterThan(0)
  const opacities = [...html.querySelectorAll('svg[role="img"] line')]
    .map((l) => l.getAttribute('stroke-opacity'))
    .filter((o) => o === '0.22')
  expect(opacities.length).toBe(2)
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
  expect(valueList(stacked).textContent).toContain(
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
  expect(woman.querySelectorAll('[data-ts-key="you"]').length).toBe(1)
  const none = page(
    renderToString(
      <VisualChart
        chart={STACKED}
        country={null}
        profile={{ gender: 'outro' }}
      />,
    ),
  )
  expect(none.querySelector('[data-ts-key="you"]')).toBeNull()
})

/** The "você" tags' boxes in a chart's SVG. */
const tags = (html: Document) =>
  [...html.querySelectorAll('[data-ts-key="you"] rect')].map((rect) => ({
    left: Number(rect.getAttribute('x')),
    top: Number(rect.getAttribute('y')),
  }))

it('keeps the "você" tag clear of a long Study title on a phone\'s width', () => {
  // Past the plot's right edge on a 350px drawing.
  const title = 'Pew Research Center (2023, 2020 e 2019)'
  const dots = page(
    renderToString(
      <VisualChart
        chart={{
          ...DOTS,
          points: DOTS.points.map((p) => ({ ...p, label: title })),
        }}
        country={null}
        profile={{ age: 30 }}
      />,
    ),
  )
  const labels = [...dots.querySelectorAll('svg[role="img"] text')].filter(
    (t) => t.textContent === title,
  )
  expect(tags(dots)).toHaveLength(2)
  // Each tag sits on its row's title line, past where the title ends: a
  // 13px bold title runs about 6.5px a letter.
  const ends = tags(dots).map((tag) => {
    const label = labels.find(
      (t) => Math.abs(Number(t.getAttribute('y')) - (tag.top + 10)) < 3,
    )
    return {
      tag: tag.left,
      title: Number(label?.getAttribute('x')) + title.length * 6.5,
    }
  })
  for (const { tag, title: end } of ends) expect(tag).toBeGreaterThan(end)
})

it('keeps a time line\'s "você" tags clear of the value axis\'s words', () => {
  const line = page(
    renderToString(
      <VisualChart
        chart={LINE}
        country={null}
        profile={{ gender: 'mulher' }}
      />,
    ),
  )
  const axis = [...line.querySelectorAll('svg[role="img"] text')].filter((t) =>
    LINE.ticks.some((tick) => tick.text === t.textContent),
  )
  const axisEnd = Math.max(...axis.map((t) => Number(t.getAttribute('x'))))
  expect(tags(line)).toHaveLength(3)
  for (const tag of tags(line)) expect(tag.left).toBeGreaterThan(axisEnd)
})

it('starts a time line right above its highest words, with room for a value\'s "você" tag', () => {
  // The divorce line: the values near the top of the scale.
  const near = {
    ...LINE,
    ticks: [0, 5, 10, 15, 20].map((value) => ({ value, text: `${value}` })),
    points: LINE.points.slice(1).map((p, i) => ({
      ...p,
      value: [16, 13.8][i]!,
      covers: i === 0 ? [] : p.covers,
    })),
  }
  /** How far below the drawing's top its highest word starts: a value
   * (14px, centered on its line) or a "você" tag. */
  const drawn = (profile: { gender: 'mulher' } | null) => {
    const html = page(
      renderToString(
        <VisualChart chart={near} country={null} profile={profile} />,
      ),
    )
    const values = [...html.querySelectorAll('svg[role="img"] text')]
      .filter((t) => t.getAttribute('font-size') === '14')
      .map((t) => Number(t.getAttribute('y')) - 8)
    return {
      headroom: Math.min(...values, ...tags(html).map((tag) => tag.top)),
      dots: [...html.querySelectorAll('svg[role="img"] circle')].map((c) =>
        c.getAttribute('cy'),
      ),
    }
  }
  const mine = drawn({ gender: 'mulher' })
  expect(mine.headroom).toBeGreaterThanOrEqual(0)
  expect(mine.headroom).toBeLessThan(10)
  // The point whose Study may cover the Profile keeps its tag's room
  // without one, so the plot does not move when a Profile is saved.
  expect(drawn(null).dots).toEqual(mine.dots)
  expect(drawn(null).headroom).toBeLessThan(20)
})

it('tells how to open a number only once the chart can take the tap', () => {
  // Without JavaScript a tap opens nothing: the server does not say it.
  const served = page(
    renderToString(<VisualChart chart={DOTS} country={null} profile={null} />),
  )
  expect(served.body.textContent).not.toContain(CHART_COPY.hint)
  render(<VisualChart chart={DOTS} country={null} profile={null} />)
  expect(screen.getAllByText(CHART_COPY.hint)).toHaveLength(1)
})
