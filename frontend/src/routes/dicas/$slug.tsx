import { createFileRoute, Link } from '@tanstack/react-router'
import { buscarDica } from '#/conteudo/guias'
import { FichasCitadas, LinhaDePergunta } from '#/ui/guia'
import { ForcaDaEvidencia } from '#/ui/selos'

export const Route = createFileRoute('/dicas/$slug')({
  loader: ({ params }) => buscarDica({ data: params.slug }),
  head: ({ loaderData: dica }) => ({
    meta: dica
      ? [
          { title: `${dica.busca.titulo} · Tem estudo?` },
          { name: 'description', content: dica.busca.descricao },
        ]
      : [],
  }),
  notFoundComponent: DicaNaoExiste,
  component: PaginaDaDica,
})

function PaginaDaDica() {
  const dica = Route.useLoaderData()

  return (
    <main className="folha">
      <div className="coluna">
        <Link to="/dicas" className="voltar">
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
            <path d="M20 7.4C14 6.6 8 7.2 2.6 7M7 2.4 2.4 7.1 7.2 11.6" />
          </svg>
          Todas as Dicas
        </Link>

        <h1 className="display display-ficha">{dica.texto}</h1>

        <section
          className="painel com-reticula dica"
          aria-label="Quanto a evidência pesa"
        >
          <div className="dica-meta dica-meta-topo">
            <ForcaDaEvidencia forca={dica.forca} rotulo />
          </div>
          {dica.inferencia && (
            <p className="inferencia">
              Inferência nossa: nenhum estudo testou isso direto. Saiu das
              Fichas citadas.
            </p>
          )}
          <p className="vale">
            <b>Vale para:</b> {dica.valePara}
          </p>
        </section>

        <section className="secao" aria-labelledby="t-guias">
          <h2 id="t-guias" className="headline">
            Aparece nos Guias
          </h2>
          {dica.guias.length === 0 ? (
            <p className="secundario">Nenhum Guia traz esta Dica ainda.</p>
          ) : (
            <ul className="linhas-pergunta">
              {dica.guias.map((guia) => (
                <li key={guia.slug}>
                  <LinhaDePergunta guia={guia} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="secao" aria-labelledby="t-fichas">
          <h2 id="t-fichas" className="headline">
            Fichas citadas
          </h2>
          <FichasCitadas fichas={dica.fichas} />
        </section>
      </div>
    </main>
  )
}

function DicaNaoExiste() {
  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">Essa Dica não está no ar</h1>
        <p className="lead">
          O endereço pode ter mudado, ou a Dica ainda espera os estudos serem
          conferidos. <Link to="/dicas">Veja as Dicas publicadas</Link>.
        </p>
      </div>
    </main>
  )
}
