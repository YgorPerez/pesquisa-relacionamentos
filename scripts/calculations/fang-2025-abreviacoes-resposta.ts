// Study 4 (p. 10): the mean of the 0/1 "replied" variable in each condition of
// the Discord field experiment, shown as a percentage. Full-text first, then
// abbreviated.
//
//   node scripts/calculations/fang-2025-abreviacoes-resposta.ts
const percent = (p: number) => `${Math.round(p * 100)}%`

console.log(`${percent(0.2)} vs. ${percent(0.15)}`)
