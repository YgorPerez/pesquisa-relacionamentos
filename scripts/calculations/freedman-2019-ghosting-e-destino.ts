// Freedman, Powell, Le & Williams (2019), Journal of Social and Personal
// Relationships 36(3):905–924. Numbers copied from the article.
//
//   node scripts/calculations/freedman-2019-ghosting-e-destino.ts
//     the check the Fact sheet's note quotes: each "X% more/less likely" of
//     the logistic regressions against the change in odds per point of the
//     belief scale its B implies, exp(B) - 1. The extracted text drops the
//     minus sign, so the sign comes from the sentence: "less likely" is a
//     negative B. B is printed with two decimals, so the two percentages can
//     differ by about half a point.
const comma = (n: number, digits: number) => n.toFixed(digits).replace('.', ',')

const logistic: Array<[string, number, number]> = [
  ['Study 1, destiny, acceptable to end a short-term relationship', 0.2, 22.2],
  ['Study 1, destiny, acceptable to end a long-term relationship', 0.49, 63.4],
  ['Study 1, growth, acceptable to end a long-term relationship', -0.49, -38.4],
  ['Study 1, destiny, acceptable after two dates or less', 0.22, 24.6],
  ['Study 1, destiny, would think poorly of a ghoster', -0.27, -23.6],
  ['Study 1, growth, would think poorly of a ghoster', 0.3, 35.4],
  ['Study 1, destiny, would consider using ghosting', 0.36, 43.4],
  ['Study 1, destiny, has ghosted a romantic partner', 0.28, 31.8],
  ['Study 1, destiny, has been ghosted by a romantic partner', 0.31, 35.7],
  ['Study 2, destiny, has ghosted a romantic partner', 0.32, 37.2],
]

console.log(
  logistic
    .map(
      ([name, b, printed]) =>
        `${name}: B ${b} gives ${comma((Math.exp(b) - 1) * 100, 1)}%, the article prints ${comma(printed, 1)}%`,
    )
    .join('\n'),
)
