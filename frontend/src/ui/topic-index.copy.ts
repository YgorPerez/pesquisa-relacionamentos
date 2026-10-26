// The words of the home page's Topic index (`topic-index.tsx`), shared with
// its test.

/** Under the Topic's name: how many Questions it answers. */
export const questionCount = (count: number): string =>
  count === 1 ? '1 Pergunta' : `${count} Perguntas`

/** The link to the Topic's page, at the end of the open fold. */
export const OPEN_TOPIC = 'Abrir o Tema'

/** Next to a Topic whose Guide was read to "O que levar" (#195). */
export const READ = 'lido'
