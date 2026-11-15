// Ranganath, Jurafsky & McFarland (2013): the classifier accuracies of the
// flirtation columns, which the tables give as proportions, shown as
// percentages. One argument per table:
//
//   table9   Table 9, SVM rows (speakers seen in training): men self, women
//            self, men other, women other.
//   table16  Table 16 (unseen speakers): men self, men other, their baseline;
//            women self, women other, their baselines.
//   table18  Table 18 (self-reported flirtation): traits only for men and
//            women, linguistic features for men and women, both for men and
//            women.
//
//   node scripts/calculations/ranganath-2013-flerte-fala.ts table9
const percent = (p: number) => `${Math.round(p * 100)}%`

const tables: Record<string, ReadonlyArray<number>> = {
  table9: [0.66, 0.74, 0.65, 0.78],
  table16: [0.57, 0.59, 0.48, 0.53, 0.52, 0.37, 0.34],
  table18: [0.64, 0.55, 0.66, 0.74, 0.72, 0.76],
}

const values = tables[process.argv[2] ?? '']
if (!values) {
  console.error(
    `usage: ranganath-2013-flerte-fala.ts ${Object.keys(tables).join('|')}`,
  )
  process.exit(1)
}
console.log(values.map(percent).join(', '))
