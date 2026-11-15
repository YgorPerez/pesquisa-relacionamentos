// Recomputes the two-sided p-value of the F(1, df) and t(df) tests that
// Glikson, Cheshin and van Kleef (2018) print in Experiments 2 and 3, to set
// against the p the article prints next to each one. F(1, df) is t(df) squared,
// so both go through the Student t distribution. The Fact sheet uses this only
// in its Limitações; no Achados row depends on it.
//
//   node scripts/calculations/glikson-2018-smiley-primeira-impressao.ts

// ln Γ(x), Lanczos approximation.
function logGamma(x: number): number {
  const c = [
    76.1800917294715, -86.5053203294168, 24.0140982408309, -1.23173957245016,
    0.00120865097386618, -0.000005395239384953,
  ]
  let y = x
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5)
  let ser = 1.000000000190015
  for (const k of c) ser += k / ++y
  return -tmp + Math.log((Math.sqrt(2 * Math.PI) * ser) / x)
}

// Continued fraction of the regularized incomplete beta (Numerical Recipes).
function betaCf(a: number, b: number, x: number): number {
  const tiny = 1e-30
  let c = 1
  let d = 1 - ((a + b) * x) / (a + 1)
  if (Math.abs(d) < tiny) d = tiny
  d = 1 / d
  let h = d
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < tiny) d = tiny
    c = 1 + aa / c
    if (Math.abs(c) < tiny) c = tiny
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1))
    d = 1 + aa * d
    if (Math.abs(d) < tiny) d = tiny
    c = 1 + aa / c
    if (Math.abs(c) < tiny) c = tiny
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-12) break
  }
  return h
}

function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const front = Math.exp(
    logGamma(a + b) -
      logGamma(a) -
      logGamma(b) +
      a * Math.log(x) +
      b * Math.log(1 - x),
  )
  return x < (a + 1) / (a + b + 2)
    ? (front * betaCf(a, b, x)) / a
    : 1 - (front * betaCf(b, a, 1 - x)) / b
}

/** Two-sided p of a t statistic with df degrees of freedom. */
const pFromT = (t: number, df: number) =>
  incompleteBeta(df / 2, 0.5, df / (df + t * t))

const tests: Array<[label: string, t: number, df: number, printed: string]> = [
  ['Exp. 2, competence, F(1, 87) = 6.26', Math.sqrt(6.26), 87, '.003'],
  ['Exp. 2, information sharing, F(1, 87) = 4.50', Math.sqrt(4.5), 87, '.014'],
  [
    'Exp. 3, warmth, smiley x formality, F(1, 80) = 2.38',
    Math.sqrt(2.38),
    80,
    '.058',
  ],
  ['Exp. 3, competence, smiley, F(1, 80) = 7.83', Math.sqrt(7.83), 80, '.001'],
  [
    'Exp. 3, competence, smiley x formality, F(1, 80) = 5.57',
    Math.sqrt(5.57),
    80,
    '.001',
  ],
  [
    'Exp. 3, appropriateness, smiley x formality, F(1, 80) = 4.34',
    Math.sqrt(4.34),
    80,
    '.003',
  ],
]

for (const [label, t, df, printed] of tests)
  console.log(`${label}: p = ${pFromT(t, df).toFixed(3)} (printed ${printed})`)
