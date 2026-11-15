// Gray et al. (2018), Figure 2 (p. 32): the counts of men and women who chose
// each of the three most common answers to Q9 ("What makes an online dating
// profile most appealing?"). The article gives the counts and the chi-square,
// not the shares; this prints each answer as a share of the men (52) and of
// the women (107) in the table, with the counts it comes from.
//
//   node scripts/calculations/gray-2018-perfis-eficazes.ts
const figure2 = {
  homens: { foto: 37, informacao: 4, afinidades: 11, total: 52 },
  mulheres: { foto: 53, informacao: 11, afinidades: 43, total: 107 },
} as const

const share = (count: number, total: number) =>
  (Math.round((count / total) * 1000) / 10).toFixed(1)

for (const [group, row] of Object.entries(figure2)) {
  console.log(
    `${group}: foto ${row.foto} de ${row.total} (${share(row.foto, row.total)}%), ` +
      `afinidades ${row.afinidades} de ${row.total} (${share(row.afinidades, row.total)}%)`,
  )
}
