// The words the library charts write (#470), in one place, as `chart-tones.ts`
// is for their colours: the plot (`visual-chart-plot.tsx`) sets these sizes
// on the library's text marks, and the plot's layout and our layer over it
// (`chart-overlay.ts`) guess from the same numbers how far a text runs. The
// server lays the SVG out without measuring a letter, so each `letter` is a
// rough average width, a little generous.

/** A row's label above its mark: a bar's, or a Study's title in bold. */
export const LABEL = { fontSize: 13, letter: 6.6, boldLetter: 7 } as const
/** A Study's measure, a range's countries, a stacked part's value. */
export const SMALL = { fontSize: 12 } as const
/** The value after a mark, or above a time line's dot: `letter` hugs it
 * (the pink marker behind it), `wideLetter` leaves room for the longest. */
export const VALUE = {
  fontSize: 14,
  fontWeight: 700,
  letter: 7.4,
  wideLetter: 8.2,
} as const
/** The yellow "você" tag. */
export const TAG = { fontSize: 12, fontWeight: 700, letter: 7.4 } as const
/** How far the value starts after its bar. */
export const VALUE_DX = 10
