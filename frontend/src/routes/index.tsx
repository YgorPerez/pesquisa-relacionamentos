import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { leituras } from '#/conteudo/leituras'
import { LinhaDaCalculadora } from '#/ui/linha-da-pergunta'
import { Coluna, Display, Folha, Lead } from '#/ui/folha'
import { Aviso, Headline, Painel, Secao } from '#/ui/secao'

export const Route = createFileRoute('/')({
  // Só espera a leitura: os dados vão ao navegador pelo `queryClient`, e não
  // pelo `loaderData`, que os mandaria duas vezes no HTML.
  loader: async ({ context }) => {
    await context.queryClient.query(leituras.temas())
  },
  component: Inicio,
})

/** As duas calculadoras. As páginas delas chegam nos tickets #32 e #33. */
const CALCULADORAS = [
  {
    para: '/grupo-possivel',
    nome: 'Grupo possível',
    resumo: 'Quantas pessoas no Brasil atendem ao que você procura.',
  },
  {
    para: '/prioridades',
    nome: 'Prioridades vs. evidência',
    resumo:
      'Toque no que mais importa para você e veja quanto a evidência põe em cada um.',
  },
] as const

/** A página inicial: a frase do site, os Temas com as Perguntas e os atalhos
 * para as calculadoras. */
function Inicio() {
  const { data: temas } = useSuspenseQuery(leituras.temas())

  return (
    <Folha>
      <Coluna>
        <Display>
          Dúvida de relacionamento, com a{' '}
          <span className="marca-texto">fonte</span> junto
        </Display>
        <Lead>
          Respostas curtas sobre onde conhecer pessoas e como escolher parceiro.
          Cada afirmação leva ao estudo de onde saiu, e a gente avisa quando a
          pesquisa ainda não sabe.
        </Lead>

        <Secao aria-labelledby="temas">
          <Headline id="temas">Os Temas</Headline>
          {temas.length === 0 ? (
            <Aviso>
              Os Guias entram no ar quando os estudos que os sustentam forem
              conferidos na fonte. Enquanto isso,{' '}
              <Link to="/estudos">veja os estudos do acervo</Link>.
            </Aviso>
          ) : (
            temas.map((tema) => (
              <Painel
                como="article"
                key={tema.slug}
                className="not-first-of-type:mt-lg"
              >
                <h3 className="m-0 font-title text-title">
                  <Link
                    to="/$tema"
                    params={{ tema: tema.slug }}
                    className="inline-flex min-h-toque items-center decoration-2"
                  >
                    {tema.titulo}
                  </Link>
                </h3>
                <ol className="mt-1 mb-0 pl-marcador">
                  {tema.guias.map((guia) => (
                    <li key={guia.slug} className="not-first:mt-0.5">
                      <Link
                        to="/$tema/$slug"
                        params={{ tema: guia.tema, slug: guia.slug }}
                        className="inline-flex min-h-toque items-center"
                      >
                        {guia.pergunta}
                      </Link>
                    </li>
                  ))}
                </ol>
              </Painel>
            ))
          )}
        </Secao>

        <Secao aria-labelledby="calculadoras">
          <Headline id="calculadoras">Faça a conta</Headline>
          <ul className="isolate m-0 list-none p-0">
            {CALCULADORAS.map((c) => (
              <li key={c.para} className="not-first:mt-md">
                <LinhaDaCalculadora
                  href={c.para}
                  titulo={c.nome}
                  resumo={c.resumo}
                />
              </li>
            ))}
          </ul>
        </Secao>

        <footer className="mt-rodape text-nota text-tinta-2">
          <p>
            <Link to="/estudos">Todos os estudos</Link> ·{' '}
            <Link to="/dicas">Todas as Dicas</Link>
          </p>
        </footer>
      </Coluna>
    </Folha>
  )
}
