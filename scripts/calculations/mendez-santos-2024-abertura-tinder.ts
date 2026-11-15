// Gráfico 2 (p. 36): would the respondent reject a profile they like for its
// photos if it has a spelling mistake? The article gives percentages only for
// the women (p. 41); the men's shares are computed here from the chart's counts.
//
//   node scripts/calculations/mendez-santos-2024-abertura-tinder.ts
const men = { yes: 12, no: 17, maybe: 13 }
const total = men.yes + men.no + men.maybe
const percent = (part: number) => `${((part / total) * 100).toFixed(1)}%`

console.log(
  `men: ${men.yes} yes, ${men.no} no, ${men.maybe} maybe, of ${total}; ` +
    `yes ${percent(men.yes)}; yes or maybe ${percent(men.yes + men.maybe)}`,
)
