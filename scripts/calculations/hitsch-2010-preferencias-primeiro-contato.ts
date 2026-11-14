// Probabilities shown as percentages.
//
//   node scripts/calculations/hitsch-2010-preferencias-primeiro-contato.ts
//     Section 5 (p. 14): the "base" first-contact probability, a median man
//     browsing a median woman vs. a median woman browsing a median man.
const percent = (p: number) => `${(p * 100).toFixed(1)}%`

console.log(`${percent(0.187)} vs. ${percent(0.155)}`)
