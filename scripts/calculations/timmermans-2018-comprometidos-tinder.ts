// Results, p. 133: of the 1486 Tinder users in the merged dataset, "906
// participants (61%)" reported an offline meeting with another Tinder user.
// The same page gives the share by group: 57.7% of the non-single users
// (n = 333) and 65.3% of the single users (n = 1153). Applied to the group
// sizes of Table 1, those two shares give more people than 906. Table 3 notes
// that these variables have missing answers, without saying how many, so the
// group shares may have a smaller denominator. Prints both totals.
//
//   node scripts/calculations/timmermans-2018-comprometidos-tinder.ts
const nonSingle = { n: 333, share: 0.577 }
const single = { n: 1153, share: 0.653 }
const reported = { met: 906, percent: 61 }

const total = nonSingle.n + single.n
const met = nonSingle.n * nonSingle.share + single.n * single.share
console.log(
  `by group: ${Math.round(met)} of ${total} = ${((met / total) * 100).toFixed(1)}% (the article reports ${reported.met}, ${reported.percent}%)`,
)
