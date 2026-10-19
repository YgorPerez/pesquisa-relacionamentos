// A linha grande de uma Pergunta (DESIGN.md, Navegação): a Pergunta em
// destaque, a primeira frase da resposta e a seta, num cartão com a
// retícula. As relacionadas do Guia, onde a Ficha e a Dica são citadas, e as
// calculadoras do início.
import { Link } from '@tanstack/react-router'

/** O que a linha mostra de um Guia: o bastante de um `GuiaResumo`. */
type PerguntaDaLinha = {
  readonly tema: string
  readonly slug: string
  readonly pergunta: string
  readonly primeiraFrase: string
}

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

/** O que a linha grande mostra: o título e a frase embaixo, e a seta. */
function CorpoDaLinha({ titulo, frase }: { titulo: string; frase: string }) {
  return (
    <>
      <span>
        <b className="mb-1 block font-title text-linha leading-tight font-bold tracking-title">
          {titulo}
        </b>
        <span className="block text-nota leading-nota text-tinta-2 group-hover:text-tinta">
          {frase}
        </span>
      </span>
      <Seta />
    </>
  )
}

const LINHA =
  'reticula group grid min-h-toque grid-cols-[1fr_auto] items-center gap-3 rounded-mao-2 border-2 border-tinta bg-folha p-4 no-underline hover:bg-amarelo-voce'

/** Uma Pergunta como linha grande: a Pergunta, a primeira frase da resposta e
 * a seta. `de` é a Pergunta do Guia de onde se sai, que o outro Guia mostra
 * em "Voltar para <Pergunta>". */
export function LinhaDePergunta({
  guia,
  de,
}: {
  guia: PerguntaDaLinha
  de?: string
}) {
  return (
    <Link
      to="/$tema/$slug"
      params={{ tema: guia.tema, slug: guia.slug }}
      state={de ? { de } : undefined}
      className={LINHA}
      data-slot="linha-pergunta"
    >
      <CorpoDaLinha titulo={guia.pergunta} frase={guia.primeiraFrase} />
    </Link>
  )
}

/** A linha grande de uma calculadora, no início. */
export function LinhaDaCalculadora({
  href,
  titulo,
  resumo,
}: {
  href: string
  titulo: string
  resumo: string
}) {
  return (
    <a href={href} className={LINHA} data-slot="linha-pergunta">
      <CorpoDaLinha titulo={titulo} frase={resumo} />
    </a>
  )
}
