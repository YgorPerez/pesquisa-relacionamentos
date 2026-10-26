import { Link, useMatches } from '@tanstack/react-router'
import { SEARCH } from './site-search.copy'

/** What a route's loader data carries when the page belongs to a Topic.
 * The keys are set by the Guide route's loader. */
interface WithTopic {
  readonly topic?: string
  readonly topicTitle?: string
}

/** The hand-drawn magnifier that leads to `/busca` (#275). */
const Magnifier = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9.4 2.6c3.9-.2 6.9 2.7 6.8 6.5-.1 3.7-3 6.5-6.7 6.5-3.8.1-6.7-2.8-6.7-6.5 0-3.6 2.9-6.4 6.6-6.5Z" />
    <path d="M14.3 14.6c1.9 1.6 3.6 3.2 5.1 4.9" />
  </svg>
)

/** The top bar: the site name on the left, which leads home; on the right,
 * on the Guide page the Topic tag, which leads to the Topic, and on every
 * page the magnifier of the search. */
export function Header() {
  const topic = useMatches({
    select: (matches) =>
      matches
        .map((m) => m.loaderData as WithTopic | undefined)
        .find((data) => data?.topic && data.topicTitle),
  })

  return (
    <header className="border-b-2 border-tinta bg-papel">
      <div className="mx-auto flex max-w-pagina items-center justify-between gap-3 px-md py-xs">
        <Link
          to="/"
          className="inline-flex min-h-toque shrink-0 items-center font-headline text-nivel leading-none font-bold tracking-headline whitespace-nowrap no-underline"
        >
          Tem estudo?
        </Link>
        <div className="flex min-w-0 items-center gap-1">
          {topic?.topic && (
            <Link
              to="/$tema"
              params={{ tema: topic.topic }}
              className="group inline-flex min-h-toque min-w-0 items-center font-label text-etiqueta leading-curta font-bold no-underline"
            >
              <span className="rounded-mao-2 border-(length:--traco-etiqueta) border-tinta bg-folha px-2.5 py-1.25 group-hover:underline group-hover:decoration-(length:--traco-etiqueta) group-hover:underline-offset-4">
                {topic.topicTitle}
              </span>
            </Link>
          )}
          <Link
            to="/busca"
            aria-label={SEARCH}
            className="inline-flex size-toque flex-none items-center justify-center text-tinta-2 hover:text-tinta"
            data-slot="lupa"
          >
            <Magnifier />
          </Link>
        </div>
      </div>
    </header>
  )
}
