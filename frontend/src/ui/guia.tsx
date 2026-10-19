// As peças do Guia que se repetem em outras páginas: o HTML que o servidor
// já montou, a Confiança da resposta curta, a lista numerada de Fichas
// citadas e a linha grande de uma Pergunta.
import type { Forca } from '@tem-estudo/conteudo'
import { Link } from '@tanstack/react-router'
import type { FichaCitada, GuiaResumo } from '#/conteudo/vista-guia'
import { Degraus, ForcaDaEvidencia, StatusDeVerificacao } from './selos'

export function Html({
  html,
  como = 'div',
  className,
}: {
  html: string
  como?: 'div' | 'span' | 'p'
  className?: string
}) {
  const Tag = como
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Três degraus de 72px ao lado de "Confiança da resposta" e do nível. */
export function ConfiancaDaResposta({ confianca }: { confianca: Forca }) {
  return (
    <div className="confianca" data-confianca={confianca}>
      <Degraus nivel={confianca} largura={72} />
      <p className="confianca-rotulo">
        Confiança da resposta
        <span className="confianca-nivel">{confianca}</span>
      </p>
    </div>
  )
}

/** A Confiança em tamanho de etiqueta, para listas de Perguntas. */
export function ConfiancaCurta({ confianca }: { confianca: Forca }) {
  return (
    <span className="selo-meta" data-confianca={confianca}>
      <Degraus nivel={confianca} />
      confiança {confianca}
    </span>
  )
}

export function FichasCitadas({ fichas }: { fichas: ReadonlyArray<FichaCitada> }) {
  return (
    <>
      <ol className="fichas-citadas">
        {fichas.map((ficha) => (
          <li key={ficha.slug} id={ficha.ancora} className="ficha-citada" tabIndex={-1}>
            <span className="ficha-n" aria-hidden="true">
              {ficha.n}
            </span>
            <div>
              <Link to="/estudos/$slug" params={{ slug: ficha.slug }} className="ficha-titulo">
                {ficha.titulo}
              </Link>
              <div className="ficha-meta">
                <StatusDeVerificacao status={ficha.status} />
                <ForcaDaEvidencia forca={ficha.forca} />
                <span>{ficha.contexto}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="legenda-curta">
        Status: lido no original (conferido no texto completo) ou parcial (só no resumo ou na página
        oficial). Força: forte, moderada ou fraca, conforme o desenho e o tamanho do estudo.
      </p>
    </>
  )
}

const Seta = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 11c8-2 16-1 25-1M27 10l-7-7M27 10l-7 7" />
  </svg>
)

/** Uma Pergunta como linha grande: a Pergunta, a primeira frase da resposta e a seta. */
export function LinhaDePergunta({ guia }: { guia: GuiaResumo }) {
  return (
    <Link
      to="/$tema/$slug"
      params={{ tema: guia.tema, slug: guia.slug }}
      className="linha-pergunta com-reticula"
    >
      <span>
        <b>{guia.pergunta}</b>
        <span className="secundario">{guia.primeiraFrase}</span>
      </span>
      <Seta />
    </Link>
  )
}
