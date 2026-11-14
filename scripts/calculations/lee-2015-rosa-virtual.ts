// Table proportions shown as percentages.
//
//   node scripts/calculations/lee-2015-rosa-virtual.ts
//     Table 3, panel C (women): share with at least one initiated date
//     (a proposal they sent that was accepted), 2 roses vs. 8 roses.
const percent = (p: number) => `${(p * 100).toFixed(1)}%`

console.log(`${percent(0.218)} vs. ${percent(0.328)}`)
