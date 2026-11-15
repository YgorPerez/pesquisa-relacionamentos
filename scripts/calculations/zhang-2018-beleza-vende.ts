// A proportion from the descriptive table shown as a percentage.
//
//   node scripts/calculations/zhang-2018-beleza-vende.ts
//     Table 2 (appendix, p. 13 of the PDF): mean of the "Ratio of
//     Initiator's Requests Being Replied", 0.035.
const ratioReplied = 0.035
console.log(`${(ratioReplied * 100).toFixed(1).replace('.', ',')}%`)
