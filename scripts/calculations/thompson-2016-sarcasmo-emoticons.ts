// Thompson & Filik (2016), author manuscript: the article gives the chance of
// producing an emoticon as a proportion (mean likelihood ± SE); the Fact sheet
// shows it as a percentage. The test statistics are copied as printed, so the
// row's Valor can carry them next to the percentages.
//
//   node scripts/calculations/thompson-2016-sarcasmo-emoticons.ts <row>
const percent = (p: number) => `${Math.round(p * 100)}%`

const rows: Record<string, () => string> = {
  // Experiment 1, Overall (p. 10): sarcastic .88, literal .51.
  'exp1-overall': () =>
    `${percent(0.88)} vs. ${percent(0.51)} (chi2 = 24.59, p < .001)`,
  // Experiment 1, Overall (p. 10): praise .76, criticism .71.
  'exp1-polarity': () =>
    `${percent(0.76)} vs. ${percent(0.71)} (chi2 = 4.55, p = .033)`,
  // Experiment 1, ellipsis (p. 10): literal criticism .52, literal praise .06,
  // sarcastic criticism .77, sarcastic praise .50.
  'exp1-ellipsis': () =>
    `literal ${percent(0.52)} vs. ${percent(0.06)}; sarcastic ${percent(0.77)} vs. ${percent(0.5)} (chi2 = 5.65, p = .017)`,
  // Experiment 1, smile (p. 12): literal praise .81, literal criticism .04,
  // sarcastic praise .17, sarcastic criticism .08.
  'exp1-smile': () =>
    `${percent(0.81)}; ${percent(0.04)}; ${percent(0.17)}; ${percent(0.08)} (chi2 = 4.99, p = .026)`,
  // Experiment 1, diagonal face (p. 12): literal criticism .40, sarcastic
  // praise and criticism .15 each, literal praise .02.
  'exp1-diagonal': () =>
    `${percent(0.4)}; ${percent(0.15)}; ${percent(0.02)} (chi2 = 10.58, p < .001)`,
  // Experiment 2, Overall (p. 15): sarcastic .51, literal .18.
  'exp2-overall': () =>
    `${percent(0.51)} vs. ${percent(0.18)} (chi2 = 40.72, p < .001)`,
  // Experiment 2, smile (p. 17): literal praise .40, sarcastic praise and
  // criticism .05 each.
  'exp2-smile': () =>
    `${percent(0.4)}; ${percent(0.05)} (chi2 = 7.17, p = .007)`,
}

const row = process.argv[2] ?? ''
const run = rows[row]
if (!run) {
  console.error(
    `unknown row "${row}"; use one of: ${Object.keys(rows).join(', ')}`,
  )
  process.exit(1)
}
console.log(run())
