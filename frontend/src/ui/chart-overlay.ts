// Our own drawing over the chart library's SVG (#470, DESIGN.md): the pink
// marker behind the key value, the hand ring around Brazil and the yellow
// "você" tag. It goes into the library's markup (`renderSvg`), so the server
// sends it inside the complete SVG and the browser's updates reconcile it
// with the rest. Each mark is a variant of `OverlayMark`, never drawn by
// hand at the call.
import { CHART_COPY } from './visual-chart.copy'

/** Where a point's mark ends on the chart, in scene pixels, and what our
 * layer draws on it. */
export interface OverlayMark {
  readonly key: string
  /** The end of the bar or the center of the dot. */
  readonly x: number
  readonly y: number
  /** The value label right after the mark, which the pink marker covers. */
  readonly valueText: string
  readonly highlight: boolean
  readonly brazil: boolean
  readonly you: boolean
  /** On a time line the value sits centered this far above its dot, and
   * the "você" tag above the value, instead of after the mark and on the
   * row's label line. */
  readonly valueAbove?: number
}

/** The value label's offset after the mark and its rough letter width, the
 * same numbers `visual-chart-plot.tsx` gives the library's `text` mark. */
export const VALUE_DX = 10
const LETTER = 7.4
const LABEL_HEIGHT = 20

const escape = (text: string) =>
  text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)

/** The pink marker of `.numero-chave` (`drawings.css`), as a path in a box
 * of `width` × `height`: the edges tremble a little, like the hand's. */
function marker(x: number, y: number, width: number) {
  const h = LABEL_HEIGHT
  const top = y - h / 2
  const right = x + width
  return `<path data-ts-key="marcador" d="M${x - 2} ${top + 2}C${x + width * 0.3} ${top} ${x + width * 0.7} ${top + 1} ${right + 2} ${top}l1 ${h / 2 - 1}-1 ${h / 2 + 1}C${x + width * 0.6} ${top + h + 1} ${x + width * 0.3} ${top + h} ${x - 3} ${top + h + 1}l-1-${h / 2}z" fill="var(--color-rosa-mito)"/>`
}

/** The hand ring of the references, around Brazil's mark: the stroke runs
 * a little past where it started. */
function ring(x: number, y: number) {
  const r = 11
  return `<path data-ts-key="brasil" d="M${x + r} ${y - 2}C${x + r} ${y - r} ${x - r + 1} ${y - r - 1} ${x - r} ${y}C${x - r + 1} ${y + r} ${x + r} ${y + r + 1} ${x + r + 1} ${y - 4}" fill="none" stroke="var(--color-tinta)" stroke-width="1.8" stroke-linecap="round"/>`
}

/** The "você" tag, yellow like every "vale para você", at the right edge of
 * the plot on the row's label line. */
const tagWidth = () => CHART_COPY.you.length * LETTER + 10

function you(right: number, y: number) {
  const text = CHART_COPY.you
  const width = tagWidth()
  return `<g data-ts-key="voce"><rect x="${right - width}" y="${y - 9}" width="${width}" height="18" rx="4" fill="var(--color-amarelo-voce)"/><text x="${right - 5}" y="${y}" text-anchor="end" dominant-baseline="central" font-size="12" font-weight="700" fill="var(--color-tinta)">${escape(text)}</text></g>`
}

/** The layer under the library's marks (the marker, so the value stays on
 * top of it) and the one over them (the ring and the tag). `labelY` is
 * where a row's label line is, from its mark's `y`; `right` is the plot's
 * right edge. */
export function overlayLayers(
  marks: ReadonlyArray<OverlayMark>,
  { labelOffset, right }: { labelOffset: number; right: number },
): { under: string; over: string } {
  const valueWidth = (m: OverlayMark) => m.valueText.length * LETTER + 6
  const under = marks
    .filter((m) => m.highlight)
    .map((m) => {
      const drawn =
        m.valueAbove === undefined
          ? marker(m.x + VALUE_DX - 3, m.y, valueWidth(m))
          : // The library centers the value's line `valueAbove` over the
            // dot.
            marker(m.x - valueWidth(m) / 2, m.y - m.valueAbove, valueWidth(m))
      return `<g data-ts-key="sob-${escape(m.key)}">${drawn}</g>`
    })
  const over = marks
    .filter((m) => m.brazil || m.you)
    .map((m) => {
      const tag = !m.you
        ? ''
        : m.valueAbove === undefined
          ? you(right, m.y - labelOffset)
          : you(m.x + tagWidth() / 2, m.y - m.valueAbove - LABEL_HEIGHT - 2)
      return `<g data-ts-key="sobre-${escape(m.key)}">${m.brazil ? ring(m.x, m.y) : ''}${tag}</g>`
    })
  return {
    under: `<g class="sobreposicao-sob" data-ts-key="sobreposicao-sob" aria-hidden="true">${under.join('')}</g>`,
    over: `<g class="sobreposicao" data-ts-key="sobreposicao" aria-hidden="true">${over.join('')}</g>`,
  }
}

/** The library's SVG with our two layers: the lower one right after the
 * opening tag and its `<desc>`/`<defs>`, the upper one at the end. */
export function withOverlay(
  svg: string,
  layers: { under: string; over: string },
  defs = '',
): string {
  const open = svg.indexOf('>') + 1
  const end = svg.lastIndexOf('</svg>')
  if (open <= 0 || end < 0) return svg
  return `${svg.slice(0, open)}${defs}${layers.under}${svg.slice(open, end)}${layers.over}${svg.slice(end)}`
}
