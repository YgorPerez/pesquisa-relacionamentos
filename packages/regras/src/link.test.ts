import { describe, expect, it } from 'vitest'
import {
  ehLink,
  fraseDoLink,
  lerLink,
  previaDePrioridades,
  previaDoGrupo,
  queryDoLink,
  type EstadoDoLink,
} from './link.ts'
import { REQUISITOS_PADRAO, type Requisitos } from './requisitos.ts'

const TUDO: Requisitos = {
  idade: { min: 25, max: 35 },
  lugar: { uf: 'SP', municipio: '3550308' },
  companheiro: false,
  escolaridade: 'superior',
  renda: '5+',
  cores: ['preta', 'parda'],
  religioes: ['umbanda-candomble', 'sem-religiao'],
  semFilhos: true,
  altura: { min: 160, max: 200 },
  naoFuma: true,
}

describe('ida e volta', () => {
  it('o Grupo possível volta igual, com o Perfil e todos os Requisitos', () => {
    const estado: EstadoDoLink = {
      calculadora: 'grupo-possivel',
      perfil: { genero: 'homem', procura: 'mulheres', idade: 30 },
      requisitos: TUDO,
    }
    expect(lerLink('grupo-possivel', queryDoLink(estado))).toEqual(estado)
  })

  it('sem Perfil e sem mexer nos Requisitos, o link leva só a versão', () => {
    const estado: EstadoDoLink = { calculadora: 'grupo-possivel', perfil: null, requisitos: null }
    expect(queryDoLink(estado)).toBe('v=1')
    expect(lerLink('grupo-possivel', 'v=1')).toEqual(estado)
  })

  it('Requisitos no padrão não ocupam a query e voltam como "nunca mexeu"', () => {
    const query = queryDoLink({ calculadora: 'grupo-possivel', perfil: { idade: 40 }, requisitos: REQUISITOS_PADRAO })
    expect(query).toBe('v=1&idade=40')
    expect(lerLink('grupo-possivel', query)).toEqual({ calculadora: 'grupo-possivel', perfil: { idade: 40 }, requisitos: null })
  })

  it('Prioridades volta com o topo 3 na ordem, o desfecho e o Perfil', () => {
    const estado: EstadoDoLink = {
      calculadora: 'prioridades',
      perfil: { genero: 'mulher' },
      prioridades: { topo3: ['renda', 'sexo', 'calma'], desfecho: 'duracao' },
    }
    const query = queryDoLink(estado)
    expect(query).toBe('v=1&genero=mulher&topo=renda,sexo,calma&desfecho=duracao')
    expect(lerLink('prioridades', query)).toEqual(estado)
  })

  it('a renda "5+" sobrevive ao escape e também chega sem ele', () => {
    const r = { ...REQUISITOS_PADRAO, renda: '5+' as const }
    const query = queryDoLink({ calculadora: 'grupo-possivel', perfil: null, requisitos: r })
    expect(query).toBe('v=1&renda=5%2B')
    expect(lerLink('grupo-possivel', '?v=1&renda=5+')).toEqual({ calculadora: 'grupo-possivel', perfil: null, requisitos: r })
  })
})

describe('versões antigas', () => {
  // Links copiados da versão 1, como circulam. Se um destes quebrar, quem
  // recebeu um link antigo abre a página errada: escreva um leitor novo.
  it('um link da versão 1 do Grupo possível abre o mesmo estado', () => {
    expect(
      lerLink(
        'grupo-possivel',
        '?v=1&genero=homem&procura=mulheres&idade=30&idades=25-35&uf=SP&municipio=3550308&companheiro=nao' +
          '&escolaridade=superior&renda=5%2B&cor=preta,parda&religiao=umbanda-candomble,sem-religiao' +
          '&sem-filhos=sim&altura=160-200&nao-fuma=sim',
      ),
    ).toEqual({ calculadora: 'grupo-possivel', perfil: { genero: 'homem', procura: 'mulheres', idade: 30 }, requisitos: TUDO })
  })

  it('um link da versão 1 de Prioridades abre o mesmo estado', () => {
    expect(lerLink('prioridades', 'v=1&procura=ambos&topo=gentileza,humor&desfecho=atracao')).toEqual({
      calculadora: 'prioridades',
      perfil: { procura: 'ambos' },
      prioridades: { topo3: ['gentileza', 'humor'], desfecho: 'atracao' },
    })
  })
})

describe('query inválida', () => {
  it('sem versão, com versão desconhecida ou que não se decodifica, não é link', () => {
    expect(lerLink('grupo-possivel', '')).toBeNull()
    expect(lerLink('grupo-possivel', 'genero=homem&idade=30')).toBeNull()
    expect(lerLink('grupo-possivel', 'v=99&genero=homem')).toBeNull()
    expect(lerLink('prioridades', 'v=1&topo=%E0%A4%A')).toBeNull()
  })

  it('um valor inválido cai fora e o resto do link vale', () => {
    expect(lerLink('grupo-possivel', 'v=1&genero=robo&procura=mulheres&idade=12&escolaridade=doutorado&uf=XX&cor=azul,preta')).toEqual({
      calculadora: 'grupo-possivel',
      perfil: { procura: 'mulheres' },
      requisitos: { ...REQUISITOS_PADRAO, cores: ['preta'] },
    })
    expect(lerLink('grupo-possivel', 'v=1&idades=50-20&altura=100-300')).toEqual({
      calculadora: 'grupo-possivel',
      perfil: null,
      requisitos: REQUISITOS_PADRAO,
    })
  })

  it('o topo 3 fica com até três ids que existem, sem repetir; desfecho desconhecido vira satisfação', () => {
    expect(lerLink('prioridades', 'v=1&topo=renda,renda,<b>,sexo,calma,humor&desfecho=amor', ['renda', 'sexo', 'humor'])).toEqual({
      calculadora: 'prioridades',
      perfil: null,
      prioridades: { topo3: ['renda', 'sexo', 'humor'], desfecho: 'satisfacao' },
    })
  })

  it('a chave de não ser contado nunca vai nem volta pelo link', () => {
    const query = 'v=1&nao-contar=sim&contar=nao&genero=mulher'
    const estado = lerLink('grupo-possivel', query)
    expect(estado).toEqual({ calculadora: 'grupo-possivel', perfil: { genero: 'mulher' }, requisitos: null })
    expect(queryDoLink(estado!)).toBe('v=1&genero=mulher')
  })
})

describe('fraseDoLink', () => {
  const NOMES = { renda: 'Renda', sexo: 'Química sexual', calma: 'Estabilidade emocional' }

  it('diz o Perfil e o que se procura, como no exemplo da story 63', () => {
    const r = { ...REQUISITOS_PADRAO, idade: { min: 25, max: 35 }, lugar: { uf: 'SP' as const }, escolaridade: 'superior' as const }
    expect(
      fraseDoLink({ calculadora: 'grupo-possivel', perfil: { genero: 'homem', procura: 'mulheres', idade: 30 }, requisitos: r }),
    ).toBe('Este link mostra: homem, 30, procura mulheres de 25 a 35, ensino superior, em SP.')
  })

  it('cita cada Requisito fora do padrão e o município pelo nome', () => {
    expect(
      fraseDoLink(
        { calculadora: 'grupo-possivel', perfil: { genero: 'outro' }, requisitos: TUDO },
        { municipio: 'São Paulo' },
      ),
    ).toBe(
      'Este link mostra: outro gênero, procura pessoas de 25 a 35, mora ou não com companheiro(a), ensino superior, ' +
        'mais de 5 salários mínimos, cor preta ou parda, religião umbanda ou candomblé ou sem religião, sem filhos, ' +
        'a partir de 160 cm, não fuma, em São Paulo (SP).',
    )
  })

  it('sem Perfil e sem Requisitos, diz que o link não leva nada seu', () => {
    expect(fraseDoLink({ calculadora: 'grupo-possivel', perfil: null, requisitos: null })).toBe(
      'Este link mostra só a conta do Brasil inteiro, sem nada seu.',
    )
  })

  it('em Prioridades, o Perfil, o topo 3 pelos nomes e o desfecho', () => {
    expect(
      fraseDoLink(
        { calculadora: 'prioridades', perfil: { genero: 'mulher', idade: 41 }, prioridades: { topo3: ['renda', 'sexo', 'calma'], desfecho: 'duracao' } },
        { nomes: NOMES },
      ),
    ).toBe('Este link mostra: mulher, 41, topo 3 renda, química sexual e estabilidade emocional, em duração.')
    expect(
      fraseDoLink({ calculadora: 'prioridades', perfil: null, prioridades: { topo3: [], desfecho: 'satisfacao' } }),
    ).toBe('Este link mostra: nenhuma característica escolhida, em satisfação.')
  })
})

describe('prévia nas redes', () => {
  const conta = { alvo: 'mulheres' as const, resultado: { min: 123_400, max: 178_900 } }
  const homem30 = { genero: 'homem' as const, procura: 'mulheres' as const, idade: 30 }

  it('o Grupo possível mostra a faixa e quem se procura, como no exemplo do spec', () => {
    const r = { ...REQUISITOS_PADRAO, idade: { min: 25, max: 35 }, lugar: { uf: 'SP' as const }, naoFuma: true }
    expect(previaDoGrupo({ calculadora: 'grupo-possivel', perfil: homem30, requisitos: r }, conta)).toEqual({
      titulo: 'Entre 120 mil e 180 mil mulheres de 25 a 35 em SP',
      descricao: 'Pela conta do Grupo possível, com o Censo 2022 e a PNS 2019. Também pediu: não fuma. Faça a sua conta.',
    })
  })

  it('nunca leva o gênero nem a idade de quem compartilhou, nem a idade tirada dela', () => {
    const previa = previaDoGrupo({ calculadora: 'grupo-possivel', perfil: homem30, requisitos: null }, conta)
    expect(previa.titulo).toBe('Entre 120 mil e 180 mil mulheres no Brasil, na idade procurada')
    const texto = `${previa.titulo} ${previa.descricao}`
    expect(texto).not.toMatch(/homem|homens|30|25|35|interessa/)
  })

  it('o município entra pelo nome', () => {
    const r = { ...REQUISITOS_PADRAO, lugar: { uf: 'SP' as const, municipio: '3550308' } }
    const previa = previaDoGrupo(
      { calculadora: 'grupo-possivel', perfil: null, requisitos: r },
      { alvo: 'pessoas', resultado: { min: 900, max: 1_100 } },
      { municipio: 'São Paulo' },
    )
    expect(previa.titulo).toBe('Entre 900 e 1,1 mil pessoas em São Paulo (SP)')
  })

  it('Prioridades mostra o topo 3 e o alerta, sem o Perfil', () => {
    const cars = [
      { id: 'renda', nome: 'Renda', atracao: { degrau: 2 }, satisfacao: { degrau: 0 }, duracao: { degrau: 0 } },
      { id: 'sexo', nome: 'Química sexual', atracao: { degrau: 3 }, satisfacao: { degrau: 3 }, duracao: { degrau: 1 } },
    ] as const
    const previa = previaDePrioridades(cars, { topo3: ['sexo', 'renda'], desfecho: 'satisfacao' })
    expect(previa).toEqual({
      titulo: 'Topo 3: química sexual e renda',
      descricao: 'No seu topo 3, para satisfação: para renda não há boa evidência.',
    })
    expect(previaDePrioridades(cars, { topo3: ['sexo'], desfecho: 'atracao' })?.descricao).toBe(
      'Para atração, a evidência não põe nenhuma delas em "quase nada" ou "não sabemos".',
    )
    expect(previaDePrioridades(cars, { topo3: [], desfecho: 'atracao' })).toBeNull()
  })
})

describe('ehLink', () => {
  it('reconhece a query com versão, válida ou não, e deixa as outras', () => {
    expect(ehLink('?v=1&genero=homem')).toBe(true)
    expect(ehLink('v=99')).toBe(true)
    expect(ehLink('v=1&x=%E0%A4%A')).toBe(true)
    expect(ehLink('utm_source=zap')).toBe(false)
    expect(ehLink('')).toBe(false)
  })
})
