// Table 1 (p. 16) gives the mean, standard deviation and size of each of the
// four groups. The main effect of language errors in a 2x2 ANOVA that those
// numbers give, next to the F the Results print (p. 15); and the chi-square
// that the percentages of people who noticed errors give (p. 15), next to the
// printed one. They do not match, which the fact sheet's Limitações says.
//
//   node scripts/calculations/heijckers-2022-erros-ingles-l2.ts
const sizes = [40, 33, 20, 38] // errors+knowledge, errors, no errors+knowledge, no errors
const residualDf = sizes.reduce((a, b) => a + b) - 4

function errorsMainEffect(means: number[], sds: number[]) {
  const mse =
    sizes.reduce((sum, n, i) => sum + (n - 1) * sds[i] ** 2, 0) / residualDf
  const contrast = (means[0] + means[1] - means[2] - means[3]) / 2
  const variance = (mse / 4) * sizes.reduce((sum, n) => sum + 1 / n, 0)
  const f = contrast ** 2 / variance
  return { f, etaSquared: f / (f + residualDf) }
}

const intelligence = errorsMainEffect(
  [4.15, 3.95, 4.61, 4.58],
  [0.84, 0.88, 0.71, 0.7],
)
const attractiveness = errorsMainEffect(
  [3.8, 3.68, 3.88, 4.07],
  [0.9, 0.74, 0.65, 1.0],
)
console.log(
  `intelligence: F = ${intelligence.f.toFixed(1)}, partial eta squared = ${intelligence.etaSquared.toFixed(2)} (printed: 4.65, .036)`,
)
console.log(
  `attractiveness: F = ${attractiveness.f.toFixed(1)} (printed: 1.09)`,
)

const noticedWithErrors = Math.round(0.904 * 73)
const noticedWithout = Math.round(0.759 * 58)
const [a, b, c, d] = [
  noticedWithErrors,
  73 - noticedWithErrors,
  noticedWithout,
  58 - noticedWithout,
]
const chiSquare =
  (131 * (a * d - b * c) ** 2) / ((a + b) * (c + d) * (a + c) * (b + d))
console.log(
  `noticed errors: chi-square = ${chiSquare.toFixed(1)} (printed: 1.57)`,
)
