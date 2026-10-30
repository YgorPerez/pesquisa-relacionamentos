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

it('rings Brazil on a bar comparison only when it sets Brazil apart from other countries', () => {
  const bars = (second: string): Visual => ({
    id: 'barras',
    kind: 'bars',
    title: 'Barras',
    unit: '%',
    bars: [
      { label: 'A', value: 18, fact_sheet: 'silva-2020-apps-brasil' },
      { label: 'B', value: 24, fact_sheet: second },
    ],
  })
  const onlyBrazil = chartView(
    bars('silva-2020-apps-brasil'),
    library(),
    cite,
    'tema',
  )
  expect(onlyBrazil?.points.map((p) => p.brazil)).toEqual([false, false])
  expect(onlyBrazil?.points.map((p) => p.country?.slug)).toEqual([
    'brasil',
    'brasil',
  ])
  const mixed = chartView(
    bars('costa-2018-satisfacao'),
    library(),
    cite,
    'tema',
  )
  expect(mixed?.points.map((p) => p.brazil)).toEqual([true, false])
})

it('lets the axis top replace a round tick that would print on top of it, and puts a word unit only there', () => {
  const view = chartView(
    {
      id: 'escala-de-sete',
      kind: 'bars',
      title: 'Uma escala de 1 a 7',
      unit: 'pontos',
      max: 7,
      bars: [
        { label: 'Um', value: 5.6, fact_sheet: 'silva-2020-apps-brasil' },
        { label: 'Outro', value: 5.3, fact_sheet: 'silva-2020-apps-brasil' },
      ],
    },
    library(),
    cite,
    'tema',
  )
  expect(view?.ticks.map((t) => [t.value, t.text])).toEqual([
    [0, '0'],
    [2, '2'],
    [4, '4'],
    [7, '7 pontos'],
  ])
})

it("gives a bar the year it names and the country it sets over its Fact sheet's", () => {
  const view = chartView(
    {
      id: 'anos',
      kind: 'bars',
      title: 'Anos',
      unit: '%',
      bars: [
        {
          label: 'Em 2020',
          value: 18,
          fact_sheet: 'silva-2020-apps-brasil',
          year: 2020,
        },
        {
          label: 'Em Gana',
          value: 24,
          fact_sheet: 'costa-2018-satisfacao',
          country: 'Gana',
        },
      ],
    },
    library(),
    cite,
    'tema',
  )
  expect(view?.points.map((p) => [p.year, p.country?.name])).toEqual([
    [2020, 'Brasil'],
    [null, 'Gana'],
  ])
})
