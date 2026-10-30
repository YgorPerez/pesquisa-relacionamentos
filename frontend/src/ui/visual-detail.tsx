// The tap detail of a chart (#470): the exact value, our calculation when
// the number is a "conta nossa", what the point measures, and the Fact
// sheet's ring, which opens the page's reference popover
// (`reference-popover.tsx`). It opens on a tap, a click or Enter on a mark,
// so it never depends on hover. A Study table of mixed units opens it too.
import type { ChartPoint } from '#/content/chart-view'
import { SiteButton } from './button'
import { DefinitionGlyph } from './definition-glyph'
import { CHART_COPY } from './visual-chart.copy'
import { SourceRefs } from './visual-frame'

export function VisualDetail({
  point,
  definitions,
  you,
  onClose,
}: {
  point: ChartPoint
  definitions: ReadonlyArray<{ readonly legend: string }>
  /** The Study covers the saved Profile. */
  you: boolean
  onClose: () => void
}) {
  const definition =
    point.definition === null ? undefined : definitions[point.definition]
  return (
    <div
      className="mt-xs rounded-mao-2 border-(length:--traco-etiqueta) fio-pontilhado border-tinta bg-folha p-sm text-nota leading-nota"
      data-slot="detalhe-do-grafico"
    >
      <p className="m-0 font-label text-label">
        {point.label}
        {point.detail && (
          <span className="block font-body font-normal italic">
            {point.detail}
          </span>
        )}
      </p>
      <p className="m-0 mt-1 font-title text-grande leading-tight font-bold">
        {point.number.text}
      </p>
      {point.number.own && (
        <p className="m-0 mt-1">
          {CHART_COPY.calculation(point.number.own, point.number.text)}
        </p>
      )}
      <dl className="m-0 mt-1 grid grid-cols-[auto_1fr] gap-x-2">
        {point.country && (
          <>
            <dt className="text-tinta-2">{CHART_COPY.country}</dt>
            <dd className="m-0">{point.country.name}</dd>
          </>
        )}
        {point.year !== null && (
          <>
            <dt className="text-tinta-2">{CHART_COPY.year}</dt>
            <dd className="m-0">{point.year}</dd>
          </>
        )}
        {definition && point.definition !== null && (
          <>
            <dt className="text-tinta-2">{CHART_COPY.definition}</dt>
            <dd className="m-0">
              <DefinitionGlyph shape={point.definition} /> {definition.legend}
            </dd>
          </>
        )}
      </dl>
      {you && (
        <p className="m-0 mt-1">
          <span className="selo-voce-texto">{CHART_COPY.you}</span>
          {CHART_COPY.youCovered}
        </p>
      )}
      <div className="mt-xs flex flex-wrap items-center justify-between gap-sm">
        <p className="m-0">
          <SourceRefs sources={point.number.sources} glued={CHART_COPY.sources} />
        </p>
        <SiteButton variant="light" onClick={onClose}>
          {CHART_COPY.close}
        </SiteButton>
      </div>
    </div>
  )
}
