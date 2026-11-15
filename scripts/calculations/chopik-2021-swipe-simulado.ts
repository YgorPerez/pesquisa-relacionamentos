// Table 1 (p. 6): the share of trials in which a photo was chosen, by the
// photo's sex, in each of the four studies, shown as a percentage. Each pair
// is men's photos first, then women's.
//
//   node scripts/calculations/chopik-2021-swipe-simulado.ts
const percent = (p: number) => `${Math.round(p * 100)}%`

const chosen: ReadonlyArray<readonly [string, number, number]> = [
  ['1a', 0.1, 0.15],
  ['1b', 0.09, 0.16],
  ['2a', 0.14, 0.19],
  ['2b', 0.15, 0.25],
]

console.log(
  chosen
    .map(
      ([study, men, women]) =>
        `${study}: ${percent(men)} vs. ${percent(women)}`,
    )
    .join('; '),
)
