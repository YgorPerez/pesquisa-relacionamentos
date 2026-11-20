// Jakobsen & Hoang (2024), "Eyes on the price", master's thesis, Copenhagen
// Business School. "Yes"/"No" counts per picture type, copied from Table 6
// (NeuroLab, p. 66) and Table 8 (Prolific, p. 70); the thesis writes the
// Prolific thousands with a dot ("2.062").
//
//   node scripts/calculations/jakobsen-2024-pistas-visuais-match.ts neurolab
//   node scripts/calculations/jakobsen-2024-pistas-visuais-match.ts prolific
//     share of "Yes" per type (SA, NA, SM, NM), then pooled: smiling against
//     non-smiling, alone against multiple.
type Counts = Record<
  'SA' | 'NA' | 'SM' | 'NM',
  readonly [yes: number, no: number]
>

const NEUROLAB: Counts = {
  SA: [93, 219],
  NA: [123, 189],
  SM: [114, 198],
  NM: [78, 234],
}
const PROLIFIC: Counts = {
  SA: [2062, 2433],
  NA: [2007, 2471],
  SM: [1747, 2748],
  NM: [2322, 2156],
}

const percent = (yes: number, no: number) =>
  `${((yes / (yes + no)) * 100).toFixed(1).replace('.', ',')}%`

function pooled(c: Counts, a: ReadonlyArray<keyof Counts>) {
  const yes = a.reduce((s, k) => s + c[k][0], 0)
  const no = a.reduce((s, k) => s + c[k][1], 0)
  return `${percent(yes, no)} (${yes} de ${yes + no})`
}

const which = process.argv[2]
const counts =
  which === 'neurolab' ? NEUROLAB : which === 'prolific' ? PROLIFIC : null
if (!counts) {
  console.error(
    'usage: jakobsen-2024-pistas-visuais-match.ts neurolab|prolific',
  )
  process.exit(1)
}
for (const k of ['SA', 'NA', 'SM', 'NM'] as const)
  console.log(`${k}: ${percent(...counts[k])} de "sim"`)
console.log(
  `sorrindo: ${pooled(counts, ['SA', 'SM'])}; sem sorrir: ${pooled(counts, ['NA', 'NM'])}`,
)
console.log(
  `sozinho: ${pooled(counts, ['SA', 'NA'])}; com outras pessoas: ${pooled(counts, ['SM', 'NM'])}`,
)
