// The colours the library charts write and paint with (#470), in one place:
// the plot (`visual-chart-plot.tsx`) and our layer over it
// (`chart-overlay.ts`) use these, and `chart-tones.test.ts` checks every text
// against what lies under it, because axe cannot measure text inside an SVG
// (`e2e/accessibility.e2e.ts`). Each is a `tokens.css` variable.

/** Ink: marks, labels and values. */
export const INK = 'var(--color-tinta)'
/** The page under the chart. */
export const PAPER = 'var(--color-folha)'
/** Axis ticks, and the text of a point another country dims. */
export const MUTED = 'var(--color-tinta-2)'
/** The pink marker behind the key value. */
export const MARKER = 'var(--color-rosa-mito)'
/** The "você" tag's yellow. */
export const YOU = 'var(--color-amarelo-voce)'
/** The opacity of a mark that another row's card dims. */
export const DIMMED = 0.28
/** The opacity of a mark a filter (the country, the legend) left out: fainter
 * than `DIMMED`, so what matches still shows while a row has the card. */
export const FILTERED_OUT = 0.16
/** The verde-água behind the active row, a mark that leads to its Fact sheet
 * (#499), at this opacity over the page. The Study table's row writes the same
 * in its class (`bg-agua-fonte/32`), and DESIGN.md says 32%. */
export const ACTIVE = 'var(--color-agua-fonte)'
export const ACTIVE_OPACITY = 0.32
/** A time line's guide and the row's outline. */
export const ACTIVE_LINE = 'var(--color-agua-tinta)'
