// Table 3 (p. 7) match probabilities shown as percentages, by the education
// level of the fictitious profile: Ma+, Ma–, Ba+ and Ba–.
//
//   node scripts/calculations/neyt-2019-escolaridade-tinder.ts all
//     Panel A: all subjects.
//   node scripts/calculations/neyt-2019-escolaridade-tinder.ts men
//     Panel B: male subjects rating the female profiles.
//   node scripts/calculations/neyt-2019-escolaridade-tinder.ts women
//     Panel C: female subjects rating the male profiles.
//
// Each level's probability is read from the pair where it first appears:
// Ma+, Ma– and Ba+ in column (1), Ba– in column (2) of "Ba+ versus Ba–".
const panels: Record<string, [number, number, number, number]> = {
  all: [0.36, 0.331, 0.327, 0.312],
  men: [0.64, 0.622, 0.624, 0.593],
  women: [0.08, 0.04, 0.029, 0.031],
}

const percent = (p: number) => `${(p * 100).toFixed(1).replace('.', ',')}%`
const labels = ['Ma+', 'Ma–', 'Ba+', 'Ba–']

const panel = panels[process.argv[2] ?? '']
if (!panel) {
  console.error('usage: neyt-2019-escolaridade-tinder.ts all|men|women')
  process.exit(1)
}
console.log(panel.map((p, i) => `${labels[i]}: ${percent(p)}`).join('; '))
