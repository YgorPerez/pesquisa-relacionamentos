// The `/sites-vizinhos` page's read, on the server like the Guides
// (`guides.ts`): the browser gets only the finished groups. The query lives
// here and not in `reads.ts`, which every page imports: only this page reads
// it, kept in the router's QueryClient like the others (ADR 0031).
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { readingGroups, type ReadingGroup } from './neighbor-sites-view'

/** The Readings grouped by Topic, Portuguese first in each group. */
const listReadingGroups = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<ReadingGroup>> => {
    const { default: library } = await import('virtual:library')
    return readingGroups(library)
  },
)

/** The page's read: `static`, like every read of the library
 * (`reads.ts`). */
export const readingGroupsQuery = () =>
  queryOptions({
    queryKey: ['reading-groups'],
    queryFn: () => listReadingGroups(),
  })
