// A Study table whose numbers do not share a unit (#475): it stays a table,
// one row per Study, with where, when, how many and how it was done next to
// its number, because one scale cannot hold a % and a "vezes". Two columns,
// so it fits a 360px phone without scrolling sideways; a real table, so it
// reads as one. Its rows are a chart's points all the same: the number opens
// the tap detail (`visual-detail.tsx`), the Guide's country lights its rows
// and dims the others, Brazil's row is marked for everyone, and the saved
// Profile tags the Studies that cover it. No library: the server's table is
// the whole drawing, and the tap is a plain button.
import { appliesToYou } from '@tem-estudo/rules/applies-to-you'
import type { Profile } from '@tem-estudo/rules/profile'
import { useState } from 'react'
import type { ChartTable } from '#/content/chart-view'
import { cn } from '@/platform/cn'
import { CHART_TABLE_COPY } from './visual-chart-table.copy'
import { CHART_COPY } from './visual-chart.copy'
import { VisualDetail } from './visual-detail'
import { SourceRefs, VisualFrame } from './visual-frame'
import { VISUAL_COPY } from './visual.copy'

/** `border-b-0` and the padding undo the `.prosa` table rule
 * (`drawings.css`), which the body's Markdown puts around the Visual. */
const CELL =
  'border-t-(length:--traco-etiqueta) border-b-0 fio-pontilhado border-tinta py-2.5 align-top'

/** "Brasil · 2019 · 2.400 pessoas · transversal", Brazil in its mark, the
 * same as "no Brasil" in the prose, for everyone. */
function Context({ context, brazil }: { context: string; brazil: boolean }) {
  const country = brazil ? /^Brasil(?= ·|$)/.exec(context)?.[0] : undefined
  return (
    <span className="block text-tinta-2">
      {country && <span className="marca-brasil">{country}</span>}
      {country ? context.slice(country.length) : context}
    </span>
  )
}

function TableHead() {
  return (
    <thead>
      <tr>
        <th
          scope="col"
          className="w-2/3 border-b-0 pb-1.5 text-left font-label text-label"
        >
          {VISUAL_COPY.study}
        </th>
        <th
          scope="col"
          className="border-b-0 pb-1.5 text-right font-label text-label"
        >
          {VISUAL_COPY.result}
        </th>
      </tr>
    </thead>
  )
}

/** A Study's row: its title, context and measure, and its number, which
 * opens the detail under the table. */
function StudyRow({
  point,
  context,
  dimmed,
  you,
  open,
  detailId,
  onToggle,
}: {
  point: ChartTable['rows'][number]['point']
  context: string
  dimmed: boolean
  you: boolean
  open: boolean
  detailId: string
  onToggle: () => void
}) {
  const study = point.number.sources[0]
  return (
    <tr
      data-apagada={dimmed || undefined}
      className="transition-opacity data-apagada:text-tinta-2 data-apagada:opacity-40"
    >
      <th scope="row" className={`${CELL} pr-sm text-left font-normal`}>
        <span className="block font-bold">
          {you && <span className="selo-voce-texto">{CHART_COPY.you}</span>}
          {study ? (
            <SourceRefs sources={[study]} after={study.title} />
          ) : (
            point.label
          )}
        </span>
        <Context context={context} brazil={point.brazil} />
        <span className="block italic">{point.detail}</span>
      </th>
      <td className={`${CELL} text-right`}>
        <button
          type="button"
          aria-label={CHART_TABLE_COPY.openDetail(point.number.text)}
          aria-expanded={open}
          aria-controls={detailId}
          onClick={onToggle}
          className={cn(
            'cursor-pointer rounded-mao-2 border-0 bg-transparent p-0 text-right font-title text-grande leading-tight font-bold text-current underline decoration-dotted decoration-2 underline-offset-4',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta',
          )}
        >
          {point.number.text}
        </button>
      </td>
    </tr>
  )
}

export function VisualChartTable({
  table,
  country,
  profile,
}: {
  table: ChartTable
  /** The Guide's chosen country (`?pais=`), or `null`. */
  country: string | null
  profile: Profile | null
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const lit =
    country !== null &&
    table.rows.some((r) => r.point.country?.slug === country)
  const open = table.rows.find((r) => r.point.key === selected)?.point
  const detailId = `${table.domId}-detalhe`
  return (
    <VisualFrame domId={table.domId} title={table.title} note={table.note}>
      <table
        aria-labelledby={`${table.domId}-titulo`}
        className="m-0 table w-full table-fixed border-collapse text-nota leading-nota"
      >
        <TableHead />
        <tbody>
          {table.rows.map(({ point, context }) => (
            <StudyRow
              key={point.key}
              point={point}
              context={context}
              dimmed={lit && point.country?.slug !== country}
              you={
                point.covers.length > 0 &&
                appliesToYou(profile, point.covers)?.covered === true
              }
              open={selected === point.key}
              detailId={detailId}
              onToggle={() =>
                setSelected((now) => (now === point.key ? null : point.key))
              }
            />
          ))}
        </tbody>
      </table>
      <div id={detailId} aria-live="polite">
        {open && (
          <VisualDetail
            point={open}
            definitions={[]}
            you={appliesToYou(profile, open.covers)?.covered === true}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </VisualFrame>
  )
}
