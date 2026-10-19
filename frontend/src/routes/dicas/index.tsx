import { createFileRoute, Link } from '@tanstack/react-router'
import { listarDicas } from '#/conteudo/guias'
import { ForcaDaEvidencia } from '#/ui/selos'

export const Route = createFileRoute('/dicas/')({
  loader: () => listarDicas(),
  head: () => ({
    meta: [
      { title: 'Dicas · Tem estudo?' },
      {
        name: 'description',
        content: 'O que fazer com o que os estudos dizem, cada Dica com a Força da evidência e as Fichas que a sustentam.',
      },
    ],
  }),
  component: Dicas,
})

function Dicas() {
  const dicas = Route.useLoaderData()

  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">
          O que <span className="marca-texto">fazer</span> com a evidência
        </h1>
        <p className="lead">
          Cada Dica diz quanto a evidência pesa e leva aos estudos de onde saiu. Quando nenhum estudo
          testou a Dica direto, ela vem marcada como inferência nossa.
        </p>

        <section className="secao" aria-labelledby="lista-dicas">
          <h2 id="lista-dicas" className="headline">
            {dicas.length === 1 ? '1 Dica' : `${dicas.length} Dicas`}
          </h2>
          {dicas.length === 0 ? (
            <p className="aviso">
              Nenhuma Dica no ar ainda. Elas entram quando os estudos que as sustentam forem
              conferidos na fonte.
            </p>
          ) : (
            <ol className="dicas">
              {dicas.map((dica) => (
                <li key={dica.slug} className="dica-da-lista">
                  <Link to="/dicas/$slug" params={{ slug: dica.slug }} className="ficha-titulo">
                    {dica.texto}
                  </Link>
                  <div className="ficha-meta">
                    <ForcaDaEvidencia forca={dica.forca} />
                    {dica.inferencia && <span className="inferencia-curta">Inferência nossa</span>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  )
}
