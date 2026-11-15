// Probabilities shown as percentages.
//
//   node scripts/calculations/egebark-2021-beleza-educacao-experimento.ts
//     Table 5 (p. 30), row "Mean Response": the share of invited women
//     (column 1) and men (column 2) who replied positively.
const percent = (p: number) => `${(p * 100).toFixed(1)}%`

console.log(`women ${percent(0.117)}, men ${percent(0.275)}`)
