import { describe, expect, it } from 'vite-plus/test'
import {
  idadeProcurada,
  lerRequisitos,
  quemSeProcura,
  REQUISITOS_PADRAO,
  soltar,
  valorDoRequisito,
  type Requisitos,
} from './requirements.ts'

describe('lerRequisitos', () => {
  it('devolve o padrão para lixo: "não mora com companheiro(a)" ligado e o resto solto', () => {
    expect(lerRequisitos(null)).toEqual(REQUISITOS_PADRAO)
    expect(lerRequisitos('x')).toEqual(REQUISITOS_PADRAO)
    expect(REQUISITOS_PADRAO.companheiro).toBe(true)
  })

  it('aceita os Requisitos válidos e volta igual depois de passar por JSON', () => {
    const r: Requisitos = {
      idade: { min: 25, max: 35 },
      lugar: { uf: 'SP', municipio: '3550308' },
      companheiro: false,
      escolaridade: 'superior',
      renda: '2-5',
      cores: ['preta', 'parda'],
      religioes: ['sem-religiao'],
      semFilhos: true,
      altura: { min: 160, max: 200 },
      naoFuma: true,
    }
    expect(lerRequisitos(JSON.parse(JSON.stringify(r)))).toEqual(r)
  })

  it('descarta o que não vale e mantém o resto', () => {
    const r = lerRequisitos({
      idade: { min: 40, max: 30 },
      lugar: { uf: 'SP', municipio: '3304557' },
      escolaridade: 'doutorado',
      cores: ['preta', 'azul'],
      altura: { min: 100, max: 180 },
      naoFuma: 'sim',
    })
    expect(r.idade).toBeNull()
    // O município do Rio não é de SP: fica a UF.
    expect(r.lugar).toEqual({ uf: 'SP' })
    expect(r.escolaridade).toBeNull()
    expect(r.cores).toEqual(['preta'])
    expect(r.altura).toEqual(REQUISITOS_PADRAO.altura)
    expect(r.naoFuma).toBe(false)
  })
})

describe('valorDoRequisito', () => {
  const r: Requisitos = {
    ...REQUISITOS_PADRAO,
    idade: { min: 40, max: 80 },
    lugar: { uf: 'SP', municipio: '3550308' },
    escolaridade: 'medio',
    cores: ['preta', 'parda', 'indigena'],
    altura: { min: 140, max: 175 },
  }

  it('escreve cada Requisito como na frase', () => {
    expect(valorDoRequisito('idade', null, r)).toBe('40 anos ou mais')
    expect(valorDoRequisito('lugar', null, r, 'São Paulo')).toBe(
      'São Paulo (SP)',
    )
    expect(valorDoRequisito('lugar', null, REQUISITOS_PADRAO)).toBe(
      'Brasil inteiro',
    )
    expect(valorDoRequisito('escolaridade', null, r)).toBe(
      'pelo menos médio completo',
    )
    expect(valorDoRequisito('cor', null, r)).toBe(
      'cor preta, parda ou indígena',
    )
    expect(valorDoRequisito('altura', null, r)).toBe('até 175 cm')
    expect(valorDoRequisito('renda', null, r)).toBe('qualquer renda')
  })

  it('"sem filhos" procurando homens diz que não há dado', () => {
    expect(
      valorDoRequisito(
        'filhos',
        { procura: 'homens' },
        { ...r, semFilhos: true },
      ),
    ).toBe('sem dado para homens')
  })
})

describe('soltar', () => {
  it('volta só aquele Requisito ao "qualquer"', () => {
    const r: Requisitos = {
      ...REQUISITOS_PADRAO,
      cores: ['preta'],
      naoFuma: true,
    }
    expect(soltar(r, 'cor')).toEqual({ ...r, cores: [] })
    expect(soltar(r, 'idade').idade).toEqual({ min: 18, max: 80 })
  })
})

describe('idadeProcurada', () => {
  it('começa na idade do Perfil ±5, dentro de 18 a 80', () => {
    expect(idadeProcurada({ idade: 30 }, REQUISITOS_PADRAO)).toEqual({
      min: 25,
      max: 35,
    })
    expect(idadeProcurada({ idade: 20 }, REQUISITOS_PADRAO)).toEqual({
      min: 18,
      max: 25,
    })
    expect(idadeProcurada({ idade: 79 }, REQUISITOS_PADRAO)).toEqual({
      min: 74,
      max: 80,
    })
  })

  it('sem idade no Perfil, qualquer idade; depois de mexer, a escolhida', () => {
    expect(idadeProcurada(null, REQUISITOS_PADRAO)).toEqual({
      min: 18,
      max: 80,
    })
    expect(
      idadeProcurada(
        { idade: 30 },
        { ...REQUISITOS_PADRAO, idade: { min: 40, max: 50 } },
      ),
    ).toEqual({ min: 40, max: 50 })
  })
})

describe('quemSeProcura', () => {
  it('procurando mulheres: o sexo 1 do Censo, "mulheres" e o filtro de filhos vale', () => {
    expect(quemSeProcura({ procura: 'mulheres' })).toEqual({
      sexos: [1],
      alvo: 'mulheres',
      filhos: 'vale',
    })
  })

  it('procurando homens: o sexo 0, "homens" e sem dado de filhos', () => {
    expect(quemSeProcura({ procura: 'homens' })).toEqual({
      sexos: [0],
      alvo: 'homens',
      filhos: 'sem-dado',
    })
  })

  it('procurando os dois, ou sem dizer: os dois sexos, "pessoas" e filhos só para as mulheres', () => {
    const ambos = { sexos: [0, 1], alvo: 'pessoas', filhos: 'so-mulheres' }
    expect(quemSeProcura({ procura: 'ambos' })).toEqual(ambos)
    expect(quemSeProcura({ genero: 'homem' })).toEqual(ambos)
    expect(quemSeProcura(null)).toEqual(ambos)
  })
})
