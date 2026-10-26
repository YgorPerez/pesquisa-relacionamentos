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
    bebida: 'nunca',
    exercicio: 'sim',
    saude_bucal: 'boa',
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
      values: {
        orientacao: 'heterossexual',
        altura: '165',
        fumo: 'nao',
        bebida: null,
        exercicio: null,
        saude_bucal: null,
      },
    })
  })

  it('puts heights out of the 140 to 200 range at 139 and 201, and leaves the missing ones empty', () => {
    assert.equal(readPnsRecord(person('120'))?.values.altura, '139')
    assert.equal(readPnsRecord(person('213'))?.values.altura, '201')
    assert.equal(readPnsRecord(person('   ', ' '))?.values.altura, null)
    assert.equal(readPnsRecord(person('   ', ' '))?.values.fumo, null)
  })
})

describe('readPnsRecord: lifestyle answers', () => {
  /** The selected adult with these answers (`[start, value]` by name). */
  const answering = (answers: Record<string, [number, string]>) =>
    readPnsRecord(
      line({
        C006: [108, '1'],
        C008: [117, '040'],
        M001: [527, '1'],
        V00291: [1426, '00000001.00000'],
        ...answers,
      }),
    )!.values

  it('drinking: never, less than once a week, or weekly; who did not say is left empty', () => {
    // P027 at 662: 1 never, 2 under once a month, 3 once a month or more;
    // P02801 at 663, days a week for those who drink monthly (0 = under once
    // a week).
    const drinking = (p027: string, p02801 = ' ') =>
      answering({ P027: [662, p027], P02801: [663, p02801] }).bebida
    assert.equal(drinking('1'), 'nunca')
    assert.equal(drinking('2'), 'raramente')
    assert.equal(drinking('3', '0'), 'raramente')
    assert.equal(drinking('3', '1'), 'semanal')
    assert.equal(drinking('3', '7'), 'semanal')
    assert.equal(drinking('9'), null)
    assert.equal(drinking('3', '9'), null)
  })

  it('exercise: 150 minutes a week or more, days times the usual duration', () => {
    // P034 at 673 (exercised in the last 3 months), P035 at 674 (days a
    // week, 0 = under once a week), P03701 at 675 (hours), P03702 at 677
    // (minutes).
    const exercise = (p034: string, days = ' ', hours = '  ', minutes = '  ') =>
      answering({
        P034: [673, p034],
        P035: [674, days],
        P03701: [675, hours],
        P03702: [677, minutes],
      }).exercicio
    assert.equal(exercise('2'), 'nao')
    assert.equal(exercise('1', '0'), 'nao')
    assert.equal(exercise('1', '3', '00', '50'), 'sim')
    assert.equal(exercise('1', '2', '01', '00'), 'nao')
    assert.equal(exercise('1', '2', '01', '15'), 'sim')
    assert.equal(exercise('1', '3', '00', '99'), null)
    assert.equal(exercise('9'), null)
  })

  it('exercise: a minute of a vigorous main activity counts as two', () => {
    // 2 days of 40 minutes: 80 walking (P036 = 01), 160 running (03).
    const exercise = (activity: string) =>
      answering({
        P034: [673, '1'],
        P035: [674, '2'],
        P03701: [675, '00'],
        P03702: [677, '40'],
        P036: [679, activity],
      }).exercicio
    assert.equal(exercise('01'), 'nao')
    assert.equal(exercise('03'), 'sim')
  })

  it('oral health: very good or good, against fair, poor or very poor', () => {
    // U005 at 1208, from 1 (very good) to 5 (very poor), 9 unknown.
    const teeth = (u005: string) =>
      answering({ U005: [1208, u005] }).saude_bucal
    assert.equal(teeth('1'), 'boa')
    assert.equal(teeth('2'), 'boa')
    assert.equal(teeth('3'), 'nao')
    assert.equal(teeth('5'), 'nao')
    assert.equal(teeth('9'), null)
  })
})

describe('pnsToCsv', () => {
  it('writes one column per PNS variable, the empty answer as ""', () => {
    const csv = pnsToCsv(pnsCells([adult({ weight: 2.6 }, { altura: null })]))
    assert.equal(
      csv,
      'sexo,idade,orientacao,altura,fumo,bebida,exercicio,saude_bucal,peso,n_registros,efeito_plano\n' +
        'homem,18-24,heterossexual,,nao,nunca,sim,boa,3,1,1.000\n',
    )
  })
})
