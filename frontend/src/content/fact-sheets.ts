// The Fact sheets for the pages, read on the server. The browser calls these
// functions by RPC when navigating, and the whole library stays out of its
// bundle.
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
// Only the subpaths without `node:fs`: this file also goes into the browser
// bundle, which keeps the functions' stubs.
import { isFactSheetIndexable } from '@tem-estudo/content/paths'
import { VERIFICATION_STATUSES } from '@tem-estudo/content/lists'
import {
  factSheetSummary,
  factSheetView,
  type FactSheetSummary,
  type FactSheetView,
} from './view'
import { citedIn, type CitedIn } from './cited-in'
import { pageTerms, withTermLinks, type TermView } from './terms-view'

const STATUS_ORDER: ReadonlyArray<string> = VERIFICATION_STATUSES

/** All the Fact sheets: the checked ones first, then by name. */
export const listFactSheets = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<FactSheetSummary>> => {
    const { default: library } = await import('virtual:library')
    return [...library.factSheets]
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          a.slug.localeCompare(b.slug),
      )
      .map(factSheetSummary)
  },
)

export const getFactSheet = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => {
    if (typeof slug !== 'string') throw new Error('invalid slug')
    return slug
  })
  .handler(
    async ({
      data: slug,
    }): Promise<
      FactSheetView & {
        citedIn: CitedIn
        terms: Readonly<Record<string, TermView>>
      }
    > => {
      const { default: library } = await import('virtual:library')
      const factSheet = library.factSheets.find((f) => f.slug === slug)
      if (!factSheet) throw notFound()
      const used = new Set<string>()
      const view = factSheetView(
        factSheet,
        isFactSheetIndexable(factSheet),
        (markdown) => withTermLinks(markdown, library.terms, used, [slug]),
      )
      return {
        ...view,
        citedIn: citedIn(slug, library),
        terms: pageTerms(used, library),
      }
    },
  )
