// The home page's Topic index (#143): one panel with a fold per Topic, in
// the `position` order of the content. Closed, the six Topics fit on a phone
// screen; a tap opens the Topic's Questions and the link to its page.
//
// The fold is the browser's `<details>`, not the Base UI `Collapsible`: it
// opens without JavaScript and before hydration, and the Guide's reading
// point (`useReadingPointInHistory`) reopens it on the way back by its `id`.
import { Link } from '@tanstack/react-router'
import { ForwardArrow } from './navigation'
import { Panel } from './section'
import { OPEN_TOPIC, questionCount } from './topic-index.copy'

type IndexTopic = {
  readonly slug: string
  readonly title: string
  readonly guides: ReadonlyArray<{
    readonly topic: string
    readonly slug: string
    readonly question: string
  }>
}

/** The little arrow of the DESIGN.md fold, which turns when it opens. */
const FoldArrow = () => (
  <svg
    className="mt-1.5 flex-none self-start transition-transform duration-250 ease-sai group-open:rotate-90 motion-reduce:transition-none"
    width="14"
    height="16"
    viewBox="0 0 14 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 2.5l6.5 5.6L4 13.6" />
  </svg>
)

/** The Topics, each a fold with the count of Questions; open, the Questions
 * in the Topic's order and "Abrir o Tema". */
export function TopicIndex({ topics }: { topics: ReadonlyArray<IndexTopic> }) {
  return (
    <Panel className="py-1.5">
      <ol className="m-0 list-none p-0" data-slot="temas">
        {topics.map((topic) => (
          <li
            key={topic.slug}
            className="not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
          >
            <details id={`tema-${topic.slug}`} className="group">
              <summary className="flex min-h-toque cursor-pointer list-none items-start gap-2.5 py-2.5 [&::-webkit-details-marker]:hidden">
                <FoldArrow />
                <span>
                  <span className="block font-title text-title decoration-2 underline-offset-4 group-hover:underline">
                    {topic.title}
                  </span>
                  <span className="block text-nota leading-nota text-tinta-2">
                    {questionCount(topic.guides.length)}
                  </span>
                </span>
              </summary>
              <div className="pb-sm pl-6">
                <ol className="m-0 pl-marcador">
                  {topic.guides.map((guide) => (
                    <li key={guide.slug} className="not-first:mt-0.5">
                      <Link
                        to="/$tema/$slug"
                        params={{ tema: guide.topic, slug: guide.slug }}
                        className="inline-flex min-h-toque items-center"
                      >
                        {guide.question}
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link
                  to="/$tema"
                  params={{ tema: topic.slug }}
                  aria-label={`${OPEN_TOPIC}: ${topic.title}`}
                  className="mt-1 inline-flex min-h-toque items-center gap-2 font-label text-aviso font-bold no-underline hover:underline"
                >
                  {OPEN_TOPIC}
                  <ForwardArrow />
                </Link>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
