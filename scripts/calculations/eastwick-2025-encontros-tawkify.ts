// The second date decision is coded 1 for "yes" and 0 for "no", and its mean
// over the 9,084 reports is M = 0.58 (Methods, "Second date decision"): the
// share of reports that said yes, printed as a percentage.
//
//   node scripts/calculations/eastwick-2025-encontros-tawkify.ts
const mean = 0.58
console.log(`${Math.round(mean * 100)}%`)
