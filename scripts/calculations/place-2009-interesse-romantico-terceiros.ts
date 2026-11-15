// Place, Todd, Penke & Asendorpf (2009), Psychological Science 20(1):22–26.
// Numbers copied from the article.
//
//   node scripts/calculations/place-2009-interesse-romantico-terceiros.ts
//     the chance accuracy the article gives for an observer who guesses with
//     the stimuli's offer rates (41% of the men, 33% of the women said yes):
//     p² + (1 − p)², rounded to whole percent, as in the Results.
//   node scripts/calculations/place-2009-interesse-romantico-terceiros.ts checks
//     the consistency checks the Fact sheet's Limitações quote: partial eta
//     squared from each F and its degrees of freedom, F·df1 / (F·df1 + df2),
//     against the printed value; and the printed d of each t(53) against
//     2t/√df (the independent-groups formula) and t/√n (one group of 54
//     measured twice, or against a fixed chance level).
const chance = (p: number) => p * p + (1 - p) * (1 - p)
const percent = (x: number) => `${Math.round(x * 100)}%`

if (process.argv[2] === 'checks') {
  const anovas: Array<[string, number, number, number, number]> = [
    ['relationship status, male interest', 6.18, 1, 50, 0.11],
    ['clip location, male interest (mixed ANOVA)', 16.86, 2, 100, 0.25],
    ['clip location, female interest (mixed ANOVA)', 16.18, 2, 100, 0.41],
    ['clip location, male interest (single factor)', 29.35, 2, 106, 0.36],
    ['clip location, female interest (single factor)', 36.52, 2, 106, 0.41],
  ]
  for (const [name, f, df1, df2, printed] of anovas)
    console.log(
      `${name}: F ${f} gives partial eta squared ${((f * df1) / (f * df1 + df2)).toFixed(2)}, the article prints ${printed.toFixed(2)}`,
    )
  const tests: Array<[string, number, number]> = [
    ['male vs. female interest (paired)', 3.64, 1.0],
    ['male interest vs. chance', 10.76, 2.94],
    ['female interest vs. chance', 2.24, 0.62],
  ]
  for (const [name, t, printed] of tests)
    console.log(
      `${name}: t(53) ${t}, 2t/sqrt(53) = ${((2 * t) / Math.sqrt(53)).toFixed(2)}, t/sqrt(54) = ${(t / Math.sqrt(54)).toFixed(2)}, the article prints d ${printed.toFixed(2)}`,
    )
} else {
  console.log(
    `men's interest ${percent(chance(0.41))}, women's interest ${percent(chance(0.33))}`,
  )
}
