// The tones of a stacked bar's parts (#476): ink over paper, from a light
// wash for the first answer to full ink for the last, so the order reads in
// black and white, without the three highlighters (DESIGN.md gives each a
// fixed role). The plot (`visual-chart-plot.tsx`) and its legend
// (`visual-chart.tsx`) share them.
import { INK, PAPER } from './chart-tones'

const LIGHTEST = 0.12
/** Each part's value is written inside it, in 12px bold: ink reads at AA
 * (4.5:1) up to about 0.54 of ink, paper from about 0.6. A tone between
 * would read in neither, so it moves to the nearer of these two edges
 * (`chart-tones.test.ts` checks every tone). */
const INK_TEXT_UP_TO = 0.5
const PAPER_TEXT_FROM = 0.65

/** The ink's opacity of part `part` of `parts`, and the colour of the
 * value written on it, which must read on that tone. */
export function partTone(part: number, parts: number) {
  const even = parts <= 1 ? 1 : LIGHTEST + ((1 - LIGHTEST) * part) / (parts - 1)
  const middle = (INK_TEXT_UP_TO + PAPER_TEXT_FROM) / 2
  const opacity =
    even <= INK_TEXT_UP_TO || even >= PAPER_TEXT_FROM
      ? even
      : even < middle
        ? INK_TEXT_UP_TO
        : PAPER_TEXT_FROM
  return { opacity, text: opacity <= INK_TEXT_UP_TO ? INK : PAPER }
}
