// Asendorpf, Penke & Back (2011), European Journal of Personality 25(1):16–30.
// Numbers copied from the article (Method, p. 19; Results, p. 25).
//
//   node scripts/calculations/asendorpf-2011-speed-dating-acompanhamento.ts
//     the overall mean and standard deviation of short-term and long-term
//     mating interest, pooled from the means and standard deviations the
//     article gives for men and for women, next to the overall values it
//     prints. The Limitações section quotes the result: the printed overall
//     standard deviations look swapped.
const MEN = 190
const WOMEN = 192

interface Group {
  readonly mean: number
  readonly sd: number
}

function pooled(men: Group, women: Group): { mean: number; sd: number } {
  const n = MEN + WOMEN
  const mean = (MEN * men.mean + WOMEN * women.mean) / n
  // Sum of squares around the overall mean, with sample variances (n - 1).
  const within = (MEN - 1) * men.sd ** 2 + (WOMEN - 1) * women.sd ** 2
  const between =
    MEN * (men.mean - mean) ** 2 + WOMEN * (women.mean - mean) ** 2
  return { mean, sd: Math.sqrt((within + between) / (n - 1)) }
}

const comma = (x: number) => x.toFixed(2).replace('.', ',')

const shortTerm = pooled({ mean: 3.21, sd: 1.9 }, { mean: 2.5, sd: 1.72 })
const longTerm = pooled({ mean: 5.06, sd: 1.48 }, { mean: 5.18, sd: 1.42 })

console.log(
  [
    `caso curto: média ${comma(shortTerm.mean)}, desvio ${comma(shortTerm.sd)} (o artigo imprime 2,85 e 1,45)`,
    `relação longa: média ${comma(longTerm.mean)}, desvio ${comma(longTerm.sd)} (o artigo imprime 5,12 e 1,84)`,
  ].join('\n'),
)
