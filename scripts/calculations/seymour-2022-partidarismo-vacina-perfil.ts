// Checks of the thesis's own arithmetic that the Limitações section reports.
//
//   node scripts/calculations/seymour-2022-partidarismo-vacina-perfil.ts
//     The Results give d = 0.664 (political similarity) and d = 0.091
//     (vaccine similarity) without saying for which group. Both come out of
//     the men's means and SDs (Results, p. 18; Table 2): the mean difference
//     over the average of the two SDs.
//   node scripts/calculations/seymour-2022-partidarismo-vacina-perfil.ts women
//     The same sum with the women's means and SDs, for comparison.
//   node scripts/calculations/seymour-2022-partidarismo-vacina-perfil.ts vaccinated
//     Results, p. 18: "were vaccinated (n= 73, 72.3%)"; 73 of the 97 is 75.3%.
//   node scripts/calculations/seymour-2022-partidarismo-vacina-perfil.ts tvalue
//     Table 2, men, vaccine similarity: ".935 (56) .0354". The two-sided p of
//     t = 0.935 with 56 df is about 0.354, so ".0354" is a slipped decimal.
const d = (m1: number, m2: number, sd1: number, sd2: number) =>
  ((m1 - m2) / ((sd1 + sd2) / 2)).toFixed(3)

// Two-sided p of a t statistic: the tail area of the t density over its
// whole area, both by the midpoint rule, so no gamma function is needed.
const twoSidedP = (t: number, df: number) => {
  const density = (x: number) => (1 + (x * x) / df) ** (-(df + 1) / 2)
  const area = (from: number, to: number) => {
    const steps = 200_000
    const width = (to - from) / steps
    let sum = 0
    for (let i = 0; i < steps; i++) sum += density(from + (i + 0.5) * width)
    return sum * width
  }
  const end = 100
  return area(Math.abs(t), end) / area(0, end)
}

switch (process.argv[2]) {
  case undefined:
    console.log(
      `men: political ${d(6.56, 5.67, 1.39, 1.29)}, vaccine ${d(6.17, 6.06, 1.28, 1.14)}`,
    )
    break
  case 'women':
    console.log(
      `women: political ${d(5.8, 5.19, 1.55, 1.2)}, vaccine ${d(5.76, 5.23, 1.39, 1.33)}`,
    )
    break
  case 'vaccinated':
    console.log(`${((73 / 97) * 100).toFixed(1)}%`)
    break
  case 'tvalue':
    console.log(`p = ${twoSidedP(0.935, 56).toFixed(3)}`)
    break
  default:
    console.error(
      'usage: seymour-2022-partidarismo-vacina-perfil.ts [women|vaccinated|tvalue]',
    )
    process.exit(1)
}
