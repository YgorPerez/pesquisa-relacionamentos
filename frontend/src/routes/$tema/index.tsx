import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { leituras } from '#/conteudo/leituras'
import { ConfiancaCurta, Html } from '#/ui/guia'
import { Coluna, Display, Folha, Headline, Lead } from '#/ui/pagina'

export const Route = createFileRoute('/$tema/')({
  // O `loaderData` leva só o que o `head` usa; o Tema vai pelo `queryClient`.
  loader: async ({ context, params }) => {
    const { busca } = await context.queryClient.query(
      leituras.tema(params.tema),
    )
    return { busca }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.busca.titulo} · Tem estudo?` },
          { name: 'description', content: loaderData.busca.descricao },
        ]
      : [],
  }),
  notFoundComponent: TemaNaoExiste,
  component: PaginaDoTema,
})

function PaginaDoTema() {
  const { data: tema } = useSuspenseQuery(leituras.tema(Route.useParams().tema))

  return (
    <Folha>
      <Coluna>
        <Display>{tema.titulo}</Display>
        <Html
          className="prosa m-0 text-lead"
          slot="contexto"
          html={tema.contextoHtml}
        />

        <ol className="m-0 list-none p-0" data-slot="perguntas">
          {tema.guias.map((guia) => (
            <li key={guia.slug} className="regua mt-secao pt-5">
              <Headline>
                <Link
                  to="/$tema/$slug"
                  params={{ tema: guia.tema, slug: guia.slug }}
                  className="decoration-2 underline-offset-5 hover:bg-amarelo-voce"
                >
                  {guia.pergunta}
                </Link>
              </Headline>
              <ConfiancaCurta confianca={guia.confianca} className="mb-2.5" />
              <Html className="prosa mt-2.5" html={guia.respostaHtml} />
              <Link
                to="/$tema/$slug"
                params={{ tema: guia.tema, slug: guia.slug }}
                className="mt-1 inline-flex min-h-toque items-center gap-2 font-label text-aviso font-bold no-underline hover:underline"
                aria-label={`Ler o Guia: ${guia.pergunta}`}
              >
                Ler o Guia
                <svg
                  width="22"
                  height="14"
                  viewBox="0 0 22 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 7.4C8 6.6 14 7.2 19.4 7M15 2.4l4.6 4.7-4.8 4.5" />
                </svg>
              </Link>
            </li>
          ))}
        </ol>
      </Coluna>
    </Folha>
  )
}

function TemaNaoExiste() {
  return (
    <Folha>
      <Coluna>
        <Display>Essa página não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/">Veja os Temas na página inicial</Link>.
        </Lead>
      </Coluna>
    </Folha>
  )
}
