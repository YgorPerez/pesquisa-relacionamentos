// Proportions of correct choices in the forced choice task, shown as
// percentages. The other numbers of each line are printed as the excerpt
// gives them, so the Valor can name them.
//
//   node scripts/calculations/leivers-2015-fidelidade-rosto-mulheres.ts exp1
//     Experiment 1, all 43 men (p. 5): mean 0.55 against chance 0.5, p = .003.
//   ... exp1-image
//     Experiment 1 by image type (p. 5): faces 0.57 (p = .023), full person
//     0.54 (p = .075).
//   ... exp1-pairs
//     Experiment 1 by pair (p. 6): 0.29 to 0.86; below 0.5 in six of the 17
//     pairs; across pairs, p = .127.
//   ... exp2
//     Experiment 2, 60 men, faces (p. 8): mean 0.59 against 0.5, p < .001.
//   ... exp2-pairs
//     Experiment 2 by pair (p. 8): 0.20 to 0.83; below 0.5 in four of the 17
//     pairs.
const percent = (p: number) => `${Math.round(p * 100)}%`

const lines: Record<string, string> = {
  exp1: `${percent(0.55)} vs. ${percent(0.5)} (p = 0.003)`,
  'exp1-image': `face ${percent(0.57)} (p = 0.023); full person ${percent(0.54)} (p = 0.075)`,
  'exp1-pairs': `${percent(0.29)} to ${percent(0.86)}; below ${percent(0.5)} in 6 of 17 pairs; across pairs p = 0.127`,
  exp2: `${percent(0.59)} vs. ${percent(0.5)} (p < 0.001)`,
  'exp2-pairs': `${percent(0.2)} to ${percent(0.83)}; below ${percent(0.5)} in 4 of 17 pairs`,
}

const line = lines[process.argv[2] ?? '']
if (line === undefined) {
  console.error(`usage: one of ${Object.keys(lines).join(', ')}`)
  process.exit(1)
}
console.log(line)
