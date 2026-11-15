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
const d = (m1: number, m2: number, sd1: number, sd2: number) =>
  ((m1 - m2) / ((sd1 + sd2) / 2)).toFixed(3)

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
  default:
    console.error(
      'usage: seymour-2022-partidarismo-vacina-perfil.ts [women|vaccinated]',
    )
    process.exit(1)
}
