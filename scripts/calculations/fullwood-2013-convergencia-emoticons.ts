// Fullwood, Orchard & Floyd (2013), emoticons in chat rooms.
//
//   node scripts/calculations/fullwood-2013-convergencia-emoticons.ts
//     Table 1 (p. 6): share of chatters who used emoticons, by sex, out of
//     all chatters of that sex. The table's bracketed percentages divide the
//     users by the non-users (60/405 = 14.81%), not by the total (465).
//   node scripts/calculations/fullwood-2013-convergencia-emoticons.ts two-sided
//     Table 6 (pp. 7-8): two-sided p of the winking and hugging t tests,
//     t(105) = -1.908 and 1.724, which the table reports as p < 0.05.
const percent = (part: number, whole: number) =>
  `${((part / whole) * 100).toFixed(1).replace('.', ',')}%`

// Lanczos approximation of ln Γ(x), enough for the t density's constant.
function logGamma(x: number): number {
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  let a = c[0] ?? 0
  const t = x - 1 + g + 0.5
  for (let i = 1; i < g + 2; i++) a += (c[i] ?? 0) / (x - 1 + i)
  return 0.5 * Math.log(2 * Math.PI) + (x - 0.5) * Math.log(t) - t + Math.log(a)
}

// Two-sided p of a t statistic: 1 - 2 × the area of the density from 0 to |t|,
// by Simpson's rule.
function twoSidedP(t: number, df: number): number {
  const constant = Math.exp(
    logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI),
  )
  const density = (x: number) =>
    constant * (1 + (x * x) / df) ** (-(df + 1) / 2)
  const steps = 10_000
  const h = Math.abs(t) / steps
  let sum = density(0) + density(Math.abs(t))
  for (let i = 1; i < steps; i++) sum += (i % 2 === 0 ? 2 : 4) * density(i * h)
  return 1 - 2 * ((sum * h) / 3)
}

if (process.argv[2] === 'two-sided') {
  const p = (t: number) => twoSidedP(t, 105).toFixed(3).replace('.', ',')
  console.log(`piscadela: p = ${p(1.908)}; abraço: p = ${p(1.724)}`)
} else {
  console.log(
    `mulheres: 54 de 238 = ${percent(54, 238)}; homens: 60 de 465 = ${percent(60, 465)}`,
  )
}
