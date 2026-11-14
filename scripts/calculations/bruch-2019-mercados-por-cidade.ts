// Users per city and in total, from the supplement's Table S1 (p. S3), row
// "Total number of users": men plus women in each of the four cities.
//
//   node scripts/calculations/bruch-2019-mercados-por-cidade.ts
const users: Array<[city: string, men: number, women: number]> = [
  ['Nova York', 44_009, 50_618],
  ['Boston', 9_113, 9_355],
  ['Chicago', 28_635, 23_236],
  ['Seattle', 12_721, 9_248],
]

const total = users.reduce((sum, [, men, women]) => sum + men + women, 0)
console.log(
  `${total} no total; ${users.map(([city, men, women]) => `${city}: ${men + women}`).join('; ')}`,
)
