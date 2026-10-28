// Table 2, Model 4 (offline meetings): the Sexual Experience × Relationship
// Motive interaction has B = -.34. In a negative binomial count model the
// table's Exp(B) is e^B. Prints B and Exp(B), to two decimals.
//
//   node scripts/calculations/timmermans-2018-tinder.ts
const b = -0.34
console.log(`${b.toFixed(2)} ${Math.exp(b).toFixed(2)}`)
