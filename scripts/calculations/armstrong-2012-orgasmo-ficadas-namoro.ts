// Table proportions shown as percentages.
//
//   node scripts/calculations/armstrong-2012-orgasmo-ficadas-namoro.ts
//     Table 4 (p. 452): predicted probability of orgasm in a hookup, by
//     previous hookups with the same partner.
//   node scripts/calculations/armstrong-2012-orgasmo-ficadas-namoro.ts with-intercourse
//     Table 1 (p. 443): observed orgasm in the last hookup and the last
//     relationship event, only those with intercourse.
const percent = (p: number) => `${Math.round(p * 100)}%`

if (process.argv[2] === 'with-intercourse') {
  console.log(`${percent(0.42)} vs. ${percent(0.74)}`)
} else {
  const byPreviousHookups: Array<[string, number]> = [
    ['Nenhuma vez', 0.1],
    ['1 a 2 vezes', 0.12],
    ['3 a 5 vezes', 0.14],
    ['6 ou mais', 0.2],
  ]
  console.log(
    byPreviousHookups.map(([label, p]) => `${label}: ${percent(p)}`).join('; '),
  )
}
