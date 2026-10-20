// Paths and indexing derived from the content (#15). The URLs stay in
// Portuguese (ADR 0039).
import type { FactSheet } from './fact-sheet.ts'
import type { Guide } from './items.ts'

export function factSheetPath(factSheet: Pick<FactSheet, 'slug'>): string {
  return `/estudos/${factSheet.slug}`
}

export function topicPath(topic: { readonly slug: string }): string {
  return `/${topic.slug}`
}

export function guidePath(guide: Pick<Guide, 'topic' | 'slug'>): string {
  return `/${guide.topic}/${guide.slug}`
}

export function tipPath(tip: { readonly slug: string }): string {
  return `/dicas/${tip.slug}`
}

/** A ⬜ fact sheet stays out of the index and the sitemap: only ✅ and 🟡 go
 * to search engines. */
export function isFactSheetIndexable(
  factSheet: Pick<FactSheet, 'status'>,
): boolean {
  return factSheet.status !== 'nao-verificado'
}
