// Table 1 (p. 3) gives, per gender, how many selfies were coded as taken from
// above (+1), from below (-1) and frontal (0). The article never states the
// analysed sample; the first line prints it from those counts. It matches the
// degrees of freedom of the tests: t(206), t(348) and Levene's F(1, 554).
//
// The rest checks the article against itself. For women, Table 1 prints
// "58 (25.5%)" above and "89 (16.6%)" below, but 58 of 349 is 16.6% and 89 of
// 349 is 25.5%: counts and percentages are swapped. The text reports
// M = 0.089 and t(348) = 2.577 for women and a Welch F(1, 398.4) = 24.94
// between genders. Those only come out with 89 above and 58 below.
//
//   node scripts/calculations/sedgewick-2017-angulo-selfie-tinder.ts
interface Poses {
  readonly above: number
  readonly below: number
  readonly frontal: number
}

const men: Poses = { above: 35, below: 79, frontal: 93 }
const womenAsPrinted: Poses = { above: 58, below: 89, frontal: 202 }
const womenSwapped: Poses = { above: 89, below: 58, frontal: 202 }

function describe({ above, below, frontal }: Poses) {
  const n = above + below + frontal
  const mean = (above - below) / n
  const sd = Math.sqrt((above + below - n * mean * mean) / (n - 1))
  return { n, mean, sd, t: mean / (sd / Math.sqrt(n)), d: mean / sd }
}

/** Welch's F for two groups: the square of Welch's t. */
function welch(a: Poses, b: Poses) {
  const x = describe(a)
  const y = describe(b)
  const vx = x.sd ** 2 / x.n
  const vy = y.sd ** 2 / y.n
  const f = (x.mean - y.mean) ** 2 / (vx + vy)
  const df = (vx + vy) ** 2 / (vx ** 2 / (x.n - 1) + vy ** 2 / (y.n - 1))
  return { f, df }
}

const share = (part: number, whole: number) => ((part / whole) * 100).toFixed(1)

const m = describe(men)
const printed = describe(womenAsPrinted)
const swapped = describe(womenSwapped)

console.log(
  `analysed selfies: ${m.n} men + ${printed.n} women = ${m.n + printed.n}`,
)
console.log(
  `women, Table 1 as printed: ${womenAsPrinted.above} above = ${share(womenAsPrinted.above, printed.n)}%, ${womenAsPrinted.below} below = ${share(womenAsPrinted.below, printed.n)}%`,
)
console.log(
  `men: M = ${m.mean.toFixed(3)}, SD = ${m.sd.toFixed(3)}, t = ${m.t.toFixed(3)}, M/SD = ${Math.abs(m.d).toFixed(3)}`,
)
console.log(
  `women as printed: M = ${printed.mean.toFixed(3)}, t = ${printed.t.toFixed(3)}, Welch F = ${welch(men, womenAsPrinted).f.toFixed(2)}`,
)
console.log(
  `women swapped: M = ${swapped.mean.toFixed(3)}, SD = ${swapped.sd.toFixed(3)}, t = ${swapped.t.toFixed(3)}, M/SD = ${swapped.d.toFixed(3)}, Welch F = ${welch(men, womenSwapped).f.toFixed(2)} with df ${welch(men, womenSwapped).df.toFixed(1)}`,
)
