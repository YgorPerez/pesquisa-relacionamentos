// A Study table whose numbers do not share a unit (#475): it stays a table,
// one row per Study, with where, when, how many and how it was done next to
// its number, because one scale cannot hold a % and a "vezes". Two columns,
// so it fits a 360px phone without scrolling sideways; a real table, so it
// reads as one. Its rows are a chart's points all the same: each shows and
// pins the chart's card (`chart-card.ts`, `visual-detail.tsx`), the Guide's
// country lights its rows and dims the others, Brazil's row is marked for
// everyone, and the saved Profile tags the Studies that cover it. No library:
// the server's table is the whole drawing, and the tap is a plain button, its
// keys the plots' (arrows, Home, End and Enter).
import { appliesToYou } from '@tem-estudo/rules/applies-to-you'
import type { Profile } from '@tem-estudo/rules/profile'
import { useRef, type RefObject } from 'react'
import type { ChartTable } from '#/content/chart-view'
import { cn } from '@/platform/cn'
import { Button } from '@/ui/shadcn/button'
import {
  closeCard,
  useCloseCardOn,
  enterCard,
  hoverCard,
  pinCard,
  useChartCard,
  useInteractive,
  type CardTarget,
} from './chart-card'
import { litByCountry, reachesCountry } from './chart-filters'
import { ChartHint, ChartPulse } from './chart-invitation'
import { CHART_TABLE_COPY } from './visual-chart-table.copy'
import { CHART_COPY } from './visual-chart.copy'
import { ChartCard } from './visual-detail'
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

/** A Study's number: the way into its card for a keyboard and a screen
 * reader. */
function StudyNumber({
  chart,
  text,
  pinned,
  buttonRef,
  onKeyboard,
}: {
  chart: string
  text: string
  pinned: boolean
  buttonRef: RefObject<HTMLButtonElement | null>
  onKeyboard: () => void
}) {
  // A press focuses it too, and the press pins: only another way in shows the
  // card on focus. The arrows' focus has to count, and it is not a key's own.
  const pressed = useRef(false)
  return (
    <Button
      ref={buttonRef}
      variant="number"
      data-slot="study-number"
      aria-label={CHART_TABLE_COPY.openDetail(text)}
      aria-expanded={pinned}
      aria-haspopup="dialog"
      onPointerDown={() => {
        pressed.current = true
      }}
      onFocus={() => {
        if (!pressed.current) onKeyboard()
      }}
      onBlur={() => {
        pressed.current = false
        hoverCard(null, chart)
      }}
      onKeyDown={(event) => {
        const next = numberAfter(event.currentTarget, event.key)
        if (next === undefined) return
        // The arrows' card is unpinned, as on a plot: only Enter pins.
        event.preventDefault()
        if (next === event.currentTarget) return
        if (pinned) closeCard()
        next.focus()
      }}
    >
      {text}
    </Button>
  )
}

/** Where a key moves the focus from a Study's number, as a plot's marks do:
 * the arrows stop at the ends, Home and End go to them. `undefined` for any
 * other key. */
function numberAfter(from: HTMLElement, key: string) {
  const numbers = [
    ...(from
      .closest('tbody')
      ?.querySelectorAll<HTMLElement>('[data-slot="study-number"]') ?? []),
  ]
  const at = numbers.indexOf(from)
  const last = numbers.length - 1
  const index = {
    ArrowDown: Math.min(at + 1, last),
    ArrowRight: Math.min(at + 1, last),
    ArrowUp: Math.max(at - 1, 0),
    ArrowLeft: Math.max(at - 1, 0),
    Home: 0,
    End: last,
  }[key]
  return index === undefined ? undefined : numbers[index]
}

/** A Study's row: its title, context and measure, and its number. The whole
 * row is a target: a mouse over it shows its card, a click pins it, and its
 * number is the way in for a keyboard and a screen reader. The rings in its
 * title keep their own tap. */
function StudyRow({
  chart,
  point,
  context,
  off,
  dimmed,
  you,
  active,
  pinned,
  interactive,
}: {
  chart: string
  point: ChartTable['rows'][number]['point']
  context: string
  /** The Guide's country left it out, whoever has the card. */
  off: boolean
  /** Another row has the card. */
  dimmed: boolean
  you: boolean
  active: boolean
  pinned: boolean
  interactive: boolean
}) {
  const study = point.number.sources[0]
  const number = useRef<HTMLButtonElement>(null)
  const target = (via: CardTarget['via']): CardTarget => ({
    chart,
    point,
    anchor: () => number.current?.getBoundingClientRect() ?? new DOMRect(),
    via,
    refocus: () => number.current?.focus(),
  })
  return (
    <tr
      data-apagada={off || undefined}
      data-dimmed={(dimmed && !off) || undefined}
      data-active={active || undefined}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') hoverCard(target('pointer'))
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') hoverCard(null, chart)
      }}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a')) return
        pinCard(target('pointer'))
      }}
      onKeyDown={(event) => {
        // From the number: Tab goes on into the pinned card.
        if (
          pinned &&
          event.key === 'Tab' &&
          !event.shiftKey &&
          enterCard(chart)
        )
          event.preventDefault()
      }}
      className={cn(
        'transition-opacity data-active:bg-agua-fonte/32 data-apagada:text-tinta-2 data-apagada:opacity-40 data-dimmed:text-tinta-2 data-dimmed:opacity-60',
        interactive && 'cursor-pointer',
      )}
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
        <StudyNumber
          chart={chart}
          text={point.number.text}
          pinned={pinned}
          buttonRef={number}
          onKeyboard={() => hoverCard(target('keyboard'))}
        />
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
  const card = useChartCard(table.domId)
  const host = useRef<HTMLTableElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const interactive = useInteractive()
  const lit = litByCountry(
    table.rows.map((r) => r.point),
    country,
  )
  const active = card.target?.point.key ?? null
  useCloseCardOn(table.domId, country)
  return (
    <VisualFrame domId={table.domId} title={table.title} note={table.note}>
      <div ref={frame} className="relative">
        <table
          ref={host}
          aria-labelledby={`${table.domId}-titulo`}
          className="m-0 table w-full table-fixed border-collapse text-nota leading-nota"
        >
          <TableHead />
          <tbody>
            {table.rows.map(({ point, context }) => (
              <StudyRow
                key={point.key}
                chart={table.domId}
                point={point}
                context={context}
                off={lit && !reachesCountry(point, country)}
                dimmed={active !== null && active !== point.key}
                you={
                  point.covers.length > 0 &&
                  appliesToYou(profile, point.covers)?.covered === true
                }
                active={active === point.key}
                pinned={card.pinned && active === point.key}
                interactive={interactive}
              />
            ))}
          </tbody>
        </table>
        <ChartPulse host={frame} mark="tbody tr" />
      </div>
      <ChartHint />
      <ChartCard card={card} host={host} definitions={[]} profile={profile} />
    </VisualFrame>
  )
}
