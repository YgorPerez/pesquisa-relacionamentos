// Men's mean share of the 10 photo pairs in which they chose the braless
// photo, shown as a percentage with its 95% confidence interval.
//
//   node scripts/calculations/prokop-2026-sutia-percepcao.ts attractive
//     p. 6: "The mean preference score for seeing women not wearing a bra was
//     0.67 [95% CI, 0.6564, 0.6914], N = 277"
//   node scripts/calculations/prokop-2026-sutia-percepcao.ts faithful
//     p. 7: "Perceived fidelity scores for breasts without a bra were low
//     (mean = 0.15 [95% CI, 0.1328, 0.1591], N = 277)"
const percent = (p: number) => `${Math.round(p * 100)}%`

const scores: Record<string, [number, number, number]> = {
  attractive: [0.67, 0.6564, 0.6914],
  faithful: [0.15, 0.1328, 0.1591],
}

const which = process.argv[2] ?? 'attractive'
const score = scores[which]
if (!score) throw new Error(`unknown score: ${which}`)
const [mean, low, high] = score
console.log(`277 homens: ${percent(mean)} (${percent(low)} a ${percent(high)})`)
