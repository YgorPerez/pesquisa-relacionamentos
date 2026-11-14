// Table 3 (p. 96): the accuracy of each method on the 300 test texts, shown
// as a percentage. Table 1 (p. 95): the share of each relationship goal among
// the 12,310 collected profiles.
//
//   node scripts/calculations/lee-2019-classificar-objetivo-perfil.ts <human|liwc|word|corpus>
const percent = (p: number) => `${Math.round(p * 100)}%`

const accuracy: Record<string, number> = {
  human: 0.57,
  liwc: 0.56,
  word: 0.62,
}

const longTerm = 10_696
const date = 1_634

const which = process.argv[2] ?? ''
if (which === 'corpus') {
  const total = longTerm + date
  console.log(
    `long-term: ${percent(longTerm / total)}; date: ${percent(date / total)}`,
  )
} else if (which in accuracy) {
  console.log(percent(accuracy[which] ?? 0))
} else {
  console.error(
    'usage: lee-2019-classificar-objetivo-perfil.ts <human|liwc|word|corpus>',
  )
  process.exitCode = 1
}
