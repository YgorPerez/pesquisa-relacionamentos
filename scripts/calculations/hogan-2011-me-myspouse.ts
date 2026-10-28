// Table 1.1 (p. 5): respondents per country, in the table's order (Germany,
// France, UK, Italy, Spain, Netherlands, Greece, Portugal, Belgium, Sweden,
// Austria, Switzerland, Denmark, Finland, Norway, Ireland, Japan, Brazil).
// Prints the total and Brazil's count, the last row.
//
//   node scripts/calculations/hogan-2011-me-myspouse.ts
const perCountry = [
  2638, 2970, 2552, 3515, 2673, 1491, 297, 603, 1124, 794, 309, 278, 241, 508,
  317, 368, 2084, 2438,
]
const total = perCountry.reduce((sum, n) => sum + n, 0)
const brazil = perCountry[perCountry.length - 1]
console.log(`${total} ${brazil}`)
