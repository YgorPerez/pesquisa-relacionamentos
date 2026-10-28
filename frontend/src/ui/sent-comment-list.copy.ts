// The words of the Comentários section of "Seus trechos"
// (`sent-comment-list.tsx`, #347), shared with its tests. The type labels
// are the issue's (`content/comment-kinds.ts`); "Este trecho mudou" is the
// Grifos' (`highlight-list.copy.ts`).
import { plural, quoteButtonLabel } from './highlight-list.copy'

/** The section's title. */
export const COMMENTS = 'Comentários'

/** The count over the list. */
export const sentCount = (n: number) =>
  plural(n, 'comentário enviado', 'comentários enviados')

/** Under the count: what "Tirar da lista" does and does not do. */
export const KEPT_LINE =
  'Eles já estão com o curador. “Tirar da lista” apaga só deste aparelho.'

/** The start of the line with no Comentário. */
export const NO_COMMENTS = 'Nenhum comentário enviado deste navegador.'

export const NO_COMMENTS_LINE = `${NO_COMMENTS} Selecione um trecho e toque em “Comentar” para mandar um recado ao curador. Ele aparece aqui.`

/** Over what the reader wrote. */
export const YOUR_COMMENT = 'Seu comentário'

export const COMMENT_CHANGED_LINE =
  'A página foi reescrita e o trecho não está mais nela. O link leva à página.'

export const REMOVE_FROM_LIST = 'Tirar da lista'

/** The name of a Comentário's "Tirar da lista". */
export const removeCommentLabel = (text: string): string =>
  quoteButtonLabel(REMOVE_FROM_LIST, text)

const DATE = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

/** When it was sent, in the reader's time zone. */
export const sentOn = (at: number) => `Enviado em ${DATE.format(at)}`
