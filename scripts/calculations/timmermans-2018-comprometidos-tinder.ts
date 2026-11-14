// Results, p. 133: of the 1486 Tinder users in the merged dataset, "906
// participants (61%)" reported an offline meeting with another Tinder user.
// The same page gives the share by group, 57.7% of the non-single users and
// 65.3% of the single users, with the test "χ2 (1) = 5.355". Applied to the
// group sizes of Table 1 (333 and 1153), the two shares give 945 people, not
// 906, and a different χ2. Table 3 notes that these variables have missing
// answers. The article's own numbers say where: 753 of the 1153 single users
// (65.3%) plus 153 non-single users make the 906, 153 is 57.7% of 265, and
// only those counts return the reported χ2. So the 57.7% is a share of 265
// non-single users, and the other 68 of the 333 have no answer to the question.
//
//   node scripts/calculations/timmermans-2018-comprometidos-tinder.ts
interface Group {
  readonly met: number
  readonly n: number
}

/** Pearson's chi-square of a 2 x 2 table, without continuity correction. */
function chiSquare(a: Group, b: Group): number {
  const total = a.n + b.n
  const met = a.met + b.met
  let sum = 0
  for (const g of [a, b]) {
    const yes = (g.n * met) / total
    const no = g.n - yes
    sum += (g.met - yes) ** 2 / yes + (g.n - g.met - no) ** 2 / no
  }
  return sum
}

const percent = (g: Group) => ((g.met / g.n) * 100).toFixed(1)

const single: Group = { met: 753, n: 1153 }
const nonSingleAll: Group = { met: Math.round(333 * 0.577), n: 333 }
const nonSingleAnswered: Group = { met: 906 - single.met, n: 265 }

console.log(
  `shares applied to Table 1: ${nonSingleAll.met} + ${single.met} = ${nonSingleAll.met + single.met} of 1486, chi-square ${chiSquare(nonSingleAll, single).toFixed(3)} (the article reports 906 and 5.355)`,
)
console.log(
  `from the article's 906: ${nonSingleAnswered.met} of ${nonSingleAnswered.n} non-single = ${percent(nonSingleAnswered)}%, ${single.met} of ${single.n} single = ${percent(single)}%, chi-square ${chiSquare(nonSingleAnswered, single).toFixed(3)}`,
)

// No other pair of denominators gives 906 meetings, 57.7%, 65.3% and 5.355.
const fits: string[] = []
for (let n1 = 1; n1 <= 333; n1++) {
  for (let n2 = 1; n2 <= 1153; n2++) {
    for (let x = Math.floor(0.5765 * n1); x <= Math.ceil(0.5775 * n1); x++) {
      const a: Group = { met: x, n: n1 }
      const b: Group = { met: 906 - x, n: n2 }
      if (b.met < 0 || b.met > n2) continue
      if (percent(a) !== '57.7' || percent(b) !== '65.3') continue
      if (chiSquare(a, b).toFixed(3) === '5.355')
        fits.push(`${a.met}/${a.n} and ${b.met}/${b.n}`)
    }
  }
}
console.log(`denominators that fit all four numbers: ${fits.join('; ')}`)
console.log(
  `non-single users without an answer: ${333 - nonSingleAnswered.n}; ${nonSingleAnswered.met} of 333 = ${((nonSingleAnswered.met / 333) * 100).toFixed(1)}%`,
)
