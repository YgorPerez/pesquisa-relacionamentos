// What a chart drawn by the library gets from a Visual (#471): the points
// with their number, country, definition and the Fact sheets' `covers`,
// over the e2e fixture's Fact sheets (Silva 2020 is Brazil's, Costa 2018 the
// United States').
import { fileURLToPath } from 'node:url'
import { formatProblems, loadLibrary, type Visual } from '@tem-estudo/content'
import { expect, it } from 'vite-plus/test'
import { chartCountries, chartView } from './chart-view'

const FIXTURE = fileURLToPath(new URL('../../e2e/library', import.meta.url))

function library() {
  const result = loadLibrary(FIXTURE)
  if (!result.ok) throw new Error(formatProblems(result.errors))
  return result.library
}

const cite = (slug: string) => ({
  n: slug.startsWith('silva') ? 1 : 2,
  anchor: `ficha-${slug}`,
  title: slug.startsWith('silva') ? 'Silva (2020)' : 'Costa (2018)',
})

const table = (rows: string[], extra: Partial<Visual> = {}): Visual =>
  ({
    id: 'lado-a-lado',
    kind: 'study-table',
    title: 'Lado a lado',
    rows: rows.map((slug, i) => ({
      fact_sheet: slug,
      measure: `Medida ${i}`,
      value: 18 + i,
      unit: '%',
    })),
    ...extra,
  }) as Visual

it('turns a Study table of one unit into one dot per Study, with its country and covers', () => {
  const view = chartView(
    table(['silva-2020-apps-brasil', 'costa-2018-satisfacao']),
    library(),
    cite,
    'tema',
  )
  expect(view).toMatchObject({
    kind: 'dots',
    domId: 'visual-tema-lado-a-lado',
    points: [
      {
        label: 'Silva (2020)',
        detail: 'Medida 0',
        number: { text: '18%' },
        country: { slug: 'brasil', name: 'Brasil' },
        brazil: true,
        covers: [{ ages: { min: 18, max: 35 } }],
      },
      {
        label: 'Costa (2018)',
        number: { text: '19%' },
        country: { slug: 'eua', name: 'EUA' },
        brazil: false,
        covers: [{ couple: 'different-sex' }],
      },
    ],
  })
  expect(view?.ticks.at(-1)).toEqual({ value: 100, text: '100%' })
})

it('leaves a Study table that mixes units as a table', () => {
  const visual = table(['silva-2020-apps-brasil', 'costa-2018-satisfacao'])
  if (visual.kind !== 'study-table') throw new Error('a table')
  const mixed = {
    ...visual,
    rows: [visual.rows[0]!, { ...visual.rows[1]!, unit: 'ponto' }],
  }
  expect(chartView(mixed, library(), cite, 'tema')).toBeNull()
})

it("takes the point's own country and its definition's place in the list", () => {
  const visual = table(['silva-2020-apps-brasil', 'costa-2018-satisfacao'], {
    definitions: [
      { id: 'apps', legend: 'só aplicativos' },
      { id: 'online', legend: 'qualquer canal online' },
    ],
  } as Partial<Visual>)
  if (visual.kind !== 'study-table') throw new Error('a table')
  const view = chartView(
    {
      ...visual,
      rows: [
        { ...visual.rows[0]!, definition: 'online' },
        { ...visual.rows[1]!, definition: 'apps', country: 'Gana' },
      ],
    },
    library(),
    cite,
    'tema',
  )
  expect(view?.definitions).toEqual([
    { id: 'apps', legend: 'só aplicativos' },
    { id: 'online', legend: 'qualquer canal online' },
  ])
  expect(view?.points.map((p) => [p.definition, p.country?.slug])).toEqual([
    [1, 'brasil'],
    [0, 'gana'],
  ])
})

it('stacks the parts of each bar from the left, each part a point with its answer and the bar’s group', () => {
  const stacked: Visual = {
    id: 'partes',
    kind: 'stacked-bars',
    title: 'Partes',
    segments: ['Contentes', 'Arrependidos'],
    bars: [
      {
        label: 'Mulheres',
        values: [18, 82],
        fact_sheet: 'silva-2020-apps-brasil',
        applies_to: { genders: ['woman'] },
      },
      {
        label: 'Homens',
        values: [24, 76],
        fact_sheet: 'silva-2020-apps-brasil',
      },
    ],
  }
  const view = chartView(stacked, library(), cite, 'tema')
  expect(view).toMatchObject({
    kind: 'stacked',
    segments: ['Contentes', 'Arrependidos'],
    points: [
      {
        label: 'Mulheres',
        detail: 'Contentes',
        number: { text: '18%' },
        stack: { bar: '0', part: 0, start: 0 },
        covers: [{ genders: ['woman'] }],
        country: { slug: 'brasil' },
      },
      {
        label: 'Mulheres',
        detail: 'Arrependidos',
        stack: { bar: '0', part: 1, start: 18 },
      },
      {
        label: 'Homens',
        detail: 'Contentes',
        stack: { bar: '1', part: 0, start: 0 },
        // Without `applies_to`, the Fact sheet's own `covers`.
        covers: [{ ages: { min: 18, max: 35 } }],
      },
      { label: 'Homens', stack: { bar: '1', part: 1, start: 24 } },
    ],
  })
  expect(view?.ticks.at(-1)).toEqual({ value: 100, text: '100%' })
})

it('draws bars with the highlighted one marked, and lists the countries of every chart once', () => {
  const bars: Visual = {
    id: 'barras',
    kind: 'bars',
    title: 'Barras',
    unit: '%',
    bars: [
      { label: 'A', value: 18, fact_sheet: 'silva-2020-apps-brasil' },
      { label: 'B', value: 24, fact_sheet: 'costa-2018-satisfacao' },
    ],
    highlight: 'B',
  }
  const view = chartView(bars, library(), cite, 'tema')
  expect(view?.kind).toBe('bars')
  expect(view?.points.map((p) => [p.label, p.highlight])).toEqual([
    ['A', false],
    ['B', true],
  ])
  const dots = chartView(
    table(['costa-2018-satisfacao', 'silva-2020-apps-brasil']),
    library(),
    cite,
    'tema',
  )
  expect(chartCountries([view!, dots!])).toEqual([
    { slug: 'brasil', name: 'Brasil' },
    { slug: 'eua', name: 'EUA' },
  ])
})
