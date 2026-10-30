import type { ChartPoint, ChartView } from '#/content/chart-view'

const study = (
  key: string,
  label: string,
  value: number,
  text: string,
  extra: Partial<ChartPoint> = {},
): ChartPoint => ({
  key,
  label,
  detail: 'Casais formados de 2010 em diante',
  value,
  number: {
    text,
    own: null,
    sources: [{ n: Number(key) + 1, anchor: `ficha-${key}`, title: label }],
  },
  country: null,
  year: null,
  definition: null,
  highlight: false,
  brazil: false,
  covers: [],
  ...extra,
})

/** Three Studies of one unit as dots: Brazil's, one of the United States
 * that covers only people from 26 to 65, and one from France. */
export const DOTS: ChartView = {
  kind: 'dots',
  domId: 'visual-exemplo-pontos',
  title: 'Quantos casais se conheceram online, conforme o estudo',
  note: 'contar só os casais recentes dá o número maior',
  ticks: [0, 20, 40, 60, 80, 100].map((value) => ({
    value,
    text: `${value}%`,
  })),
  points: [
    study('0', 'Silva (2020)', 18, '18%', {
      country: { slug: 'brasil', name: 'Brasil' },
      brazil: true,
      definition: 0,
      covers: [{ ages: { min: 18, max: 35 } }],
    }),
    study('1', 'Rosenfeld (2019)', 39, '39%', {
      country: { slug: 'eua', name: 'EUA' },
      definition: 1,
      year: 2017,
      covers: [{ ages: { min: 26, max: 65 } }],
    }),
    study('2', 'Bergström (2016)', 9, '9%', {
      country: { slug: 'franca', name: 'França' },
      definition: 0,
    }),
  ],
  definitions: [
    { id: 'apps', legend: 'só sites e aplicativos' },
    { id: 'online', legend: 'qualquer canal online' },
  ],
  ownLines: [],
  sources: [],
}

/** Two bars, the second highlighted and our own calculation. */
export const BARS: ChartView = {
  kind: 'bars',
  domId: 'visual-exemplo-barras',
  title: 'Como os casais se conheceram',
  note: null,
  ticks: [0, 25, 50, 75, 100].map((value) => ({ value, text: `${value}%` })),
  points: [
    study('0', 'Online, 2017', 39, '39%', { detail: null }),
    study('1', 'Por outro caminho', 61, '61%', {
      detail: null,
      highlight: true,
      number: {
        text: '61%',
        own: '100 − 39',
        sources: [{ n: 1, anchor: 'ficha-0', title: 'Rosenfeld (2019)' }],
      },
    }),
  ],
  definitions: [],
  ownLines: ['Por outro caminho: conta nossa, 100 − 39 = 61%'],
  sources: [{ n: 1, anchor: 'ficha-0', title: 'Rosenfeld (2019)' }],
}
