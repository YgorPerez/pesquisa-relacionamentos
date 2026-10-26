// The words of the Guide's reading bar (`reading-progress.tsx`), shared with
// its test and with the home page's "Continuar lendo".

/** Before the "2 de 5" for a screen reader, and on the home page's item. */
export const CHAPTER = 'Capítulo'

/** "2 de 5": the Chapter's number and how many the Guide has. */
export const chapterOf = (n: number, total: number): string =>
  `${n} de ${total}`
