// The PNS 2019 probabilities by sex × age group, with the sample design
// interval (stratum and PSU), on sample records.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { estimatePns, type PnsRecord } from './pns.ts'

const adult = (partial: Partial<PnsRecord>): PnsRecord => ({
  stratum: 'E1',
  psu: 'U1',
  weight: 1,
  sex: 'homem',
  age: 22,
  orientation: 'heterossexual',
  height: 175,
  smoking: 'nao',
  ...partial,
})

const row = (
  rows: ReturnType<typeof estimatePns>,
  measure: string,
  category: string,
  sex = 'homem',
  age = '18-24',
) =>
  rows.find(
    (l) =>
      l.medida === measure &&
      l.categoria === category &&
      l.sexo === sex &&
      l.idade === age,
  )

describe('estimatePns', () => {
  it("gives the proportion weighted by the selected resident's weight", () => {
    const rows = estimatePns([
      adult({ psu: 'U1', weight: 3, orientation: 'homossexual' }),
      adult({ psu: 'U2', weight: 1 }),
    ])
    assert.equal(row(rows, 'orientacao', 'homossexual')?.p, 0.75)
    assert.equal(row(rows, 'orientacao', 'heterossexual')?.p, 0.25)
    assert.equal(row(rows, 'orientacao', 'homossexual')?.n_registros, 2)
  })

  it('computes the 95% interval from the variance between PSUs in the stratum', () => {
    // Three PSUs of weight 1, one smoker: p = 1/3. The residuals per PSU are
    // 2/9, −1/9 and −1/9; the variance is 3/2 × 6/81 = 1/9 and the standard error, 1/3.
    const rows = estimatePns([
      adult({ psu: 'A', smoking: 'diario' }),
      adult({ psu: 'B' }),
      adult({ psu: 'C' }),
    ])
    const smokes = row(rows, 'fumo', 'diario')
    assert.ok(smokes)
    assert.equal(smokes.p_min, 0)
    assert.ok(Math.abs(smokes.p_max - (1 / 3 + 1.96 / 3)) < 1e-9)
  })

  it('splits sex and age group, from age 18 up', () => {
    const rows = estimatePns([
      adult({ age: 17 }),
      adult({ age: 31, sex: 'mulher', smoking: 'ocasional' }),
      adult({ age: 75, sex: 'mulher' }),
    ])
    assert.equal(row(rows, 'fumo', 'ocasional', 'mulher', '30-34')?.p, 1)
    assert.equal(row(rows, 'fumo', 'nao', 'mulher', '70+')?.p, 1)
    assert.equal(row(rows, 'fumo', 'nao', 'homem', '18-24'), undefined)
  })

  it('leaves out of the denominator whoever did not answer that question', () => {
    const rows = estimatePns([
      adult({ psu: 'A', smoking: null }),
      adult({ psu: 'B', smoking: 'diario' }),
    ])
    assert.equal(row(rows, 'fumo', 'diario')?.p, 1)
    assert.equal(row(rows, 'fumo', 'diario')?.n_registros, 1)
    assert.equal(row(rows, 'orientacao', 'heterossexual')?.n_registros, 2)
  })

  it('gives height as the cumulative proportion up to each centimeter from 140 to 200', () => {
    const rows = estimatePns([
      adult({ psu: 'A', height: 160 }),
      adult({ psu: 'B', height: 180 }),
    ])
    assert.equal(row(rows, 'altura', 'ate-159')?.p, 0)
    assert.equal(row(rows, 'altura', 'ate-160')?.p, 0.5)
    assert.equal(row(rows, 'altura', 'ate-179')?.p, 0.5)
    assert.equal(row(rows, 'altura', 'ate-180')?.p, 1)
    assert.equal(rows.filter((l) => l.medida === 'altura').length, 61)
  })
})
