import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { countEvent } from '#/analytics/counting'
import { EVENTS } from '#/analytics/events'
import { searchQuery } from '#/content/site-search'
import { SearchForm, SearchResultsList } from '#/ui/site-search'
import { SEARCH, SEARCH_LINE, TITLE } from '#/ui/site-search.copy'
import { Column, Display, Lead, Sheet } from '#/ui/sheet'

const hasText = (query: string) => query.trim() !== ''

export const Route = createFileRoute('/busca')({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search['q'] === 'string' ? { q: search['q'] } : {},
  loaderDeps: ({ search }) => ({ q: search.q ?? '' }),
  loader: async ({ context, deps }) => {
    if (hasText(deps.q)) await context.queryClient.query(searchQuery(deps.q))
  },
  head: () => ({
    meta: [
      { title: `${SEARCH} · Tem estudo?` },
      // A search is not a page for the search engines, with or without a
      // query.
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: SearchPage,
})

/** `/busca` (#275): the field, and under it what the query found. */
function SearchPage() {
  const { q = '' } = Route.useSearch()
  const navigate = useNavigate()
  const { data: results } = useQuery({
    ...searchQuery(q),
    enabled: hasText(q),
  })

  // Counts that a search found nothing, never what was searched (#18).
  // The query is only what tells one empty search from the next.
  const emptyFor =
    results?.match === 'none' && hasText(results.query) ? results.query : null
  useEffect(() => {
    if (emptyFor !== null) countEvent(EVENTS.searchWithoutResult())
  }, [emptyFor])

  return (
    <Sheet>
      <Column>
        <Display>
          <span className="marca-texto">{TITLE.marked}</span> {TITLE.rest}
        </Display>
        <Lead>{SEARCH_LINE}</Lead>
        <SearchForm
          key={q}
          query={q}
          autoFocus={!hasText(q)}
          onSearch={(query) =>
            void navigate({
              to: '/busca',
              search: hasText(query) ? { q: query.trim() } : {},
            })
          }
        />
        {results && <SearchResultsList results={results} />}
      </Column>
    </Sheet>
  )
}
