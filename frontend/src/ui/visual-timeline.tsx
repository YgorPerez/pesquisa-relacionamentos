// The time line: each number at its year, on an axis with a tick per year,
// exact. The axis and the dots are an SVG in percentages of the column; the
// values above and the years below are HTML placed at the same percentages,
// since axe cannot measure the contrast of SVG text. The list under it says
// what each number measured, with its Fact sheet, and is what a screen
// reader reads. The highlighted value takes the key number's pink marker.
import type { ReactNode } from 'react'
import type { TimelineView } from '#/content/visuals-view'
import { cn } from '@/platform/cn'
import { OwnTag, SourceRefs, VisualFrame, VisualListItem } from './visual-frame'
import { VISUAL_COPY } from './visual.copy'

/** The axis runs from 6% to 94% of the width, so the end labels fit. */
const x = (share: number) => `${6 + share * 88}%`

/** Two values closer than this (a share of the axis) take turns above. */
const CROWDED = 0.2

type Event = TimelineView['events'][number]

/** Which values go one line higher: the one after a close neighbour that
 * stayed low. */
function raisedValues(events: ReadonlyArray<Event>): boolean[] {
  const raised: boolean[] = []
  events.forEach((event, i) => {
    const previous = events[i - 1]
    raised.push(
      previous !== undefined &&
        event.at - previous.at < CROWDED &&
        !raised[i - 1],
    )
  })
  return raised
}

/** A label placed at its point: anchored inward at the ends of the axis. */
function AtPoint({
  event,
  className,
  children,
}: {
  event: Event
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'absolute whitespace-nowrap',
        event.at > 0.9
          ? '-translate-x-full'
          : event.at >= 0.1 && '-translate-x-1/2',
        className,
      )}
      style={{ left: x(event.at) }}
    >
      {children}
    </span>
  )
}

/** The axis line, a tick per year (one every five past 30 years) and the
 * dots, without text. */
function AxisDrawing({ visual }: { visual: TimelineView }) {
  const span = visual.years.length
  const ticks = visual.years.filter((year) => span <= 30 || year % 5 === 0)
  const first = visual.years[0] ?? 0
  const share = (year: number) => (year - first) / Math.max(span - 1, 1)
  return (
    <svg
      width="100%"
      height="14"
      aria-hidden="true"
      className="block overflow-visible"
      data-slot="linha-do-tempo"
    >
      <line
        x1={x(0)}
        x2={x(1)}
        y1="7"
        y2="7"
        className="stroke-tinta"
        strokeWidth="2"
      />
      {ticks.map((year) => (
        <line
          key={year}
          x1={x(share(year))}
          x2={x(share(year))}
          y1="3"
          y2="11"
          className="stroke-tinta"
          strokeWidth="1.2"
        />
      ))}
      {visual.events.map((event) => (
        <circle
          key={`${event.year}-${event.label}`}
          cx={x(event.at)}
          cy="7"
          r="5"
          className="fill-tinta stroke-papel"
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

function Axis({ visual }: { visual: TimelineView }) {
  const raised = raisedValues(visual.events)
  const anyRaised = raised.some(Boolean)
  return (
    <div aria-hidden="true">
      <div
        className={cn(
          'relative font-label text-label',
          anyRaised ? 'h-13' : 'h-7',
        )}
      >
        {visual.events.map((event, i) => (
          <AtPoint
            key={`${event.year}-${event.label}`}
            event={event}
            className={raised[i] ? 'top-0' : 'bottom-1'}
          >
            <span className={cn(event.highlight && 'numero-chave')}>
              {event.number.text}
            </span>
          </AtPoint>
        ))}
      </div>
      <AxisDrawing visual={visual} />
      <div className="relative h-5 font-label text-miudo text-tinta-2">
        {visual.events.map((event) => (
          <AtPoint
            key={`${event.year}-${event.label}`}
            event={event}
            className="top-1"
          >
            {event.year}
          </AtPoint>
        ))}
      </div>
    </div>
  )
}

export function VisualTimeline({ visual }: { visual: TimelineView }) {
  const ownLines = visual.events.flatMap((event) =>
    event.number.own
      ? [
          VISUAL_COPY.ownLine(
            String(event.year),
            event.number.own,
            event.number.text,
          ),
        ]
      : [],
  )
  return (
    <VisualFrame
      domId={visual.domId}
      title={visual.title}
      note={visual.note}
      ownLines={ownLines}
    >
      <Axis visual={visual} />
      <ol className="m-0 mt-xs list-none p-0 text-nota leading-nota">
        {visual.events.map((event) => (
          <VisualListItem key={`${event.year}-${event.label}`}>
            <strong>{event.year}</strong> · {event.label}:{' '}
            {event.number.own && (
              <>
                <strong>{event.number.text}</strong> <OwnTag />
              </>
            )}
            <SourceRefs
              sources={event.number.sources}
              glued={
                event.number.own ? undefined : (
                  <strong>{event.number.text}</strong>
                )
              }
            />
          </VisualListItem>
        ))}
      </ol>
    </VisualFrame>
  )
}
