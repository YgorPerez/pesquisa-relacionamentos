// The article gives height in inches and weight in pounds. Each row prints
// the article's number next to its metric value, so the fact sheet can show
// both.
//
//   node scripts/calculations/toma-2008-mentira-altura-peso-idade.ts <row>
//
// Rows (pages of PSPB 34(8)):
//   height-threshold  p. 1028: discrepancy that counted as a lie
//   weight-threshold  p. 1028: same, for weight
//   height-deviation  p. 1029: mean absolute deviation and the two extremes
//   height-by-gender  p. 1029: mean overstatement, men then women
//   weight-deviation  p. 1029: mean absolute deviation and the two extremes
//   weight-by-gender  p. 1029: mean understatement, women then men
const CM_PER_INCH = 2.54
const KG_PER_POUND = 0.45359237

const ROWS: Record<
  string,
  { readonly unit: 'in' | 'lb'; readonly values: ReadonlyArray<number> }
> = {
  'height-threshold': { unit: 'in', values: [0.5] },
  'weight-threshold': { unit: 'lb', values: [5] },
  'height-deviation': { unit: 'in', values: [0.77, 3, 1.75] },
  'height-by-gender': { unit: 'in', values: [0.57, 0.03] },
  'weight-deviation': { unit: 'lb', values: [9.04, 35, 20] },
  'weight-by-gender': { unit: 'lb', values: [8.48, 1.94] },
}

const portuguese = (n: number, digits?: number) =>
  (digits === undefined ? String(n) : n.toFixed(digits)).replace('.', ',')

const row = ROWS[process.argv[2] ?? '']
if (!row) {
  console.error(`usage: one of ${Object.keys(ROWS).join(', ')}`)
  process.exit(1)
}

console.log(
  row.values
    .map((value) =>
      row.unit === 'in'
        ? `${portuguese(value)} pol = ${portuguese(value * CM_PER_INCH, 1)} cm`
        : `${portuguese(value)} lb = ${portuguese(value * KG_PER_POUND, 1)} kg`,
    )
    .join('; '),
)
