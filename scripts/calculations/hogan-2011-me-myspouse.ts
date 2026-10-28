// Table 1.1 (p. 5): respondents per country, named as the table's rows run.
// Prints the total and Brazil's count.
//
//   node scripts/calculations/hogan-2011-me-myspouse.ts
const perCountry: Record<string, number> = {
  Germany: 2638,
  France: 2970,
  UK: 2552,
  Italy: 3515,
  Spain: 2673,
  Netherlands: 1491,
  Greece: 297,
  Portugal: 603,
  Belgium: 1124,
  Sweden: 794,
  Austria: 309,
  Switzerland: 278,
  Denmark: 241,
  Finland: 508,
  Norway: 317,
  Ireland: 368,
  Japan: 2084,
  Brazil: 2438,
}
const total = Object.values(perCountry).reduce((sum, n) => sum + n, 0)
const brazil = perCountry.Brazil
console.log(`${total} ${brazil}`)
