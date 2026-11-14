// Experiment VI, Table 1 (p. 118): how many men chose each of the five
// women. The counts add up to the 71 men of the Method (p. 117); the
// selective woman's share is shown as a percentage.
//
//   node scripts/calculations/walster-1973-dificil-de-conquistar.ts
const choices = {
  selective: 42,
  uniformlyHard: 6,
  uniformlyEasy: 5,
  noInformation1: 11,
  noInformation2: 7,
}
const men = Object.values(choices).reduce((sum, n) => sum + n, 0)
const share = Math.round((choices.selective / men) * 100)

console.log(`${choices.selective} de ${men} (${share}%)`)
