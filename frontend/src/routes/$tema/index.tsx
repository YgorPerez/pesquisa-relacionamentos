import { createFileRoute, Link } from '@tanstack/react-router'
import { buscarTema } from '#/conteudo/guias'
import { ConfiancaCurta, Html } from '#/ui/guia'

export const Route = createFileRoute('/$tema/')({
  loader: ({ params }) => buscarTema({ data: params.tema }),
  head: ({ loaderData: tema }) => ({
    meta: tema
      ? [
          { title: `${tema.busca.titulo} · Tem estudo?` },
          { name: 'description', content: tema.busca.descricao },
        ]
      : [],
  }),
  notFoundComponent: TemaNaoExiste,
  component: PaginaDoTema,
})

function PaginaDoTema() {
  const tema = Route.useLoaderData()

  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">{tema.titulo}</h1>
        <Html className="lead contexto prosa" html={tema.contextoHtml} />

        <ol className="perguntas">
          {tema.guias.map((guia) => (
            <li key={guia.slug} className="secao pergunta-do-tema">
              <h2 className="headline">
                <Link
                  to="/$tema/$slug"
                  params={{ tema: guia.tema, slug: guia.slug }}
                >
                  {guia.pergunta}
                </Link>
              </h2>
              <ConfiancaCurta confianca={guia.confianca} />
              <Html className="prosa" html={guia.respostaHtml} />
              <Link
                to="/$tema/$slug"
                params={{ tema: guia.tema, slug: guia.slug }}
                className="voltar ler-guia"
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
      </div>
    </main>
  )
}

function TemaNaoExiste() {
  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">Essa página não existe</h1>
        <p className="lead">
          O endereço pode ter mudado.{' '}
          <Link to="/">Veja os Temas na página inicial</Link>.
        </p>
      </div>
    </main>
  )
}
