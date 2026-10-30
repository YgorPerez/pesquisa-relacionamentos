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
/** The opacity of a mark the chosen country dims. */
export const DIMMED = 0.22
