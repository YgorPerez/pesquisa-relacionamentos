// Who starts the conversation after a match, by sex (p. 282 and Figura 6,
// p. 283). The text gives 59% who start and 41% who wait, and the sex split
// inside each group; Figura 6 gives N = 305 for the question and N = 181 for
// those who start, so 124 wait. The percentages in the text match whole
// counts of those groups (94/181 = 51.93%, 105/124 = 84.68%), so the counts
// are recovered and each sex's share who start is printed: men, then women.
//
//   node scripts/calculations/fernandes-2020-flerte-apps.ts
const answered = 305
const start = 181
const wait = answered - start

const startMen = Math.round(start * 0.5193)
const startWomen = Math.round(start * 0.4807)
const waitWomen = Math.round(wait * 0.8468)
const waitMen = Math.round(wait * 0.1532)

const percent = (part: number, whole: number) =>
  `${Math.round((part / whole) * 100)}%`

console.log(
  `${percent(startMen, startMen + waitMen)} vs. ${percent(startWomen, startWomen + waitWomen)}`,
)
