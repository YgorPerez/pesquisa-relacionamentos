// As probabilidades da PNS 2019 por sexo × faixa de idade, com o intervalo
// do desenho amostral (estrato e UPA), sobre registros de exemplo.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { estimarPns, type RegistroPns } from './pns.ts'

const adulto = (parcial: Partial<RegistroPns>): RegistroPns => ({
  estrato: 'E1',
  upa: 'U1',
  peso: 1,
  sexo: 'homem',
  idade: 22,
  orientacao: 'heterossexual',
  altura: 175,
  fumo: 'nao',
  ...parcial,
})

const linha = (
  linhas: ReturnType<typeof estimarPns>,
  medida: string,
  categoria: string,
  sexo = 'homem',
  idade = '18-24',
) =>
  linhas.find(
    (l) =>
      l.medida === medida &&
      l.categoria === categoria &&
      l.sexo === sexo &&
      l.idade === idade,
  )

describe('estimarPns', () => {
  it('dá a proporção ponderada pelo peso do morador selecionado', () => {
    const linhas = estimarPns([
      adulto({ upa: 'U1', peso: 3, orientacao: 'homossexual' }),
      adulto({ upa: 'U2', peso: 1 }),
    ])
    assert.equal(linha(linhas, 'orientacao', 'homossexual')?.p, 0.75)
    assert.equal(linha(linhas, 'orientacao', 'heterossexual')?.p, 0.25)
    assert.equal(linha(linhas, 'orientacao', 'homossexual')?.n_registros, 2)
  })

  it('calcula o intervalo de 95% pela variância entre UPAs do estrato', () => {
    // Três UPAs de peso 1, uma fumante: p = 1/3. Os resíduos por UPA são
    // 2/9, −1/9 e −1/9; a variância é 3/2 × 6/81 = 1/9 e o erro-padrão, 1/3.
    const linhas = estimarPns([
      adulto({ upa: 'A', fumo: 'diario' }),
      adulto({ upa: 'B' }),
      adulto({ upa: 'C' }),
    ])
    const fuma = linha(linhas, 'fumo', 'diario')
    assert.ok(fuma)
    assert.equal(fuma.p_min, 0)
    assert.ok(Math.abs(fuma.p_max - (1 / 3 + 1.96 / 3)) < 1e-9)
  })

  it('separa sexo e faixa de idade, a partir de 18 anos', () => {
    const linhas = estimarPns([
      adulto({ idade: 17 }),
      adulto({ idade: 31, sexo: 'mulher', fumo: 'ocasional' }),
      adulto({ idade: 75, sexo: 'mulher' }),
    ])
    assert.equal(linha(linhas, 'fumo', 'ocasional', 'mulher', '30-34')?.p, 1)
    assert.equal(linha(linhas, 'fumo', 'nao', 'mulher', '70+')?.p, 1)
    assert.equal(linha(linhas, 'fumo', 'nao', 'homem', '18-24'), undefined)
  })

  it('deixa fora do denominador quem não respondeu aquela pergunta', () => {
    const linhas = estimarPns([
      adulto({ upa: 'A', fumo: null }),
      adulto({ upa: 'B', fumo: 'diario' }),
    ])
    assert.equal(linha(linhas, 'fumo', 'diario')?.p, 1)
    assert.equal(linha(linhas, 'fumo', 'diario')?.n_registros, 1)
    assert.equal(linha(linhas, 'orientacao', 'heterossexual')?.n_registros, 2)
  })

  it('dá a altura como proporção acumulada até cada centímetro de 140 a 200', () => {
    const linhas = estimarPns([
      adulto({ upa: 'A', altura: 160 }),
      adulto({ upa: 'B', altura: 180 }),
    ])
    assert.equal(linha(linhas, 'altura', 'ate-159')?.p, 0)
    assert.equal(linha(linhas, 'altura', 'ate-160')?.p, 0.5)
    assert.equal(linha(linhas, 'altura', 'ate-179')?.p, 0.5)
    assert.equal(linha(linhas, 'altura', 'ate-180')?.p, 1)
    assert.equal(linhas.filter((l) => l.medida === 'altura').length, 61)
  })
})
