// The tones of a stacked bar's parts (#476): ink over paper, from a light
// wash for the first answer to full ink for the last, so the order reads in
// black and white, without the three highlighters (DESIGN.md gives each a
// fixed role). The plot (`visual-chart-plot.tsx`) and its legend
// (`visual-chart.tsx`) share them.

const LIGHTEST = 0.12

/** The ink's opacity of part `part` of `parts`, and the colour of the
 * value written on it, which must read on that tone. */
export function partTone(part: number, parts: number) {
  const opacity =
    parts <= 1 ? 1 : LIGHTEST + ((1 - LIGHTEST) * part) / (parts - 1)
  return {
    opacity,
    text: opacity < 0.5 ? 'var(--color-tinta)' : 'var(--color-folha)',
  }
}
