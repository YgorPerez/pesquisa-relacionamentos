// The bar comparison: one bar per number on one axis from zero, exact. Each
// row is the label and the value in HTML, so they wrap on a 360px phone and
// a screen reader reads them, over a bar drawn in an SVG in percentages of
// the column, so every row keeps the same scale at any width. The SVG has
// no text: axe could not measure its contrast. The only hand-drawn touch is
// the key number's pink marker on the highlighted value.
import type { BarsView } from '#/content/visuals-view'
import { cn } from '@/platform/cn'
import { OwnTag, VisualFrame } from './visual-frame'
import { VISUAL_COPY } from './visual.copy'

const at = (share: number) => `${share * 100}%`
const BAR = 18

type Bar = BarsView['bars'][number]

/** The hatch that fills a bar of our own calculation. */
function Hatch({ id }: { id: string }) {
  return (
    <defs>
      <pattern
        id={id}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="6"
          className="stroke-tinta"
          strokeWidth="2.2"
        />
      </pattern>
    </defs>
  )
}

/** One bar over the axis's grid. */
function BarDrawing({
  bar,
  ticks,
  hatchId,
}: {
  bar: Bar
  ticks: BarsView['ticks']
  hatchId: string
}) {
  const own = bar.number.own !== null
  return (
    <svg
      width="100%"
      height={BAR + 6}
      aria-hidden="true"
      className="mt-1 block overflow-visible"
    >
      {own && <Hatch id={hatchId} />}
      {ticks.map((tick) => (
        <line
          key={tick.at}
          x1={at(tick.at)}
          x2={at(tick.at)}
          y1="0"
          y2={BAR + 6}
          className="stroke-tinta-2 opacity-25"
          strokeWidth="1"
        />
      ))}
      <rect
        x="0"
        y="3"
        width={at(bar.share)}
        height={BAR}
        rx="2"
        className={own ? 'stroke-tinta' : 'fill-tinta'}
        fill={own ? `url(#${hatchId})` : undefined}
        strokeWidth={own ? 1.5 : undefined}
      />
    </svg>
  )
}

/** The axis under the bars: a rule and the round values, in HTML. */
function Axis({ ticks }: { ticks: BarsView['ticks'] }) {
  const last = ticks.length - 1
  return (
    <div
      aria-hidden="true"
      className="relative mt-1 h-5 border-t border-tinta font-label text-miudo text-tinta-2"
    >
      {ticks.map((tick, i) => (
        <span
          key={tick.at}
          className={cn(
            'absolute top-1',
            i === last ? '-translate-x-full' : i > 0 && '-translate-x-1/2',
          )}
          style={{ left: at(tick.at) }}
        >
          {tick.text}
        </span>
      ))}
    </div>
  )
}

export function VisualBars({ visual }: { visual: BarsView }) {
  const ownLines = visual.bars.flatMap((bar) =>
    bar.number.own
      ? [VISUAL_COPY.ownLine(bar.label, bar.number.own, bar.number.text)]
      : [],
  )
  return (
    <VisualFrame
      domId={visual.domId}
      title={visual.title}
      note={visual.note}
      ownLines={ownLines}
      sources={visual.sources}
    >
      <ol className="m-0 list-none p-0" data-slot="barras">
        {visual.bars.map((bar, i) => (
          <li key={bar.label} className="mt-sm first:mt-0">
            <span className="flex flex-wrap items-baseline gap-x-2 font-label text-label">
              <span>{bar.label}</span>
              {bar.number.own && <OwnTag />}
              <span className={cn('ml-auto', bar.highlight && 'numero-chave')}>
                {bar.number.text}
              </span>
            </span>
            <BarDrawing
              bar={bar}
              ticks={visual.ticks}
              hatchId={`${visual.domId}-hachura-${i}`}
            />
          </li>
        ))}
      </ol>
      <Axis ticks={visual.ticks} />
    </VisualFrame>
  )
}
