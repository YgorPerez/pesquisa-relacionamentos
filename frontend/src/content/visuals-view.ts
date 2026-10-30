// A Guide's Visuals in the shape the `ui/visual-*` pieces draw, and
// drawn here, on the server, into the HTML that takes the place of each
// `{{visual:<id>}}` line of the body (`view.ts`). The page gets finished SVG
// and HTML: no chart code goes to the browser, and the Visual reads without
// JS (#182). The Visuals the chart library draws go through `chart-view.ts`
// instead (ADR 0042, "SVG from the server, interaction on top"): every bar
// comparison (#473), Study table (#475), time line (#474) and stacked bar
// comparison (#476). Only the diagram is drawn here.
import type { Calculation, DiagramVisual, Evidence } from '@tem-estudo/content'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { VisualDiagram } from '#/ui/visual-diagram'
import { VISUAL_COPY } from '#/ui/visual.copy'

/** A reference to a cited Fact sheet: its number on the page, the anchor of
 * its item in the list and its title, for the ring's label. */
export interface SourceRef {
  readonly n: number
  readonly anchor: string
  readonly title: string
}

/** How the page numbers its Fact sheets (`guide-view.ts`). */
export type Cite = (slug: string) => SourceRef | undefined

/** A number as the Visual writes it, and where it comes from. */
export interface NumberView {
  /** "18%", "0,1 ponto". */
  readonly text: string
  /** The own calculation written out ("100 − 18"), or `null` when the
   * number is a Fact sheet's. */
  readonly own: string | null
  readonly sources: ReadonlyArray<SourceRef>
}

interface Common {
  readonly id: string
  /** The figure's id on the page. */
  readonly domId: string
  readonly title: string
  readonly note: string | null
  /** Every Fact sheet the Visual cites, in the page's order. */
  readonly sources: ReadonlyArray<SourceRef>
}

export interface DiagramView extends Common {
  readonly kind: 'diagram'
  readonly nodes: ReadonlyArray<{ readonly id: string; readonly label: string }>
  readonly arrows: ReadonlyArray<{
    /** The positions of the two nodes in `nodes`. */
    readonly from: number
    readonly to: number
    readonly evidence: Evidence
    readonly text: string
    readonly sources: ReadonlyArray<SourceRef>
  }>
}

export type VisualView = DiagramView

/** A Visual drawn here, as HTML: every other kind is the chart library's,
 * or a `ChartTable` (`chart-view.ts`). */
export type HtmlVisual = DiagramVisual

const decimalsOf = (value: number) => String(value).split('.')[1]?.length ?? 0

/** A number in pt-BR, with the decimals it was written with. */
export function formatNumber(
  value: number,
  decimals = decimalsOf(value),
): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export const withUnit = (value: number, unit: string) =>
  unit === '%' ? `${formatNumber(value)}%` : `${formatNumber(value)} ${unit}`

const OPERATOR: Record<
  Exclude<Calculation['operation'], 'mean' | 'complement'>,
  string
> = {
  difference: ' − ',
  sum: ' + ',
  ratio: ' ÷ ',
}

/** "24 − 18", "100 − 18", "média de 1, 2 e 3". */
function expression(calculation: Calculation): string {
  const inputs = calculation.inputs.map((i) => formatNumber(i.value))
  switch (calculation.operation) {
    case 'complement':
      return `100 − ${inputs[0] ?? ''}`
    case 'mean':
      return VISUAL_COPY.mean(inputs)
    default:
      return inputs.join(OPERATOR[calculation.operation])
  }
}

function refsOf(slugs: ReadonlyArray<string>, cite: Cite): SourceRef[] {
  const refs = [...new Set(slugs)].flatMap((slug) => {
    const ref = cite(slug)
    return ref ? [ref] : []
  })
  return refs.sort((a, b) => a.n - b.n)
}

export function numberView(
  datum: {
    value: number
    fact_sheet?: string | undefined
    calculation?: Calculation | undefined
  },
  unit: string,
  cite: Cite,
): NumberView {
  const slugs = datum.calculation
    ? datum.calculation.inputs.map((i) => i.fact_sheet)
    : datum.fact_sheet
      ? [datum.fact_sheet]
      : []
  return {
    text: withUnit(datum.value, unit),
    own: datum.calculation ? expression(datum.calculation) : null,
    sources: refsOf(slugs, cite),
  }
}

/** The references of every part, once each, in the page's order. */
export const allSources = (
  parts: ReadonlyArray<{ sources: ReadonlyArray<SourceRef> }>,
): SourceRef[] =>
  [
    ...new Map(
      parts.flatMap((p) => p.sources).map((s) => [s.anchor, s]),
    ).values(),
  ].sort((a, b) => a.n - b.n)

/** The axis's round steps: 1, 2, 2.5 or 5 times a power of ten, so that it
 * has at most five intervals. */
export function axisTicks(
  largest: number,
  max: number | undefined,
  unit: string,
) {
  const top = max ?? (unit === '%' && largest <= 100 ? 100 : largest)
  const magnitude = 10 ** Math.floor(Math.log10(top / 5 || 1))
  const step =
    [1, 2, 2.5, 5, 10]
      .map((m) => m * magnitude)
      .find((s) => Math.ceil(top / s - 1e-9) <= 5) ?? top
  const end = max ?? Math.ceil(top / step - 1e-9) * step
  const ticks: number[] = []
  for (let at = 0; at <= end + 1e-9; at += step)
    ticks.push(Number(at.toFixed(6)))
  if (max !== undefined && ticks[ticks.length - 1] !== max) {
    // A round tick half a step or less from the top would print on top of
    // it (6 and 7 on a scale of 1 to 7): the top takes its place.
    const last = ticks[ticks.length - 1] ?? 0
    if (last > 0 && max - last <= step / 2) ticks.pop()
    ticks.push(max)
  }
  return ticks
}

/** A kind's own part of the view; `visualView` adds the common one. */
type Own<V extends VisualView> = Omit<V, Exclude<keyof Common, 'sources'>>

function diagramView(visual: DiagramVisual, cite: Cite): Own<DiagramView> {
  const position = (id: string) => visual.nodes.findIndex((n) => n.id === id)
  const arrows = visual.arrows.map((arrow) => ({
    from: position(arrow.from),
    to: position(arrow.to),
    evidence: arrow.evidence,
    text: arrow.text,
    sources: refsOf(arrow.fact_sheets, cite),
  }))
  return {
    kind: 'diagram',
    nodes: visual.nodes.map((n) => ({ id: n.id, label: n.label })),
    arrows,
    sources: allSources(arrows),
  }
}

/** `scope` is the Topic's slug, which keeps the figure's id apart from the
 * page's other ids. */
export function visualView(
  visual: HtmlVisual,
  cite: Cite,
  scope: string,
): VisualView {
  return {
    id: visual.id,
    domId: `visual-${scope}-${visual.id}`,
    title: visual.title,
    note: visual.note ?? null,
    ...diagramView(visual, cite),
  }
}

/** HTML that React drew from a Visual's view: React escapes every text it
 * puts in, and the view only carries the library's checked data, so it goes
 * into the page past `safe-html.ts`, which would strip the SVG. */
export type RenderedVisual = string & { readonly __rendered: unique symbol }

function render(view: VisualView): RenderedVisual {
  return renderToStaticMarkup(
    createElement(VisualDiagram, { visual: view }),
  ) as RenderedVisual
}

/** Each Visual of the Question drawn, by id, for `html()` to put in place of
 * its `{{visual:<id>}}` line. */
export function renderVisuals(
  visuals: ReadonlyArray<HtmlVisual>,
  cite: Cite,
  scope: string,
): ReadonlyMap<string, RenderedVisual> {
  return new Map(
    visuals.map((visual) => [
      visual.id,
      render(visualView(visual, cite, scope)),
    ]),
  )
}
