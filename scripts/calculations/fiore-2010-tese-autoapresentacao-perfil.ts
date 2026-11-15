// Fiore (2010), PhD dissertation, UC Berkeley. Numbers copied from Table 4.5
// (p. 48), the distribution of relationship duration.
//
//   node scripts/calculations/fiore-2010-tese-autoapresentacao-perfil.ts
//     retrospective respondents: the share who saw their date 0 times after
//     the first meeting, out of the 659 who answered (section 4.4.1). The
//     table's men and women add up to 659, with 399 women, as the text says.
//
//   node scripts/calculations/fiore-2010-tese-autoapresentacao-perfil.ts contemporaneous
//     contemporaneous respondents: how many people the table counts, against
//     the 144 (86 women) that section 4.4.1 says entered the duration analyses.
const comma = (n: number, digits: number) => n.toFixed(digits).replace('.', ',')
const sum = (xs: ReadonlyArray<number>) => xs.reduce((a, b) => a + b, 0)

// Number of dates after the first: 0, 1–2, 3–4, 5–10, 10+.
const retrospective = {
  men: [81, 46, 32, 27, 74],
  women: [141, 62, 42, 51, 103],
}
// Number of weeks dating: 0, 2, 6, 10.
const contemporaneous = {
  men: [55, 12, 1, 7],
  women: [72, 15, 8, 6],
}

if (process.argv[2] === 'contemporaneous') {
  const men = sum(contemporaneous.men)
  const women = sum(contemporaneous.women)
  console.log(
    `${men + women} people in the table (${women} women, ${men} men); ` +
      `${contemporaneous.men[0] + contemporaneous.women[0]} at 0 weeks`,
  )
} else {
  const total = sum(retrospective.men) + sum(retrospective.women)
  const none = retrospective.men[0] + retrospective.women[0]
  console.log(
    `${none} of ${total} (${sum(retrospective.women)} women) saw their date 0 times after the first: ` +
      `${comma((none / total) * 100, 1)}%`,
  )
}
