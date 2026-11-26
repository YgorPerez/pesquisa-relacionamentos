// Table 2 of the Interspeech paper gives conversations and utterances for
// each of the five sets (train, valid freq., valid rare, test freq., test
// rare). Prints their sums: conversations, then utterances.
//
//   node scripts/calculations/gopalakrishnan-2019-topical-chat.ts
const conversations = [9058, 565, 566, 565, 565]
const utterances = [198306, 12367, 12540, 12463, 12338]
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
console.log(`${sum(conversations)} ${sum(utterances)}`)
