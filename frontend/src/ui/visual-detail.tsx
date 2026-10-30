// The card of a chart (#499): the exact value, our calculation when the
// number is a "conta nossa" and what the point measures, beside the mark.
// Hover or the keyboard's focus shows it, without buttons and without taking
// the pointer or the focus; pinned (`chart-card.ts`) it has the way to the
// Fact sheet and "Fechar", and closes with Esc or a click outside. A Study
// table of mixed units opens it too.
import { Popover } from '@base-ui/react/popover'
import { appliesToYou } from '@tem-estudo/rules/applies-to-you'
import type { Profile } from '@tem-estudo/rules/profile'
import type { RefObject } from 'react'
import type { ChartPoint } from '#/content/chart-view'
import { cn } from '@/platform/cn'
import { SiteButton } from './button'
import { cardId, closeCard, type CardState } from './chart-card'
import { DefinitionGlyph } from './definition-glyph'
import { SmallLink } from './section'
import { CHART_COPY } from './visual-chart.copy'

type Definitions = ReadonlyArray<{ readonly legend: string }>

/** A Fact sheet's slug out of its anchor in the page's list. */
const slugOfAnchor = (anchor: string) => anchor.replace(/^ficha-/, '')

/** The card's words, in either state. */
export function VisualDetail({
  point,
  definitions,
  you,
  hint,
  onClose,
}: {
  point: ChartPoint
  definitions: Definitions
  /** The Study covers the saved Profile. */
  you: boolean
  /** On hover: how to pin it. */
  hint?: string
  /** Pinned: closes it. */
  onClose?: (click: { readonly detail: number }) => void
}) {
  const definition =
    point.definition === null ? undefined : definitions[point.definition]
  return (
    <>
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
      {hint && <p className="m-0 mt-1 font-bold text-agua-tinta">{hint}</p>}
      {onClose && (
        <div className="mt-1 flex flex-col items-start">
          {point.number.sources.map((source) => (
            <SmallLink
              key={source.anchor}
              to="/estudos/$slug"
              params={{ slug: slugOfAnchor(source.anchor) }}
              className="text-agua-tinta"
            >
              {CHART_COPY.openFactSheet(source.title)}
            </SmallLink>
          ))}
          <SiteButton variant="light" onClick={onClose} className="self-end">
            {CHART_COPY.close}
          </SiteButton>
        </div>
      )}
    </>
  )
}

/** The one card, beside the mark it belongs to. `host` holds the chart's
 * marks: a click there is the chart's own, which pins or unpins, and not a
 * click outside. */
export function ChartCard({
  card,
  host,
  definitions,
  profile,
}: {
  card: CardState
  host: RefObject<HTMLElement | null>
  definitions: Definitions
  profile: Profile | null
}) {
  const { target, pinned } = card
  if (!target) return null
  const close = (click?: { readonly detail: number }) => {
    const id = cardId(target.chart)
    const inside = document.getElementById(id)?.contains(document.activeElement)
    const mark = host.current?.querySelector<HTMLElement>(
      'svg, button[aria-expanded="true"]',
    )
    closeCard()
    // A keyboard was in the card, which is gone: back to the mark. A mouse's
    // click (`detail` above 0) stays out of it: focusing the chart would show
    // its first point's card under a pointer that is elsewhere.
    if (inside && !click?.detail) mark?.focus()
  }
  const hint =
    target.via === 'keyboard' ? CHART_COPY.pinByKey : CHART_COPY.pinByPointer
  return (
    <Popover.Root
      open
      onOpenChange={(open, details) => {
        if (open) return
        const from = details.event.target
        if (
          details.reason !== 'escape-key' &&
          from instanceof Node &&
          host.current?.contains(from)
        )
          return
        close()
      }}
    >
      <Popover.Portal>
        <Popover.Positioner
          anchor={{
            getBoundingClientRect: target.anchor,
            ...(host.current ? { contextElement: host.current } : {}),
          }}
          side="right"
          sideOffset={8}
          collisionPadding={8}
          className={cn('z-20', !pinned && 'pointer-events-none')}
        >
          <Popover.Popup
            id={cardId(target.chart)}
            aria-label={`${target.point.label}: ${target.point.number.text}`}
            initialFocus={false}
            finalFocus={false}
            data-slot="detalhe-do-grafico"
            data-fixado={pinned || undefined}
            className="w-75 max-w-(--available-width) rounded-mao-2 border-2 border-tinta bg-folha p-sm text-nota leading-nota text-tinta outline-none data-fixado:border-agua-tinta"
          >
            <VisualDetail
              point={target.point}
              definitions={definitions}
              you={appliesToYou(profile, target.point.covers)?.covered === true}
              {...(pinned ? { onClose: close } : { hint })}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
