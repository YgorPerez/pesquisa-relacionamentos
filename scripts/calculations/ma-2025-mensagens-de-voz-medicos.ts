// Ma et al. (2025), "The Power of Voice", SSRN 5890302, Table 1 (summary
// statistics). Both variables are 0/1, so the mean is the share of the
// 164,151 consultations.
//
//   node scripts/calculations/ma-2025-mensagens-de-voz-medicos.ts
//     the share of consultations in which the physician used voice
//     (Voice use, mean 0.179) and the share in which the patient rated the
//     consultation helpful (Helpfulness, mean 0.098), in percent.
const VOICE_USE_MEAN = 0.179
const HELPFULNESS_MEAN = 0.098

const percent = (share: number) => (share * 100).toFixed(1).replace('.', ',')

console.log(`Voice use: ${percent(VOICE_USE_MEAN)}%`)
console.log(`Helpfulness: ${percent(HELPFULNESS_MEAN)}%`)
