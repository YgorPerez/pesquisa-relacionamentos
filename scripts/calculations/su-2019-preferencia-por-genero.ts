// Table 7 proportions shown as percentages: the share of messages whose
// receiver had a higher centrality index than the sender, against the share
// the authors' random baseline gives.
//
//   node scripts/calculations/su-2019-preferencia-por-genero.ts pagerank
//     Column pop3 (PageRank in the messaging network).
//   node scripts/calculations/su-2019-preferencia-por-genero.ts indegree
//     Column Indegree (indegree in the click network).
const percent = (p: number) => `${(p * 100).toFixed(1)}%`

// Table 7, rows FM, FM (random), MF, MF (random).
const table7 = {
  pagerank: { fm: 0.902, fmRandom: 0.827, mf: 0.833, mfRandom: 0.775 },
  indegree: { fm: 0.777, fmRandom: 0.656, mf: 0.84, mfRandom: 0.727 },
}

const column = table7[process.argv[2] as keyof typeof table7]
if (!column) {
  console.error('usage: su-2019-preferencia-por-genero.ts pagerank|indegree')
  process.exit(1)
}
console.log(
  `women to men: ${percent(column.fm)} (random ${percent(column.fmRandom)}); ` +
    `men to women: ${percent(column.mf)} (random ${percent(column.mfRandom)})`,
)
