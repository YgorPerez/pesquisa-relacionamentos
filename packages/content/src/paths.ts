// Paths and indexing derived from the content (#15). The URLs stay in
// Portuguese (ADR 0039).
import type { FactSheet } from './fact-sheet.ts'
import type { Question } from './items.ts'
import type { Calculator } from './lists.ts'

export function factSheetPath(factSheet: Pick<FactSheet, 'slug'>): string {
  return `/estudos/${factSheet.slug}`
}

export function topicPath(topic: { readonly slug: string }): string {
  return `/${topic.slug}`
}

/** A Question is answered inside its Topic's Guide, anchored by its slug
 * (ADR 0042). */
export function questionPath(
  question: Pick<Question, 'topic' | 'slug'>,
): string {
  return `/${question.topic}#${question.slug}`
}

export function tipPath(tip: { readonly slug: string }): string {
  return `/dicas/${tip.slug}`
}

const CALCULATOR_PATHS: Record<Calculator, string> = {
  'possible-group': '/grupo-possivel',
  priorities: '/prioridades',
}

/** The calculator's page. */
export function calculatorPath(calculator: Calculator): string {
  return CALCULATOR_PATHS[calculator]
}

/** A ⬜ fact sheet stays out of the index and the sitemap: only ✅ and 🟡 go
 * to search engines. */
export function isFactSheetIndexable(
  factSheet: Pick<FactSheet, 'status'>,
): boolean {
  return factSheet.status !== 'unverified'
}
