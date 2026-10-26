// A list written in a sentence, in Portuguese: "renda, sexo e calma". One
// joiner for every text the rules and the pages write.

const AND = new Intl.ListFormat('pt-BR', { type: 'conjunction' })
const OR = new Intl.ListFormat('pt-BR', { type: 'disjunction' })

/** "renda, sexo e calma". */
export const andList = (items: ReadonlyArray<string>): string =>
  AND.format(items)

/** "preta, parda ou branca". */
export const orList = (items: ReadonlyArray<string>): string => OR.format(items)
