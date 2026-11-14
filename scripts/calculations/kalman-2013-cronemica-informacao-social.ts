// Results (p. 1265): "The mean log interpost pause was 1.92." The pause is in
// seconds and the log is the natural log (Section 2.3), so the mean of the
// logs, taken back to seconds, is the geometric mean pause.
//
//   node scripts/calculations/kalman-2013-cronemica-informacao-social.ts
const meanLog = 1.92
console.log(`mean log ${meanLog} -> ${Math.exp(meanLog).toFixed(1)} seconds`)
