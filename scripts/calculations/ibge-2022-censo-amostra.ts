// Women aged 25 to 29 in SP who were not living in a union, summing the
// sample weight (P0110) of the public 2022 Census microdata. Reads the CSV
// that the possible group pipeline generated (`pnpm data:possible-group`);
// SIDRA 10185 publishes 747,507 for the same cell.
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const [header = '', ...lines] = gunzipSync(
  readFileSync('data/possible-group/censo-2022.csv.gz'),
)
  .toString('utf8')
  .trim()
  .split('\n')
const column = Object.fromEntries(header.split(',').map((name, i) => [name, i]))
const field = (values: string[], name: string) =>
  values[column[name] ?? -1] ?? ''

let sum = 0
for (const line of lines) {
  const v = line.split(',')
  if (
    field(v, 'sexo') === 'mulher' &&
    field(v, 'idade') === '25-29' &&
    field(v, 'uf') === 'SP' &&
    field(v, 'uniao') === 'nao'
  )
    sum += Number(field(v, 'peso'))
}
console.log(Math.round(sum))
