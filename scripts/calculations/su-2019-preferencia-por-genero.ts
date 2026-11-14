// Table 7 proportions shown as percentages: the share of messages whose
// receiver had a higher centrality index than the sender, against the share
// the authors' random baseline gives, and how many percentage points the
// share sits above or below that baseline.
//
//   node scripts/calculations/su-2019-preferencia-por-genero.ts pop1
//     Column pop1 (clicks per recommendation).
//   node scripts/calculations/su-2019-preferencia-por-genero.ts pop2
//     Column pop2 (messages received per recommendation).
//   node scripts/calculations/su-2019-preferencia-por-genero.ts pagerank
//     Column pop3 (PageRank in the messaging network).
//   node scripts/calculations/su-2019-preferencia-por-genero.ts indegree
//     Column Indegree (indegree in the click network).

// Table 7, rows FM, FM (random), MF, MF (random), in thousandths so the
// subtraction stays exact.
const table7 = {
  pop1: { fm: 779, fmRandom: 729, mf: 828, mfRandom: 768 },
  pop2: { fm: 232, fmRandom: 234, mf: 116, mfRandom: 125 },
  pagerank: { fm: 902, fmRandom: 827, mf: 833, mfRandom: 775 },
  indegree: { fm: 777, fmRandom: 656, mf: 840, mfRandom: 727 },
}

const percent = (thousandths: number) => `${(thousandths / 10).toFixed(1)}%`

const versusRandom = (share: number, random: number) => {
  const points = (Math.abs(share - random) / 10).toFixed(1)
  const side = share >= random ? 'above' : 'below'
  return `${percent(share)} (random ${percent(random)}, ${points} points ${side})`
}

const column = table7[process.argv[2] as keyof typeof table7]
if (!column) {
  console.error(
    'usage: su-2019-preferencia-por-genero.ts pop1|pop2|pagerank|indegree',
  )
  process.exit(1)
}
console.log(
  `women to men: ${versusRandom(column.fm, column.fmRandom)}; ` +
    `men to women: ${versusRandom(column.mf, column.mfRandom)}`,
)
