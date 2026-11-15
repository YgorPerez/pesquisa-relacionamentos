// Table 6 (p. 31 of the thesis, p. 42 of the PDF): share willing to compromise
// on each trait when establishing a long-term relationship, coded 1 = yes and
// 0 = no, so the table's means are proportions. Shown as percentages, single
// mothers first, women without children second, with the table's p-value.
//
//   node scripts/calculations/franco-2018-maes-solo.ts attractiveness status
//   node scripts/calculations/franco-2018-maes-solo.ts kindness
const percent = (p: number) => `${Math.round(p * 100)}%`

const longTerm: Record<string, [number, number, string]> = {
  attractiveness: [0.88, 0.69, '0.151'],
  status: [0.67, 0.85, '0.156'],
  kindness: [0.46, 0.65, '0.167'],
}

const traits = process.argv.slice(2)
if (traits.length === 0 || traits.some((t) => !(t in longTerm)))
  throw new Error(`name traits among ${Object.keys(longTerm).join(', ')}`)
console.log(
  traits
    .map((trait) => {
      const [mothers, others, p] = longTerm[trait]
      return `${trait}: ${percent(mothers)} vs. ${percent(others)} (p = ${p})`
    })
    .join('; '),
)
