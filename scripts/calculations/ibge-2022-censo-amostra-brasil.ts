// Share of people aged 25 to 29 in Brazil who were not living in a union in
// 2022, by sex, from the SIDRA 10185 response saved in
// sources/ibge-2022-censo-amostra.txt (the Brazil-level query).
//
//   node scripts/calculations/ibge-2022-censo-amostra-brasil.ts <men|women>
//
// Prints the percentage with one decimal, as "51,9".
import { readFileSync } from 'node:fs'

const text = readFileSync('sources/ibge-2022-censo-amostra.txt', 'utf8')
const at = text.indexOf(
  '/agregados/10185/periodos/2022/variaveis/140?localidades=N1[all]',
)
if (at < 0)
  throw new Error('the Brazil query of table 10185 is not in the source')
const start = text.indexOf('[', text.indexOf('\n', at))
const end = text.indexOf('\n', start)

interface Result {
  readonly classificacoes: ReadonlyArray<{
    readonly id: string
    readonly categoria: Record<string, string>
  }>
  readonly series: ReadonlyArray<{ readonly serie: Record<string, string> }>
}
const [variable] = JSON.parse(text.slice(start, end)) as [
  { resultados: Result[] },
]

/** Classification 464 (marital status) and 2 (sex) category ids. */
function cell(status: string, sex: string): number {
  const found = variable.resultados.find((r) =>
    r.classificacoes.every(
      (c) =>
        (c.id !== '464' || status in c.categoria) &&
        (c.id !== '2' || sex in c.categoria),
    ),
  )
  const value = Number(found?.series[0]?.serie['2022'])
  if (!Number.isFinite(value)) throw new Error(`no cell ${status} × ${sex}`)
  return value
}

const TOTAL = '50292'
const NOT_IN_UNION = '12109'
const SEXES: Record<string, string> = { men: '4', women: '5' }
const which = process.argv[2] ?? ''
const sex = SEXES[which]
if (!sex) throw new Error(`usage: <men|women>, got "${which}"`)

const share = (100 * cell(NOT_IN_UNION, sex)) / cell(TOTAL, sex)
console.log(share.toFixed(1).replace('.', ','))
