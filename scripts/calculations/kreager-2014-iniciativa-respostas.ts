// Table proportions shown as percentages.
//
//   node scripts/calculations/kreager-2014-iniciativa-respostas.ts unanswered
//     Table 3: share of first contacts never reciprocated, male initiated
//     vs. female initiated.
//   node scripts/calculations/kreager-2014-iniciativa-respostas.ts answered
//     Table 3: the complement, first contacts reciprocated at least once.
//   node scripts/calculations/kreager-2014-iniciativa-respostas.ts no-messages
//     Table 1: daters who sent no message, men vs. women.
//   node scripts/calculations/kreager-2014-iniciativa-respostas.ts low-men
//   node scripts/calculations/kreager-2014-iniciativa-respostas.ts low-women
//     Table 4: where the messages of senders in the lowest desirability
//     quintile went, to the highest quintile and to their own.
const percent = (p: number) => `${Math.round(p * 100)}%`

// Table 3, "Message not reciprocated (ref.)".
const unanswered = { men: 0.79, women: 0.58 }
// Table 1, "No outgoing messages".
const noMessages = { men: 0.15, women: 0.31 }
// Table 4, row "Low": High, Medium-high, Medium, Medium-low, Low.
const lowSenders = {
  men: [0.29, 0.21, 0.16, 0.18, 0.16],
  women: [0.3, 0.22, 0.2, 0.18, 0.1],
}

const toTopAndOwn = (row: number[]) =>
  `to the highest quintile: ${percent(row[0] ?? NaN)}; to their own: ${percent(row[4] ?? NaN)}`

switch (process.argv[2]) {
  case 'unanswered':
    console.log(`${percent(unanswered.men)} vs. ${percent(unanswered.women)}`)
    break
  case 'answered':
    console.log(
      `${percent(1 - unanswered.men)} vs. ${percent(1 - unanswered.women)}`,
    )
    break
  case 'no-messages':
    console.log(`${percent(noMessages.men)} vs. ${percent(noMessages.women)}`)
    break
  case 'low-men':
    console.log(toTopAndOwn(lowSenders.men))
    break
  case 'low-women':
    console.log(toTopAndOwn(lowSenders.women))
    break
  default:
    console.error(
      'usage: kreager-2014-iniciativa-respostas.ts unanswered|answered|no-messages|low-men|low-women',
    )
    process.exit(1)
}
