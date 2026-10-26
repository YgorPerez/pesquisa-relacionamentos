// Cross-checking the microdata against numbers published in SIDRA: the step
// that stops the pipeline when weights or codes are wrong.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import type { Aggregate, Cell } from './census.ts'
import {
  crossCheck,
  crossCheckPns,
  type Published,
  type PublishedPns,
} from './cross-check.ts'
import type { PnsRecord } from './pns.ts'

const cell = (
  sexo: string,
  idade: string,
  uf: string,
  uniao: string,
  peso: number,
): Cell => ({
  sexo,
  idade,
  uf,
  uniao,
  escolaridade: 'medio',
  renda: 'ate-1',
  cor: 'parda',
  religiao: 'catolica',
  filhos: '',
  pais: '',
  trabalho: '',
  casa: '',
  peso,
  n_registros: 10,
})

// Two states, one age group, women: the microdata.
const aggregate: Aggregate = {
  cells: [
    cell('mulher', '20-24', 'AC', 'sim', 400),
    cell('mulher', '20-24', 'AC', 'nao', 600),
    cell('mulher', '20-24', 'SP', 'sim', 4000),
    cell('mulher', '20-24', 'SP', 'nao', 6000),
  ],
  totalWeight: { AC: 1500, SP: 15000 },
  discarded: {
    under15: { records: 0, weight: 0 },
    sexOrAgeSuppressed: { records: 0, weight: 0 },
  },
  withoutHousehold: 0,
}

// What SIDRA published for the same cells, 1% off.
const published = (ac: [number, number], sp: [number, number]): Published => ({
  population: { AC: 1500, SP: 15000 },
  marital: [
    { place: 'AC', sex: 'mulher', age: '20-24', union: 'sim', people: ac[0] },
    { place: 'AC', sex: 'mulher', age: '20-24', union: 'nao', people: ac[1] },
    { place: 'SP', sex: 'mulher', age: '20-24', union: 'sim', people: sp[0] },
    { place: 'SP', sex: 'mulher', age: '20-24', union: 'nao', people: sp[1] },
    {
      place: 'BR',
      sex: 'mulher',
      age: '20-24',
      union: 'sim',
      people: ac[0] + sp[0],
    },
    {
      place: 'BR',
      sex: 'mulher',
      age: '20-24',
      union: 'nao',
      people: ac[1] + sp[1],
    },
  ],
})

describe('crossCheckPns', () => {
  const person = (psu: string, orientation: string): PnsRecord => ({
    stratum: 'E',
    psu,
    weight: 1,
    sex: 'homem',
    age: 30,
    values: {
      orientacao: orientation,
      altura: '170',
      fumo: 'nao',
      bebida: null,
      exercicio: null,
      saude_bucal: null,
      cigarro_eletronico: null,
      obesidade: null,
      depressao: null,
      culto: null,
    },
  })
  // 4 of 5 heterosexual (80%) and 1 homosexual (20%).
  const records = [
    'heterossexual',
    'heterossexual',
    'heterossexual',
    'heterossexual',
    'homossexual',
  ].map((o, i) => person(`U${i}`, o))

  it('passes when the distribution matches the published table, rounded to one decimal', () => {
    const table: ReadonlyArray<PublishedPns> = [
      { sex: 'homem', category: 'homossexual', percent: 20.0 },
    ]
    assert.deepEqual(crossCheckPns(records, table), [])
  })

  it('fails when the distribution drifts from the table', () => {
    const table: ReadonlyArray<PublishedPns> = [
      { sex: 'homem', category: 'homossexual', percent: 1.4 },
    ]
    assert.deepEqual(crossCheckPns(records, table), [
      'PNS homem homossexual: the microdata gives 20,0% and Table 1.1.1 publishes 1,4%',
    ])
  })
})

describe('crossCheck', () => {
  it('passes when the microdata reproduces SIDRA within the tolerance', () => {
    const r = crossCheck(aggregate, published([404, 606], [4040, 6060]))
    assert.deepEqual(r.failures, [])
    assert.equal(r.checkedCells, 6)
  })

  it('fails when a Brazil cell drifts more than 2.5%', () => {
    // Microdata 4,400 against 4,000 published: +10%.
    const r = crossCheck(aggregate, published([400, 600], [3600, 6000]))
    assert.ok(
      r.failures.some(
        (f) =>
          f.includes('BR mulher 20-24 living in a union') &&
          f.includes('+10,0%'),
      ),
      r.failures.join('\n'),
    )
  })

  it('fails when the share not living in a union in a state drifts more than 3 points', () => {
    // In AC, SIDRA says 50% without a union; the microdata says 60%.
    const r = crossCheck(aggregate, published([500, 500], [4000, 6000]))
    assert.ok(
      r.failures.some(
        (f) => f.startsWith('AC mulher 20-24') && f.includes('10,0 points'),
      ),
      r.failures.join('\n'),
    )
  })

  it("fails when the weights do not sum to the state's population", () => {
    const r = crossCheck(aggregate, {
      ...published([400, 600], [4000, 6000]),
      population: { AC: 1500, SP: 15100 },
    })
    assert.deepEqual(r.failures, [
      'SP: the weights sum to 15.000 people and SIDRA publishes 15.100',
    ])
  })

  it('fails when SIDRA has a state the microdata does not', () => {
    const r = crossCheck(aggregate, {
      ...published([400, 600], [4000, 6000]),
      population: { AC: 1500, SP: 15000, RJ: 9 },
    })
    assert.deepEqual(r.failures, [
      'RJ: the weights sum to 0 people and SIDRA publishes 9',
    ])
  })
})
