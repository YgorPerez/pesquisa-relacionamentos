// Experiment 1, widowed respondents (Table 2, p. 6): interest in a date with
// the healthy profile, 4.1 (SD 3.7, n = 10), and with the cancer profile,
// 1.1 (SD 1.6, n = 15). Prints Cohen's d with the pooled standard deviation,
// which the Discussion (p. 5) gives as 3.8, and the same 3.0-point difference
// divided by 0.79, the standard error the Results print as "7.9".
//
//   node scripts/calculations/tuinman-2018-sobrevivente-cancer.ts
const healthy = { mean: 4.1, sd: 3.7, n: 10 }
const cancer = { mean: 1.1, sd: 1.6, n: 15 }

const pooled = Math.sqrt(
  ((healthy.n - 1) * healthy.sd ** 2 + (cancer.n - 1) * cancer.sd ** 2) /
    (healthy.n + cancer.n - 2),
)
const difference = healthy.mean - cancer.mean
const format = (x: number) => x.toFixed(1).replace('.', ',')

console.log(`d = ${format(difference / pooled)}`)
console.log(`diferença / 0,79 = ${format(difference / 0.79)}`)
