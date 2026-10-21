import { describe, expect, it } from 'vite-plus/test'
import {
  top3Alert,
  toggleInTop3,
  level,
  readPriorities,
  shelves,
  biasFor,
  shareWord,
  type TraitWithEvidence,
} from './priorities.ts'

const cell = (n: 0 | 1 | 2 | 3) => ({ level: n })

/** Five traits with sample levels, as in the priorities file. */
const TRAITS: ReadonlyArray<TraitWithEvidence> = [
  {
    id: 'aparencia',
    name: 'Aparência',
    attraction: cell(3),
    satisfaction: cell(2),
    duration: cell(0),
    bias: { all: 'Pesa mais na atração do que se diz.' },
  },
  {
    id: 'renda',
    name: 'Renda',
    attraction: cell(2),
    satisfaction: cell(0),
    duration: cell(0),
    bias: {
      man: 'Homens declaram menos.',
      woman: 'Mulheres declaram mais.',
    },
  },
  {
    id: 'parecido',
    name: 'Ser parecido comigo',
    attraction: cell(1),
    satisfaction: cell(1),
    duration: cell(0),
  },
  {
    id: 'gentileza',
    name: 'Gentileza',
    attraction: cell(0),
    satisfaction: cell(2),
    duration: cell(1),
  },
  {
    id: 'idade',
    name: 'Idade parecida',
    attraction: cell(0),
    satisfaction: cell(0),
    duration: cell(1),
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

describe('shareWord', () => {
  it('names a range of explained variance by its top, so the word follows the data', () => {
    expect(shareWord({ min: 0, max: 1.9 })).toBe('quase nada')
    expect(shareWord({ min: 1, max: 2 })).toBe('pouco')
    expect(shareWord({ min: 5, max: 8 })).toBe('pouco')
    expect(shareWord({ min: 10, max: 20 })).toBe('uma parte')
    expect(shareWord({ min: 20, max: 30 })).toBe('muito')
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
      readPriorities({ top3: ['renda', 'aparencia'], outcome: 'duracao' }),
    ).toEqual({
      top3: ['renda', 'aparencia'],
      outcome: 'duracao',
    })
  })

  it('without a valid outcome, it stays on satisfaction', () => {
    expect(readPriorities({ top3: ['renda'], outcome: 'amor' })).toEqual({
      top3: ['renda'],
      outcome: 'satisfacao',
    })
  })

  it('drops repeats, non-text, and what goes past three', () => {
    expect(
      readPriorities({
        top3: ['renda', 'renda', 7, 'Não Slug', 'a', 'b', 'c'],
        outcome: 'atracao',
      }),
    ).toEqual({
      top3: ['renda', 'a', 'b'],
      outcome: 'atracao',
    })
  })

  it('keeps only the ids that exist, when the list is given', () => {
    expect(
      readPriorities({ top3: ['renda', 'sumiu'] }, ['renda', 'aparencia']),
    ).toEqual({
      top3: ['renda'],
      outcome: 'satisfacao',
    })
  })

  it('returns null for what is not an object', () => {
    expect(readPriorities(null)).toBeNull()
    expect(readPriorities('renda')).toBeNull()
    expect(readPriorities({ top3: 'renda' })).toEqual({
      top3: [],
      outcome: 'satisfacao',
    })
  })
})
