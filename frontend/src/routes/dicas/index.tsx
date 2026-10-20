import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { leituras } from '#/conteudo/leituras'
import { ForcaDaEvidencia, MetaDaFicha } from '#/ui/selos'
import {
  Aviso,
  Coluna,
  Display,
  Folha,
  Headline,
  Lead,
  Secao,
} from '#/ui/pagina'

export const Route = createFileRoute('/dicas/')({
  loader: async ({ context }) => {
    await context.queryClient.query(leituras.dicas())
  },
  head: () => ({
    meta: [
      { title: 'Dicas · Tem estudo?' },
      {
        name: 'description',
        content:
          'O que fazer com o que os estudos dizem, cada Dica com a Força da evidência e as Fichas que a sustentam.',
      },
    ],
  }),
  component: Dicas,
})

function Dicas() {
  const { data: dicas } = useSuspenseQuery(leituras.dicas())

  return (
    <Folha>
      <Coluna>
        <Display>
          O que <span className="marca-texto">fazer</span> com a evidência
        </Display>
        <Lead>
          Cada Dica diz quanto a evidência pesa e leva aos estudos de onde saiu.
          Quando nenhum estudo testou a Dica direto, ela vem marcada como
          inferência nossa.
        </Lead>

        <Secao aria-labelledby="lista-dicas">
          <Headline id="lista-dicas">
            {dicas.length === 1 ? '1 Dica' : `${dicas.length} Dicas`}
          </Headline>
          {dicas.length === 0 ? (
            <Aviso>
              Nenhuma Dica no ar ainda. Elas entram quando os estudos que as
              sustentam forem conferidos na fonte.
            </Aviso>
          ) : (
            <ol className="m-0 list-none p-0" data-slot="dicas">
              {dicas.map((dica) => (
                <li
                  key={dica.slug}
                  className="py-sm not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
                >
                  <Link
                    to="/dicas/$slug"
                    params={{ slug: dica.slug }}
                    className="inline-flex min-h-toque items-center font-bold decoration-agua-tinta hover:bg-agua-fonte"
                  >
                    {dica.texto}
                  </Link>
                  <MetaDaFicha>
                    <ForcaDaEvidencia forca={dica.forca} />
                    {dica.inferencia && (
                      <span className="text-tinta-2 italic">
                        Inferência nossa
                      </span>
                    )}
                  </MetaDaFicha>
                </li>
              ))}
            </ol>
          )}
        </Secao>
      </Coluna>
    </Folha>
  )
}
