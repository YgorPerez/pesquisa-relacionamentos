import { createFileRoute, Link } from '@tanstack/react-router'
import { listarFichas } from '#/conteudo/fichas'
import {
  ForcaDaEvidencia,
  LegendaDasFichas,
  StatusDeVerificacao,
} from '#/ui/selos'
import { MetaDaFicha } from '#/ui/guia'
import { Aviso, Coluna, Display, Folha, Headline, Lead, Secao } from '#/ui/pagina'

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
    <Folha>
      <Coluna>
        <Display>
          Os <span className="marca-texto">estudos</span> por trás das respostas
        </Display>
        <Lead>
          Cada Ficha resume um estudo: o que mediu, os números com o trecho do
          original e o que ele não consegue dizer. Ao lado de cada uma, até onde
          a gente conferiu e quanto a evidência pesa.
        </Lead>

        <Secao aria-labelledby="lista">
          <Headline id="lista">
            {contar(fichas.length, 'Ficha', 'Fichas')}
          </Headline>
          {conferidas === 0 && (
            <Aviso>
              Nenhuma Ficha foi conferida no original ainda. Todas estão sendo
              refeitas com a fonte aberta ao lado, e até lá nenhuma sustenta um
              Guia.
            </Aviso>
          )}
          <ol className="m-0 list-none p-0" data-slot="fichas">
            {fichas.map((ficha) => (
              <li
                key={ficha.slug}
                className="py-sm not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
              >
                <Link
                  to="/estudos/$slug"
                  params={{ slug: ficha.slug }}
                  className="inline-flex min-h-toque items-center font-bold decoration-agua-tinta hover:bg-agua-fonte"
                >
                  {ficha.titulo}
                </Link>
                <MetaDaFicha>
                  <StatusDeVerificacao status={ficha.status} />
                  <ForcaDaEvidencia forca={ficha.forca} />
                  <span className="text-tinta-2">{ficha.contexto}</span>
                </MetaDaFicha>
              </li>
            ))}
          </ol>
        </Secao>

        <Secao aria-labelledby="como-ler">
          <Headline id="como-ler">
            Como ler
          </Headline>
          <LegendaDasFichas />
        </Secao>
      </Coluna>
    </Folha>
  )
}
