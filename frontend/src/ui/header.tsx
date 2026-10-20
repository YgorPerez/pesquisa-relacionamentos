import { Link, useMatches } from '@tanstack/react-router'

/** What a route's loader data carries when the page belongs to a Topic.
 * The keys are set by the Guide route's loader. */
interface WithTopic {
  readonly topic?: string
  readonly topicTitle?: string
}

/** The top bar: the site name on the left, which leads home, and on the
 * Guide page the Topic tag on the right, which leads to the Topic. */
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
          className="inline-flex min-h-toque items-center font-headline text-nivel leading-none font-bold tracking-headline no-underline"
        >
          Tem estudo?
        </Link>
        {topic?.topic && (
          <Link
            to="/$tema"
            params={{ tema: topic.topic }}
            className="group inline-flex min-h-toque items-center font-label text-etiqueta leading-curta font-bold no-underline"
          >
            <span className="rounded-mao-2 border-(length:--traco-etiqueta) border-tinta bg-folha px-2.5 py-1.25 group-hover:underline group-hover:decoration-(length:--traco-etiqueta) group-hover:underline-offset-4">
              {topic.topicTitle}
            </span>
          </Link>
        )}
      </div>
    </header>
  )
}
