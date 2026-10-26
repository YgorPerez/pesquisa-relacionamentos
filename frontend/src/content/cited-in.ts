// "Citada em" on a Fact sheet's page: the Questions and Tips that cite it,
// in the same summaries the Guides and the Tips list use.
import type { Library } from '@tem-estudo/content'
import { isTipPublished } from '@tem-estudo/content/queries'
import {
  questionSummary,
  tipSummary,
  type QuestionSummary,
  type TipSummary,
} from './guide-view'

export interface CitedIn {
  readonly questions: ReadonlyArray<QuestionSummary>
  readonly tips: ReadonlyArray<TipSummary>
}

/** The Questions and the published Tips that cite the Fact sheet, for its
 * page. A Question cites what its answer, its findings and the Chapter that
 * answers it cite, Tips included. */
export const citedIn = (slug: string, library: Library): CitedIn => ({
  questions: library.questions
    .filter((q) => q.citedFactSheets.includes(slug))
    .map(questionSummary),
  tips: library.tips
    .filter((d) => isTipPublished(d) && d.fact_sheets.includes(slug))
    .map(tipSummary),
})
