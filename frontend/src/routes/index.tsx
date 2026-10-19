import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Inicio,
})

/** Os dois Temas do MVP, na ordem dos Guias. Viram links quando os Guias
 * publicarem. */
const TEMAS = [
  {
    titulo: 'Onde conhecer pessoas',
    resumo: 'App ou presencial, e onde estão as pessoas da sua idade.',
  },
  {
    titulo: 'Escolher parceiro',
    resumo: 'O que você exige de alguém e o que de fato pesa numa relação.',
  },
]

/** A página inicial provisória: o nome, a promessa e os Temas que vêm. */
function Inicio() {
  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">
          Dúvida de relacionamento, com a <span className="marca-texto">fonte</span> junto
        </h1>
        <p className="lead">
          Respostas curtas sobre onde conhecer pessoas e como escolher parceiro. Cada afirmação
          leva ao estudo de onde saiu, e a gente avisa quando a pesquisa ainda não sabe.
        </p>

        <section className="secao" aria-labelledby="temas">
          <h2 id="temas" className="headline">
            Os Temas
          </h2>
          {TEMAS.map((tema) => (
            <article key={tema.titulo} className="painel com-reticula">
              <h3 className="title">{tema.titulo}</h3>
              <p className="secundario">{tema.resumo}</p>
            </article>
          ))}
        </section>

        <footer className="rodape">
          <p>
            Os Guias entram no ar quando os estudos que os sustentam forem conferidos na fonte.
            Enquanto isso, <Link to="/estudos">veja os estudos do acervo</Link>.
          </p>
        </footer>
      </div>
    </main>
  )
}
