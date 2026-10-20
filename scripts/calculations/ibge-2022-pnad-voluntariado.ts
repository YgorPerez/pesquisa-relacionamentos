// Share of women among the people who did volunteer work in 2022, inside one
// category of a SIDRA table by sex: women / total, in thousands of people.
// Reads the SIDRA responses saved in the local source.
//
//   node scripts/calculations/ibge-2022-pnad-voluntariado.ts 7081 25 a 49 anos
//   node scripts/calculations/ibge-2022-pnad-voluntariado.ts 7085 Empresa, organização ou instituição
import { readFileSync } from 'node:fs'

interface Result {
  readonly classificacoes: ReadonlyArray<{
    readonly categoria: Record<string, string>
  }>
  readonly series: ReadonlyArray<{ readonly serie: Record<string, string> }>
}
interface Variable {
  readonly id: string
  readonly resultados: ReadonlyArray<Result>
}

// The Cálculo cell splits on spaces, so the category comes in pieces.
const [table = '', ...words] = process.argv.slice(2)
const category = words.join(' ')
const source = readFileSync('sources/ibge-2022-pnad-voluntariado.txt', 'utf8')
const section = source
  .split('\n## ')
  .find((s) => s.startsWith(`SIDRA ${table}:`))
const json = section?.split('\n').find((line) => line.startsWith('['))
if (!json) throw new Error(`no SIDRA ${table} response in the source`)

// Variable 10236: people who did volunteer work, in thousands.
const people = (JSON.parse(json) as Variable[]).find((v) => v.id === '10236')
const thousands = (sex: string) => {
  const result = people?.resultados.find((r) => {
    const names = r.classificacoes.map((c) => Object.values(c.categoria)[0])
    return names[0] === sex && names[1] === category
  })
  const value = Number(result?.series[0]?.serie['2022'])
  if (!Number.isFinite(value)) throw new Error(`no ${sex} / ${category} cell`)
  return value
}

const share = (100 * thousands('Mulheres')) / thousands('Total')
console.log(share.toFixed(1).replace('.', ','))
