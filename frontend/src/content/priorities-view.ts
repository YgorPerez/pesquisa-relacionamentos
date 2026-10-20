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
  readonly level: Level
  readonly measure: string | null
  readonly text: string
  readonly factSheet: PriorityFactSheet | null
}

/** A trait as the rules read it (`TraitWithEvidence`): `name`, the outcome
 * keys and `bias` mirror the priorities file. */
export interface TraitView {
  readonly id: string
  readonly name: string
  readonly attraction: CellView
  readonly satisfaction: CellView
  readonly duration: CellView
  readonly bias?: {
    readonly all?: string
    readonly man?: string
    readonly woman?: string
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
    strength: factSheet.strength,
    sample: withoutFormatting(factSheet.sample.description),
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
    level: c.level,
    measure: c.measure ?? null,
    text: c.plain_text,
    factSheet: c.fact_sheet ? factSheet(c.fact_sheet) : null,
  })
  const { explained_satisfaction: bar } = priorities
  const guide = library.guides.find((g) => g.calculator === 'priorities')
  return {
    bar: {
      relationship: bar.relationship,
      partner: bar.partner,
      unexplained: bar.unexplained,
      factSheet: factSheet(bar.fact_sheet),
    },
    traits: priorities.traits.map((c) => ({
      id: c.id,
      name: c.name,
      attraction: cell(c.attraction),
      satisfaction: cell(c.satisfaction),
      duration: cell(c.duration),
      ...(c.bias ? { bias: c.bias } : {}),
    })),
    fromGuide: guide
      ? {
          topic: guide.topic,
          slug: guide.slug,
          question: withoutMarks(guide.question),
          confidence: guide.confidence,
          answer: withoutMarks(guide.shortAnswer),
        }
      : null,
  }
}
