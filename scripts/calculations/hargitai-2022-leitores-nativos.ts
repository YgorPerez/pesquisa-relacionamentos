// Table 6 (p. 20 of the PDF): who noticed errors in profile text 3, as a share
// of each text version. The table's percentages are of the column (all who
// noticed errors), not of the row, so the row shares are computed here from
// the counts.
//
//   node scripts/calculations/hargitai-2022-leitores-nativos.ts
const percent = (part: number, whole: number) =>
  `${((part / whole) * 100).toFixed(1)}%`

const withErrors = { noticed: 46, notNoticed: 45 }
const withoutErrors = { noticed: 26, notNoticed: 71 }
const total = (row: { noticed: number; notNoticed: number }) =>
  row.noticed + row.notNoticed

console.log(
  `with errors: ${withErrors.noticed} of ${total(withErrors)} = ${percent(withErrors.noticed, total(withErrors))}; ` +
    `without errors: ${withoutErrors.noticed} of ${total(withoutErrors)} = ${percent(withoutErrors.noticed, total(withoutErrors))}`,
)
