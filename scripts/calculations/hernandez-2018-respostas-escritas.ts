// Table 1 (p. 114): the one-sample t that each question's mean, standard
// deviation and sample size give against a test value of 0, next to the t the
// table prints. The two do not match, which the fact sheet's Limitações says.
//
//   node scripts/calculations/hernandez-2018-respostas-escritas.ts
const rows = [
  { label: 'Q17', mean: 0.444, sd: 0.942, n: 245, printed: 3.162 },
  { label: 'Q34', mean: 0.586, sd: 0.7476, n: 246, printed: 5.324 },
  { label: 'Q41', mean: 0.7446, sd: 0.9661, n: 247, printed: 5.284 },
  { label: 'Q42', mean: 0.4893, sd: 0.90583, n: 247, printed: 3.703 },
]

for (const { label, mean, sd, n, printed } of rows) {
  const t = mean / (sd / Math.sqrt(n))
  console.log(`${label}: t = ${t.toFixed(1)} (table: ${printed})`)
}
