// Jang et al., "Beauty vs. vibe in online dating with large multimodal
// models", SSRN 5191741 preprint (Computers in Human Behavior).
// Poisson coefficients turned into rate ratios, exp(b), and percent changes.
//
//   node scripts/calculations/jang-2025-beleza-vibe.ts beauty
//     Model 1, Tables 2 and 3: beauty 0.6946 (men) and 0.4394 (women). The
//     text gives 2.00 and 1.55 times; the abstract says matches rise "by 200%
//     for men and 155% for women", which are the ratios, not the increases.
//   node scripts/calculations/jang-2025-beleza-vibe.ts mood-women
//     Model 2a, Table 3: mood for women is 0.3453 in the table; the text uses
//     0.4350 and an increase of 54.5%.
const percent = (b: number) =>
  `${((Math.exp(b) - 1) * 100).toFixed(1).replace('.', ',')}%`
const ratio = (b: number) => Math.exp(b).toFixed(2).replace('.', ',')
const comma = (x: number) => String(x).replace('.', ',')

const which = process.argv[2]
if (which === 'beauty') {
  for (const [who, b] of [
    ['homens', 0.6946],
    ['mulheres', 0.4394],
  ] as const)
    console.log(
      `${who}: exp(${comma(b)}) = ${ratio(b)} vezes, aumento de ${percent(b)}`,
    )
  console.log('resumo do artigo: 200% (homens) e 155% (mulheres)')
} else if (which === 'mood-women') {
  console.log(
    `tabela: exp(${comma(0.3453)}) = ${ratio(0.3453)} vezes, aumento de ${percent(0.3453)}`,
  )
  console.log(
    `texto: exp(${comma(0.435)}) = ${ratio(0.435)} vezes, aumento de ${percent(0.435)}`,
  )
} else {
  console.error('usage: jang-2025-beleza-vibe.ts beauty|mood-women')
  process.exit(1)
}
