import { describe, expect, it } from 'vite-plus/test'
import {
  top3Alert,
  toggleInTop3,
  level,
  readPriorities,
  shelves,
  biasFor,
  type TraitWithEvidence,
} from './priorities.ts'

const cell = (n: 0 | 1 | 2 | 3) => ({ degrau: n })

/** Five traits with sample levels, as in the priorities file. */
const TRAITS: ReadonlyArray<TraitWithEvidence> = [
  {
    id: 'aparencia',
    nome: 'Aparência',
    atracao: cell(3),
    satisfacao: cell(2),
    duracao: cell(0),
    vies: { todos: 'Pesa mais na atração do que se diz.' },
  },
  {
    id: 'renda',
    nome: 'Renda',
    atracao: cell(2),
    satisfacao: cell(0),
    duracao: cell(0),
    vies: {
      homem: 'Homens declaram menos.',
      mulher: 'Mulheres declaram mais.',
    },
  },
  {
    id: 'parecido',
    nome: 'Ser parecido comigo',
    atracao: cell(1),
    satisfacao: cell(1),
    duracao: cell(0),
  },
  {
    id: 'gentileza',
    nome: 'Gentileza',
    atracao: cell(0),
    satisfacao: cell(2),
    duracao: cell(1),
  },
  {
    id: 'idade',
    nome: 'Idade parecida',
    atracao: cell(0),
    satisfacao: cell(0),
    duracao: cell(1),
  },
]

describe('level', () => {
  it("reads the trait's level for the outcome", () => {
    expect(level(TRAITS[0]!, 'atracao')).toBe(3)
    expect(level(TRAITS[0]!, 'satisfacao')).toBe(2)
    expect(level(TRAITS[0]!, 'duracao')).toBe(0)
  })
})

describe('toggleInTop3', () => {
  it('a tap gives the next number', () => {
    expect(toggleInTop3([], 'renda')).toEqual(['renda'])
    expect(toggleInTop3(['renda'], 'aparencia')).toEqual(['renda', 'aparencia'])
  })

  it('tapping again removes it and renumbers the others', () => {
    expect(toggleInTop3(['renda', 'aparencia', 'idade'], 'renda')).toEqual([
      'aparencia',
      'idade',
    ])
  })

  it('with three chosen, tapping a fourth changes nothing', () => {
    expect(toggleInTop3(['renda', 'aparencia', 'idade'], 'gentileza')).toEqual([
      'renda',
      'aparencia',
      'idade',
    ])
  })
})

describe('shelves', () => {
  it('puts each trait on the shelf of its level, from "pesa" to "não sabemos"', () => {
    expect(shelves(TRAITS, 'satisfacao', [])).toEqual([
      { level: 3, name: 'pesa', ids: [] },
      { level: 2, name: 'pesa pouco', ids: ['aparencia', 'gentileza'] },
      { level: 1, name: 'quase nada', ids: ['parecido'] },
      { level: 0, name: 'não sabemos', ids: ['renda', 'idade'] },
    ])
  })

  it('the chosen ones come first on the shelf, in top 3 order', () => {
    const [, littleWeight, , noData] = shelves(TRAITS, 'satisfacao', [
      'idade',
      'gentileza',
      'renda',
    ])
    expect(littleWeight?.ids).toEqual(['gentileza', 'aparencia'])
    expect(noData?.ids).toEqual(['idade', 'renda'])
  })
})

describe('top3Alert', () => {
  it('with nothing on "quase nada" or "não sabemos", there is no alert', () => {
    expect(
      top3Alert(TRAITS, ['aparencia', 'gentileza'], 'satisfacao'),
    ).toBeNull()
    expect(top3Alert(TRAITS, [], 'satisfacao')).toBeNull()
  })

  it('says in a sentence, without a number, what weighs almost nothing', () => {
    expect(top3Alert(TRAITS, ['aparencia', 'parecido'], 'satisfacao')).toBe(
      'No seu topo 3, para satisfação: ser parecido comigo pesa quase nada.',
    )
  })

  it('says for which there is no good evidence', () => {
    expect(top3Alert(TRAITS, ['renda', 'aparencia'], 'satisfacao')).toBe(
      'No seu topo 3, para satisfação: para renda não há boa evidência.',
    )
  })

  it('joins both cases and uses the plural, in top 3 order', () => {
    expect(
      top3Alert(TRAITS, ['idade', 'aparencia', 'gentileza'], 'atracao'),
    ).toBe(
      'No seu topo 3, para atração: para idade parecida e gentileza não há boa evidência.',
    )
    expect(
      top3Alert(TRAITS, ['gentileza', 'idade', 'parecido'], 'duracao'),
    ).toBe(
      'No seu topo 3, para duração: gentileza e idade parecida pesam quase nada; para ser parecido comigo não há boa evidência.',
    )
  })

  it('ignores what is not in the data', () => {
    expect(top3Alert(TRAITS, ['sumiu', 'aparencia'], 'satisfacao')).toBeNull()
  })
})

describe('biasFor', () => {
  it('the bias that applies to everyone shows with or without a gender', () => {
    expect(biasFor(TRAITS[0]!, undefined)).toBe(
      'Pesa mais na atração do que se diz.',
    )
    expect(biasFor(TRAITS[0]!, 'mulher')).toBe(
      'Pesa mais na atração do que se diz.',
    )
    expect(biasFor(TRAITS[0]!, 'outro')).toBe(
      'Pesa mais na atração do que se diz.',
    )
  })

  it("the gender bias follows the profile's gender", () => {
    expect(biasFor(TRAITS[1]!, 'homem')).toBe('Homens declaram menos.')
    expect(biasFor(TRAITS[1]!, 'mulher')).toBe('Mulheres declaram mais.')
  })

  it('without a gender, or with "outro", a single-gender bias does not show', () => {
    expect(biasFor(TRAITS[1]!, undefined)).toBeNull()
    expect(biasFor(TRAITS[1]!, 'outro')).toBeNull()
  })

  it('without a bias, nothing', () => {
    expect(biasFor(TRAITS[2]!, 'homem')).toBeNull()
  })
})

describe('readPriorities', () => {
  it('accepts the ordered top 3 and the outcome', () => {
    expect(
      readPriorities({ topo3: ['renda', 'aparencia'], desfecho: 'duracao' }),
    ).toEqual({
      topo3: ['renda', 'aparencia'],
      desfecho: 'duracao',
    })
  })

  it('without a valid outcome, it stays on satisfaction', () => {
    expect(readPriorities({ topo3: ['renda'], desfecho: 'amor' })).toEqual({
      topo3: ['renda'],
      desfecho: 'satisfacao',
    })
  })

  it('drops repeats, non-text, and what goes past three', () => {
    expect(
      readPriorities({
        topo3: ['renda', 'renda', 7, 'Não Slug', 'a', 'b', 'c'],
        desfecho: 'atracao',
      }),
    ).toEqual({
      topo3: ['renda', 'a', 'b'],
      desfecho: 'atracao',
    })
  })

  it('keeps only the ids that exist, when the list is given', () => {
    expect(
      readPriorities({ topo3: ['renda', 'sumiu'] }, ['renda', 'aparencia']),
    ).toEqual({
      topo3: ['renda'],
      desfecho: 'satisfacao',
    })
  })

  it('returns null for what is not an object', () => {
    expect(readPriorities(null)).toBeNull()
    expect(readPriorities('renda')).toBeNull()
    expect(readPriorities({ topo3: 'renda' })).toEqual({
      topo3: [],
      desfecho: 'satisfacao',
    })
  })
})
