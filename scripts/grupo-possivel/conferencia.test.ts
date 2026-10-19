// A conferência dos microdados contra números publicados do SIDRA: o passo
// que barra o pipeline quando pesos ou códigos estão errados.
import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import type { Agregado, Celula } from './censo.ts'
import { conferir, conferirPns, type Publicado, type PublicadoPns } from './conferencia.ts'
import type { RegistroPns } from './pns.ts'

const celula = (sexo: string, idade: string, uf: string, uniao: string, peso: number): Celula => ({
  sexo, idade, uf, uniao, escolaridade: 'medio', renda: 'ate-1', cor: 'parda', religiao: 'catolica', filhos: '', peso, n_registros: 10,
})

// Duas UFs, um grupo de idade, mulheres: o microdado.
const agregado: Agregado = {
  celulas: [
    celula('mulher', '20-24', 'AC', 'sim', 400),
    celula('mulher', '20-24', 'AC', 'nao', 600),
    celula('mulher', '20-24', 'SP', 'sim', 4000),
    celula('mulher', '20-24', 'SP', 'nao', 6000),
  ],
  pesoTotal: { AC: 1500, SP: 15000 },
  descartados: { menosDe15: { registros: 0, peso: 0 }, sexoOuIdadeIgnorados: { registros: 0, peso: 0 } },
}

// O que o SIDRA publicou para as mesmas células, com 1% de diferença.
const publicado = (ac: [number, number], sp: [number, number]): Publicado => ({
  populacao: { AC: 1500, SP: 15000 },
  conjugal: [
    { local: 'AC', sexo: 'mulher', idade: '20-24', uniao: 'sim', pessoas: ac[0] },
    { local: 'AC', sexo: 'mulher', idade: '20-24', uniao: 'nao', pessoas: ac[1] },
    { local: 'SP', sexo: 'mulher', idade: '20-24', uniao: 'sim', pessoas: sp[0] },
    { local: 'SP', sexo: 'mulher', idade: '20-24', uniao: 'nao', pessoas: sp[1] },
    { local: 'BR', sexo: 'mulher', idade: '20-24', uniao: 'sim', pessoas: ac[0] + sp[0] },
    { local: 'BR', sexo: 'mulher', idade: '20-24', uniao: 'nao', pessoas: ac[1] + sp[1] },
  ],
})

describe('conferirPns', () => {
  const pessoa = (upa: string, orientacao: string): RegistroPns => ({
    estrato: 'E', upa, peso: 1, sexo: 'homem', idade: 30, orientacao, altura: 170, fumo: 'nao',
  })
  // 4 de 5 heterossexuais (80%) e 1 homossexual (20%).
  const registros = ['heterossexual', 'heterossexual', 'heterossexual', 'heterossexual', 'homossexual'].map((o, i) =>
    pessoa(`U${i}`, o),
  )

  it('passa quando a distribuição bate com a tabela publicada, arredondada a uma casa', () => {
    const tabela: ReadonlyArray<PublicadoPns> = [{ sexo: 'homem', categoria: 'homossexual', percentual: 20.0 }]
    assert.deepEqual(conferirPns(registros, tabela), [])
  })

  it('falha quando a distribuição se afasta da tabela', () => {
    const tabela: ReadonlyArray<PublicadoPns> = [{ sexo: 'homem', categoria: 'homossexual', percentual: 1.4 }]
    assert.deepEqual(conferirPns(registros, tabela), [
      'PNS homem homossexual: o microdado dá 20,0% e a Tabela 1.1.1 publica 1,4%',
    ])
  })
})

describe('conferir', () => {
  it('passa quando o microdado reproduz o SIDRA dentro da tolerância', () => {
    const r = conferir(agregado, publicado([404, 606], [4040, 6060]))
    assert.deepEqual(r.falhas, [])
    assert.equal(r.celulasConferidas, 6)
  })

  it('falha quando uma célula do Brasil se afasta mais de 2,5%', () => {
    // Microdado 4.400 contra 4.000 publicados: +10%.
    const r = conferir(agregado, publicado([400, 600], [3600, 6000]))
    assert.ok(r.falhas.some((f) => f.includes('BR mulher 20-24 vivia em união') && f.includes('+10,0%')), r.falhas.join('\n'))
  })

  it('falha quando a proporção que não vive em união numa UF se afasta mais de 3 pontos', () => {
    // No AC, o SIDRA diz 50% sem união; o microdado diz 60%.
    const r = conferir(agregado, publicado([500, 500], [4000, 6000]))
    assert.ok(r.falhas.some((f) => f.startsWith('AC mulher 20-24') && f.includes('10,0 pontos')), r.falhas.join('\n'))
  })

  it('falha quando a soma dos pesos não dá a população da UF', () => {
    const r = conferir(agregado, { ...publicado([400, 600], [4000, 6000]), populacao: { AC: 1500, SP: 15100 } })
    assert.deepEqual(r.falhas, ['SP: a soma dos pesos dá 15.000 pessoas e o SIDRA publica 15.100'])
  })

  it('falha quando o SIDRA tem uma UF que o microdado não tem', () => {
    const r = conferir(agregado, { ...publicado([400, 600], [4000, 6000]), populacao: { AC: 1500, SP: 15000, RJ: 9 } })
    assert.deepEqual(r.falhas, ['RJ: a soma dos pesos dá 0 pessoas e o SIDRA publica 9'])
  })
})
