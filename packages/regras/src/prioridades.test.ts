import { describe, expect, it } from 'vite-plus/test'
import {
  alertaDoTopo3,
  alternarNoTopo3,
  degrau,
  lerPrioridades,
  prateleiras,
  viesPara,
  type CaracteristicaComEvidencia,
} from './prioridades.ts'

const celula = (n: 0 | 1 | 2 | 3) => ({ degrau: n })

/** Quatro características com degraus de exemplo, como no arquivo de Prioridades. */
const CARS: ReadonlyArray<CaracteristicaComEvidencia> = [
  {
    id: 'aparencia',
    nome: 'Aparência',
    atracao: celula(3),
    satisfacao: celula(2),
    duracao: celula(0),
    vies: { todos: 'Pesa mais na atração do que se diz.' },
  },
  {
    id: 'renda',
    nome: 'Renda',
    atracao: celula(2),
    satisfacao: celula(0),
    duracao: celula(0),
    vies: {
      homem: 'Homens declaram menos.',
      mulher: 'Mulheres declaram mais.',
    },
  },
  {
    id: 'parecido',
    nome: 'Ser parecido comigo',
    atracao: celula(1),
    satisfacao: celula(1),
    duracao: celula(0),
  },
  {
    id: 'gentileza',
    nome: 'Gentileza',
    atracao: celula(0),
    satisfacao: celula(2),
    duracao: celula(1),
  },
  {
    id: 'idade',
    nome: 'Idade parecida',
    atracao: celula(0),
    satisfacao: celula(0),
    duracao: celula(1),
  },
]

describe('degrau', () => {
  it('lê o degrau da característica no desfecho', () => {
    expect(degrau(CARS[0]!, 'atracao')).toBe(3)
    expect(degrau(CARS[0]!, 'satisfacao')).toBe(2)
    expect(degrau(CARS[0]!, 'duracao')).toBe(0)
  })
})

describe('alternarNoTopo3', () => {
  it('tocar dá o próximo número', () => {
    expect(alternarNoTopo3([], 'renda')).toEqual(['renda'])
    expect(alternarNoTopo3(['renda'], 'aparencia')).toEqual([
      'renda',
      'aparencia',
    ])
  })

  it('tocar de novo tira e renumera as outras', () => {
    expect(alternarNoTopo3(['renda', 'aparencia', 'idade'], 'renda')).toEqual([
      'aparencia',
      'idade',
    ])
  })

  it('com três escolhidas, tocar numa quarta não muda nada', () => {
    expect(
      alternarNoTopo3(['renda', 'aparencia', 'idade'], 'gentileza'),
    ).toEqual(['renda', 'aparencia', 'idade'])
  })
})

describe('prateleiras', () => {
  it('põe cada característica na prateleira do seu degrau, de "pesa" a "não sabemos"', () => {
    expect(prateleiras(CARS, 'satisfacao', [])).toEqual([
      { degrau: 3, nome: 'pesa', ids: [] },
      { degrau: 2, nome: 'pesa pouco', ids: ['aparencia', 'gentileza'] },
      { degrau: 1, nome: 'quase nada', ids: ['parecido'] },
      { degrau: 0, nome: 'não sabemos', ids: ['renda', 'idade'] },
    ])
  })

  it('as escolhidas vêm primeiro na prateleira, na ordem do topo 3', () => {
    const [, poucoPeso, , semDado] = prateleiras(CARS, 'satisfacao', [
      'idade',
      'gentileza',
      'renda',
    ])
    expect(poucoPeso?.ids).toEqual(['gentileza', 'aparencia'])
    expect(semDado?.ids).toEqual(['idade', 'renda'])
  })
})

describe('alertaDoTopo3', () => {
  it('sem nada em "quase nada" ou "não sabemos", não há alerta', () => {
    expect(
      alertaDoTopo3(CARS, ['aparencia', 'gentileza'], 'satisfacao'),
    ).toBeNull()
    expect(alertaDoTopo3(CARS, [], 'satisfacao')).toBeNull()
  })

  it('diz em frase, sem número, o que pesa quase nada', () => {
    expect(alertaDoTopo3(CARS, ['aparencia', 'parecido'], 'satisfacao')).toBe(
      'No seu topo 3, para satisfação: ser parecido comigo pesa quase nada.',
    )
  })

  it('diz para o que não há boa evidência', () => {
    expect(alertaDoTopo3(CARS, ['renda', 'aparencia'], 'satisfacao')).toBe(
      'No seu topo 3, para satisfação: para renda não há boa evidência.',
    )
  })

  it('junta os dois casos e põe o plural, na ordem do topo 3', () => {
    expect(
      alertaDoTopo3(CARS, ['idade', 'aparencia', 'gentileza'], 'atracao'),
    ).toBe(
      'No seu topo 3, para atração: para idade parecida e gentileza não há boa evidência.',
    )
    expect(
      alertaDoTopo3(CARS, ['gentileza', 'idade', 'parecido'], 'duracao'),
    ).toBe(
      'No seu topo 3, para duração: gentileza e idade parecida pesam quase nada; para ser parecido comigo não há boa evidência.',
    )
  })

  it('ignora o que não está nos dados', () => {
    expect(alertaDoTopo3(CARS, ['sumiu', 'aparencia'], 'satisfacao')).toBeNull()
  })
})

describe('viesPara', () => {
  it('o viés que vale para todos aparece com ou sem gênero', () => {
    expect(viesPara(CARS[0]!, undefined)).toBe(
      'Pesa mais na atração do que se diz.',
    )
    expect(viesPara(CARS[0]!, 'mulher')).toBe(
      'Pesa mais na atração do que se diz.',
    )
    expect(viesPara(CARS[0]!, 'outro')).toBe(
      'Pesa mais na atração do que se diz.',
    )
  })

  it('o viés por gênero segue o gênero do Perfil', () => {
    expect(viesPara(CARS[1]!, 'homem')).toBe('Homens declaram menos.')
    expect(viesPara(CARS[1]!, 'mulher')).toBe('Mulheres declaram mais.')
  })

  it('sem gênero, ou com "outro", o viés de um gênero só não aparece', () => {
    expect(viesPara(CARS[1]!, undefined)).toBeNull()
    expect(viesPara(CARS[1]!, 'outro')).toBeNull()
  })

  it('sem viés, nada', () => {
    expect(viesPara(CARS[2]!, 'homem')).toBeNull()
  })
})

describe('lerPrioridades', () => {
  it('aceita o topo 3 ordenado e o desfecho', () => {
    expect(
      lerPrioridades({ topo3: ['renda', 'aparencia'], desfecho: 'duracao' }),
    ).toEqual({
      topo3: ['renda', 'aparencia'],
      desfecho: 'duracao',
    })
  })

  it('sem desfecho válido, fica em satisfação', () => {
    expect(lerPrioridades({ topo3: ['renda'], desfecho: 'amor' })).toEqual({
      topo3: ['renda'],
      desfecho: 'satisfacao',
    })
  })

  it('descarta repetidas, não texto, e o que passa de três', () => {
    expect(
      lerPrioridades({
        topo3: ['renda', 'renda', 7, 'Não Slug', 'a', 'b', 'c'],
        desfecho: 'atracao',
      }),
    ).toEqual({
      topo3: ['renda', 'a', 'b'],
      desfecho: 'atracao',
    })
  })

  it('fica só com as ids que existem, quando a lista é dada', () => {
    expect(
      lerPrioridades({ topo3: ['renda', 'sumiu'] }, ['renda', 'aparencia']),
    ).toEqual({
      topo3: ['renda'],
      desfecho: 'satisfacao',
    })
  })

  it('devolve null para o que não é um objeto', () => {
    expect(lerPrioridades(null)).toBeNull()
    expect(lerPrioridades('renda')).toBeNull()
    expect(lerPrioridades({ topo3: 'renda' })).toEqual({
      topo3: [],
      desfecho: 'satisfacao',
    })
  })
})
