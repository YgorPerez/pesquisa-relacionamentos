// The two Brazilian samples of Table S3 (Universidade Federal de Sergipe, 69,
// and University of Kansas, 55, both in Portuguese) added up, and their share
// of the final N of 10,358.
//
//   node scripts/calculations/eastwick-2024-preferencias-43-paises.ts
const brazil = 69 + 55
const share = (100 * brazil) / 10358
console.log(`${brazil} ${share.toFixed(1).replace('.', ',')}`)
