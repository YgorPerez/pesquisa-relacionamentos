// The sample data of the Priorities stories: five traits with one level per
// outcome, the source Fact sheet and Joel's bar.
import type {
  SatisfactionSplit,
  TraitView,
  CellView,
  PriorityFactSheet,
} from '#/content/priorities-view'

const FACT_SHEET: PriorityFactSheet = {
  slug: 'costa-2018-satisfacao',
  name: 'Costa (2018)',
  status: 'parcial',
  strength: 'moderada',
  sample: 'Casais casados recrutados online.',
}

const cell = (
  degrau: 0 | 1 | 2 | 3,
  text = 'Nenhum estudo lido mede isso.',
): CellView => ({
  degrau,
  measure: null,
  text,
  factSheet: degrau > 0 ? FACT_SHEET : null,
})

export const TRAITS: ReadonlyArray<TraitView> = [
  {
    id: 'aparencia',
    nome: 'Aparência',
    atracao: cell(3),
    satisfacao: cell(2, 'Só um pouco, e só no começo.'),
    duracao: cell(0),
  },
  {
    id: 'sexo',
    nome: 'Química sexual',
    atracao: cell(3),
    satisfacao: cell(3),
    duracao: cell(0),
  },
  {
    id: 'renda',
    nome: 'Renda',
    atracao: cell(2),
    satisfacao: cell(0),
    duracao: cell(0),
  },
  {
    id: 'parecido',
    nome: 'Ser parecido comigo',
    atracao: cell(1),
    satisfacao: cell(1),
    duracao: cell(0),
  },
  {
    id: 'idade',
    nome: 'Idade parecida',
    atracao: cell(0),
    satisfacao: cell(0),
    duracao: cell(0),
  },
]

export const SPLIT: SatisfactionSplit = {
  relationship: 45,
  partner: 5,
  unexplained: 50,
  factSheet: {
    ...FACT_SHEET,
    name: 'Joel et al. (2020)',
    status: 'ok',
    strength: 'forte',
  },
}
