// The PNAD Contínua probability of an office occupation, by sex × Census age
// group × education, and its cross-check against SIDRA 5435.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import {
  crossCheckPnad,
  estimatePnad,
  readPnadRecord,
  type PnadRecord,
} from './pnad.ts'

const person = (partial: Partial<PnadRecord>): PnadRecord => ({
  stratum: 'E1',
  psu: 'U1',
  weight: 1,
  sex: 'mulher',
  age: 27,
  education: 'superior',
  occupation: null,
  ...partial,
})

const row = (
  rows: ReturnType<typeof estimatePnad>,
  universe: string,
  education = '',
  sex = 'mulher',
  age = '25-29',
) =>
  rows.find(
    (l) =>
      l.universo === universe &&
      l.escolaridade === education &&
      l.sexo === sex &&
      l.idade === age,
  )

describe('estimatePnad', () => {
  it('counts groups 1 to 4 of VD4011 as office, over everyone in the cell', () => {
    const rows = estimatePnad([
      person({ psu: 'A', occupation: 1 }),
      person({ psu: 'B', occupation: 4 }),
      person({ psu: 'C', occupation: 5 }),
      person({ psu: 'D', occupation: null }),
    ])
    assert.equal(row(rows, 'todos')?.p, 0.5)
    assert.equal(row(rows, 'todos')?.n_registros, 4)
  })

  it('also gives the share among the employed, for when "trabalha" is on', () => {
    const rows = estimatePnad([
      person({ psu: 'A', occupation: 2, weight: 3 }),
      person({ psu: 'B', occupation: 9, weight: 1 }),
      person({ psu: 'C', occupation: null, weight: 4 }),
    ])
    assert.equal(row(rows, 'ocupados')?.p, 0.75)
    assert.equal(row(rows, 'ocupados')?.n_registros, 2)
  })

  it('splits by education, with an all-educations row for cells without it', () => {
    const thirty = (partial: Partial<PnadRecord>) =>
      Array.from({ length: 30 }, (_, i) => person({ psu: `P${i}`, ...partial }))
    const rows = estimatePnad([
      ...thirty({ occupation: 3 }),
      ...thirty({ education: 'medio', occupation: 7 }),
    ])
    assert.equal(row(rows, 'todos', 'superior')?.p, 1)
    assert.equal(row(rows, 'todos', 'medio')?.p, 0)
    assert.equal(row(rows, 'todos', '')?.p, 0.5)
    assert.equal(row(rows, 'todos', 'fundamental'), undefined)
  })

  it('leaves out an education row below 30 records, where the count falls back to the all-educations one', () => {
    const rows = estimatePnad([
      ...Array.from({ length: 30 }, (_, i) =>
        person({ psu: `P${i}`, education: 'medio', occupation: 4 }),
      ),
      ...Array.from({ length: 29 }, (_, i) => person({ psu: `Q${i}` })),
    ])
    assert.equal(row(rows, 'todos', 'medio')?.p, 1)
    assert.equal(row(rows, 'todos', 'superior'), undefined)
    assert.equal(row(rows, 'todos', '')?.n_registros, 59)
  })

  it('uses the Census age groups, and only ages 18 and 19 in the 15 to 19 one', () => {
    const rows = estimatePnad([
      person({ age: 17, occupation: 4 }),
      person({ age: 19, occupation: 5 }),
      person({ age: 83, sex: 'homem', occupation: 1 }),
    ])
    assert.equal(row(rows, 'todos', '', 'mulher', '15-19')?.p, 0)
    assert.equal(row(rows, 'todos', '', 'mulher', '15-19')?.n_registros, 1)
    assert.equal(row(rows, 'todos', '', 'homem', '80+')?.p, 1)
  })

  it('computes the 95% interval from the variance between PSUs in the stratum', () => {
    // Three PSUs of weight 1, one in an office: p = 1/3, standard error 1/3
    // (the same worked example as the PNS).
    const rows = estimatePnad([
      person({ psu: 'A', occupation: 2 }),
      person({ psu: 'B' }),
      person({ psu: 'C' }),
    ])
    const office = row(rows, 'todos')
    assert.ok(office)
    assert.equal(office.p_min, 0)
    assert.ok(Math.abs(office.p_max - (1 / 3 + 1.96 / 3)) < 1e-9)
  })
})

describe('readPnadRecord', () => {
  // A line of PNADC_032022.txt with only the fields the pipeline reads, at
  // the positions of input_PNADC_trimestral.sas.
  const line = (fields: Record<number, string>) => {
    const chars = Array<string>(3479).fill(' ')
    for (const [start, value] of Object.entries(fields))
      for (let i = 0; i < value.length; i++)
        chars[Number(start) - 1 + i] = value[i]!
    return chars.join('')
  }
  const fields = {
    12: '110000016',
    21: '1110011',
    50: '000123.45678900',
    95: '2',
    104: ' 34',
    405: '7',
    410: '1',
    421: '03',
  }

  it('reads stratum, PSU, weight, sex, age, education and VD4011', () => {
    assert.deepEqual(readPnadRecord(line(fields)), {
      stratum: '1110011',
      psu: '110000016',
      weight: 123.456789,
      sex: 'mulher',
      age: 34,
      education: 'superior',
      occupation: 3,
    })
  })

  it('groups VD3004 like the Census groups P0760', () => {
    const education = (code: string) =>
      readPnadRecord(line({ ...fields, 405: code }))?.education
    assert.deepEqual(['1', '2', '3', '4', '5', '6', '7'].map(education), [
      'sem-fundamental',
      'sem-fundamental',
      'fundamental',
      'fundamental',
      'medio',
      'medio',
      'superior',
    ])
  })

  it('has no occupation for whoever is not employed (VD4002 = 2 or blank)', () => {
    assert.equal(
      readPnadRecord(line({ ...fields, 410: '2', 421: '  ' }))?.occupation,
      null,
    )
  })

  it('leaves out whoever is under 14, the age VD4011 starts at', () => {
    assert.equal(readPnadRecord(line({ ...fields, 104: ' 13' })), null)
  })
})

describe('crossCheckPnad', () => {
  // 2,500 employed people of weight 1,000: 1,000 in group 1, 1,500 in group 5.
  const records = [
    ...Array.from({ length: 1000 }, () =>
      person({ occupation: 1, weight: 1000 }),
    ),
    ...Array.from({ length: 1500 }, () =>
      person({ occupation: 5, weight: 1000 }),
    ),
  ]

  it('passes when the employed by group, in thousands, match SIDRA 5435', () => {
    assert.deepEqual(
      crossCheckPnad(records, [
        { group: 0, thousands: 2500 },
        { group: 1, thousands: 1000 },
        { group: 5, thousands: 1500 },
        { group: 2, thousands: 0 },
      ]),
      [],
    )
  })

  it('fails when a group is off by more than the rounding', () => {
    const failures = crossCheckPnad(records, [{ group: 1, thousands: 1002 }])
    assert.equal(failures.length, 1)
    assert.match(failures[0]!, /group 1/)
  })
})
