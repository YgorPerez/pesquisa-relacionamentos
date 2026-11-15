// The proportions the accepted manuscript gives as decimals (pp. 15–18,
// Tables 1 and 2), shown as percentages. Each key is one Achados row.
//
//   node scripts/calculations/turnbull-dugarte-2025-extrema-direita.ts <key>
//
// uk-mean: mean share of profiles swiped positively in Britain (p. 15).
// uk-parties: Reform UK and Conservative profiles in Britain (p. 15).
// es-parties: overall mean and VOX profiles in Spain (p. 16).
// uk-right: Conservative and Reform UK profiles, center-right respondents (p. 17).
// es-vox: VOX profiles, right- and left-wing respondents, and the authors'
//   difference of .16 over the left's .34 (p. 18).
// child-others: Table 1, "Acceptable" row, for the non-radical-right parties.
// child-uk: Table 2, Britain, center-right respondents on Reform UK.
// child-es: Table 2, Spain, center-right respondents on VOX and SALF.
const percent = (p: number) => `${Math.round(p * 100)}%`

const rows: Record<string, () => string> = {
  'uk-mean': () => percent(0.46),
  'uk-parties': () =>
    `Reform UK ${percent(0.39)} vs. Conservative ${percent(0.35)}`,
  'es-parties': () => `overall ${percent(0.44)} vs. VOX ${percent(0.38)}`,
  'uk-right': () =>
    `Conservative ${percent(0.48)} vs. Reform UK ${percent(0.48)}`,
  'es-vox': () =>
    `right ${percent(0.49)} vs. left ${percent(0.34)}; .16 / .34 = ${percent(0.16 / 0.34)}`,
  'child-others': () =>
    `Conservative ${percent(0.75)}, Labour ${percent(0.81)}, PP ${percent(0.72)}, PSOE ${percent(0.78)}`,
  'child-uk': () =>
    `center-left more ${percent(0.08)}, equal ${percent(0.53)}, Reform UK more ${percent(0.39)}`,
  'child-es': () =>
    `VOX: center-left more ${percent(0.17)}, equal ${percent(0.54)}, VOX more ${percent(0.29)}; ` +
    `SALF: center-left more ${percent(0.17)}, equal ${percent(0.58)}, SALF more ${percent(0.25)}`,
}

const row = rows[process.argv[2] ?? '']
if (!row) {
  console.error(
    `usage: turnbull-dugarte-2025-extrema-direita.ts <${Object.keys(rows).join('|')}>`,
  )
  process.exit(1)
}
console.log(row())
