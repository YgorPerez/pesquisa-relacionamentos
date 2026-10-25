import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { reads } from '#/content/reads'
import { ShortConfidence, Html } from '#/ui/guide'
import { ForwardArrow } from '#/ui/navigation'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Headline } from '#/ui/section'

export const Route = createFileRoute('/$tema/')({
  // The `loaderData` carries only what the `head` uses; the Topic goes
  // through the `queryClient`.
  loader: async ({ context, params }) => {
    const topic = await context.queryClient.query(reads.topic(params.tema))
    return { search: topic.search }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.search.title} · Tem estudo?` },
          { name: 'description', content: loaderData.search.description },
        ]
      : [],
  }),
  notFoundComponent: TopicNotFound,
  component: TopicPage,
})

function TopicPage() {
  const { data: topic } = useSuspenseQuery(reads.topic(Route.useParams().tema))

  return (
    <Sheet>
      <Column>
        <Display>{topic.title}</Display>
        <Html
          className="prosa m-0 text-lead"
          slot="contexto"
          html={topic.contextHtml}
        />

        <ol className="m-0 list-none p-0" data-slot="perguntas">
          {topic.guides.map((guide) => (
            <li key={guide.slug} className="regua mt-secao pt-5">
              <Headline>
                <Link
                  to="/$tema/$slug"
                  params={{ tema: guide.topic, slug: guide.slug }}
                  className="decoration-2 underline-offset-5 hover:bg-amarelo-voce"
                >
                  {guide.question}
                </Link>
              </Headline>
              <ShortConfidence
                confidence={guide.confidence}
                className="mb-2.5"
              />
              <Html className="prosa mt-2.5" html={guide.answerHtml} />
              <Link
                to="/$tema/$slug"
                params={{ tema: guide.topic, slug: guide.slug }}
                className="mt-1 inline-flex min-h-toque items-center gap-2 font-label text-aviso font-bold no-underline hover:underline"
                aria-label={`Ler o Guia: ${guide.question}`}
              >
                Ler o Guia
                <ForwardArrow />
              </Link>
            </li>
          ))}
        </ol>
      </Column>
    </Sheet>
  )
}

function TopicNotFound() {
  return (
    <Sheet>
      <Column>
        <Display>Essa página não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/">Veja os Temas na página inicial</Link>.
        </Lead>
      </Column>
    </Sheet>
  )
}
