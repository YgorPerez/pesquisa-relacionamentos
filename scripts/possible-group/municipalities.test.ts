// Marital status by municipality (SIDRA 10185), which the possible group uses
// instead of proportional adjustment by population (#31): the municipalities
// must sum to the state published in the same table.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import type { MaritalCell } from './cross-check.ts'
import {
  crossCheckMunicipalities,
  municipalitiesToCsv,
  type MunicipalityMarital,
} from './municipalities.ts'

const municipality = (
  code: string,
  name: string,
  state: string,
  yes: number,
  no: number,
): MunicipalityMarital => ({
  code,
  name,
  state,
  people: new Map([
    ['mulher_25-29_sim', yes],
    ['mulher_25-29_nao', no],
  ]),
})

const municipalities = [
  municipality('1200401', 'Rio Branco', 'AC', 300, 700),
  municipality('1200203', 'Cruzeiro do Sul', 'AC', 100, 200),
]
const byState = (yes: number, no: number): MaritalCell[] => [
  { place: 'AC', sex: 'mulher', age: '25-29', union: 'sim', people: yes },
  { place: 'AC', sex: 'mulher', age: '25-29', union: 'nao', people: no },
  { place: 'BR', sex: 'mulher', age: '25-29', union: 'nao', people: 99999 },
]

describe('crossCheckMunicipalities', () => {
  it('passes when the municipalities sum to the state, with the rounding slack', () => {
    assert.deepEqual(
      crossCheckMunicipalities(municipalities, byState(400, 900)),
      [],
    )
    assert.deepEqual(
      crossCheckMunicipalities(municipalities, byState(412, 890)),
      [],
    )
  })

  it('fails naming the cell that does not add up', () => {
    const failures = crossCheckMunicipalities(municipalities, byState(400, 950))
    assert.equal(failures.length, 1)
    assert.match(
      failures[0]!,
      /AC mulher 25-29 not living in a union: municipalities sum to 900, the state publishes 950/,
    )
  })
})

describe('municipalitiesToCsv', () => {
  it('one line per municipality, with sex × group × union in the columns', () => {
    const csv = municipalitiesToCsv(municipalities)
    const [header, first] = csv.split('\n')
    assert.match(header!, /^municipio,nome,uf,homem_15-19_sim,homem_15-19_nao,/)
    assert.equal(header!.split(',').length, 3 + 2 * 14 * 2)
    const columns = header!.split(',')
    const values = first!.split(',')
    assert.equal(values[0], '1200203')
    assert.equal(values[columns.indexOf('mulher_25-29_nao')], '200')
    assert.equal(values[columns.indexOf('homem_80+_sim')], '0')
  })
})
