// Table 1 (p. 279) gives, for each kind of mimicry, the Poisson coefficient,
// its standard error, the z-score, a p-value and the "% change defection".
// This prints, for the three rows with a % change, the two-sided p-value the
// z-score implies and exp(coefficient) - 1, the usual reading of a Poisson
// coefficient as a percent change, to set beside the table.
//
//   node scripts/calculations/scissors-2008-mimica-lexical-confianca.ts

/** Standard normal CDF, Abramowitz and Stegun 26.2.17 (error below 1e-7). */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const poly =
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  const upper = (Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)) * poly
  return z >= 0 ? 1 - upper : upper
}

const rows = [
  {
    name: 'Lexical (across sessions)',
    coeff: 0.098,
    z: 2.14,
    p: '0.03',
    change: '+10.3%',
  },
  {
    name: 'Lexical (within sessions)',
    coeff: -0.102,
    z: -1.91,
    p: '0.05',
    change: '-9.6%',
  },
  {
    name: 'Text-chat Abbreviation',
    coeff: -0.282,
    z: -1.93,
    p: '0.06',
    change: '-24.4%',
  },
]

for (const { name, coeff, z, p, change } of rows) {
  const twoSided = 2 * (1 - normalCdf(Math.abs(z)))
  const percent = (Math.exp(coeff) - 1) * 100
  console.log(
    `${name}: z ${z} -> p ${twoSided.toFixed(3)} (table ${p}); exp(${coeff}) - 1 = ${percent.toFixed(1)}% (table ${change})`,
  )
}
