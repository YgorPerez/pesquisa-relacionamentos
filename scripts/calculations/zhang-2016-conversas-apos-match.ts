// Table 8 (p. 17): the rate of reciprocation by degree of social separation,
// shown as a percentage. The 1-degree row (432 conversations) stays out.
//
//   node scripts/calculations/zhang-2016-conversas-apos-match.ts
const percent = (p: number) => `${Math.round(p * 100)}%`

const reciprocationByDegree: Array<[string, number]> = [
  ['2 graus', 0.54],
  ['3 graus', 0.52],
  ['4 graus ou mais', 0.26],
]

console.log(
  reciprocationByDegree
    .map(([label, p]) => `${label}: ${percent(p)}`)
    .join('; '),
)
