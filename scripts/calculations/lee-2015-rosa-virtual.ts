// Table proportions shown as percentages, and two checks of the article's own
// arithmetic that the Limitações section reports.
//
//   node scripts/calculations/lee-2015-rosa-virtual.ts
//     Table 3, panel C (women): share with at least one initiated date
//     (a proposal they sent that was accepted), 2 roses vs. 8 roses.
//   node scripts/calculations/lee-2015-rosa-virtual.ts overall-acceptance
//     Section 4.1: 295 of the 1,921 proposals were accepted. Footnote 14's
//     "16 versus 29 percent" cannot both be shares of the proposals each sex
//     received, because both sit above this overall rate.
//   node scripts/calculations/lee-2015-rosa-virtual.ts rose-increase
//     Section 4.3, Hypothesis 5: 0.259 more accepted offers over a mean of
//     0.412, which the text calls "a 37 % increase".
const percent = (p: number, digits = 1) => `${(p * 100).toFixed(digits)}%`

switch (process.argv[2]) {
  case undefined:
    console.log(`${percent(0.218)} vs. ${percent(0.328)}`)
    break
  case 'overall-acceptance':
    console.log(percent(295 / 1921))
    break
  case 'rose-increase':
    console.log(percent(0.259 / 0.412, 0))
    break
  default:
    console.error(
      'usage: lee-2015-rosa-virtual.ts [overall-acceptance|rose-increase]',
    )
    process.exit(1)
}
