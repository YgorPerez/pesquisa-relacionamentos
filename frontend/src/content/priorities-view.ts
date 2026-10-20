// The Priorities file in the shape the `/prioridades` page and the B1 Guide
// card draw: each cell with its Fact sheet already summarized (short name,
// Status, Strength and sample), so the browser does not receive the library.
import type {
  Library,
  PriorityCell,
  FactSheet,
  Strength,
  VerificationStatus,
} from '@tem-estudo/content'
import type { Level } from '@tem-estudo/rules/priorities'
import { withoutMarks } from './guide-view'

export interface PriorityFactSheet {
  readonly slug: string
  /** "Joel et al. (2020)": the Fact sheet title up to the colon. */
  readonly name: string
  readonly status: VerificationStatus
  readonly strength: Strength
  readonly sample: string
}

export interface CellView {
  readonly degrau: Level
  readonly measure: string | null
  readonly text: string
  readonly factSheet: PriorityFactSheet | null
}

/** A trait as the rules read it (`TraitWithEvidence`): `nome`, the outcome
 * keys and `vies` mirror the priorities file. */
export interface TraitView {
  readonly id: string
  readonly nome: string
  readonly atracao: CellView
  readonly satisfacao: CellView
  readonly duracao: CellView
  readonly vies?: {
    readonly todos?: string
    readonly homem?: string
    readonly mulher?: string
  }
}

export interface SatisfactionSplit {
  readonly relationship: number
  readonly partner: number
  readonly unexplained: number
  readonly factSheet: PriorityFactSheet
}

/** The "Do Guia" block at the end of the page. */
interface CalculatorGuide {
  readonly topic: string
  readonly slug: string
  readonly question: string
  readonly confidence: Strength
  readonly answer: string
}

export interface PrioritiesView {
  readonly bar: SatisfactionSplit
  readonly traits: ReadonlyArray<TraitView>
  readonly fromGuide: CalculatorGuide | null
}

const withoutFormatting = (text: string) =>
  text.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()

function priorityFactSheet(factSheet: FactSheet): PriorityFactSheet {
  return {
    slug: factSheet.slug,
    name: factSheet.title.split(':')[0]?.trim() ?? factSheet.title,
    status: factSheet.status,
    strength: factSheet.forca,
    sample: withoutFormatting(factSheet.amostra.descricao),
  }
}

export function buildPrioritiesView(library: Library): PrioritiesView | null {
  const { priorities } = library
  if (!priorities) return null
  // The build guarantees each cited Fact sheet exists and is ✅ or 🟡.
  const factSheet = (slug: string): PriorityFactSheet => {
    const found = library.factSheets.find((f) => f.slug === slug)
    if (!found)
      throw new Error(`fact sheet ${slug} is missing from the library`)
    return priorityFactSheet(found)
  }
  const cell = (c: PriorityCell): CellView => ({
    degrau: c.degrau,
    measure: c.medida ?? null,
    text: c.texto_simples,
    factSheet: c.ficha ? factSheet(c.ficha) : null,
  })
  const { satisfacao_explicada: bar } = priorities
  const guide = library.guides.find((g) => g.calculadora === 'prioridades')
  return {
    bar: {
      relationship: bar.relacao,
      partner: bar.parceiro,
      unexplained: bar.sem_explicacao,
      factSheet: factSheet(bar.ficha),
    },
    traits: priorities.caracteristicas.map((c) => ({
      id: c.id,
      nome: c.nome,
      atracao: cell(c.atracao),
      satisfacao: cell(c.satisfacao),
      duracao: cell(c.duracao),
      ...(c.vies ? { vies: c.vies } : {}),
    })),
    fromGuide: guide
      ? {
          topic: guide.topic,
          slug: guide.slug,
          question: withoutMarks(guide.pergunta),
          confidence: guide.confianca,
          answer: withoutMarks(guide.shortAnswer),
        }
      : null,
  }
}
