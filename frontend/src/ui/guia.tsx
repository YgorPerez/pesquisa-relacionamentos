// As peças do Guia que se repetem em outras páginas: o HTML que o servidor
// já montou, a Confiança da resposta curta, a lista numerada de Fichas
// citadas e a linha grande de uma Pergunta.
import type { Forca } from '@tem-estudo/conteudo'
import { Link } from '@tanstack/react-router'
import type { HtmlSeguro } from '#/conteudo/html-seguro'
import type { FichaCitada } from '#/conteudo/vista-guia'
import { cn } from '@/platform/cn'
import { Button } from '@/ui/shadcn/button'
import { LacoDaFicha, type FichaCirculada } from './navegacao'
import {
  Degraus,
  ForcaDaEvidencia,
  MetaDaFicha,
  StatusDeVerificacao,
} from './selos'

export function Html({
  html,
  como = 'div',
  className,
  slot,
}: {
  html: HtmlSeguro
  como?: 'div' | 'span' | 'p'
  className?: string
  /** O `data-slot`, por onde o teste acha o bloco. */
  slot?: string
}) {
  const Tag = como
  return (
    <Tag
      className={className}
      data-slot={slot}
      dangerouslySetInnerHTML={{ __html: html }}
    />
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
        {fichas.map((ficha) => (
          <ItemDaFicha
            key={ficha.slug}
            ficha={ficha}
            circulada={circulada?.slug === ficha.slug ? circulada : null}
            voltarAoTexto={voltarAoTexto}
          />
        ))}
      </ol>
      <p className="mt-3 mb-0 text-label leading-body font-normal text-tinta-2">
        Status: lido no original (conferido no texto completo) ou parcial (só no
        resumo ou na página oficial). Força: forte, moderada ou fraca, conforme
        o desenho e o tamanho do estudo.
      </p>
    </>
  )
}

/** Uma Ficha citada: o número, o título com o Status e a Força e, se o
 * leitor veio do texto até ela (`circulada`), o laço e "voltar ao texto". */
function ItemDaFicha({
  ficha,
  circulada,
  voltarAoTexto,
}: {
  ficha: FichaCitada
  circulada: FichaCirculada | null
  voltarAoTexto: (() => void) | undefined
}) {
  const alvo = circulada !== null
  return (
    <li
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
          <Button
            variant="sublinhado"
            className="mt-1.5"
            onClick={voltarAoTexto}
          >
            voltar ao texto
          </Button>
        )}
      </div>
    </li>
  )
}
