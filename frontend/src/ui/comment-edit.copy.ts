// "Editar comentário" (`comment-edit.tsx`, #443): the texts the form and its
// tests share. The fields' labels are the send form's
// (`selection-comment.copy.ts`).
import { quoteButtonLabel } from './highlight-list.copy'

export const EDIT_COMMENT = 'Editar comentário'

/** The name of a Comentário's "Editar comentário" in "Seus trechos", which
 * has one per Comentário. */
export const editCommentLabel = (text: string): string =>
  quoteButtonLabel(EDIT_COMMENT, text)

export const SAVE = 'Salvar'
export const SAVING = 'Salvando…'

export const FAILED =
  'Não deu para salvar. O seu texto continua aqui; tente de novo daqui a pouco.'

/** The server found the issue closed: Corrigido or Não vamos mudar. */
export const CLOSED =
  'O curador já fechou este comentário, e ele não pode mais ser editado.'
