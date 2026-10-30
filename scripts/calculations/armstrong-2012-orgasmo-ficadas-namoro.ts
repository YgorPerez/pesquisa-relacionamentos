// Table 4 (p. 452): predicted probability of orgasm in a hookup, by previous
// hookups with the same partner. Prints them as percentages.
//
//   node scripts/calculations/armstrong-2012-orgasmo-ficadas-namoro.ts
const byPreviousHookups: Array<[string, number]> = [
  ['Nenhuma vez', 0.1],
  ['1 a 2 vezes', 0.12],
  ['3 a 5 vezes', 0.14],
  ['6 ou mais', 0.2],
]

console.log(
  byPreviousHookups
    .map(([label, p]) => `${label}: ${Math.round(p * 100)}%`)
    .join('; '),
)
