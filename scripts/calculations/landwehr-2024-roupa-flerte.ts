// Landwehr, Mundloch & Schmidt (2024), Archives of Sexual Behavior
// 53(6):2063–2082. Numbers copied from Table 1 (p. 2070).
//
//   node scripts/calculations/landwehr-2024-roupa-flerte.ts
//     the mean error rate (ER) of each trial type before (T1) and after (T2)
//     the erotic audio story, as a percentage of that type's trials. The
//     table prints ER as a fraction (.02 to .10); the article's own reading
//     that 6 errors are 25% of the 24 high conflict trials of T2 treats it
//     the same way.
const errorRate: Array<[string, number]> = [
  ['low conflict, before', 0.02],
  ['low conflict, after', 0.02],
  ['high conflict, before', 0.06],
  ['high conflict, after', 0.1],
]

console.log(
  errorRate
    .map(([trials, rate]) => `${trials}: ${Math.round(rate * 100)}%`)
    .join('\n'),
)
