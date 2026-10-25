// The HCMST composite response rate (Data section): panel recruitment
// (32.6%) times the initial demographic survey (56.8%) times consent to
// this survey (71%). The article prints the product as 13%.
//
//   node scripts/calculations/rosenfeld-2012-searching-for-a-mate.ts
const rate = 0.326 * 0.568 * 0.71
console.log(`${Math.round(100 * rate)}`)
