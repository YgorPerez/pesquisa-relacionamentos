// Checks of the paper's own arithmetic that the Limitações section reports.
//
//   node scripts/calculations/miyamoto-2024-ingles-site-matrimonial.ts
//     Table 9: a plain two-proportion z-test for the lower caste (30.2% vs.
//     19.8%) and upper caste (30.2% vs. 40.6%) rows. Each cell has 96
//     interests (12 fictitious profiles x 8 men), so the rates are 29, 19 and
//     39 of 96. The table prints p = 0.019 and 0.033.
//   node scripts/calculations/miyamoto-2024-ingles-site-matrimonial.ts relative
//     The "47%" and "43%" of the abstract: the regression's 0.143 and 0.129
//     over the 30.2% overall acceptance rate (Table 9), and 0.143 over the
//     13.5% of upper caste men for lower caste profiles without English
//     (Table 11).
//   node scripts/calculations/miyamoto-2024-ingles-site-matrimonial.ts penalty
//     Section 5.1's education (14% to 20%) and income (23% to 25%)
//     penalties: the Table 8 coefficients on interests per view over the mean
//     of all 48 profiles (0.286, Table 5).
const twoProportionP = (a: number, b: number, n: number) => {
  const pooled = (a + b) / (2 * n)
  const z = (a / n - b / n) / Math.sqrt((pooled * (1 - pooled) * 2) / n)
  return 2 * (1 - normalCdf(Math.abs(z)))
}

// Abramowitz and Stegun 7.1.26, accurate to about 1e-7.
function normalCdf(x: number) {
  const t = 1 / (1 + 0.3275911 * (x / Math.SQRT2))
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return 0.5 * (1 + (1 - poly * Math.exp(-(x * x) / 2)))
}

const percent = (p: number) => `${(p * 100).toFixed(1)}%`

switch (process.argv[2]) {
  case undefined:
    console.log(
      `lower caste p = ${twoProportionP(29, 19, 96).toFixed(3)}, upper caste p = ${twoProportionP(29, 39, 96).toFixed(3)}`,
    )
    break
  case 'relative':
    console.log(
      `${percent(0.143 / 0.302)} and ${percent(0.129 / 0.302)} of 30.2%; ${percent(0.143 / 0.135)} of 13.5%`,
    )
    break
  case 'penalty':
    console.log(
      `education ${percent(0.04 / 0.286)} (MA) to ${percent(0.056 / 0.286)} (BA); income ${percent(0.067 / 0.286)} (5-7.5 lakhs) to ${percent(0.07 / 0.286)} (3-4 lakhs)`,
    )
    break
  default:
    console.error(
      'usage: miyamoto-2024-ingles-site-matrimonial.ts [relative|penalty]',
    )
    process.exit(1)
}
