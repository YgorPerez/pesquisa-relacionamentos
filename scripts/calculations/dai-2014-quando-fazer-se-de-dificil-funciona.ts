// Study 2 (p. 4): the partial eta squared that the reported F and its degrees
// of freedom imply for the commitment-by-strategy interaction on the
// motivational index, against the .36 the article prints. For an F(1, df)
// effect, partial eta squared = F / (F + df). The same formula gives the .17
// the article prints for Study 1's F(1, 97) = 20.02.
//
//   node scripts/calculations/dai-2014-quando-fazer-se-de-dificil-funciona.ts
const etaSquared = (f: number, df: number) => f / (f + df)

const study2 = etaSquared(11.79, 57).toFixed(2)
const study1 = etaSquared(20.02, 97).toFixed(2)
console.log(
  `Study 2: ${study2} (printed: 0.36); Study 1: ${study1} (printed: 0.17)`,
)
