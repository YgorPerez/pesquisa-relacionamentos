// O estado conjugal por município (SIDRA 10185), que o Grupo possível usa no
// lugar do ajuste proporcional pela população (#31): a soma dos municípios
// tem de dar a UF publicada na mesma tabela.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import type { CelulaConjugal } from './conferencia.ts'
import {
  conferirMunicipios,
  municipiosEmCsv,
  type ConjugalDoMunicipio,
} from './municipios.ts'

const municipio = (
  codigo: string,
  nome: string,
  uf: string,
  sim: number,
  nao: number,
): ConjugalDoMunicipio => ({
  codigo,
  nome,
  uf,
  pessoas: new Map([
    ['mulher_25-29_sim', sim],
    ['mulher_25-29_nao', nao],
  ]),
})

const municipios = [
  municipio('1200401', 'Rio Branco', 'AC', 300, 700),
  municipio('1200203', 'Cruzeiro do Sul', 'AC', 100, 200),
]
const daUf = (sim: number, nao: number): CelulaConjugal[] => [
  { local: 'AC', sexo: 'mulher', idade: '25-29', uniao: 'sim', pessoas: sim },
  { local: 'AC', sexo: 'mulher', idade: '25-29', uniao: 'nao', pessoas: nao },
  { local: 'BR', sexo: 'mulher', idade: '25-29', uniao: 'nao', pessoas: 99999 },
]

describe('conferirMunicipios', () => {
  it('passa quando os municípios somam a UF, com a folga do arredondamento', () => {
    assert.deepEqual(conferirMunicipios(municipios, daUf(400, 900)), [])
    assert.deepEqual(conferirMunicipios(municipios, daUf(412, 890)), [])
  })

  it('falha dizendo a célula que não fecha', () => {
    const falhas = conferirMunicipios(municipios, daUf(400, 950))
    assert.equal(falhas.length, 1)
    assert.match(
      falhas[0]!,
      /AC mulher 25-29 não vivia em união: municípios somam 900, a UF publica 950/,
    )
  })
})

describe('municipiosEmCsv', () => {
  it('uma linha por município, com sexo × grupo × união nas colunas', () => {
    const csv = municipiosEmCsv(municipios)
    const [cabecalho, primeira] = csv.split('\n')
    assert.match(
      cabecalho!,
      /^municipio,nome,uf,homem_15-19_sim,homem_15-19_nao,/,
    )
    assert.equal(cabecalho!.split(',').length, 3 + 2 * 14 * 2)
    const colunas = cabecalho!.split(',')
    const valores = primeira!.split(',')
    assert.equal(valores[0], '1200203')
    assert.equal(valores[colunas.indexOf('mulher_25-29_nao')], '200')
    assert.equal(valores[colunas.indexOf('homem_80+_sim')], '0')
  })
})
