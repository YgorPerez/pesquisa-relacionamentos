// The Census aggregator on a tiny microdata file (seam 5 of spec #23).
// The records mimic IBGE's `Pessoas_<UF>_publico.csv`: `;` separator, weight
// with a decimal point, and only the columns the aggregator reads (the other
// hundred-odd change nothing).
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { aggregatePeople, cellsToCsv, readHouseholds } from './census.ts'

const HEADER =
  'P0010;P0020;P0110;P0150;P0180;P0210;P0280;P0340;P0410;P0760;P1110;P0300;P0310;P0950;P0990;P0100;P0170'

// Woman in SP, 20–24, parda, not living with a partner (never has), no
// children, evangelical, college degree, R$ 3,000 (between 2 and 5 minimum
// wages of R$ 1,212).
const WOMAN_SP = '3;35;10.5;2;05;4;3;0;2;7;3000;2;2'

describe('aggregatePeople', () => {
  it('sums weights and counts records of the same combination', async () => {
    const { cells } = await aggregatePeople([
      HEADER,
      WOMAN_SP,
      WOMAN_SP.replace('10.5', '4.25'),
    ])
    assert.deepEqual(cells, [
      {
        sexo: 'mulher',
        idade: '20-24',
        uf: 'SP',
        uniao: 'nao',
        escolaridade: 'superior',
        renda: '2-5',
        cor: 'parda',
        religiao: 'evangelica',
        filhos: 'nao',
        pais: 'nao',
        trabalho: 'nao',
        casa: '',
        peso: 14.75,
        n_registros: 2,
      },
    ])
  })

  it('translates the codes from the variable dictionary', async () => {
    const manAC = '1;12;6.2;1;17;5;1;;7;3;1212;2;2'
    const womanWithChildren = '1;12;2;2;06;1;2;3;3;1;0;2;2'
    const { cells } = await aggregatePeople([HEADER, manAC, womanWithChildren])
    assert.deepEqual(
      cells.map((c) => [
        c.sexo,
        c.idade,
        c.uf,
        c.uniao,
        c.escolaridade,
        c.renda,
        c.cor,
        c.religiao,
        c.filhos,
      ]),
      [
        // Man: the Census does not ask about children, so it stays empty (no data).
        [
          'homem',
          '80+',
          'AC',
          'sim',
          'fundamental',
          'ate-1',
          'indigena',
          'sem-religiao',
          '',
        ],
        [
          'mulher',
          '25-29',
          'AC',
          'nao',
          'sem-fundamental',
          'sem-renda',
          'branca',
          'espirita',
          'sim',
        ],
      ],
    )
  })

  it('leaves empty what IBGE did not determine', async () => {
    // Race 9 (unknown), religion 9 (not declared), education 8 (not
    // determined) and blank children for a woman.
    const { cells } = await aggregatePeople([
      HEADER,
      '1;35;1;2;07;9;3;;9;8;;2;2',
    ])
    const [c] = cells
    assert.deepEqual(
      [c?.cor, c?.religiao, c?.escolaridade, c?.filhos, c?.renda],
      ['', '', '', '', 'sem-renda'],
    )
  })

  it('records whether the mother, the father or a step-parent lives in the same household', async () => {
    const withMother = WOMAN_SP.replace(/;2;2$/, ';1;2')
    const withStepfather = WOMAN_SP.replace(/;2;2$/, ';2;1').replace(
      '10.5',
      '1',
    )
    const { cells } = await aggregatePeople([
      HEADER,
      WOMAN_SP,
      withMother,
      withStepfather,
    ])
    assert.deepEqual(
      cells.map((c) => [c.pais, c.peso]),
      [
        ['nao', 10.5],
        ['sim', 11.5],
      ],
    )
  })

  it('records whether the person was employed and whether in their own business', async () => {
    // P0950 blank: outside the labor force; 0: unemployed; 1: employed, with
    // the position in P0990 (03 private employee, 07 employer, 08
    // self-employed).
    const work = (p0950: string, p0990: string) =>
      `${WOMAN_SP};${p0950};${p0990}`
    const { cells } = await aggregatePeople([
      HEADER,
      work('', ''),
      work('0', '').replace('10.5', '1'),
      work('1', '03'),
      work('1', '07').replace('10.5', '2'),
      work('1', '08').replace('10.5', '3'),
    ])
    assert.deepEqual(
      cells.map((c) => [c.trabalho, c.peso]),
      [
        ['nao', 11.5],
        ['negocio', 5],
        ['sim', 10.5],
      ],
    )
  })

  it("owns a home when the household is the residents' own and the person heads it or is the head's spouse", async () => {
    // `Domicilios_<UF>_publico.csv`: D0100 links to the person's P0100;
    // D0190 1 owned and paid, 2 owned and paying, 3 rented, blank in a
    // collective household.
    const households = await readHouseholds([
      'D0010;D0020;D0100;D0110;D0190',
      '1;35;100;3.1;1',
      '1;35;200;3.1;2',
      '1;35;300;3.1;3',
      '1;35;400;3.1;',
    ])
    // P0170 01 head, 02 and 03 spouse, 04 child, 20 alone in a collective
    // household.
    const person = (control: string, condition: string, weight: string) =>
      `${WOMAN_SP};;;${control};${condition}`.replace('10.5', weight)
    const { cells, withoutHousehold } = await aggregatePeople(
      [
        HEADER,
        person('100', '01', '1'),
        person('200', '03', '2'),
        person('100', '04', '4'),
        person('300', '01', '8'),
        person('400', '20', '16'),
      ],
      households,
    )
    assert.deepEqual(
      cells.map((c) => [c.casa, c.peso]),
      [
        ['', 16],
        ['nao', 12],
        ['sim', 3],
      ],
    )
    assert.equal(withoutHousehold, 0)
  })

  it('counts the people whose household is missing from the households file', async () => {
    const { cells, withoutHousehold } = await aggregatePeople(
      [HEADER, `${WOMAN_SP};;;999;01`],
      new Map(),
    )
    assert.equal(cells[0]?.casa, '')
    assert.equal(withoutHousehold, 1)
  })

  it('keeps people aged 15 or more and counts the discarded ones', async () => {
    const child = '1;35;3;1;03;1;3;;1;2;0;2;2'
    const suppressedSex = '1;35;7;9;99;1;3;;1;2;0;2;2'
    const { cells, discarded } = await aggregatePeople([
      HEADER,
      WOMAN_SP,
      child,
      suppressedSex,
    ])
    assert.equal(cells.length, 1)
    assert.deepEqual(discarded, {
      under15: { records: 1, weight: 3 },
      sexOrAgeSuppressed: { records: 1, weight: 7 },
    })
  })

  it("sums the total weight of every record, to check against the state's population", async () => {
    const child = '1;35;3;1;03;1;3;;1;2;0;2;2'
    const { totalWeight } = await aggregatePeople([HEADER, WOMAN_SP, child])
    assert.deepEqual(totalWeight, { SP: 13.5 })
  })

  it('accepts several files, each with its own header', async () => {
    const { cells } = await aggregatePeople([
      HEADER,
      WOMAN_SP,
      HEADER,
      WOMAN_SP,
    ])
    assert.equal(cells[0]?.n_registros, 2)
  })

  it('rejects a file missing a column the aggregator uses', async () => {
    await assert.rejects(
      aggregatePeople(['P0020;P0110', '35;1']),
      /column P0150 missing/,
    )
  })
})

describe('cellsToCsv', () => {
  it('writes the long CSV with a header and the weight with two decimals', async () => {
    const { cells } = await aggregatePeople([
      HEADER,
      WOMAN_SP,
      '1;12;6.2;1;17;5;1;;7;3;1212;2;2',
    ])
    assert.equal(
      cellsToCsv(cells),
      [
        'sexo,idade,uf,uniao,escolaridade,renda,cor,religiao,filhos,pais,trabalho,casa,peso,n_registros',
        'homem,80+,AC,sim,fundamental,ate-1,indigena,sem-religiao,,nao,nao,,6.20,1',
        'mulher,20-24,SP,nao,superior,2-5,parda,evangelica,nao,nao,nao,,10.50,1',
        '',
      ].join('\n'),
    )
  })
})
