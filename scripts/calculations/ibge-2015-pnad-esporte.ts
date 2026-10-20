// How many people of the most common sex there are for each one of the other
// sex, among those whose main sport (Tabela 5) or main physical activity
// (Tabela 13) was a given modality, in the PNAD 2015 supplement. Reads the
// men and women shares from the local source.
//
//   node scripts/calculations/ibge-2015-pnad-esporte.ts Dança e ballet
//   node scripts/calculations/ibge-2015-pnad-esporte.ts Corrida
import { readFileSync } from 'node:fs'

// The Cálculo cell splits on spaces, so the name comes in pieces.
const modality = process.argv.slice(2).join(' ')
const source = readFileSync('sources/ibge-2015-pnad-esporte.txt', 'utf8')
const row = source
  .split('\n')
  .map((line) => line.trim().split(/\s{2,}/))
  // The sex tables open each row with the 100,0 total; the region tables don't.
  .find(([name, total]) => name === modality && total === '100,0')
if (!row) throw new Error(`no table row named "${modality}"`)

const [men = NaN, women = NaN] = row
  .slice(2)
  .map((n) => Number(n.replace(',', '.')))
const ratio = Math.max(men, women) / Math.min(men, women)
console.log(ratio.toFixed(1).replace('.', ','))
