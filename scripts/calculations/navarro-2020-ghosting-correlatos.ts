// Navarro et al. (2020), IJERPH 17(3):1116. Numbers copied from the article.
//
//   node scripts/calculations/navarro-2020-ghosting-correlatos.ts
//     how many people were ghosted 3 times or more in the last year, with or
//     without breadcrumbing: the "ghosting" and the "combined" groups of
//     section 3.1, over the 626 of the sample
//   node scripts/calculations/navarro-2020-ghosting-correlatos.ts checks
//     the internal checks the Limitações section quotes: the F each R2 of
//     Table 3 implies, B / SE for the coefficients of Table 3, and the
//     eta squared each F of Table 2 implies
const SAMPLE = 626
const GHOSTING_ONLY = 30
const COMBINED = 15

const comma = (n: number, digits: number) => n.toFixed(digits).replace('.', ',')

function repeatedGhosting(): string {
  const people = GHOSTING_ONLY + COMBINED
  return `${people} de ${SAMPLE} = ${comma((people / SAMPLE) * 100, 1)}%`
}

function checks(): string {
  // Table 3: six predictors in each model.
  const predictors = 6
  const models: Array<[string, number, number]> = [
    ['satisfaction with life', 0.129, 150.216],
    ['helplessness', 0.046, 50.017],
    ['loneliness', 0.148, 170.936],
  ]
  const fromR2 = models.map(([name, r2, printed]) => {
    const f = r2 / predictors / ((1 - r2) / (SAMPLE - predictors - 1))
    return `${name}: R2 ${r2} gives F = ${f.toFixed(2)}, the table prints ${printed}`
  })

  // Table 3: B and SE. Beyond about 1.96 the coefficient passes p < .05,
  // beyond about 2.58 it passes p < .01, beyond about 3.29 it passes p < .001.
  const coefficients: Array<[string, number, number]> = [
    ['breadcrumbing on satisfaction with life', -0.194, 0.093],
    ['breadcrumbing on helplessness', 0.324, 0.055],
    ['breadcrumbing on loneliness', 0.17, 0.084],
    ['ghosting on satisfaction with life', -0.079, 0.13],
    ['ghosting on helplessness', 0.244, 0.137],
    ['ghosting on loneliness', 0.19, 0.118],
    ['relationship status on helplessness', -0.227, 0.077],
  ]
  const ratios = coefficients.map(
    ([name, b, se]) => `${name}: B / SE = ${(b / se).toFixed(2)}`,
  )

  // Table 2: four groups, so 3 and 622 degrees of freedom.
  const between = 3
  const within = SAMPLE - 4
  const anovas: Array<[string, number, number]> = [
    ['satisfaction with life', 4.961, 0.04],
    ['helplessness', 6.134, 0.08],
    ['loneliness', 8.336, 0.06],
  ]
  const etas = anovas.map(([name, f, printed]) => {
    const eta = (between * f) / (between * f + within)
    return `${name}: F ${f} gives eta squared = ${eta.toFixed(3)}, the table prints ${printed}`
  })

  return [...fromR2, ...ratios, ...etas].join('\n')
}

console.log(process.argv[2] === 'checks' ? checks() : repeatedGhosting())
