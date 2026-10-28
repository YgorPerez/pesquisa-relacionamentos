// The hand-drawn loop around the cited Fact sheet (DESIGN.md, signature). The
// drawing comes in a 100 × 100 box and is redone at the Fact sheet's real
// size, so the stroke does not deform as it would with
// `preserveAspectRatio="none"`.
const LOOP_100 =
  'M7 7C35 2 75 3 96 7c3 25 3 60-1 86-30 4-65 4-91 1C1 70 1 35 4 5'

/** The loop's path in a `width` × `height` box: the numbers alternate
 * between x and y. */
export function loopPath(width: number, height: number): string {
  let i = 0
  return LOOP_100.replace(/-?\d+(\.\d+)?/g, (n) =>
    (((i++ % 2 === 0 ? width : height) * Number(n)) / 100).toFixed(1),
  )
}

/** How the page scrolls to what the loop circles, and back to the text:
 * smooth, unless the reader asked for less motion. */
export const scrollBehavior = (): ScrollBehavior =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
