// The Guide's pieces that repeat on other pages: the HTML the server already
// built, the short answer's Confidence, the numbered list of cited Fact
// sheets and a Question's big row.
import type { Strength } from '@tem-estudo/content'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { CitedFactSheet } from '#/content/guide-view'
import type { FactSheetSummary } from '#/content/view'
import { cn } from '@/platform/cn'
import { Button } from '@/ui/shadcn/button'
import { FactSheetLoop } from './fact-sheet-loop'
import type { CircledFactSheet } from './navigation'
import {
  Steps,
  StrengthBadge,
  FactSheetMeta,
  VerificationStatusBadge,
} from './badges'
import { STRENGTH_WORD } from './badges.copy'

export { Html } from './html'

/** Three 72px steps next to "Confiança da resposta" and the level. */
export function AnswerConfidence({ confidence }: { confidence: Strength }) {
  return (
    <div
      className="m-0 mb-3 flex items-center gap-sm border-b-(length:--traco-etiqueta) fio-pontilhado border-tinta pb-3"
      data-confidence={confidence}
    >
      <Steps level={confidence} width={72} />
      <p className="m-0 font-label text-label leading-tight text-tinta-2">
        Confiança da resposta
        <span className="block font-title text-nivel leading-headline font-bold tracking-title text-tinta">
          {STRENGTH_WORD[confidence]}
        </span>
      </p>
    </div>
  )
}

/** The Confidence at tag size, for lists of Questions. */
export function ShortConfidence({
  confidence,
  className,
}: {
  confidence: Strength
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-label text-label',
        className,
      )}
      data-confidence={confidence}
    >
      <Steps level={confidence} />
      confiança {STRENGTH_WORD[confidence]}
    </span>
  )
}

export function CitedFactSheets({
  factSheets,
  circled,
  backToText,
}: {
  factSheets: ReadonlyArray<CitedFactSheet>
  /** The Fact sheet the reader tapped in the text, with the loop and "voltar
   * ao texto". */
  circled?: CircledFactSheet | null
  backToText?: () => void
}) {
  return (
    <>
      <ol className="m-0 list-none p-0" data-slot="fichas-citadas">
        {factSheets.map((factSheet) => (
          <FactSheetItem
            key={factSheet.slug}
            factSheet={factSheet}
            circled={circled?.slug === factSheet.slug ? circled : null}
            backToText={backToText}
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

/** A Fact sheet's title, leading to its page, over its Status and its
 * Strength; `children` go at the end of that row. */
export function FactSheetTitle({
  factSheet,
  children,
}: {
  factSheet: FactSheetSummary
  children?: ReactNode
}) {
  return (
    <>
      <Link
        to="/estudos/$slug"
        params={{ slug: factSheet.slug }}
        className="inline-flex min-h-toque items-center font-bold decoration-agua-tinta hover:bg-agua-fonte"
      >
        {factSheet.title}
      </Link>
      <FactSheetMeta>
        <VerificationStatusBadge status={factSheet.status} />
        <StrengthBadge strength={factSheet.strength} />
        {children}
      </FactSheetMeta>
    </>
  )
}

/** A cited Fact sheet: the number, the title with the Status and the
 * Strength and, if the reader came from the text to it (`circled`), the loop
 * and "voltar ao texto". */
function FactSheetItem({
  factSheet,
  circled,
  backToText,
}: {
  factSheet: CitedFactSheet
  circled: CircledFactSheet | null
  backToText: (() => void) | undefined
}) {
  const isTarget = circled !== null
  return (
    <li
      id={factSheet.anchor}
      className="ficha-citada relative isolate grid scroll-mt-[30vh] grid-cols-[34px_1fr] gap-2.5 rounded-mao-2 pt-3.5 pr-2.5 pb-3.5 pl-1.5 not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta target:bg-agua-fonte/30 focus:shadow-none focus:outline-none data-alvo:target:bg-transparent"
      data-alvo={isTarget || undefined}
      tabIndex={-1}
    >
      {isTarget && <FactSheetLoop key={circled.tapCount} />}
      <span
        className="mt-1.75 grid size-7.5 place-items-center rounded-bolota border-(length:--traco-controle) border-agua-tinta font-label text-nota leading-none font-bold text-agua-tinta"
        aria-hidden="true"
      >
        {factSheet.n}
      </span>
      <div>
        <FactSheetTitle factSheet={factSheet}>
          <span className="text-tinta-2">{factSheet.context}</span>
        </FactSheetTitle>
        {isTarget && backToText && (
          <Button variant="underlined" className="mt-1.5" onClick={backToText}>
            voltar ao texto
          </Button>
        )}
      </div>
    </li>
  )
}
