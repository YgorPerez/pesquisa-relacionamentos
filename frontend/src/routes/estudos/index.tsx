import { createFileRoute, Link } from '@tanstack/react-router'
import { listarFichas } from '#/conteudo/fichas'
import {
  ForcaDaEvidencia,
  LegendaDasFichas,
  StatusDeVerificacao,
} from '#/ui/selos'

export const Route = createFileRoute('/estudos/')({
  loader: () => listarFichas(),
  head: () => ({
    meta: [
      { title: 'Estudos · Tem estudo?' },
      {
        name: 'description',
        content:
          'Todas as Fichas do acervo: o que cada estudo mediu, os números e até onde a gente conferiu na fonte.',
      },
    ],
  }),
  component: Estudos,
})

const contar = (n: number, um: string, varios: string) =>
  `${n} ${n === 1 ? um : varios}`

function Estudos() {
  const fichas = Route.useLoaderData()
  const conferidas = fichas.filter((f) => f.status !== 'nao-verificado').length

  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">
          Os <span className="marca-texto">estudos</span> por trás das respostas
        </h1>
        <p className="lead">
          Cada Ficha resume um estudo: o que mediu, os números com o trecho do
          original e o que ele não consegue dizer. Ao lado de cada uma, até onde
          a gente conferiu e quanto a evidência pesa.
        </p>

        <section className="secao" aria-labelledby="lista">
          <h2 id="lista" className="headline">
            {contar(fichas.length, 'Ficha', 'Fichas')}
          </h2>
          {conferidas === 0 && (
            <p className="aviso">
              Nenhuma Ficha foi conferida no original ainda. Todas estão sendo
              refeitas com a fonte aberta ao lado, e até lá nenhuma sustenta um
              Guia.
            </p>
          )}
          <ol className="fichas">
            {fichas.map((ficha) => (
              <li key={ficha.slug} className="ficha">
                <Link
                  to="/estudos/$slug"
                  params={{ slug: ficha.slug }}
                  className="ficha-titulo"
                >
                  {ficha.titulo}
                </Link>
                <div className="ficha-meta">
                  <StatusDeVerificacao status={ficha.status} />
                  <ForcaDaEvidencia forca={ficha.forca} />
                  <span>{ficha.contexto}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="secao" aria-labelledby="como-ler">
          <h2 id="como-ler" className="headline">
            Como ler
          </h2>
          <LegendaDasFichas />
        </section>
      </div>
    </main>
  )
}
