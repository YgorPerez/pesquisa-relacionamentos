// The `/glossario` page's read (#351), on the server like the Neighbor sites
// (`neighbor-sites.ts`): only this page reads it, kept in the router's
// QueryClient like the others (ADR 0031).
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { glossaryView, type TermView } from './terms-view'

/** Every Verbete, in alphabetical order. */
const listTerms = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<TermView>> => {
    const { default: library } = await import('virtual:library')
    return glossaryView(library)
  },
)

export const glossaryQuery = () =>
  queryOptions({
    queryKey: ['glossary'],
    queryFn: () => listTerms(),
  })
