// Koessler, Kohut & Campbell (2019), Collabra: Psychology 5(1):29. Numbers
// copied from the article.
//
//   node scripts/calculations/koessler-2019-ghosting-e-termino-direto.ts
//     the check the Limitações section quotes: the partial omega squared each
//     F of Sample B implies, next to the one the article prints. Each test is
//     a 1-df effect of the 2 x 2 ANOVA on the 296 people of Sample B.
const SAMPLE_B = 296

// Partial omega squared of an effect with one degree of freedom.
const omegaSquared = (f: number, n: number) => (f - 1) / (f - 1 + n)

const effects: Array<[string, number, number]> = [
  // The three the Fact sheet does not use.
  ['role on breakup distress (H3.1)', 104.71, 0.657],
  ['role on negative affect', 264.89, 0.964],
  ['strategy on breakup distress (exploratory)', 12.58, 0.073],
  // Controls: the formula gives about what the article prints elsewhere.
  ['strategy on avoidance/withdrawal (H1.1a)', 18.59, 0.055],
  ['strategy on distant/mediated communication (H1.3)', 72.05, 0.201],
  ['strategy on open confrontation (H1.2)', 345.59, 0.553],
  ['strategy on positive tone/self-blame (H1.5)', 90.03, 0.231],
  ['strategy on relationship length', 17.62, 0.053],
  ['strategy on commitment', 18.25, 0.052],
]

console.log(
  effects
    .map(
      ([name, f, printed]) =>
        `${name}: F ${f} gives omega squared = ${omegaSquared(f, SAMPLE_B).toFixed(3)}, the article prints ${printed}`,
    )
    .join('\n'),
)
