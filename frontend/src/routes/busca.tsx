import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { countEvent } from '#/analytics/counting'
import { EVENTS } from '#/analytics/events'
import { searchQuery } from '#/content/site-search'
import {
  SearchForm,
  SearchResultsList,
  SearchResultsSkeleton,
} from '#/ui/site-search'
import { SEARCH, SEARCH_LINE, TITLE } from '#/ui/site-search.copy'
import { Column, Display, Lead, Sheet } from '#/ui/sheet'

const hasText = (query: string) => query.trim() !== ''

/** How long the field waits after the last key before it searches. */
const TYPING_PAUSE = 250

/** How long a search with no result stays on the screen before it counts:
 * on the way to the word meant, the letters typed find nothing too. */
const NO_RESULT_PAUSE = 1500

/** While typing, the search starts at two letters, where `searchSite`
 * starts finding; Enter searches whatever is in the field. */
const enoughToSearch = (typed: string) => typed === '' || typed.length >= 2

export const Route = createFileRoute('/busca')({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search['q'] === 'string' ? { q: search['q'] } : {},
  loaderDeps: ({ search }) => ({ q: search.q ?? '' }),
  loader: async ({ context, deps }) => {
    // The server sends the page with its results, for the reader without
    // JavaScript. In the browser the page draws the skeleton while they
    // come, and the field never waits on them.
    if (typeof window === 'undefined' && hasText(deps.q))
      await context.queryClient.query(searchQuery(deps.q))
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

/** `/busca` (#275): the field, and under it what the query found. It
 * searches as the reader types, and the address follows the field. */
function SearchPage() {
  const { q = '' } = Route.useSearch()
  const navigate = useNavigate()
  const [text, setText] = useState(q)
  const [searched, setSearched] = useState(q.trim())
  const typed = text.trim()

  // Back, forward and the header's magnifier change the address from
  // outside: the field takes it. The address this page writes is already
  // `searched`, and leaves the field alone.
  const [address, setAddress] = useState(q)
  if (q !== address) {
    setAddress(q)
    if (q.trim() !== searched) {
      setText(q)
      setSearched(q.trim())
    }
  }

  const search = useCallback(
    (query: string) => {
      setSearched(query)
      // One entry in the history for the whole search, not one per pause.
      void navigate({
        to: '/busca',
        search: hasText(query) ? { q: query } : {},
        replace: true,
      })
    },
    [navigate],
  )

  useEffect(() => {
    if (typed === searched || !enoughToSearch(typed)) return
    const timer = setTimeout(() => search(typed), TYPING_PAUSE)
    return () => clearTimeout(timer)
  }, [typed, searched, search])

  const { data: results, isPending } = useQuery({
    ...searchQuery(searched),
    enabled: hasText(searched),
  })
  const current = typed === searched
  const searching = current
    ? hasText(searched) && isPending
    : hasText(typed) && enoughToSearch(typed)

  // Counts that a search found nothing, never what was searched (#18).
  // The query is only what tells one empty search from the next.
  const emptyFor =
    current && results?.match === 'none' && hasText(results.query)
      ? results.query
      : null
  useEffect(() => {
    if (emptyFor === null) return
    const timer = setTimeout(
      () => countEvent(EVENTS.searchWithoutResult()),
      NO_RESULT_PAUSE,
    )
    return () => clearTimeout(timer)
  }, [emptyFor])

  return (
    <Sheet>
      <Column>
        <Display>
          <span className="marca-texto">{TITLE.marked}</span> {TITLE.rest}
        </Display>
        <Lead>{SEARCH_LINE}</Lead>
        <SearchForm
          query={text}
          autoFocus={!hasText(q)}
          onType={setText}
          onSearch={(query) => search(query.trim())}
        />
        {searching ? (
          <SearchResultsSkeleton />
        ) : (
          current && results && <SearchResultsList results={results} />
        )}
      </Column>
    </Sheet>
  )
}
