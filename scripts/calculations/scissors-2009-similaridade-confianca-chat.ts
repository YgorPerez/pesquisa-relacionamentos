// Table 7 (p. 533) gives, for the three rows with a "% change defection",
// the Poisson coefficient and the percent change. This prints
// exp(coefficient) - 1, the usual reading of a Poisson coefficient as a
// percent change, beside the table's number. In Scissors et al. (2008),
// Table 1, the two agree; here they do not, and the article does not say how
// the column was computed.
//
//   node scripts/calculations/scissors-2009-similaridade-confianca-chat.ts

const rows = [
  { name: 'Noun phrases', coeff: -0.249, change: -15.3 },
  { name: 'Emoticons', coeff: -0.803, change: -14.6 },
  { name: 'Chat Abbreviations', coeff: 0.058, change: 9.7 },
]

for (const { name, coeff, change } of rows) {
  const percent = (Math.exp(coeff) - 1) * 100
  console.log(
    `${name}: exp(${coeff}) - 1 = ${percent.toFixed(1)}% (table ${change}%)`,
  )
}
