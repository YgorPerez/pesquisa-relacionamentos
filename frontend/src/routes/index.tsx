import { createFileRoute, Link } from '@tanstack/react-router'
import { listarTemas } from '#/conteudo/guias'

export const Route = createFileRoute('/')({
  loader: () => listarTemas(),
  component: Inicio,
})

const Seta = () => (
  <svg
    width="30"
    height="20"
    viewBox="0 0 30 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 11c8-2 16-1 25-1M27 10l-7-7M27 10l-7 7" />
  </svg>
)

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
  const temas = Route.useLoaderData()

  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">
          Dúvida de relacionamento, com a{' '}
          <span className="marca-texto">fonte</span> junto
        </h1>
        <p className="lead">
          Respostas curtas sobre onde conhecer pessoas e como escolher parceiro.
          Cada afirmação leva ao estudo de onde saiu, e a gente avisa quando a
          pesquisa ainda não sabe.
        </p>

        <section className="secao" aria-labelledby="temas">
          <h2 id="temas" className="headline">
            Os Temas
          </h2>
          {temas.length === 0 ? (
            <p className="aviso">
              Os Guias entram no ar quando os estudos que os sustentam forem
              conferidos na fonte. Enquanto isso,{' '}
              <Link to="/estudos">veja os estudos do acervo</Link>.
            </p>
          ) : (
            temas.map((tema) => (
              <article
                key={tema.slug}
                className="painel com-reticula tema-no-inicio"
              >
                <h3 className="title">
                  <Link
                    to="/$tema"
                    params={{ tema: tema.slug }}
                    className="link-tema"
                  >
                    {tema.titulo}
                  </Link>
                </h3>
                <ol className="perguntas-do-tema">
                  {tema.guias.map((guia) => (
                    <li key={guia.slug}>
                      <Link
                        to="/$tema/$slug"
                        params={{ tema: guia.tema, slug: guia.slug }}
                      >
                        {guia.pergunta}
                      </Link>
                    </li>
                  ))}
                </ol>
              </article>
            ))
          )}
        </section>

        <section className="secao" aria-labelledby="calculadoras">
          <h2 id="calculadoras" className="headline">
            Faça a conta
          </h2>
          <ul className="linhas-pergunta">
            {CALCULADORAS.map((c) => (
              <li key={c.para}>
                <a href={c.para} className="linha-pergunta com-reticula">
                  <span>
                    <b>{c.nome}</b>
                    <span className="secundario">{c.resumo}</span>
                  </span>
                  <Seta />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="rodape">
          <p>
            <Link to="/estudos">Todos os estudos</Link> ·{' '}
            <Link to="/dicas">Todas as Dicas</Link>
          </p>
        </footer>
      </div>
    </main>
  )
}
