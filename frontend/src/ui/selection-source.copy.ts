// "De onde vem isso?" (#336): the texts the panel and its tests share.

/** The page the selection is on: it names the list of a sentence with no
 * citation outside a Chapter. */
export type SourcesPage = 'guide' | 'tip' | 'fact-sheet'

/** Over the Fact sheets the selection cites: one sentence, several, or
 * some of them with no citation. */
export const CITES = {
  one: 'Esta frase cita:',
  many: 'Estas frases citam:',
  some: 'O trecho cita:',
}

/** When the selection, or part of it, cites no Fact sheet. */
export const CITES_NONE = {
  one: 'Esta frase não cita Ficha.',
  many: 'Estas frases não citam Ficha.',
  some: 'Parte do trecho não cita Ficha.',
}

/** Over the Fact sheets near a sentence with no citation; `others` when the
 * list leaves out the ones already cited above it. */
export const NEARBY = {
  chapter: 'As Fichas deste capítulo:',
  chapters: 'As Fichas destes capítulos:',
  guide: 'As Fichas deste Guia:',
  tip: 'As Fichas desta Dica:',
  'fact-sheet': 'A Ficha desta página:',
} satisfies Record<'chapter' | 'chapters' | SourcesPage, string>

export const NEARBY_OTHERS = {
  chapter: 'As outras Fichas deste capítulo:',
  chapters: 'As outras Fichas destes capítulos:',
  guide: 'As outras Fichas deste Guia:',
  tip: 'As outras Fichas desta Dica:',
  'fact-sheet': 'A Ficha desta página:',
} satisfies Record<keyof typeof NEARBY, string>
