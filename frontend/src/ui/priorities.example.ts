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
  status: 'partial',
  strength: 'moderate',
  sample: 'Casais casados recrutados online.',
}

const cell = (
  level: 0 | 1 | 2 | 3,
  text = 'Nenhum estudo lido mede isso.',
): CellView => ({
  level,
  measure: null,
  text,
  factSheet: level > 0 ? FACT_SHEET : null,
})

export const TRAITS: ReadonlyArray<TraitView> = [
  {
    id: 'aparencia',
    name: 'Aparência',
    attraction: cell(3),
    satisfaction: cell(2, 'Só um pouco, e só no começo.'),
    duration: cell(0),
  },
  {
    id: 'sexo',
    name: 'Química sexual',
    attraction: cell(3),
    satisfaction: cell(3),
    duration: cell(0),
  },
  {
    id: 'renda',
    name: 'Renda',
    attraction: cell(2),
    satisfaction: cell(0),
    duration: cell(0),
  },
  {
    id: 'parecido',
    name: 'Ser parecido comigo',
    attraction: cell(1),
    satisfaction: cell(1),
    duration: cell(0),
  },
  {
    id: 'idade',
    name: 'Idade parecida',
    attraction: cell(0),
    satisfaction: cell(0),
    duration: cell(0),
  },
]

export const SPLIT: SatisfactionSplit = {
  relationship: 45,
  partner: 5,
  unexplained: 50,
  factSheet: {
    ...FACT_SHEET,
    name: 'Joel et al. (2020)',
    status: 'verified',
    strength: 'strong',
  },
}
