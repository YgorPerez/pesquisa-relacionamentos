// The home page's Topic index (#143): one panel with a fold per Topic, in
// the `position` order of the content. Closed, the six Topics fit on a phone
// screen; a tap opens the Topic's Questions, each leading to its section of
// the Topic's Guide, and the link to the Guide's top.
//
// The fold is the browser's `<details>`, not the Base UI `Collapsible`: it
// opens without JavaScript and before hydration, and the Guide's reading
// point (`useReadingPointInHistory`) reopens it on the way back by its `id`.
import { Link } from '@tanstack/react-router'
import { FoldArrow, ForwardArrow } from './navigation'
import { Panel, Tag } from './section'
import { OPEN_TOPIC, READ, questionCount } from './topic-index.copy'

type IndexTopic = {
  readonly slug: string
  readonly title: string
  readonly questions: ReadonlyArray<{
    readonly topic: string
    readonly slug: string
    readonly question: string
  }>
}

/** "lido", the paper tag. */
const ReadTag = () => (
  <Tag className="ml-2 inline-block align-middle" data-slot="lido">
    {READ}
  </Tag>
)

/** The Topics, each a fold with the count of Questions; open, the Questions
 * in the Topic's order and "Abrir o Tema". A Topic in `read` (its Guide read
 * to "O que levar" in this browser, #195) says "lido" next to its name. */
export function TopicIndex({
  topics,
  read,
}: {
  topics: ReadonlyArray<IndexTopic>
  read?: ReadonlySet<string>
}) {
  return (
    <Panel className="py-1.5">
      <ol className="m-0 list-none p-0" data-slot="temas">
        {topics.map((topic) => (
          <li
            key={topic.slug}
            className="not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
          >
            <details id={`tema-${topic.slug}`} className="group">
              <summary className="group/summary flex min-h-toque cursor-pointer list-none items-start gap-2.5 py-2.5 [&::-webkit-details-marker]:hidden">
                <FoldArrow className="mt-1.5 self-start group-open:rotate-90" />
                <span>
                  <span className="block font-title text-title decoration-2 underline-offset-4 group-hover/summary:underline">
                    {topic.title}
                    {read?.has(topic.slug) && <ReadTag />}
                  </span>
                  <span className="block text-nota leading-nota text-tinta-2">
                    {questionCount(topic.questions.length)}
                  </span>
                </span>
              </summary>
              <div className="pb-sm pl-6">
                <ol className="m-0 pl-marcador">
                  {topic.questions.map((question) => (
                    <li key={question.slug} className="not-first:mt-0.5">
                      <Link
                        to="/$tema"
                        params={{ tema: question.topic }}
                        hash={question.slug}
                        className="inline-flex min-h-toque items-center"
                      >
                        {question.question}
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
