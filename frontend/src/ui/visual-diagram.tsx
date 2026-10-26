// The relation diagram: the nodes stacked in one column, the arrows between
// neighbours straight down and the others in arcs on the right, so it fits
// a 360px phone. Each arrow's stroke says what backs it: solid when a study
// tested the cause, dashed when it found only an association, dotted with a
// "?" when it is our inference. The arrowheads are the hand-drawn touch.
// The arrows are an SVG at a fixed 320px, and the nodes HTML boxes over it,
// so axe can measure the text's contrast. The list under it says each arrow
// in words, with its Fact sheets, and is what a screen reader reads.
import type { Evidence } from '@tem-estudo/content'
import type { DiagramView } from '#/content/visuals-view'
import { SourceRefs, VisualFrame, VisualListItem } from './visual-frame'
import { VISUAL_COPY } from './visual.copy'

const WIDTH = 320
const BOX_X = 4
const BOX_W = 212
const LINE = 19
const PAD = 10
const GAP = 44
/** How far right an arc's control points go: the first arc, and the last
 * one, which still keeps the curve and its "?" inside `WIDTH`. */
const NEAREST = BOX_X + BOX_W + 26
const FARTHEST = WIDTH - 12
/** About how many letters of the body type fit in a node's line. */
const LETTERS = 24

const DASH: Record<Evidence, string | undefined> = {
  cause: undefined,
  association: '7 5',
  inference: '0.5 6',
}

function wrap(label: string): string[] {
  const lines: string[] = []
  for (const word of label.split(/\s+/)) {
    const last = lines[lines.length - 1]
    if (last !== undefined && `${last} ${word}`.length <= LETTERS)
      lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  return lines
}

/** The two strokes of a hand-drawn arrowhead at (x, y), pointing at `angle`
 * (radians), a little uneven like a pen's. */
function head(x: number, y: number, angle: number): string {
  const side = (turn: number, length: number) =>
    `${x - length * Math.cos(angle + turn)} ${y - length * Math.sin(angle + turn)}`
  return `M${side(0.5, 10)}L${x} ${y}L${side(-0.42, 9)}`
}

/** One arrow in the list: a short sample of its stroke. */
function StrokeSample({ evidence }: { evidence: Evidence }) {
  return (
    <svg
      width="40"
      height="16"
      viewBox="0 0 40 16"
      aria-hidden="true"
      className="mr-1.5 inline-block align-middle"
    >
      <path
        d="M2 8H36"
        fill="none"
        className="stroke-tinta"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={DASH[evidence]}
      />
      <path
        d={head(37, 8, 0)}
        fill="none"
        className="stroke-tinta"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {evidence === 'inference' && <QuestionMark x={18} y={8} r={7} />}
    </svg>
  )
}

/** The mark of our inference: a "?" drawn in a ring, as strokes, since axe
 * cannot measure the contrast of SVG text. */
function QuestionMark({ x, y, r }: { x: number; y: number; r: number }) {
  const s = r / 9
  return (
    <g
      fill="none"
      className="stroke-tinta"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={x} cy={y} r={r} className="fill-folha" strokeWidth="1.5" />
      <path
        d={`M${x - 2.6 * s} ${y - 2.4 * s}c0-2.2 1.3-3.4 2.9-3.4s2.8 1.1 2.8 2.7c0 2.4-2.9 2.3-2.9 4.6`}
        strokeWidth={1.7 * s}
      />
      <circle
        cx={x + 0.2 * s}
        cy={y + 4.6 * s}
        r={0.6 * s}
        className="fill-tinta"
        strokeWidth={s}
      />
    </g>
  )
}

interface Box {
  readonly y: number
  readonly height: number
  readonly lines: ReadonlyArray<string>
}

/** The nodes one under the other, each as tall as its wrapped label. */
function stack(nodes: DiagramView['nodes']): Box[] {
  const boxes: Box[] = []
  for (const node of nodes) {
    const lines = wrap(node.label)
    const previous = boxes[boxes.length - 1]
    const y = previous ? previous.y + previous.height + GAP : 2
    boxes.push({ y, height: lines.length * LINE + 2 * PAD, lines })
  }
  return boxes
}

/** Each arrow's line, head and middle (where the "?" of an inference goes):
 * the first arrow between two neighbours goes straight; the others arc on
 * the right, each a little further out, and all of them inside the
 * drawing's width. */
function route(arrows: DiagramView['arrows'], boxes: ReadonlyArray<Box>) {
  const seen = new Set<string>()
  const straight = arrows.map((arrow) => {
    const pair = `${Math.min(arrow.from, arrow.to)}-${Math.max(arrow.from, arrow.to)}`
    const first = Math.abs(arrow.from - arrow.to) === 1 && !seen.has(pair)
    seen.add(pair)
    return first
  })
  const arcCount = straight.filter((s) => !s).length
  const step = Math.min(22, (FARTHEST - NEAREST) / Math.max(arcCount - 1, 1))
  let arcs = 0
  return arrows.map((arrow, i) => {
    const from = boxes[arrow.from]
    const to = boxes[arrow.to]
    if (!from || !to) return null
    if (straight[i]) {
      const x = BOX_X + BOX_W / 2
      const down = arrow.to > arrow.from
      const y1 = down ? from.y + from.height + 3 : from.y - 3
      const y2 = down ? to.y - 4 : to.y + to.height + 4
      return {
        d: `M${x} ${y1}V${y2}`,
        head: head(x, y2, down ? Math.PI / 2 : -Math.PI / 2),
        middle: { x, y: (y1 + y2) / 2 },
        evidence: arrow.evidence,
      }
    }
    const reach = NEAREST + step * arcs
    arcs += 1
    const x1 = BOX_X + BOX_W + 3
    const y1 = from.y + from.height / 2
    const x2 = BOX_X + BOX_W + 5
    const y2 = to.y + to.height / 2
    return {
      d: `M${x1} ${y1}C${reach} ${y1} ${reach} ${y2} ${x2} ${y2}`,
      head: head(x2, y2, Math.PI),
      middle: { x: 0.125 * x1 + 0.75 * reach + 0.125 * x2, y: (y1 + y2) / 2 },
      evidence: arrow.evidence,
    }
  })
}

type Route = NonNullable<ReturnType<typeof route>[number]>

/** A node: an HTML box over the arrows' SVG, at the place `stack` gave it.
 * The text is HTML so axe can measure its contrast on the box's paper. */
function NodeBox({ box, label }: { box: Box; label: string }) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-mao border-2 border-tinta bg-folha px-2 text-center font-body text-nota leading-tight"
      style={{ top: box.y, left: BOX_X, width: BOX_W, height: box.height }}
    >
      {label}
    </div>
  )
}

/** An arrow in its stroke, with the "?" in the middle of an inference. */
function ArrowDrawing({ path }: { path: Route }) {
  return (
    <g
      fill="none"
      className="stroke-tinta"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path.d} strokeDasharray={DASH[path.evidence]} />
      <path d={path.head} />
      {path.evidence === 'inference' && (
        <QuestionMark x={path.middle.x} y={path.middle.y} r={9} />
      )}
    </g>
  )
}

/** Each arrow in words: its stroke, the two nodes, what backs it and the
 * Fact sheets. */
function ArrowList({ visual }: { visual: DiagramView }) {
  return (
    <>
      <p className="m-0 mt-sm font-label text-label">{VISUAL_COPY.arrows}</p>
      <ol className="m-0 list-none p-0 text-nota leading-nota">
        {visual.arrows.map((arrow) => (
          <VisualListItem key={`${arrow.from}-${arrow.to}-${arrow.evidence}`}>
            <StrokeSample evidence={arrow.evidence} />
            <strong>
              {visual.nodes[arrow.from]?.label} →{' '}
              {visual.nodes[arrow.to]?.label}
            </strong>{' '}
            <span className="text-tinta-2 italic">
              ({VISUAL_COPY.evidence[arrow.evidence]})
            </span>
            : <SourceRefs sources={arrow.sources} after={arrow.text} />
          </VisualListItem>
        ))}
      </ol>
    </>
  )
}

export function VisualDiagram({ visual }: { visual: DiagramView }) {
  const boxes = stack(visual.nodes)
  const last = boxes[boxes.length - 1]
  const height = last ? last.y + last.height + 4 : 0
  const paths = route(visual.arrows, boxes)
  return (
    <VisualFrame domId={visual.domId} title={visual.title} note={visual.note}>
      <div
        aria-hidden="true"
        className="relative w-80 max-w-full"
        style={{ height }}
        data-slot="diagrama"
      >
        <svg
          width={WIDTH}
          height={height}
          className="absolute inset-0 overflow-visible"
        >
          {paths.map(
            (path, i) =>
              path && <ArrowDrawing key={`${path.d}-${i}`} path={path} />,
          )}
        </svg>
        {boxes.map((box, i) => (
          <NodeBox
            key={visual.nodes[i]?.id}
            box={box}
            label={visual.nodes[i]?.label ?? ''}
          />
        ))}
      </div>
      <ArrowList visual={visual} />
    </VisualFrame>
  )
}
