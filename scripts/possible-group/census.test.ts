// The Census aggregator on a tiny microdata file (seam 5 of spec #23).
// The records mimic IBGE's `Pessoas_<UF>_publico.csv`: `;` separator, weight
// with a decimal point, and only the columns the aggregator reads (the other
// hundred-odd change nothing).
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { aggregatePeople, cellsToCsv } from './census.ts'

const HEADER =
  'P0010;P0020;P0110;P0150;P0180;P0210;P0280;P0340;P0410;P0760;P1110'

// Woman in SP, 20–24, parda, not living with a partner (never has), no
// children, evangelical, college degree, R$ 3,000 (between 2 and 5 minimum
// wages of R$ 1,212).
const WOMAN_SP = '3;35;10.5;2;05;4;3;0;2;7;3000'

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
        peso: 14.75,
        n_registros: 2,
      },
    ])
  })

  it('translates the codes from the variable dictionary', async () => {
    const manAC = '1;12;6.2;1;17;5;1;;7;3;1212'
    const womanWithChildren = '1;12;2;2;06;1;2;3;3;1;0'
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
    const { cells } = await aggregatePeople([HEADER, '1;35;1;2;07;9;3;;9;8;'])
    const [c] = cells
    assert.deepEqual(
      [c?.cor, c?.religiao, c?.escolaridade, c?.filhos, c?.renda],
      ['', '', '', '', 'sem-renda'],
    )
  })

  it('keeps people aged 15 or more and counts the discarded ones', async () => {
    const child = '1;35;3;1;03;1;3;;1;2;0'
    const suppressedSex = '1;35;7;9;99;1;3;;1;2;0'
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
    const child = '1;35;3;1;03;1;3;;1;2;0'
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
      '1;12;6.2;1;17;5;1;;7;3;1212',
    ])
    assert.equal(
      cellsToCsv(cells),
      [
        'sexo,idade,uf,uniao,escolaridade,renda,cor,religiao,filhos,peso,n_registros',
        'homem,80+,AC,sim,fundamental,ate-1,indigena,sem-religiao,,6.20,1',
        'mulher,20-24,SP,nao,superior,2-5,parda,evangelica,nao,10.50,1',
        '',
      ].join('\n'),
    )
  })
})
