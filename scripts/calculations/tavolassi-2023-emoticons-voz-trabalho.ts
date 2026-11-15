// Tavolassi (2023), Tabelas 2 e 3 (pp. 25 e 27): each voice type's mean in
// Tabela 2 should be the average of its emoticon groups in Tabela 3, weighted
// by the group sizes. Prints both, so the Fact sheet's Limitações can say
// where the two tables disagree.
//
//   node scripts/calculations/tavolassi-2023-emoticons-voz-trabalho.ts
type Group = { n: number; mean: number }

const weighted = (groups: Group[]) =>
  groups.reduce((s, g) => s + g.n * g.mean, 0) /
  groups.reduce((s, g) => s + g.n, 0)

// Tabela 3: promotora = positivo (n=64), sem (n=56);
// proibitiva = positivo (n=61), negativo (n=51), sem (n=61).
const table3: Record<string, { promotora: number[]; proibitiva: number[] }> = {
  MENDOSSO: { promotora: [3.64, 3.54], proibitiva: [3.51, 3.59, 3.45] },
  MCONF_BEN: { promotora: [3.17, 3.14], proibitiva: [2.97, 3.33, 3.17] },
  MCONF_HAB: { promotora: [3.61, 3.47], proibitiva: [3.5, 3.62, 3.58] },
  MPANPOS: { promotora: [3.33, 3.44], proibitiva: [3.48, 3.48, 3.26] },
  MPANNEG: { promotora: [1.48, 1.54], proibitiva: [1.7, 1.78, 1.7] },
}
// Tabela 2: promotora (n=120), proibitiva (n=173).
const table2: Record<string, { promotora: number; proibitiva: number }> = {
  MENDOSSO: { promotora: 3.64, proibitiva: 3.54 },
  MCONF_BEN: { promotora: 3.17, proibitiva: 3.14 },
  MCONF_HAB: { promotora: 3.61, proibitiva: 3.47 },
  MPANPOS: { promotora: 3.38, proibitiva: 3.4 },
  MPANNEG: { promotora: 1.51, proibitiva: 1.72 },
}

const promotoraN = [64, 56]
const proibitivaN = [61, 51, 61]
for (const [name, t3] of Object.entries(table3)) {
  const pro = weighted(
    t3.promotora.map((mean, i) => ({ n: promotoraN[i]!, mean })),
  )
  const proi = weighted(
    t3.proibitiva.map((mean, i) => ({ n: proibitivaN[i]!, mean })),
  )
  const t2 = table2[name]!
  console.log(
    `${name}: promotora ${pro.toFixed(2)} (Tabela 2: ${t2.promotora}), proibitiva ${proi.toFixed(2)} (Tabela 2: ${t2.proibitiva})`,
  )
}
