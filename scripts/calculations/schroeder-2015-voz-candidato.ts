// Two-tailed p of the hiring-likelihood test in Experiment 4, which the
// article reports as "t(37) = 2.62, p < .01" (p. 12). Cited in the fact
// sheet's Limitações; no table row depends on it.
//
//   node scripts/calculations/schroeder-2015-voz-candidato.ts
//
// The t density integrated with Simpson's rule, so no statistics package is
// needed.
const logGamma = (z: number): number => {
  // Lanczos approximation, good to about 15 digits for z > 0.
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  const x = z - 1
  let a = c[0] ?? 0
  for (let i = 1; i < g + 2; i++) a += (c[i] ?? 0) / (x + i)
  const t = x + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

const twoTailedP = (t: number, df: number): number => {
  const k = Math.exp(
    logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI),
  )
  const density = (x: number) => k * (1 + (x * x) / df) ** (-(df + 1) / 2)
  const n = 100_000
  const h = t / n
  let sum = density(0) + density(t)
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * density(i * h)
  return 1 - (2 * sum * h) / 3
}

console.log(`t(37) = 2.62: p = ${twoTailedP(2.62, 37).toFixed(3)}`)
