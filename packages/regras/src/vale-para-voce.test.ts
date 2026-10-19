import { describe, expect, it } from 'vitest'
import type { Perfil } from './perfil.ts'
import { valeParaVoce, type Cobre, type Veredito } from './vale-para-voce.ts'

const HETERO: Cobre = { generos: ['homem', 'mulher'], procura: ['homens', 'mulheres'], casal: 'hetero' }
const MESMO_SEXO: Cobre = { generos: ['homem', 'mulher'], procura: ['homens', 'mulheres'], casal: 'mesmo-sexo' }
const SEM_RECORTE: Cobre = {}
const JOVENS: Cobre = { generos: ['homem', 'mulher'], idades: { min: 18, max: 35 } }
const SO_MARIDOS: Cobre = { generos: ['homem'], procura: ['mulheres'] }
const SO_QUEM_PROCURA_HOMENS: Cobre = { procura: ['homens'] }

const homemHomens: Perfil = { genero: 'homem', procura: 'homens', idade: 30 }
const homemMulheres: Perfil = { genero: 'homem', procura: 'mulheres', idade: 30 }
const mulherHomens: Perfil = { genero: 'mulher', procura: 'homens', idade: 24 }
const mulherMulheres: Perfil = { genero: 'mulher', procura: 'mulheres', idade: 24 }
const outro: Perfil = { genero: 'outro', procura: 'homens', idade: 30 }
const homemAmbos: Perfil = { genero: 'homem', procura: 'ambos', idade: 30 }
const mulherAmbos: Perfil = { genero: 'mulher', procura: 'ambos', idade: 50 }
const so40: Perfil = { idade: 40 }
const soHomem: Perfil = { genero: 'homem' }

const SIM: Veredito = { cobre: true }
const NAO: Veredito = { cobre: false }
const LADO_HOMENS: Veredito = { cobre: true, so: 'homens' }
const LADO_MULHERES: Veredito = { cobre: true, so: 'mulheres' }

describe('valeParaVoce: Perfis × cobre', () => {
  it.each<[string, Perfil, Cobre, Veredito]>([
    // O par do casal (#16): as listas sozinhas deixariam passar.
    ['homem que procura homens × só casais héteros', homemHomens, HETERO, NAO],
    ['homem que procura homens × casais do mesmo sexo', homemHomens, MESMO_SEXO, SIM],
    ['homem que procura mulheres × só casais héteros', homemMulheres, HETERO, SIM],
    ['homem que procura mulheres × casais do mesmo sexo', homemMulheres, MESMO_SEXO, NAO],
    ['mulher que procura homens × só casais héteros', mulherHomens, HETERO, SIM],
    ['mulher que procura mulheres × casais do mesmo sexo', mulherMulheres, MESMO_SEXO, SIM],
    ['mulher que procura mulheres × só casais héteros', mulherMulheres, HETERO, NAO],
    // Gênero e quem procura.
    ['mulher × estudo só de homens', mulherHomens, SO_MARIDOS, NAO],
    ['homem que procura mulheres × estudo só de homens que procuram mulheres', homemMulheres, SO_MARIDOS, SIM],
    ['homem que procura mulheres × estudo de quem procura homens', homemMulheres, SO_QUEM_PROCURA_HOMENS, NAO],
    // "outro" só casa com o que não separou por gênero.
    ['outro × estudo sem recorte', outro, SEM_RECORTE, SIM],
    ['outro × estudo que separou homens e mulheres', outro, JOVENS, NAO],
    ['outro × só casais héteros', outro, HETERO, NAO],
    ['outro × estudo que só separou quem procura homens', outro, SO_QUEM_PROCURA_HOMENS, SIM],
    // "ambos" vale se cobre um dos lados, e diz qual.
    ['homem que procura ambos × só casais héteros', homemAmbos, HETERO, LADO_MULHERES],
    ['homem que procura ambos × casais do mesmo sexo', homemAmbos, MESMO_SEXO, LADO_HOMENS],
    ['homem que procura ambos × estudo sem recorte', homemAmbos, SEM_RECORTE, SIM],
    ['homem que procura ambos × estudo de quem procura homens', homemAmbos, SO_QUEM_PROCURA_HOMENS, LADO_HOMENS],
    ['mulher que procura ambos × só casais héteros', mulherAmbos, HETERO, LADO_HOMENS],
    ['mulher que procura ambos × estudo só de homens', mulherAmbos, SO_MARIDOS, NAO],
    // Idade.
    ['30 anos × estudo de 18 a 35', homemMulheres, JOVENS, SIM],
    ['50 anos × estudo de 18 a 35', mulherAmbos, JOVENS, NAO],
    ['35 anos × estudo de 18 a 35 (a borda vale)', { ...homemMulheres, idade: 35 }, JOVENS, SIM],
    // Perfil pela metade: o que não foi dito não é conferido.
    ['só a idade × casais héteros', so40, HETERO, SIM],
    ['só a idade × estudo de 18 a 35', so40, JOVENS, NAO],
    ['só o gênero × casais do mesmo sexo', soHomem, MESMO_SEXO, SIM],
    ['só o gênero × estudo só de homens', soHomem, SO_MARIDOS, SIM],
  ])('%s', (_, perfil, cobre, esperado) => {
    expect(valeParaVoce(perfil, [cobre])).toEqual(esperado)
  })
})

describe('valeParaVoce com mais de um cobre', () => {
  it('vale se um dos cobre do achado cobrir o Perfil', () => {
    expect(valeParaVoce(homemHomens, [HETERO, MESMO_SEXO])).toEqual(SIM)
    expect(valeParaVoce(homemHomens, [HETERO, SO_MARIDOS])).toEqual(NAO)
  })

  it('com "ambos", os lados de cada cobre se somam', () => {
    expect(valeParaVoce(homemAmbos, [HETERO, MESMO_SEXO])).toEqual(SIM)
    expect(valeParaVoce(homemAmbos, [HETERO, HETERO])).toEqual(LADO_MULHERES)
  })

  it('sem cobre nenhum, não há dado para o Perfil', () => {
    expect(valeParaVoce(homemHomens, [])).toEqual(NAO)
  })
})

describe('valeParaVoce sem Perfil', () => {
  it('não decide nada: fica só a nota "Vale para:"', () => {
    expect(valeParaVoce(null, [HETERO])).toBeNull()
    expect(valeParaVoce({}, [HETERO])).toBeNull()
  })
})
