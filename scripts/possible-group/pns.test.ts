// The PNS 2019 cells by sex × age bracket and the answers to the PNS
// variables, with the design effect of each sex × bracket, on sample records.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { pnsCells, pnsToCsv, readPnsRecord, type PnsRecord } from './pns.ts'

const adult = (
  partial: Partial<Omit<PnsRecord, 'values'>>,
  values: Partial<PnsRecord['values']> = {},
): PnsRecord => ({
  stratum: 'E1',
  psu: 'U1',
  weight: 1,
  sex: 'homem',
  age: 22,
  ...partial,
  values: {
    orientacao: 'heterossexual',
    altura: '175',
    fumo: 'nao',
    ...values,
  },
})

describe('pnsCells', () => {
  it('groups the persons with the same sex, bracket and answers, summing weight and records', () => {
    const cells = pnsCells([
      adult({ psu: 'A', weight: 3 }),
      adult({ psu: 'B', weight: 2 }),
      adult({ psu: 'C', weight: 4 }, { fumo: 'diario' }),
      adult({ age: 31, sex: 'mulher' }),
    ])
    assert.deepEqual(
      cells.map((c) => [c.sexo, c.idade, c.values.fumo, c.peso, c.n_registros]),
      [
        ['homem', '18-24', 'diario', 4, 1],
        ['homem', '18-24', 'nao', 5, 2],
        ['mulher', '30-34', 'nao', 1, 1],
      ],
    )
  })

  it('keeps who did not answer a question in a cell of their own, with the answer empty', () => {
    const cells = pnsCells([adult({}, { fumo: null }), adult({})])
    assert.deepEqual(
      cells.map((c) => c.values.fumo),
      [null, 'nao'],
    )
  })

  it('gives the design effect of the sex × bracket from the variance between PSUs', () => {
    // Three PSUs of weight 1, one smoker: p = 1/3, design variance 1/9 (the
    // residuals per PSU are 2/9, −1/9 and −1/9), simple random sample
    // variance (1/3 × 2/3)/3 = 2/27. Effect: 1.5.
    const cells = pnsCells([
      adult({ psu: 'A' }, { fumo: 'diario' }),
      adult({ psu: 'B' }),
      adult({ psu: 'C' }),
    ])
    for (const c of cells) assert.ok(Math.abs(c.efeito_plano - 1.5) < 1e-9)
  })

  it('never takes a design effect below 1', () => {
    // A single PSU: the design variance comes out as zero.
    const cells = pnsCells([adult({}, { fumo: 'diario' }), adult({})])
    for (const c of cells) assert.equal(c.efeito_plano, 1)
  })
})

/** A `PNS_2019.txt` line with the fields at the dictionary positions. */
function line(fields: Record<string, [start: number, value: string]>) {
  const chars = Array<string>(1440).fill(' ')
  for (const [start, value] of Object.values(fields))
    for (let i = 0; i < value.length; i++) chars[start - 1 + i] = value[i]!
  return chars.join('')
}

describe('readPnsRecord', () => {
  const person = (height: string, smoking = '3') =>
    line({
      V0024: [3, '1110011'],
      UPA_PNS: [10, '110000016'],
      C006: [108, '2'],
      C008: [117, '034'],
      M001: [527, '1'],
      P00404: [617, height],
      P050: [711, smoking],
      Y008: [1304, '1'],
      V00291: [1426, '00000123.45678'],
    })

  it('reads the selected adult with the answers as the CSV writes them', () => {
    assert.deepEqual(readPnsRecord(person('165')), {
      stratum: '1110011',
      psu: '110000016',
      weight: 123.45678,
      sex: 'mulher',
      age: 34,
      values: { orientacao: 'heterossexual', altura: '165', fumo: 'nao' },
    })
  })

  it('puts heights out of the 140 to 200 range at 139 and 201, and leaves the missing ones empty', () => {
    assert.equal(readPnsRecord(person('120'))?.values.altura, '139')
    assert.equal(readPnsRecord(person('213'))?.values.altura, '201')
    assert.equal(readPnsRecord(person('   ', ' '))?.values.altura, null)
    assert.equal(readPnsRecord(person('   ', ' '))?.values.fumo, null)
  })
})

describe('pnsToCsv', () => {
  it('writes one column per PNS variable, the empty answer as ""', () => {
    const csv = pnsToCsv(pnsCells([adult({ weight: 2.6 }, { altura: null })]))
    assert.equal(
      csv,
      'sexo,idade,orientacao,altura,fumo,peso,n_registros,efeito_plano\n' +
        'homem,18-24,heterossexual,,nao,3,1,1.000\n',
    )
  })
})
