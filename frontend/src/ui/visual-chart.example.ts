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
    sources: [
      { n: Number.parseInt(key) + 1, anchor: `ficha-${key}`, title: label },
    ],
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

const country = (slug: string, name: string) => ({
  country: { slug, name },
  brazil: slug === 'brasil',
})

/** A Study of 50 countries as its average, with the spread from Ghana to
 * Poland and Brazil inside it, next to a Study of one country. */
export const RANGE: ChartView = {
  ...DOTS,
  domId: 'visual-exemplo-faixa',
  points: [
    study('0', 'Rosenfeld (2019)', 39, '39%', country('eua', 'EUA')),
    study('1', 'Kowal et al. (2025)', 16, '16%', {
      detail: 'Média de 50 países, todas as pessoas com parceiro',
      range: [
        study('1-0', 'Gana', 7, '7%', country('gana', 'Gana')),
        study(
          '1-1',
          'Brasil, conta nossa (23 de 119 pessoas, sem peso)',
          19.3,
          '19,3%',
          country('brasil', 'Brasil'),
        ),
        study('1-2', 'Polônia', 33, '33%', country('polonia', 'Polônia')),
      ],
    }),
  ],
  definitions: [],
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

const years =(first: number, last: number, written: number[]) =>
  Array.from({ length: last - first + 1 }, (_, i) => first + i).map(
    (value) => ({ value, text: written.includes(value) ? `${value}` : '' }),
  )

/** A time line of one unit, Brazil's every year, the last one highlighted:
 * the remarriages of the Guide on where to meet people. */
export const LINE: ChartView = {
  kind: 'line',
  domId: 'visual-exemplo-linha',
  title: 'Casamentos em que um dos dois já tinha sido casado',
  note: null,
  ticks: [0, 20, 40, 60, 80, 100].map((value) => ({
    value,
    text: `${value}%`,
  })),
  years: years(2004, 2024, [2004, 2014, 2024]),
  points: (
    [
      [2004, 13.5, '13,5%'],
      [2014, 23.4, '23,4%'],
      [2024, 31.1, '31,1%'],
    ] as const
  ).map(([year, value, text], i) =>
    study(`${i}`, 'Pelo menos um divorciado ou viúvo', value, text, {
      detail: null,
      year,
      country: { slug: 'brasil', name: 'Brasil' },
      brazil: true,
      highlight: year === 2024,
      covers: [{ genders: ['man', 'woman'] }],
      number: {
        text,
        own: null,
        sources: [{ n: 1, anchor: 'ficha-ibge', title: 'IBGE (2025)' }],
      },
    }),
  ),
  definitions: [],
  ownLines: [],
  sources: [{ n: 1, anchor: 'ficha-ibge', title: 'IBGE (2025)' }],
}

/** A time line of two units, one finding of the United States and one of
 * Brazil: the points sit on the years alone, with no value scale. */
export const LINE_MIXED: ChartView = {
  ...LINE,
  domId: 'visual-exemplo-linha-mista',
  title: 'Dois retratos, dois países',
  ticks: [],
  years: years(2017, 2019, [2017, 2019]),
  points: [
    study('0', 'Nos EUA, diferença de satisfação', 0.1, '0,1 ponto', {
      detail: null,
      year: 2017,
      country: { slug: 'eua', name: 'EUA' },
    }),
    study('1', 'No Brasil, conheceram o parceiro por app', 18, '18%', {
      detail: null,
      year: 2019,
      country: { slug: 'brasil', name: 'Brasil' },
      brazil: true,
      highlight: true,
    }),
  ],
}

const REGRET = [
  'Contentes',
  'Neutros',
  'Um pouco arrependidos',
  'Muito arrependidos',
]
const GALPERIN = { n: 1, anchor: 'ficha-0', title: 'Galperin (2013)' }
const GROUPS = [
  ['Mulheres heterossexuais', [27, 26, 27, 20], 'woman', 'men'],
  ['Homens heterossexuais', [52, 25, 15, 7], 'man', 'women'],
] as const

/** Two stacked bars of four parts each: the women's covers women who seek
 * men, the men's men who seek women. */
export const STACKED: ChartView = {
  kind: 'stacked',
  domId: 'visual-exemplo-empilhadas',
  title: 'Como se sentiram com a última transa casual',
  note: null,
  ticks: [0, 25, 50, 75, 100].map((value) => ({ value, text: `${value}%` })),
  points: GROUPS.flatMap(([label, values, gender, seeks], bar) =>
    values.map((value, part) =>
      study(`${bar}-${part}`, label, value, `${value}%`, {
        detail: REGRET[part] ?? null,
        number: { text: `${value}%`, own: null, sources: [GALPERIN] },
        country: { slug: 'eua', name: 'EUA' },
        covers: [{ genders: [gender], seeks: [seeks] }],
        stack: {
          bar: `${bar}`,
          part,
          start: values.slice(0, part).reduce((a, b) => a + b, 0),
        },
      }),
    ),
  ),
  definitions: [],
  ownLines: [],
  sources: [GALPERIN],
  segments: REGRET,
}
