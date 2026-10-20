// Shares of people in a consensual union ("união consensual"), from the SIDRA
// responses saved in sources/ibge-2022-censo-unioes.txt: tables 10187 and
// 10185 for 2022, 3484 and 3193 for 2010, all for Brazil.
//
//   node scripts/calculations/ibge-2022-censo-unioes.ts <year> <measure> <sex> <age>
//
// year: 2022 | 2010
// measure: unions (consensual / living in a union) | people (consensual / all
//   people aged 10 or more)
// sex: total | men | women
// age: total | a SIDRA age group as "20-24", "80+"
// Prints the percentage with one decimal, as "75,6".
// With `table` as the only argument, prints every cell.
import { readFileSync } from 'node:fs'

const text = readFileSync('sources/ibge-2022-censo-unioes.txt', 'utf8')

/** The JSON that follows the URL line of the given table. */
function response(table: string): unknown {
  const at = text.indexOf(`/agregados/${table}/`)
  if (at < 0) throw new Error(`table ${table} not in the source`)
  const start = text.indexOf('[', text.indexOf('\n', at))
  const end = text.indexOf('\n', start)
  return JSON.parse(text.slice(start, end === -1 ? undefined : end))
}

interface Result {
  readonly classificacoes: ReadonlyArray<{
    readonly nome: string
    readonly categoria: Record<string, string>
  }>
  readonly series: ReadonlyArray<{ readonly serie: Record<string, string> }>
}

/** Every cell as "<classification>=<category>|..." -> value. */
function cells(table: string): Map<string, number> {
  const [variable] = response(table) as [{ resultados: Result[] }]
  const map = new Map<string, number>()
  for (const r of variable.resultados) {
    const key = r.classificacoes
      .map((c) => `${c.nome}=${Object.values(c.categoria)[0]}`)
      .join('|')
    map.set(key, Number(Object.values(r.series[0]?.serie ?? {})[0]))
  }
  return map
}

const SEX: Record<string, string> = {
  total: 'Total',
  men: 'Homens',
  women: 'Mulheres',
}

function age(arg: string): string {
  if (arg === 'total') return 'Total'
  if (arg === '80+') return '80 anos ou mais'
  const [from, to] = arg.split('-')
  return `${from} a ${to} anos`
}

/** Sums the cells whose key holds every one of the given parts. */
function pick(map: Map<string, number>, parts: string[]): number {
  const found = [...map].filter(([key]) =>
    parts.every((p) => key.split('|').includes(p)),
  )
  if (found.length !== 1)
    throw new Error(`${found.length} cells for ${parts.join(', ')}`)
  return found[0]?.[1] ?? 0
}

const TABLES = {
  '2022': {
    unions: '10187',
    people: '10185',
    total: 'Natureza da união conjugal=Total',
    allPeople: 'Estado conjugal=Total',
  },
  '2010': {
    unions: '3484',
    people: '3193',
    total: 'Natureza da união conjugal=Total',
    allPeople: 'Estado conjugal=Total',
  },
} as const

const [year = '', measure = '', sex = 'total', group = 'total'] =
  process.argv.slice(2)

if (year === 'table') {
  for (const t of ['10187', '10185', '3484', '3193'])
    for (const [k, v] of cells(t)) console.log(t, k, v)
} else {
  const t = TABLES[year as keyof typeof TABLES]
  const s = SEX[sex]
  if (!t || !s || (measure !== 'unions' && measure !== 'people'))
    throw new Error(
      'usage: <2022|2010> <unions|people> <total|men|women> <total|20-24|80+>',
    )
  const filter = [`Sexo=${s}`, `Grupo de idade=${age(group)}`]
  const unions = cells(t.unions)
  const consensual = pick(unions, [
    'Natureza da união conjugal=União consensual',
    ...filter,
  ])
  const base =
    measure === 'unions'
      ? pick(unions, [t.total, ...filter])
      : pick(cells(t.people), [t.allPeople, ...filter])
  console.log(((consensual / base) * 100).toFixed(1).replace('.', ','))
}
