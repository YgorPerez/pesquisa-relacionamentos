// First contacts received in the observed week, by the participant's gender.
//
//   node scripts/calculations/shtatfeld-2009-habilidade-escrita-contatos.ts
//     Table 2 (p. 28): contacts by time since last entry, summed per gender;
//     sample counts from the Method (p. 24).
const men = { n: 59, contacts: [26, 3, 1, 0] }
const women = { n: 47, contacts: [280, 71, 14, 37] }

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const toMen = sum(men.contacts)
const toWomen = sum(women.contacts)
const share = Math.round((toWomen / (toMen + toWomen)) * 100)

console.log(
  `mulheres (${women.n}): ${toWomen}; homens (${men.n}): ${toMen}; ` +
    `fatia das mulheres: ${share}% de ${toMen + toWomen}; participantes: ${men.n + women.n}`,
)
