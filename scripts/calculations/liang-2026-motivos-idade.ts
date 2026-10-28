// Figure 1's simple slopes are for mean age −1 SD ("younger adults") and
// +1 SD ("older adults"); the abstract gives M = 52.4 and SD = 16.5 years.
// Prints both ages, rounded to whole years (35.9 and 68.9 before rounding).
//
//   node scripts/calculations/liang-2026-motivos-idade.ts
const mean = 52.4
const sd = 16.5
console.log(`${Math.round(mean - sd)} ${Math.round(mean + sd)}`)
