// Adams & Miles (2023), Language Sciences 99:101568, Table 3 (p. 7).
// The F values are copied from the table's F-Value column.
//
//   node scripts/calculations/adams-2023-convergencia-textismos.ts
//     for each textism type, the two one-way ICCs that the F of a one-way
//     ANOVA with two people per conversation (k = 2) gives, as pingouin
//     computes them:
//       ICC1, one person:        (F - 1) / (F + 1)
//       ICC1k, mean of the two:  1 - 1 / F
//     The table's ICC column matches ICC1k, while the Methods say ICC1.
//     Last line: Table 2's mean for markers-missing (2.88) against its total
//     (3674), divided by the 635 screenshots and by the 1270 people in them;
//     the Limitações section quotes it.
const K = 2
const SCREENSHOTS = 635
const MARKERS_MISSING_TOTAL = 3674

const TABLE_3: ReadonlyArray<readonly [string, number]> = [
  ['phrase-shorteners', 1.87],
  ['emojis/stickers', 1.76],
  ['word-#substitutions', 1.67],
  ['cases-upper', 1.56],
  ['markers-missing', 1.44],
  ['lexical-surrogates', 1.45],
  ['word-expansions', 1.35],
  ['cases-lower', 1.31],
  ['word-shorteners', 1.09],
  ['emoticons', 1.01],
  ['spatial-arrays', 0.88],
  ['markers-extra', 0.86],
]

const comma = (x: number) => x.toFixed(2).replace('.', ',').replace('-', '−')

console.log(
  [
    ...TABLE_3.map(([name, f]) => {
      const single = (f - 1) / (f + K - 1)
      const average = 1 - 1 / f
      return `${name}: ICC1 ${comma(single)}, ICC1k ${comma(average)}`
    }),
    `markers-missing per screenshot ${comma(MARKERS_MISSING_TOTAL / SCREENSHOTS)}, per person ${comma(MARKERS_MISSING_TOTAL / (SCREENSHOTS * K))}`,
  ].join('\n'),
)
