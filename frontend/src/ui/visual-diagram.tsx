// The relation diagram: the nodes stacked in one column, the arrows between
// neighbours straight down and the others in arcs on the right. Each
// arrow's stroke says what backs it: solid when a study tested the cause,
// dashed when it found only an association, dotted with a "?" when it is
// our inference. The arrowheads are the hand-drawn touch.
// The drawing is fluid up to 320px, so it fits a phone narrower than 340px:
// the nodes are HTML boxes as wide as the column minus the lane on the
// right where the arcs go, so axe can measure the text's contrast. The
// straight arrows are a narrow SVG at the boxes' centre, and the arcs an
// SVG in the lane, each as wide as its arcs need. The list under it says
// each arrow in words, with its Fact sheets, and is what a screen reader
// reads.
import type { Evidence } from '@tem-estudo/content'
import type { DiagramView } from '#/content/visuals-view'
import { SourceRefs, VisualFrame, VisualListItem } from './visual-frame'
import { VISUAL_COPY } from './visual.copy'

const BOX_X = 4
const LINE = 19
const PAD = 10
const GAP = 44
/** How far from the boxes' right edge the arcs reach: the first one, the
 * step to the next, and the room after the last for its "?". */
const ARC_FIRST = 26
const ARC_STEP = 22
const ARC_END = 14
/** The narrowest column the labels are wrapped for: a 320px phone minus the
 * page's margins. On a wider column the boxes only get some air. */
const NARROWEST = 280
/** About how wide a letter of the body type is in a node, in px. */
const LETTER_PX = 8.2
/** The width of the SVG that draws the straight arrows, at the boxes'
 * centre. */
const SPINE = 24

/** The lane on the right that holds `arcs` arcs, in px. */
const laneFor = (arcs: number) =>
  arcs === 0 ? 0 : ARC_FIRST + ARC_STEP * (arcs - 1) + ARC_END

/** About how many letters fit in a node's line at the narrowest column. */
const lettersFor = (lane: number) =>
  Math.floor((NARROWEST - BOX_X - lane - 2 * PAD) / LETTER_PX)

const DASH: Record<Evidence, string | undefined> = {
  cause: undefined,
  association: '7 5',
  inference: '0.5 6',
}

function wrap(label: string, letters: number): string[] {
  const lines: string[] = []
  for (const word of label.split(/\s+/)) {
    const last = lines[lines.length - 1]
    if (last !== undefined && `${last} ${word}`.length <= letters)
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

/** The nodes one under the other, each as tall as its label wrapped at the
 * narrowest column. */
function stack(nodes: DiagramView['nodes'], letters: number): Box[] {
  const boxes: Box[] = []
  for (const node of nodes) {
    const lines = wrap(node.label, letters)
    const previous = boxes[boxes.length - 1]
    const y = previous ? previous.y + previous.height + GAP : 2
    boxes.push({ y, height: lines.length * LINE + 2 * PAD, lines })
  }
  return boxes
}

/** Which arrows go straight: the first one between two neighbours. */
function straightArrows(arrows: DiagramView['arrows']): boolean[] {
  const seen = new Set<string>()
  return arrows.map((arrow) => {
    const pair = `${Math.min(arrow.from, arrow.to)}-${Math.max(arrow.from, arrow.to)}`
    const first = Math.abs(arrow.from - arrow.to) === 1 && !seen.has(pair)
    seen.add(pair)
    return first
  })
}

/** Each arrow's line, head and middle (where the "?" of an inference goes),
 * and whether it goes straight: then in the spine's coordinates, centred on
 * `SPINE / 2`; otherwise it arcs in the lane's, which start at the boxes'
 * right edge, each arc a little further out. */
function route(
  arrows: DiagramView['arrows'],
  straight: ReadonlyArray<boolean>,
  boxes: ReadonlyArray<Box>,
) {
  let arcs = 0
  return arrows.map((arrow, i) => {
    const from = boxes[arrow.from]
    const to = boxes[arrow.to]
    if (!from || !to) return null
    if (straight[i]) {
      const x = SPINE / 2
      const down = arrow.to > arrow.from
      const y1 = down ? from.y + from.height + 3 : from.y - 3
      const y2 = down ? to.y - 4 : to.y + to.height + 4
      return {
        d: `M${x} ${y1}V${y2}`,
        head: head(x, y2, down ? Math.PI / 2 : -Math.PI / 2),
        middle: { x, y: (y1 + y2) / 2 },
        evidence: arrow.evidence,
        straight: true,
      }
    }
    const reach = ARC_FIRST + ARC_STEP * arcs
    arcs += 1
    const x1 = 3
    const y1 = from.y + from.height / 2
    const x2 = 5
    const y2 = to.y + to.height / 2
    return {
      d: `M${x1} ${y1}C${reach} ${y1} ${reach} ${y2} ${x2} ${y2}`,
      head: head(x2, y2, Math.PI),
      middle: { x: 0.125 * x1 + 0.75 * reach + 0.125 * x2, y: (y1 + y2) / 2 },
      evidence: arrow.evidence,
      straight: false,
    }
  })
}

type Route = NonNullable<ReturnType<typeof route>[number]>

/** A node: an HTML box at the place `stack` gave it, as wide as the column
 * minus the arcs' lane. The text is HTML so axe can measure its contrast on
 * the box's paper. */
function NodeBox({
  box,
  label,
  lane,
}: {
  box: Box
  label: string
  lane: number
}) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-mao border-2 border-tinta bg-folha px-2 text-center font-body text-nota leading-tight"
      style={{ top: box.y, left: BOX_X, right: lane, height: box.height }}
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

/** Some arrows, each in its stroke, inside the SVG that holds them. Each
 * line is unique: a second arrow between the same two nodes arcs. */
function Arrows({ paths }: { paths: ReadonlyArray<Route> }) {
  return paths.map((path) => <ArrowDrawing key={path.d} path={path} />)
}

export function VisualDiagram({ visual }: { visual: DiagramView }) {
  const straight = straightArrows(visual.arrows)
  const lane = laneFor(straight.filter((s) => !s).length)
  const boxes = stack(visual.nodes, lettersFor(lane))
  const last = boxes[boxes.length - 1]
  const height = last ? last.y + last.height + 4 : 0
  const paths = route(visual.arrows, straight, boxes).filter(
    (path): path is Route => path !== null,
  )
  return (
    <VisualFrame domId={visual.domId} title={visual.title} note={visual.note}>
      <div
        aria-hidden="true"
        className="relative w-80 max-w-full"
        style={{ height }}
        data-slot="diagrama"
      >
        <svg
          width={SPINE}
          height={height}
          className="absolute top-0 overflow-visible"
          style={{
            left: `calc(${BOX_X}px + (100% - ${BOX_X + lane}px) / 2 - ${SPINE / 2}px)`,
          }}
        >
          <Arrows paths={paths.filter((p) => p.straight)} />
        </svg>
        {lane > 0 && (
          <svg
            width={lane}
            height={height}
            className="absolute top-0 right-0 overflow-visible"
          >
            <Arrows paths={paths.filter((p) => !p.straight)} />
          </svg>
        )}
        {boxes.map((box, i) => (
          <NodeBox
            key={visual.nodes[i]?.id}
            box={box}
            label={visual.nodes[i]?.label ?? ''}
            lane={lane}
          />
        ))}
      </div>
      <ArrowList visual={visual} />
    </VisualFrame>
  )
}
