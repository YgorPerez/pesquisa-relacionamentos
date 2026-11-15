// Samara, Roth & Kret (2021), Archives of Sexual Behavior 50(6):2507–2516.
// Numbers copied from the article (Participants, p. 2508; Table 1, p. 2510;
// Baseline Differences, p. 2511).
//
//   node scripts/calculations/samara-2021-projecao-superpercepcao.ts binomial
//     the men's relative success frequency and its 95% HDI, as percentages
//   node scripts/calculations/samara-2021-projecao-superpercepcao.ts guess
//     the authors' chance level: someone who says yes as often as the women
//     did (26%) matches 0.26 × 0.26 + 0.74 × 0.74 of the women's answers;
//     the Limitações section quotes it next to the 0.61 the article prints
//   node scripts/calculations/samara-2021-projecao-superpercepcao.ts dates
//     the mean number of dates per man and per woman, from the 277 dates and
//     the 67 participants, 35 of them women (Methods); the Limitações section
//     quotes it next to the "10 speed-dates" the text describes
const percent = (x: number) => `${Math.round(x * 100)}%`

const WOMEN_YES = 0.26
const SUCCESS = 0.74
const HDI = [0.66, 0.81] as const

const guess = WOMEN_YES * WOMEN_YES + (1 - WOMEN_YES) * (1 - WOMEN_YES)

const DATES = 277
const PARTICIPANTS = 67
const WOMEN = 35
const MEN = PARTICIPANTS - WOMEN

const one = (x: number) => x.toFixed(1).replace('.', ',')

const mode = process.argv[2]
if (mode === 'binomial')
  console.log(
    `acerto ${percent(SUCCESS)}, intervalo de ${percent(HDI[0])} a ${percent(HDI[1])}`,
  )
else if (mode === 'guess')
  // The article prints 0.61; the product is 0.6152, which rounds to 0.62.
  console.log(
    `0,26 × 0,26 + 0,74 × 0,74 = ${guess.toFixed(4).replace('.', ',')} (${percent(guess)}; o artigo escreve 0,61)`,
  )
else if (mode === 'dates')
  console.log(
    `${MEN} homens: ${one(DATES / MEN)} encontros por homem; ${WOMEN} mulheres: ${one(DATES / WOMEN)} por mulher`,
  )
else {
  console.error('usage: samara-2021-projecao-superpercepcao.ts binomial|guess|dates')
  process.exit(1)
}
