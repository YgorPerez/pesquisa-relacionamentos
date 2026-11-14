// Method, p. 6: 173 respondents said they had ghosted another dating app
// user, which the article gives as "63% of the total sample". The final
// sample is 328 (Method, p. 5), and 173 of 328 is not 63%. Prints the share
// over the total sample, to one decimal, next to the article's figure.
// (63% would need a denominator near 275: 173 / 0.63 = 274.6.)
//
//   node scripts/calculations/timmermans-2021-ghosting-em-apps.ts
const ghosters = 173
const sample = 328
const reported = 63
const share = ((ghosters / sample) * 100).toFixed(1)
console.log(
  `${ghosters} / ${sample} = ${share}% (the article reports ${reported}%)`,
)
