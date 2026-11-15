// Error rates of Table 1 (p. 1559), shown as percentages: high-conflict (HC)
// trials, then low-conflict (LC) trials.
//
//   node scripts/calculations/landwehr-2026-roupa-excitacao.ts t1
//     First measurement, before the erotic audio: HC .11, LC .05.
//   node scripts/calculations/landwehr-2026-roupa-excitacao.ts t2
//     Second measurement, after the audio: HC .14, LC .05.
const percent = (p: number) => `${Math.round(p * 100)}%`

const errorRates: Record<string, readonly [number, number]> = {
  t1: [0.11, 0.05],
  t2: [0.14, 0.05],
}

const rates = errorRates[process.argv[2] ?? '']
if (rates === undefined) {
  console.error(`usage: one of ${Object.keys(errorRates).join(', ')}`)
  process.exit(1)
}
const [highConflict, lowConflict] = rates
console.log(`HC ${percent(highConflict)}; LC ${percent(lowConflict)}`)
