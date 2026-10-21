// Two numbers from the SIDRA 4406 responses saved in the local source:
//
//   same-sex: civil marriages between two men plus between two women, 2024
//     (variables 4373 and 4374).
//   mean-2015-2019: mean yearly number of civil marriages, 2015 to 2019
//     (variable 4993), the pre-pandemic baseline the IBGE compares 2024 with.
//
//   node scripts/calculations/ibge-2024-registro-civil.ts same-sex
//   node scripts/calculations/ibge-2024-registro-civil.ts mean-2015-2019
import { readFileSync } from 'node:fs'

interface Variable {
  readonly id: string
  readonly resultados: ReadonlyArray<{
    readonly series: ReadonlyArray<{ readonly serie: Record<string, string> }>
  }>
}

const source = readFileSync('sources/ibge-2024-registro-civil.txt', 'utf8')
const response = (heading: string): Variable[] => {
  const section = source.split('\n## ').find((s) => s.startsWith(heading))
  const json = section?.split('\n').find((line) => line.startsWith('['))
  if (!json) throw new Error(`no "${heading}" response in the source`)
  return JSON.parse(json) as Variable[]
}
const serie = (variables: Variable[], id: string) => {
  const found = variables.find((v) => v.id === id)?.resultados[0]?.series[0]
  if (!found) throw new Error(`no variable ${id}`)
  return found.serie
}
const thousands = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const [what] = process.argv.slice(2)
if (what === 'same-sex') {
  const variables = response('SIDRA 4406: Casamentos')
  const men = Number(serie(variables, '4373')['2024'])
  const women = Number(serie(variables, '4374')['2024'])
  console.log(thousands(men + women))
} else if (what === 'mean-2015-2019') {
  const years = Object.values(
    serie(response('SIDRA 4406 (2015 a 2019)'), '4993'),
  ).map(Number)
  if (years.length !== 5)
    throw new Error(`expected 5 years, got ${years.length}`)
  console.log(thousands(years.reduce((a, b) => a + b, 0) / years.length))
} else throw new Error('usage: same-sex | mean-2015-2019')
