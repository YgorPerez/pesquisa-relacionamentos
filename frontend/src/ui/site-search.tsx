// The site search (#275): the field and the results of `/busca`, one group
// per page, Guides first. Each hit is a plain `<a>`, not the router's
// `Link`: the browser only reads the Text Fragment (`#…:~:text=`) when it
// loads a page, and it is the fragment that scrolls to the sentence and
// paints it.
import type { ChangeEvent, FormEvent } from 'react'
import type { SearchResults } from '#/content/site-search-view'
import { Headline, Notice, Section, Tag } from './section'
import { SiteButton } from './button'
import { Input } from './shadcn/input'
import {
  FIELD,
  KIND_TAG,
  NOTHING_LINE,
  SEARCH,
  SEARCHING,
  SUBMIT,
  WORDS_ONLY,
  found,
  nothingFound,
} from './site-search.copy'

/** The field. Without JS it is a GET form to `/busca`; with it, `onSearch`
 * goes there through the router. With `onType` the field is the caller's:
 * `query` is what it shows, and each key reaches `onType`. */
export function SearchForm({
  query,
  autoFocus = false,
  onType,
  onSearch,
}: {
  query: string
  autoFocus?: boolean
  onType?: (text: string) => void
  onSearch?: (query: string) => void
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (!onSearch) return
    event.preventDefault()
    const field = new FormData(event.currentTarget).get('q')
    onSearch(typeof field === 'string' ? field : '')
  }
  return (
    <form
      role="search"
      aria-label={SEARCH}
      action="/busca"
      method="get"
      onSubmit={submit}
      className="mt-md flex flex-wrap items-end gap-sm"
    >
      <label className="flex min-w-0 flex-1 basis-60 flex-col gap-1 font-label text-label leading-body font-bold">
        {FIELD}
        <Input
          type="search"
          name="q"
          {...(onType
            ? {
                value: query,
                onChange: (event: ChangeEvent<HTMLInputElement>) =>
                  onType(event.currentTarget.value),
              }
            : { defaultValue: query })}
          // Only on the empty page, which the magnifier opens: over the
          // results, the phone's keyboard would cover them.
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          className="w-full"
        />
      </label>
      <SiteButton type="submit">{SUBMIT}</SiteButton>
    </form>
  )
}

type Hit = SearchResults['groups'][number]['hits'][number]

/** Each piece with where it starts in the sentence, its key. */
function withOffsets(pieces: Hit['pieces']) {
  let at = 0
  return pieces.map((piece) => {
    const start = at
    at += piece.text.length
    return { piece, at: start }
  })
}

/** One hit: the place on the page and the sentence, its matches marked. */
function HitItem({ hit }: { hit: Hit }) {
  return (
    <li className="not-first:mt-sm" data-slot="trecho">
      <a href={hit.href} className="group/hit block no-underline">
        {hit.place && (
          <span className="block font-label text-nota leading-nota text-tinta-2">
            {hit.place}
          </span>
        )}
        <span className="underline decoration-1 underline-offset-4 group-hover/hit:decoration-2">
          {withOffsets(hit.pieces).map(({ piece, at }) =>
            piece.match ? (
              <mark key={at} className="bg-amarelo-voce text-tinta">
                {piece.text}
              </mark>
            ) : (
              <span key={at}>{piece.text}</span>
            ),
          )}
        </span>
      </a>
    </li>
  )
}

/** The results: the count, then each page with all its hits. */
export function SearchResultsList({ results }: { results: SearchResults }) {
  if (results.match === 'none')
    return (
      <Section aria-labelledby="t-resultados">
        <Headline id="t-resultados">{nothingFound(results.query)}</Headline>
        <p className="m-0">{NOTHING_LINE}</p>
      </Section>
    )
  return (
    <Section aria-labelledby="t-resultados">
      <Headline id="t-resultados">
        {found(results.total, results.groups.length)}
      </Headline>
      {results.match === 'words' && <Notice>{WORDS_ONLY}</Notice>}
      <ol className="m-0 list-none p-0" data-slot="resultados">
        {results.groups.map((group) => (
          <li
            key={group.path}
            className="not-first:mt-lg not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta not-first:pt-md"
            data-slot="pagina-encontrada"
          >
            <h3 className="m-0 mb-xs font-title text-title">
              <Tag className="mr-2 inline-block align-middle">
                {KIND_TAG[group.kind]}
              </Tag>
              <a href={group.path}>{group.title}</a>
            </h3>
            <ul className="m-0 list-none p-0">
              {group.hits.map((hit) => (
                <HitItem key={hit.href} hit={hit} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/** A grey line where the text will be, as wide as `width` and as tall as
 * the letters of the box around it. */
function Bar({ width }: { width: string }) {
  return (
    <span
      className={`inline-block h-[0.7em] max-w-full rounded-mao bg-tinta/10 align-middle ${width}`}
    />
  )
}

/** Each page the skeleton draws: its title and, per hit, the place and the
 * sentence's lines. Fixed widths, so it never jumps between renders. */
const SKELETON_PAGES = [
  {
    title: 'w-1/2',
    hits: [
      ['w-1/3', 'w-full', 'w-4/5'],
      ['w-1/4', 'w-11/12', 'w-2/3'],
    ],
  },
  { title: 'w-2/5', hits: [['w-2/5', 'w-full', 'w-3/5']] },
  { title: 'w-3/5', hits: [['w-1/4', 'w-10/12', 'w-1/2']] },
] as const

/** While a search runs: the shape of the results, the count and three pages
 * in grey, so the page does not jump when they come. */
export function SearchResultsSkeleton() {
  return (
    <Section aria-labelledby="t-buscando" aria-busy="true" data-slot="buscando">
      <h2 id="t-buscando" role="status" className="sr-only">
        {SEARCHING}
      </h2>
      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        <span className="mb-sm block font-headline text-headline">
          <Bar width="w-56" />
        </span>
        {SKELETON_PAGES.map((page, i) => (
          <div
            key={i}
            className="not-first:mt-lg not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta/25 not-first:pt-md"
          >
            <span className="mb-xs flex items-center gap-2 font-title text-title">
              <span className="inline-block h-[1.2em] w-11 shrink-0 rounded-mao-2 bg-tinta/10" />
              <Bar width={page.title} />
            </span>
            {page.hits.map(([place, ...lines], j) => (
              <div key={j} className="not-first:mt-sm">
                <span className="block font-label text-nota leading-nota">
                  <Bar width={place} />
                </span>
                {lines.map((line, k) => (
                  <span key={k} className="block">
                    <Bar width={line} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  )
}
