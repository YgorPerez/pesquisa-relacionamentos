// The model-predicted probabilities that the article reports as proportions,
// written as percentages for the Fact sheet.
//
//   node scripts/calculations/mills-2021-risada-escrita-ia.ts <row>
//
// lol-haha:   Experiment 2, p. 37 of the manuscript: a message with haha,
//             control (0.025) and recipients of artificial lol (0.0127).
// success:    Experiment 2, Table 3, p. 38: predicted probability of a correct
//             round, by group and language.
// next-haha:  Experiment 3, p. 46: a message with haha, control (0.109) and
//             recipients of artificial haha (0.0728).
const percent = (p: number) => `${Number((p * 100).toFixed(2))}%`

const rows: Record<string, () => string> = {
  'lol-haha': () => `control ${percent(0.025)}; lol ${percent(0.0127)}`,
  success: () =>
    `English: control ${percent(0.889)}, lol ${percent(0.935)}; ` +
    `Dutch: control ${percent(0.953)}, lol ${percent(0.973)}`,
  'next-haha': () => `control ${percent(0.109)}; haha ${percent(0.0728)}`,
}

const row = process.argv[2] ?? ''
const print = rows[row]
if (!print) {
  console.error(`usage: one of ${Object.keys(rows).join(', ')}`)
  process.exit(1)
}
console.log(print())
