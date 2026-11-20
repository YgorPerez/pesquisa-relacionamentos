// Arseneault & Koo (2026), International Journal of Cross Cultural Management
// 26(2):465–487, Study 1, Table 3 (warmth, Sub-Saharan Africa) and Table 2
// (group sizes).
//
//   node scripts/calculations/arseneault-2026-emoji-lider-culturas.ts
//     Cohen's d for warmth in Sub-Saharan Africa, from the table's means and
//     SDs, with the pooled SD of the two groups (101 with emojis, 95 without).
//     The table prints d = .02; the means give about 0.08. The fact sheet
//     quotes this in Limitações and does not use the table's d.
const WITH = { mean: 6.06, sd: 1.08, n: 101 }
const WITHOUT = { mean: 5.97, sd: 1.17, n: 95 }

const pooled = Math.sqrt(
  ((WITH.n - 1) * WITH.sd ** 2 + (WITHOUT.n - 1) * WITHOUT.sd ** 2) /
    (WITH.n + WITHOUT.n - 2),
)
const d = (WITH.mean - WITHOUT.mean) / pooled
console.log(`d = ${d.toFixed(2).replace('.', ',')}`)
