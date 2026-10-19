// As peças do Guia que se repetem em outras páginas: o HTML que o servidor
// já montou, a Confiança da resposta curta, a lista numerada de Fichas
// citadas e a linha grande de uma Pergunta.
import type { Forca } from '@tem-estudo/conteudo'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { FichaCitada, GuiaResumo } from '#/conteudo/vista-guia'
import { cn } from '@/platform/cn'
import { LacoDaFicha, type FichaCirculada } from './navegacao'
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
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/** Três degraus de 72px ao lado de "Confiança da resposta" e do nível. */
export function ConfiancaDaResposta({ confianca }: { confianca: Forca }) {
  return (
    <div
      className="m-0 mb-3 flex items-center gap-sm border-b-(length:--traco-etiqueta) fio-pontilhado border-tinta pb-3"
      data-confianca={confianca}
    >
      <Degraus nivel={confianca} largura={72} />
      <p className="m-0 font-label text-label leading-tight text-tinta-2">
        Confiança da resposta
        <span className="block font-title text-nivel leading-headline font-bold tracking-title text-tinta">
          {confianca}
        </span>
      </p>
    </div>
  )
}

/** A Confiança em tamanho de etiqueta, para listas de Perguntas. */
export function ConfiancaCurta({
  confianca,
  className,
}: {
  confianca: Forca
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-label text-label',
        className,
      )}
      data-confianca={confianca}
    >
      <Degraus nivel={confianca} />
      confiança {confianca}
    </span>
  )
}

export function FichasCitadas({
  fichas,
  circulada,
  voltarAoTexto,
}: {
  fichas: ReadonlyArray<FichaCitada>
  /** A Ficha que o leitor tocou no texto, com o laço e "voltar ao texto". */
  circulada?: FichaCirculada | null
  voltarAoTexto?: () => void
}) {
  return (
    <>
      <ol className="m-0 list-none p-0" data-slot="fichas-citadas">
        {fichas.map((ficha) => {
          const alvo = circulada?.slug === ficha.slug
          return (
            <li
              key={ficha.slug}
              id={ficha.ancora}
              className="ficha-citada relative isolate grid scroll-mt-[30vh] grid-cols-[34px_1fr] gap-2.5 rounded-mao-2 pt-3.5 pr-2.5 pb-3.5 pl-1.5 not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta target:bg-agua-fonte/30 focus:shadow-none focus:outline-none data-alvo:target:bg-transparent"
              data-alvo={alvo || undefined}
              tabIndex={-1}
            >
              {alvo && <LacoDaFicha key={circulada.vez} />}
              <span
                className="mt-1.75 grid size-7.5 place-items-center rounded-bolota border-(length:--traco-controle) border-agua-tinta font-label text-nota leading-none font-bold text-agua-tinta"
                aria-hidden="true"
              >
                {ficha.n}
              </span>
              <div>
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
                {alvo && voltarAoTexto && (
                  <button
                    type="button"
                    className="mt-1.5 inline-flex min-h-toque cursor-pointer items-center border-0 bg-transparent px-0 py-1 font-label text-label leading-body text-inherit underline decoration-(length:--traco-etiqueta) underline-offset-4"
                    onClick={voltarAoTexto}
                  >
                    voltar ao texto
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 mb-0 text-label leading-body font-normal text-tinta-2">
        Status: lido no original (conferido no texto completo) ou parcial (só no
        resumo ou na página oficial). Força: forte, moderada ou fraca, conforme
        o desenho e o tamanho do estudo.
      </p>
    </>
  )
}

/** A linha de metadados de uma Ficha: Status, Força e o contexto. A `grande`
 * fica embaixo do título da página da Ficha. */
export function MetaDaFicha({
  grande = false,
  children,
}: {
  grande?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center text-label leading-label font-normal',
        grande ? 'm-0 mb-lg gap-x-md gap-y-2.5' : 'mt-xs gap-x-sm gap-y-1.5',
      )}
      data-slot={grande ? 'ficha-meta-grande' : 'ficha-meta'}
    >
      {children}
    </div>
  )
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
  guia: GuiaResumo
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
