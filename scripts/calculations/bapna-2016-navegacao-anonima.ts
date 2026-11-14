// Table 12 (manuscript p. 24): the mean GetReplyRatio, the share of the people
// who messaged a user that the user replied to, shown as a percentage. Control
// group first, then the group with anonymous browsing.
//
//   node scripts/calculations/bapna-2016-navegacao-anonima.ts women
//   node scripts/calculations/bapna-2016-navegacao-anonima.ts men
const percent = (p: number) => `${(p * 100).toFixed(1)}%`

const replyRatio = {
  women: { control: 0.178, anonymous: 0.16 },
  men: { control: 0.411, anonymous: 0.393 },
}

const group = process.argv[2]
if (group !== 'women' && group !== 'men') {
  console.error('usage: bapna-2016-navegacao-anonima.ts <women|men>')
  process.exit(1)
}
const { control, anonymous } = replyRatio[group]
console.log(`${percent(control)} vs. ${percent(anonymous)}`)
