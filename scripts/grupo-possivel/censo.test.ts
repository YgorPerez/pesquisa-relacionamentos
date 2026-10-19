// O agregador do Censo sobre um microdado minúsculo (seam 5 do spec #23).
// Os registros imitam o arquivo `Pessoas_<UF>_publico.csv` do IBGE: separador
// `;`, peso com ponto decimal, e só as colunas que o agregador lê (as outras
// cento e tantas não mudam nada).
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { agregarPessoas, celulasEmCsv } from './censo.ts'

const CABECALHO =
  'P0010;P0020;P0110;P0150;P0180;P0210;P0280;P0340;P0410;P0760;P1110'

// Mulher de SP, 20–24, parda, não mora com companheiro (nunca viveu), sem
// filhos, evangélica, superior completo, R$ 3.000 (entre 2 e 5 salários de
// R$ 1.212).
const MULHER_SP = '3;35;10.5;2;05;4;3;0;2;7;3000'

describe('agregarPessoas', () => {
  it('soma pesos e conta registros da mesma combinação', async () => {
    const { celulas } = await agregarPessoas([
      CABECALHO,
      MULHER_SP,
      MULHER_SP.replace('10.5', '4.25'),
    ])
    assert.deepEqual(celulas, [
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

  it('traduz os códigos do dicionário de variáveis', async () => {
    const homemAC = '1;12;6.2;1;17;5;1;;7;3;1212'
    const mulherComFilhos = '1;12;2;2;06;1;2;3;3;1;0'
    const { celulas } = await agregarPessoas([
      CABECALHO,
      homemAC,
      mulherComFilhos,
    ])
    assert.deepEqual(
      celulas.map((c) => [
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
        // Homem: o Censo não pergunta filhos, então fica vazio (sem dado).
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

  it('deixa vazio o que o IBGE não determinou', async () => {
    // Cor 9 (ignorada), religião 9 (sem declaração), instrução 8 (não
    // determinado) e filhos em branco numa mulher.
    const { celulas } = await agregarPessoas([
      CABECALHO,
      '1;35;1;2;07;9;3;;9;8;',
    ])
    const [c] = celulas
    assert.deepEqual(
      [c?.cor, c?.religiao, c?.escolaridade, c?.filhos, c?.renda],
      ['', '', '', '', 'sem-renda'],
    )
  })

  it('fica com quem tem 15 anos ou mais e conta os descartados', async () => {
    const crianca = '1;35;3;1;03;1;3;;1;2;0'
    const sexoSuprimido = '1;35;7;9;99;1;3;;1;2;0'
    const { celulas, descartados } = await agregarPessoas([
      CABECALHO,
      MULHER_SP,
      crianca,
      sexoSuprimido,
    ])
    assert.equal(celulas.length, 1)
    assert.deepEqual(descartados, {
      menosDe15: { registros: 1, peso: 3 },
      sexoOuIdadeIgnorados: { registros: 1, peso: 7 },
    })
  })

  it('soma o peso total de todos os registros, para conferir com a população da UF', async () => {
    const crianca = '1;35;3;1;03;1;3;;1;2;0'
    const { pesoTotal } = await agregarPessoas([CABECALHO, MULHER_SP, crianca])
    assert.deepEqual(pesoTotal, { SP: 13.5 })
  })

  it('aceita vários arquivos, cada um com o seu cabeçalho', async () => {
    const { celulas } = await agregarPessoas([
      CABECALHO,
      MULHER_SP,
      CABECALHO,
      MULHER_SP,
    ])
    assert.equal(celulas[0]?.n_registros, 2)
  })

  it('recusa um arquivo sem uma coluna que o agregador usa', async () => {
    await assert.rejects(
      agregarPessoas(['P0020;P0110', '35;1']),
      /falta a coluna P0150/,
    )
  })
})

describe('celulasEmCsv', () => {
  it('escreve o CSV longo com cabeçalho e peso com duas casas', async () => {
    const { celulas } = await agregarPessoas([
      CABECALHO,
      MULHER_SP,
      '1;12;6.2;1;17;5;1;;7;3;1212',
    ])
    assert.equal(
      celulasEmCsv(celulas),
      [
        'sexo,idade,uf,uniao,escolaridade,renda,cor,religiao,filhos,peso,n_registros',
        'homem,80+,AC,sim,fundamental,ate-1,indigena,sem-religiao,,6.20,1',
        'mulher,20-24,SP,nao,superior,2-5,parda,evangelica,nao,10.50,1',
        '',
      ].join('\n'),
    )
  })
})
