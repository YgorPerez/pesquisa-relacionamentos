// The site search (#275), run on the server like the other reads: the
// browser gets only the results, never the library. Its read lives here, not
// in `reads.ts`, since only `/busca` asks for it; it is `static` like the
// others (`router.tsx`'s `queryClient`).
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { searchSite, type SearchResults } from './site-search-view'

const findInSite = createServerFn({ method: 'GET' })
  .validator((query: unknown) => (typeof query === 'string' ? query : ''))
  .handler(async ({ data: query }): Promise<SearchResults> => {
    const { default: library } = await import('virtual:library')
    return searchSite(library, query)
  })

/** The `/busca` results. */
export const searchQuery = (query: string) =>
  queryOptions({
    queryKey: ['search', query],
    queryFn: () => findInSite({ data: query }),
  })
